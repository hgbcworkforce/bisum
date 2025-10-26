// Supabase API Service for BISUM Conference Registration and Payment
// Replaces the Express.js backend with Supabase functions

import {
  createAttendee,
  getAttendeeById,
  getAttendeeByEmail,
  getAttendeeByRegistrationNumber,
  getAttendees,
  updateAttendee,
  updateAttendeePaymentStatus,
  deleteAttendee,
  getRegistrationStats,
  checkEmailExists,
  exportAttendeesToCSV
} from '../lib/attendees.js';

import {
  createPayment,
  getPaymentById,
  getPaymentByTransactionRef,
  getPaymentByFlutterwaveId,
  getPaymentsByAttendeeId,
  getPayments,
  updatePayment,
  markPaymentAsSuccessful,
  markPaymentAsFailed,
  getPaymentStats,
  processFlutterwaveWebhook,
  verifyPaymentWithFlutterwave,
  exportPaymentsToCSV
} from '../lib/payments.js';

import { REGISTRATION_PRICES, REGISTRATION_TYPES } from '../lib/supabase.js';

// Custom error class for API errors (keeping compatibility with old code)
class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// Input validation and sanitization (keeping existing validation logic)
const validateRegistrationData = (data) => {
  const errors = {};

  // Required fields validation
  const requiredFields = [
    "firstName",
    "lastName",
    "email",
    "phoneNumber",
    "registrationType",
    "referralSource",
    "breakoutSessionChoice",
  ];

  requiredFields.forEach((field) => {
    if (
      !data[field] ||
      typeof data[field] !== "string" ||
      !data[field].trim()
    ) {
      errors[field] = `${field} is required`;
    }
  });

  // Email validation
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = "Please enter a valid email address";
  }

  // Phone validation (flexible format)
  if (
    data.phoneNumber &&
    !/^\+?\d{7,15}$/.test(data.phoneNumber.trim())
  ) {
    errors.phoneNumber = "Please enter a valid phone number";
  }

  // Registration type validation
  const validTypes = ["student", "professional", "speaker", "sponsor"];
  if (data.registrationType && !validTypes.includes(data.registrationType)) {
    errors.registrationType = "Invalid registration type";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Sanitize input data
const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;

  return input
    .trim()
    .replace(/[<>]/g, "") // Basic XSS protection
    .slice(0, 1000); // Limit length to prevent payload attacks
};

const sanitizeRegistrationData = (data) => {
  const sanitized = {};

  Object.keys(data).forEach((key) => {
    if (typeof data[key] === "string") {
      sanitized[key] = sanitizeInput(data[key]);
    } else {
      sanitized[key] = data[key];
    }
  });

  return sanitized;
};

// Transform data from old format to new Supabase format
const transformToSupabaseFormat = (data) => {
  // Generate registration number if not provided
  const registrationNumber = data.registrationNumber ||
    `BISUM${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;

  return {
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    phone: data.phoneNumber || data.phone, // Support both field names
    registration_number: registrationNumber,
    registration_type: data.registrationType,
    expectations: data.expectations || null,
    referral_source: data.referralSource,
    breakout_session_choice: data.breakoutSessionChoice
  };
};

// Transform data from Supabase format to old format for compatibility
const transformFromSupabaseFormat = (data) => {
  if (!data) return null;

  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    fullName: `${data.first_name} ${data.last_name}`,
    email: data.email,
    phoneNumber: data.phone,
    phone: data.phone,
    registrationNumber: data.registration_number,
    registrationType: data.registration_type,
    registrationDate: data.registration_date,
    paymentStatus: data.payment_status,
    expectations: data.expectations,
    referralSource: data.referral_source,
    breakoutSessionChoice: data.breakout_session_choice,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

// Registration API methods (updated to use Supabase)
export const registrationAPI = {
  // Register new attendee
  register: async (registrationData) => {
    try {
      // Validate input
      const validation = validateRegistrationData(registrationData);
      if (!validation.isValid) {
        throw new ApiError("Validation failed", 400, {
          errors: validation.errors,
        });
      }

      // Sanitize input
      const sanitizedData = sanitizeRegistrationData(registrationData);

      // Transform to Supabase format
      const supabaseData = transformToSupabaseFormat(sanitizedData);

      // Check if email already exists
      const emailExists = await checkEmailExists(supabaseData.email);
      if (emailExists.exists) {
        throw new ApiError("Email already registered", 409, {
          errors: { email: "This email is already registered" }
        });
      }

      // Create attendee using Supabase
      const result = await createAttendee(supabaseData);

      if (!result.success) {
        throw new ApiError(result.error || "Registration failed", 400);
      }

      return {
        success: true,
        data: transformFromSupabaseFormat(result.data),
        message: result.message,
      };
    } catch (error) {
      console.error("Registration API Error:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || "Registration failed", 500);
    }
  },

  // Get attendee by ID
  getAttendee: async (attendeeId) => {
    try {
      if (!attendeeId) {
        throw new ApiError("Attendee ID is required", 400);
      }

      const result = await getAttendeeById(attendeeId);

      if (!result.success) {
        throw new ApiError(result.error || "Attendee not found", 404);
      }

      return {
        success: true,
        data: transformFromSupabaseFormat(result.data),
      };
    } catch (error) {
      console.error("Get Attendee API Error:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || "Failed to fetch attendee", 500);
    }
  },

  // Get attendee by email
  getAttendeeByEmail: async (email) => {
    try {
      if (!email) {
        throw new ApiError("Email is required", 400);
      }

      const result = await getAttendeeByEmail(email);

      if (!result.success) {
        throw new ApiError(result.error || "Attendee not found", 404);
      }

      return {
        success: true,
        data: transformFromSupabaseFormat(result.data),
      };
    } catch (error) {
      console.error("Get Attendee by Email API Error:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || "Failed to fetch attendee", 500);
    }
  },

  // Get attendee by registration number
  getAttendeeByRegNumber: async (registrationNumber) => {
    try {
      if (!registrationNumber) {
        throw new ApiError("Registration number is required", 400);
      }

      const result = await getAttendeeByRegistrationNumber(registrationNumber);

      if (!result.success) {
        throw new ApiError(result.error || "Attendee not found", 404);
      }

      return {
        success: true,
        data: transformFromSupabaseFormat(result.data),
      };
    } catch (error) {
      console.error("Get Attendee by Reg Number API Error:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || "Failed to fetch attendee", 500);
    }
  },

  // Update attendee information
  updateAttendee: async (attendeeId, updateData) => {
    try {
      if (!attendeeId) {
        throw new ApiError("Attendee ID is required", 400);
      }

      const sanitizedData = sanitizeRegistrationData(updateData);

      // Transform field names if needed
      const supabaseUpdateData = {};
      Object.keys(sanitizedData).forEach(key => {
        switch(key) {
          case 'firstName':
            supabaseUpdateData.first_name = sanitizedData[key];
            break;
          case 'lastName':
            supabaseUpdateData.last_name = sanitizedData[key];
            break;
          case 'phoneNumber':
            supabaseUpdateData.phone = sanitizedData[key];
            break;
          case 'registrationType':
            supabaseUpdateData.registration_type = sanitizedData[key];
            break;
          case 'paymentStatus':
            supabaseUpdateData.payment_status = sanitizedData[key];
            break;
          case 'expectations':
            supabaseUpdateData.expectations = sanitizedData[key];
            break;
          case 'referralSource':
            supabaseUpdateData.referral_source = sanitizedData[key];
            break;
          case 'breakoutSessionChoice':
            supabaseUpdateData.breakout_session_choice = sanitizedData[key];
            break;
          default:
            supabaseUpdateData[key] = sanitizedData[key];
        }
      });

      const result = await updateAttendee(attendeeId, supabaseUpdateData);

      if (!result.success) {
        throw new ApiError(result.error || "Update failed", 400);
      }

      return {
        success: true,
        data: transformFromSupabaseFormat(result.data),
        message: result.message,
      };
    } catch (error) {
      console.error("Update Attendee API Error:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || "Failed to update attendee", 500);
    }
  },

  // Get all attendees (for admin)
  getAllAttendees: async (options = {}) => {
    try {
      const result = await getAttendees(options);

      if (!result.success) {
        throw new ApiError(result.error || "Failed to fetch attendees", 500);
      }

      return {
        success: true,
        data: result.data.map(transformFromSupabaseFormat),
        pagination: result.pagination
      };
    } catch (error) {
      console.error("Get All Attendees API Error:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || "Failed to fetch attendees", 500);
    }
  },

  // Get registration statistics
  getStats: async () => {
    try {
      const result = await getRegistrationStats();

      if (!result.success) {
        throw new ApiError(result.error || "Failed to fetch stats", 500);
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error("Get Registration Stats API Error:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || "Failed to fetch registration stats", 500);
    }
  },

  // Export attendees
  exportAttendees: async () => {
    try {
      const result = await exportAttendeesToCSV();

      if (!result.success) {
        throw new ApiError(result.error || "Export failed", 500);
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error("Export Attendees API Error:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || "Failed to export attendees", 500);
    }
  },

  // Verify payment
  verifyPayment: async (data) => {
    try {
      const { transaction_ref } = data;

      if (!transaction_ref) {
        throw new ApiError("Transaction reference is required", 400);
      }

      const { data: response, error } = await supabase.functions.
        //https://paystack.com/docs/api/transaction/#verify
        invoke('verify-payment', {
          queryParams: {
            transaction_ref: transaction_ref
          }
        })

      if (error) {
        throw new ApiError(error.message, error.status);
      }

      console.log("Payment verification response:", response);

      return {
        success: true,
        data: response,
        message: "Payment verification successful"
      };
    } catch (error) {
      console.error("Error verifying payment:", error);
      return {
        success: false,
        error: handleApiError(error),
        message: "Failed to verify payment"
      };
    }
  },
};

// Payment API methods (updated to use Supabase)
export const paymentAPI = {
  // Private helper to initialize Flutterwave payment.
  _initializeFlutterwavePayment: async (paymentData) => {
    try {
      if (!paymentData || !paymentData.registrationData) {
        throw new ApiError("Registration data is required for payment initialization", 400);
      }

      const { registrationData, amount } = paymentData;
      const { email, phoneNumber, firstName, lastName, registrationType } = registrationData;

      // Basic validation
      if (!email || !amount || !firstName || !lastName) {
        throw new ApiError("Missing required fields for payment initialization", 400);
      }

      // Generate transaction reference
      const transactionRef = `BISUM_${Date.now()}_${String(Math.random()).substring(2, 8)}`;

      // Calculate Paystack charges
      let paystackCharge = 0;
      const percentageCharge = 0.015 * amount; // 1.5%
      paystackCharge = percentageCharge + 100;

      // Cap the charge at 1000 for amounts <= 1000, and at 2000 otherwise
      const chargeCap = amount <= 1000 ? 1000 : 2000;
      paystackCharge = Math.min(paystackCharge, chargeCap);

      const amountWithCharges = amount + paystackCharge;

      // Return Flutterwave initialization data
      return {
        success: true,
        data: {
          transactionRef,
          amount: amountWithCharges,
          currency: 'NGN',
          // Flutterwave specific data for frontend
          flutterwaveConfig: {
            public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
            tx_ref: transactionRef,
            amount: amountWithCharges,
            currency: 'NGN',
            payment_options: 'card,mobilemoney,ussd',
            customer: {
              email: email,
              phone_number: phoneNumber,
              name: `${firstName} ${lastName}`
            },
            customizations: {
              title: 'BISUM Conference 2025',
              description: `Registration fee for ${registrationType}`,
              logo: 'https://bhxxyjgpzozcvuyxzfyn.supabase.co/storage/v1/object/public/Bisum%20Pictures/BISUM%20logo.png' // QUICK FIX: Replace localhost URL with a public one.
            },
            redirect_url: `https://www.bisum.hgbcinfluencers.org/`, // Dynamic redirect URL
            meta: {
              // Pass all registration data to the webhook/verification
              registrationData: JSON.stringify(registrationData)
            }
          }
        },
        message: "Payment details prepared successfully",
      };
    } catch (error) {
      console.error("Initialize Payment API Error:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || "Failed to initialize payment", 500);
    }
  },

  // Main entry point for payment initialization, dispatches to specific payment gateways
  initialize: async ({ amount, registrationData, paymentMethod }) => {
    try {
      if (!registrationData || !amount || !paymentMethod) {
        throw new ApiError("Missing required data for payment initialization.", 400);
      }

      if (paymentMethod === 'flutterwave') {
        return await paymentAPI._initializeFlutterwavePayment({ amount, registrationData });
      } else if (paymentMethod === 'bank_transfer') {
        // For bank transfers, we might create a pending payment record
        // or just return instructions. For now, let's return instructions.
        return await paymentAPI.initiateBankTransfer({ amount, registrationData });
      } else if (paymentMethod === 'opay') {
        return await paymentAPI.initiateOpayPayment({ amount, registrationData });
      }
      else {
        throw new ApiError("Unsupported payment method.", 400);
      }
    } catch (error) {
      console.error(`Initialize Payment API Error (${paymentMethod}):`, error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || `Failed to initialize ${paymentMethod} payment.`, 500);
    }
  },

  verifyTransaction: async (transactionId) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        method: 'GET',
        params: { transaction_id: transactionId },
      });

      if (error) {
        throw new ApiError(error.message, 500);
      }

      if (data.error) {
        throw new ApiError(data.error, 400);
      }

      return {
        success: true,
        data: data.data,
        message: data.message,
      };
    } catch (error) {
      console.error('Verify Transaction API Error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || 'Failed to verify transaction', 500);
    }
  },

  // Initiate bank transfer payment
  initiateBankTransfer: async ({ amount, registrationData }) => {
    try {
      // In a real scenario, you might create a pending payment record in Supabase
      // and associate it with the registration data.
      // For this example, we'll return success with bank details.

      // Generate a unique reference for the bank transfer
      const bankTransferRef = `BISUM_BT_${Date.now()}_${String(Math.random()).substring(2, 8)}`;

      // Store a pending payment record if necessary (not implemented here)
      // Example:
      // const { data, error } = await supabase.from('payments').insert([
      //   {
      //     amount: amount,
      //     currency: 'NGN',
      //     status: 'pending',
      //     payment_method: 'bank_transfer',
      //     transaction_ref: bankTransferRef,
      //     // Store registrationData in metadata if needed for later processing
      //     metadata: { registrationData },
      //   }
      // ]).select();
      // if (error) throw new ApiError(error.message, 500);

      return {
        success: true,
        data: {
          transactionRef: bankTransferRef,
          amount,
          currency: 'NGN',
          instructions: {
            accountName: 'BISUM Conference',
            accountNumber: '1234567890', // Replace with actual account number
            bankName: 'Example Bank PLC', // Replace with actual bank name
            amountDue: formatCurrency(amount, 'NGN'),
            reference: bankTransferRef,
          },
          registrationData: registrationData, // Return for client-side display
        },
        message: "Bank transfer details provided. Awaiting payment.",
      };
    } catch (error) {
      console.error("Initiate Bank Transfer API Error:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || "Failed to initiate bank transfer", 500);
    }
  },

  // Initiate Opay payment
  initiateOpayPayment: async ({ amount, registrationData }) => {
    try {
      // In a real scenario, this would involve a backend call to Opay's API
      // to generate a payment link or QR code, or initiate a direct debit.
      // For this example, we'll return simulated Opay details.

      const opayRef = `BISUM_OPAY_${Date.now()}_${String(Math.random()).substring(2, 8)}`;

      // Simulate creating a pending payment record
      // const { data, error } = await supabase.from('payments').insert([
      //   {
      //     amount: amount,
      //     currency: 'NGN',
      //     status: 'pending',
      //     payment_method: 'opay',
      //     transaction_ref: opayRef,
      //     metadata: { registrationData },
      //   }
      // ]).select();
      // if (error) throw new ApiError(error.message, 500);

      return {
        success: true,
        data: {
          transactionRef: opayRef,
          amount,
          currency: 'NGN',
          instructions: {
            accountName: 'BISUM Conference Opay',
            phoneNumber: '+2348011223344', // Replace with actual Opay business number
            amountDue: formatCurrency(amount, 'NGN'),
            reference: opayRef,
            // Could include a QR code URL or deep link here
          },
          registrationData: registrationData,
        },
        message: "Opay payment details provided. Awaiting payment.",
      };
    } catch (error) {
      console.error("Initiate Opay Payment API Error:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || "Failed to initiate Opay payment", 500);
    }
  },

  // Verify payment
  verify: async (transactionId) => {
    try {
      if (!transactionId) {
        throw new ApiError("Transaction ID is required", 400);
      }

      // First try to get payment by Flutterwave transaction ID
      let paymentResult = await getPaymentByFlutterwaveId(transactionId);

      // If not found, try by transaction reference
      if (!paymentResult.success || !paymentResult.data) {
        paymentResult = await getPaymentByTransactionRef(transactionId);
      }

      if (!paymentResult.success || !paymentResult.data) {
        throw new ApiError("Payment record not found", 404);
      }

      const payment = paymentResult.data;

      // If payment is already successful, return it
      if (payment.status === 'completed') {
        return {
          success: true,
          data: {
            id: payment.id,
            transactionRef: payment.transaction_ref,
            flutterwaveTransactionId: payment.flutterwave_transaction_id,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            paidAt: payment.paid_at,
            attendeeId: payment.attendee_id,
            attendee: payment.attendees ? {
              registrationNumber: payment.attendees.registration_number,
              fullName: `${payment.attendees.first_name} ${payment.attendees.last_name}`,
              email: payment.attendees.email
            } : null
          },
          message: "Payment verified successfully",
        };
      }

      // For pending payments, we should ideally verify with Flutterwave API
      // For now, we'll return the current status
      return {
        success: false,
        message: "Payment is still pending verification",
        data: {
          status: payment.status,
          transactionRef: payment.transaction_ref
        }
      };

    } catch (error) {
      console.error("Verify Payment API Error:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || "Failed to verify payment", 500);
    }
  },

  // Get payment by ID
  getPayment: async (paymentId) => {
    try {
      if (!paymentId) {
        throw new ApiError("Payment ID is required", 400);
      }

      const result = await getPaymentById(paymentId);

      if (!result.success) {
        throw new ApiError(result.error || "Payment not found", 404);
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error("Get Payment API Error:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || "Failed to fetch payment", 500);
    }
  },

  // Get payments by attendee ID
  getPaymentsByAttendee: async (attendeeId) => {
    try {
      if (!attendeeId) {
        throw new ApiError("Attendee ID is required", 400);
      }

      const result = await getPaymentsByAttendeeId(attendeeId);

      if (!result.success) {
        throw new ApiError(result.error || "Failed to fetch payments", 500);
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error("Get Payments by Attendee API Error:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || "Failed to fetch payments", 500);
    }
  },

  // Get all payments (for admin)
  getAllPayments: async (options = {}) => {
    try {
      const result = await getPayments(options);

      if (!result.success) {
        throw new ApiError(result.error || "Failed to fetch payments", 500);
      }

      return {
        success: true,
        data: result.data,
        pagination: result.pagination
      };
    } catch (error) {
      console.error("Get All Payments API Error Error:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || "Failed to fetch payments", 500);
    }
  },

  // Get payment statistics
  getStats: async (dateRange = null) => {
    try {
      const result = await getPaymentStats(dateRange);

      if (!result.success) {
        throw new ApiError(result.error || "Failed to fetch payment stats", 500);
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error("Get Payment Stats API Error:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || "Failed to fetch payment stats", 500);
    }
  },

  // Process webhook (for server-side processing)
  processWebhook: async (webhookData) => {
    try {
      const result = await processFlutterwaveWebhook(webhookData);

      return result;
    } catch (error) {
      console.error("Process Webhook API Error:", error);
      throw new ApiError(error.message || "Failed to process webhook", 500);
    }
  },

  // Export payments
  exportPayments: async () => {
    try {
      const result = await exportPaymentsToCSV();

      if (!result.success) {
        throw new ApiError(result.error || "Export failed", 500);
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error("Export Payments API Error:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || "Failed to export payments", 500);
    }
  },

  // Handle successful payment and complete registration
  handlePaymentSuccess: async (transactionRef, flutterwaveTransactionId) => {
    try {
      if (!transactionRef && !flutterwaveTransactionId) {
        throw new ApiError("Transaction reference or Flutterwave ID is required", 400);
      }

      // Get payment record
      let paymentResult;
      if (transactionRef) {
        paymentResult = await getPaymentByTransactionRef(transactionRef);
      } else {
        paymentResult = await getPaymentByFlutterwaveId(flutterwaveTransactionId);
      }

      if (!paymentResult.success) {
        throw new ApiError("Payment not found", 404);
      }

      const payment = paymentResult.data;

      // Check if this payment has registration data (new flow)
      if (payment.flutterwave_response?.registrationData && !payment.attendee_id) {
        const registrationData = payment.flutterwave_response.registrationData;

        // Complete the registration now that payment is successful
        const registrationResult = await registrationAPI.register(registrationData);

        if (registrationResult.success) {
          // Update payment record with attendee ID
          const updateResult = await updatePayment(payment.id, {
            attendeeId: registrationResult.data.id,
            status: 'completed',
            paidAt: new Date().toISOString()
          });

          // Update attendee payment status
          await updateAttendeePaymentStatus(registrationResult.data.id, 'completed');

          return {
            success: true,
            data: {
              attendee: registrationResult.data,
              payment: payment,
              message: "Registration completed successfully after payment!"
            }
          };
        } else {
          throw new ApiError("Failed to complete registration after payment", 500);
        }
      } else {
        // Old flow or already processed
        return {
          success: true,
          data: {
            payment: payment,
            message: "Payment already processed"
          }
        };
      }

    } catch (error) {
      console.error("Payment Success Handler Error:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || "Failed to handle payment success", 500);
    }
  },
};

// Utility function to handle API errors consistently (keeping compatibility)
export const handleApiError = (error) => {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      status: error.status,
      data: error.data,
    };
  }

  return {
    message: error.message || "An unexpected error occurred. Please try again.",
    status: 500,
    data: null,
  };
};

// Helper function to get registration price
export const getRegistrationPrice = (registrationType) => {
  return REGISTRATION_PRICES[registrationType] || 0;
};

// Helper function to format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount);
};

// Export the API error class for use in components (keeping compatibility)
export { ApiError };

// Export registration types and prices for use in components
export const registrationTypes = [
  { value: REGISTRATION_TYPES.STUDENT, label: `Student - ${formatCurrency(REGISTRATION_PRICES[REGISTRATION_TYPES.STUDENT])}`, price: REGISTRATION_PRICES[REGISTRATION_TYPES.STUDENT] },
  { value: REGISTRATION_TYPES.PROFESSIONAL, label: `Professional - ${formatCurrency(REGISTRATION_PRICES[REGISTRATION_TYPES.PROFESSIONAL])}`, price: REGISTRATION_PRICES[REGISTRATION_TYPES.PROFESSIONAL] },
];
