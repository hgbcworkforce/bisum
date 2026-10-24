import crypto from 'crypto';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { attendeeService } from '../../src/services/attendee.service';
import { paystackService } from '../../src/services/paystack.service';
import { paymentService } from '../../src/services/payment.service';
import { emailService } from '../../src/services/email.service';

// Mock backend services to isolate API layer
vi.mock('../../src/services/attendee.service', () => ({
  attendeeService: {
    createPendingRegistration: vi.fn(),
    confirmRegistrationById: vi.fn(),
    confirmRegistrationByReference: vi.fn(),
    markEmailSent: vi.fn(),
    getByReference: vi.fn(),
  },
}));

vi.mock('../../src/services/paystack.service', () => ({
  paystackService: {
    initializeTransaction: vi.fn(),
  },
}));

vi.mock('../../src/services/payment.service', () => ({
  paymentService: {
    recordPayment: vi.fn(),
    getByReference: vi.fn(),
  },
}));

vi.mock('../../src/services/email.service', () => ({
  emailService: {
    sendRegistrationConfirmation: vi.fn(),
    sendMerchandiseOrderConfirmation: vi.fn(),
  },
}));

describe('API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('should return 200 with online health status', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'online');
      expect(response.body).toHaveProperty('service', 'bisum-backend');
    });
  });

  describe('POST /api/registration/initiate', () => {
    it('should reject requests with missing required fields with 400 Bad Request', async () => {
      const response = await request(app)
        .post('/api/registration/initiate')
        .send({
          firstName: 'A', // too short (< 2)
          email: 'not-an-email',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
      expect(response.body.errors).toBeDefined();
    });

    it('should initiate registration successfully with valid breakout session track', async () => {
      const mockAttendee = {
        id: 'attendee-uuid-1234',
        first_name: 'David',
        last_name: 'Olatunji',
        email: 'david@example.com',
        breakout_session_choice: 'Online Visibility',
      };

      vi.mocked(attendeeService.createPendingRegistration).mockResolvedValue(mockAttendee as any);
      vi.mocked(paystackService.initializeTransaction).mockResolvedValue({
        status: true,
        message: 'Authorization URL created',
        data: {
          authorization_url: 'https://checkout.paystack.com/test-auth-url',
          access_code: 'access-code-123',
          reference: 'BISUM-TX-TEST',
        },
      } as any);

      const payload = {
        firstName: 'David',
        lastName: 'Olatunji',
        email: 'david@example.com',
        phone: '+2348099887766',
        breakoutSessionChoice: 'Online Visibility',
        attendanceMode: 'On-site',
        registrationType: 'standard',
        amount: 2000,
      };

      const response = await request(app)
        .post('/api/registration/initiate')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.authorizationUrl).toBe('https://checkout.paystack.com/test-auth-url');
      expect(response.body.data.registrationId).toBe('attendee-uuid-1234');

      expect(attendeeService.createPendingRegistration).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'David',
          breakoutSessionChoice: 'Online Visibility',
          amountPaid: 2000,
        })
      );
    });
  });

  describe('POST /api/webhooks/paystack', () => {
    const secretKey = 'sk_test_mock_paystack_secret_key_123';

    it('should return 401 when signature header is missing', async () => {
      const response = await request(app)
        .post('/api/webhooks/paystack')
        .send({ event: 'charge.success' });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Missing signature header');
    });

    it('should return 401 when signature is invalid', async () => {
      const response = await request(app)
        .post('/api/webhooks/paystack')
        .set('x-paystack-signature', 'invalid-hex-signature')
        .send({ event: 'charge.success' });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Invalid webhook signature');
    });

    it('should process charge.success event and confirm registration with valid signature', async () => {
      const webhookBody = {
        event: 'charge.success',
        data: {
          id: 998877,
          reference: 'BISUM-TX-SUCCESS-1',
          amount: 200000, // 2000 NGN in kobo
          paid_at: '2026-10-24T10:00:00.000Z',
          channel: 'card',
          customer: {
            email: 'attendee@example.com',
            first_name: 'Grace',
            last_name: 'Ade',
          },
          metadata: {
            registration_id: 'reg-uuid-success',
          },
        },
      };

      const rawBody = JSON.stringify(webhookBody);
      const validSignature = crypto
        .createHmac('sha512', secretKey)
        .update(rawBody)
        .digest('hex');

      vi.mocked(paymentService.getByReference).mockResolvedValue(null as any);
      vi.mocked(attendeeService.confirmRegistrationById).mockResolvedValue({
        id: 'reg-uuid-success',
        first_name: 'Grace',
        last_name: 'Ade',
        email: 'attendee@example.com',
        phone: '+234800000000',
        registration_number: '0015',
        registration_type: 'standard',
        attendance_mode: 'On-site',
        breakout_session_choice: 'Real Estate',
        amount_paid: 2000,
        email_sent: false,
      } as any);

      const response = await request(app)
        .post('/api/webhooks/paystack')
        .set('x-paystack-signature', validSignature)
        .set('Content-Type', 'application/json')
        .send(webhookBody);

      expect(response.status).toBe(200);
      expect(response.body.received).toBe(true);

      expect(attendeeService.confirmRegistrationById).toHaveBeenCalledWith('reg-uuid-success', 2000);
      expect(emailService.sendRegistrationConfirmation).toHaveBeenCalledWith(
        expect.objectContaining({
          registrationNumber: '0015',
          breakoutSessionChoice: 'Real Estate',
        })
      );
      expect(attendeeService.markEmailSent).toHaveBeenCalledWith('reg-uuid-success');
    });
  });

  describe('GET /api/admin/attendees', () => {
    it('should return 401 when accessed without an authorization token', async () => {
      const response = await request(app).get('/api/admin/attendees');
      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Authentication required');
    });
  });
});
