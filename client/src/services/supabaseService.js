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
    "organization",
    "registrationType",
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
    !/^[\d\s\+\-()]{10,}$/.test(data.phoneNumber.trim())
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
  return {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phoneNumber || data.phone, // Support both field names
    organization: data.organization,
    position: data.position || null,
    registrationType: data.registrationType,
    dietaryRestrictions: data.dietaryRestrictions || null,
    specialNeeds: data.specialNeeds || null,
    sessionPreferences: data.sessionPreferences || []
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
    organization: data.organization,
    position: data.position,
    registrationNumber: data.registration_number,
    registrationType: data.registration_type,
    registrationDate: data.registration_date,
    paymentStatus: data.payment_status,
    dietaryRestrictions: data.dietary_restrictions,
    specialNeeds: data.special_needs,
    sessionPreferences: data.session_preferences || [],
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    // Add computed properties
    isFullyRegistered: data.payment_status === 'completed',
    payments: data.payments || []
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
          case 'dietaryRestrictions':
            supabaseUpdateData.dietary_restrictions = sanitizedData[key];
            break;
          case 'specialNeeds':
            supabaseUpdateData.special_needs = sanitizedData[key];
            break;
          case 'sessionPreferences':
            supabaseUpdateData.session_preferences = sanitizedData[key];
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
};

// Payment API methods (updated to use Supabase)
export const paymentAPI = {
  // Initialize payment
  initialize: async (paymentData) => {
    try {
      // Validate required fields
      if (!paymentData.attendeeId || !paymentData.amount) {
        throw new ApiError("Attendee ID and amount are required", 400);
      }

      // Get attendee to validate registration type and calculate price
      const attendeeResult = await getAttendeeById(paymentData.attendeeId);
      if (!attendeeResult.success) {
        throw new ApiError("Invalid attendee ID", 400);
      }

      const attendee = attendeeResult.data;
      const expectedAmount = REGISTRATION_PRICES[attendee.registration_type] || 0;

      // Validate amount matches expected price
      if (Math.abs(paymentData.amount - expectedAmount) > 1) { // Allow 1 naira tolerance
        throw new ApiError(`Invalid amount. Expected ${expectedAmount} for ${attendee.registration_type}`, 400);
      }

      // Generate transaction reference
      const transactionRef = `BISUM_${Date.now()}_${attendee.registration_number}`;
      const flutterwaveTransactionId = `FW_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create payment record
      const paymentCreateData = {
        transactionRef,
        flutterwaveTransactionId,
        attendeeId: paymentData.attendeeId,
        amount: expectedAmount,
        currency: 'NGN',
        paymentMethod: 'card', // Default, will be updated by webhook
        paymentChannel: 'web',
        flutterwaveResponse: {},
        metadata: {
          registrationType: attendee.registration_type,
          attendeeName: `${attendee.first_name} ${attendee.last_name}`,
          attendeeEmail: attendee.email
        }
      };

      const result = await createPayment(paymentCreateData);

      if (!result.success) {
        throw new ApiError(result.error || "Failed to initialize payment", 400);
      }

      // Return Flutterwave initialization data
      return {
        success: true,
        data: {
          paymentId: result.data.id,
          transactionRef,
          flutterwaveTransactionId,
          amount: expectedAmount,
          currency: 'NGN',
          // Flutterwave specific data for frontend
          flutterwaveConfig: {
            public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
            tx_ref: transactionRef,
            amount: expectedAmount,
            currency: 'NGN',
            payment_options: 'card,mobilemoney,ussd',
            customer: {
              email: attendee.email,
              phone_number: attendee.phone,
              name: `${attendee.first_name} ${attendee.last_name}`
            },
            customizations: {
              title: 'BISUM Conference 2024',
              description: `Registration fee for ${attendee.registration_type}`,
              logo: `${window.location.origin}/logo.png`
            },
            redirect_url: `${window.location.origin}/payment-callback`
          }
        },
        message: "Payment initialized successfully",
      };
    } catch (error) {
      console.error("Initialize Payment API Error:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || "Failed to initialize payment", 500);
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
  { value: REGISTRATION_TYPES.SPEAKER, label: `Speaker - ${formatCurrency(REGISTRATION_PRICES[REGISTRATION_TYPES.SPEAKER])}`, price: REGISTRATION_PRICES[REGISTRATION_TYPES.SPEAKER] },
  { value: REGISTRATION_TYPES.SPONSOR, label: `Sponsor - ${formatCurrency(REGISTRATION_PRICES[REGISTRATION_TYPES.SPONSOR])}`, price: REGISTRATION_PRICES[REGISTRATION_TYPES.SPONSOR] },
];
