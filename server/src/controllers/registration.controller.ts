import { Request, Response } from 'express';
import { z } from 'zod';
import { attendeeService } from '../services/attendee.service';
import { paystackService } from '../services/paystack.service';
import { paymentService } from '../services/payment.service';
import { emailService } from '../services/email.service';

export const registrationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please provide a valid email address'),
  phone: z.string().min(7, 'Please provide a valid phone number'),
  gender: z.string().optional(),
  ageRange: z.string().optional(),
  referralSource: z.string().optional(),
  breakoutSessionChoice: z.string().optional(),
  expectations: z.string().optional(),
  registrationType: z.string().default('regular'),
  amount: z.number().nonnegative(),
  callbackUrl: z.string().url().optional(),
});

export const registrationController = {
  /**
   * Initiates registration and creates a Paystack checkout session
   */
  async initiate(req: Request, res: Response) {
    try {
      const data = req.body;
      const paymentReference = `BISUM-TX-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      // 1. If amount is 0 (Free Registration)
      if (data.amount <= 0) {
        const attendee = await attendeeService.createFreeRegistration({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          gender: data.gender,
          ageRange: data.ageRange,
          referralSource: data.referralSource,
          breakoutSessionChoice: data.breakoutSessionChoice,
          expectations: data.expectations,
          registrationType: data.registrationType || 'free',
        });

        // Send confirmation email via Resend
        await emailService.sendRegistrationConfirmation({
          firstName: attendee.first_name,
          lastName: attendee.last_name,
          email: attendee.email,
          phone: attendee.phone,
          registrationNumber: attendee.registration_number,
          registrationType: attendee.registration_type,
          breakoutSessionChoice: attendee.breakout_session_choice,
          amountPaid: 0,
        });

        await attendeeService.markEmailSent(attendee.id);

        return res.status(201).json({
          success: true,
          message: 'Free registration completed successfully.',
          data: {
            registration: attendee,
            isFree: true,
          },
        });
      }

      // 2. Paid Registration: Create Pending Attendee Record
      const pendingAttendee = await attendeeService.createPendingRegistration({
        ...data,
        amountPaid: data.amount,
        paymentReference,
      });

      // 3. Initialize Paystack Transaction
      const paystackResponse = await paystackService.initializeTransaction({
        email: data.email,
        amount: data.amount,
        reference: paymentReference,
        callbackUrl: data.callbackUrl,
        metadata: {
          registration_id: pendingAttendee.id,
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          registration_type: data.registrationType,
          breakout_session_choice: data.breakoutSessionChoice,
        },
      });

      // 4. Record Pending Payment
      await paymentService.recordPayment({
        reference: paymentReference,
        customerName: `${data.firstName} ${data.lastName}`,
        customerEmail: data.email,
        amount: data.amount,
        currency: 'NGN',
        status: 'pending',
        metadata: {
          registration_id: pendingAttendee.id,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Registration initiated. Redirecting to payment...',
        data: {
          authorizationUrl: paystackResponse.data.authorization_url,
          accessCode: paystackResponse.data.access_code,
          reference: paymentReference,
          registrationId: pendingAttendee.id,
        },
      });
    } catch (error: any) {
      console.error('Initiate Registration Error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to initiate registration.',
      });
    }
  },

  /**
   * Retrieves registration status by reference
   */
  async getStatus(req: Request, res: Response) {
    try {
      const reference = String(req.params.reference);
      if (!reference || reference === 'undefined') {
        return res.status(400).json({ success: false, message: 'Reference parameter is required' });
      }

      const attendee = await attendeeService.getByReference(reference);
      if (!attendee) {
        return res.status(404).json({ success: false, message: 'Registration not found' });
      }

      return res.status(200).json({
        success: true,
        data: attendee,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve registration status',
      });
    }
  },
};
