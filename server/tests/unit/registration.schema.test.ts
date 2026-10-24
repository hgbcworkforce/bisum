import { describe, it, expect } from 'vitest';
import { registrationSchema } from '../../src/controllers/registration.controller';

describe('Registration Schema Validation Unit Tests', () => {
  const validPayload = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+2348012345678',
    gender: 'male',
    ageRange: '21-25',
    referralSource: 'church',
    breakoutSessionChoice: 'Food',
    attendanceMode: 'On-site',
    expectations: 'Looking forward to learning',
    amount: 2000,
  };

  it('should validate a complete valid registration payload', () => {
    const result = registrationSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.firstName).toBe('John');
      expect(result.data.breakoutSessionChoice).toBe('Food');
      expect(result.data.amount).toBe(2000);
      expect(result.data.registrationType).toBe('standard');
    }
  });

  it('should accept all updated breakout session tracks', () => {
    const tracks = ['Food', 'Craft', 'Online Visibility', 'Real Estate'];
    tracks.forEach((track) => {
      const result = registrationSchema.safeParse({
        ...validPayload,
        breakoutSessionChoice: track,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.breakoutSessionChoice).toBe(track);
      }
    });
  });

  it('should fail if first name is less than 2 characters', () => {
    const result = registrationSchema.safeParse({
      ...validPayload,
      firstName: 'J',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('First name must be at least 2 characters');
    }
  });

  it('should fail if email is malformed', () => {
    const result = registrationSchema.safeParse({
      ...validPayload,
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Please provide a valid email address');
    }
  });

  it('should fail if phone number is too short', () => {
    const result = registrationSchema.safeParse({
      ...validPayload,
      phone: '123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Please provide a valid phone number');
    }
  });

  it('should fail if amount is negative or zero', () => {
    const zeroResult = registrationSchema.safeParse({
      ...validPayload,
      amount: 0,
    });
    expect(zeroResult.success).toBe(false);

    const negativeResult = registrationSchema.safeParse({
      ...validPayload,
      amount: -100,
    });
    expect(negativeResult.success).toBe(false);
  });
});
