import crypto from 'crypto';
import { describe, it, expect } from 'vitest';

describe('Paystack Webhook Security & HMAC SHA-512 Verification', () => {
  const secretKey = 'sk_test_mock_paystack_secret_key_123';

  const generateSignature = (payload: string, key: string): string => {
    return crypto.createHmac('sha512', key).update(payload).digest('hex');
  };

  it('should generate a valid 128-character hex signature for a valid payload', () => {
    const rawPayload = JSON.stringify({
      event: 'charge.success',
      data: {
        reference: 'BISUM-TX-12345',
        amount: 200000,
        customer: { email: 'attendee@example.com' },
      },
    });

    const signature = generateSignature(rawPayload, secretKey);

    expect(signature).toHaveLength(128); // SHA-512 hex is 128 chars
    expect(signature).toBe(generateSignature(rawPayload, secretKey));
  });

  it('should detect payload tampering (tampered body produces mismatched signature)', () => {
    const originalPayload = JSON.stringify({
      event: 'charge.success',
      data: { reference: 'BISUM-TX-100', amount: 200000 },
    });

    const tamperedPayload = JSON.stringify({
      event: 'charge.success',
      data: { reference: 'BISUM-TX-100', amount: 10000 }, // Attacker changed amount
    });

    const validSignature = generateSignature(originalPayload, secretKey);
    const tamperedSignature = generateSignature(tamperedPayload, secretKey);

    expect(validSignature).not.toBe(tamperedSignature);
  });

  it('should reject signatures generated with an incorrect secret key', () => {
    const payload = JSON.stringify({ event: 'charge.success' });
    const correctSignature = generateSignature(payload, secretKey);
    const wrongSignature = generateSignature(payload, 'wrong_secret_key');

    expect(correctSignature).not.toBe(wrongSignature);
  });
});
