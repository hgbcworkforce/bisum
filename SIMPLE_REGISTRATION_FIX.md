# BISUM Conference - Simple Registration Fix

## 🚨 Problem: "null value in column attendee_id violates not-null constraint"

The registration flow is trying to create a payment record before the attendee record exists. Here's the simple fix:

## 🛠️ Fix 1: Update Registration Flow (Frontend)

Replace the `handleSubmit` function in `client/src/pages/Registration.jsx`:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();

  // Validate form
  const validation = validateForm();
  if (!validation.isValid) {
    setErrors(validation.errors);
    return;
  }

  setIsSubmitting(true);
  setErrors({});

  try {
    console.log("Form data being submitted:", formData);

    // STEP 1: Always create the attendee record first
    const registrationResult = await registrationAPI.register(formData);

    if (!registrationResult.success) {
      throw new Error(registrationResult.error || "Registration failed");
    }

    console.log("Attendee created successfully:", registrationResult.data);
    setAttendeeData(registrationResult.data);

    // STEP 2: If payment is required, initialize payment with attendee ID
    if (currentPrice > 0) {
      console.log("Initializing payment for amount:", currentPrice);
      setMessage("Registration successful! Redirecting to payment...");
      
      await handlePaymentInitialization({
        attendeeId: registrationResult.data.id,
        amount: currentPrice
      });
    } else {
      // STEP 3: For free registrations, complete immediately
      setSubmitSuccess(true);
      setRegistrationComplete(true);
      showSuccessMessage(
        "Registration completed successfully! Welcome to BISUM Conference 2025."
      );
    }

  } catch (error) {
    console.error("Registration error:", error);
    
    let errorMessage = "Registration failed. Please try again.";
    
    if (error.message) {
      if (error.message.includes('email') && error.message.includes('already')) {
        errorMessage = "This email is already registered for the conference.";
      } else if (error.message.includes('duplicate key')) {
        errorMessage = "This email is already registered for the conference.";
      } else if (error.message.includes('violates check constraint')) {
        errorMessage = "Please check your input data for any invalid characters.";
      } else if (error.message.includes('permission') || error.message.includes('denied')) {
        errorMessage = "Registration temporarily unavailable. Please contact support.";
      } else {
        errorMessage = error.message;
      }
    }

    setErrors({ submit: errorMessage });
    setMessage("");
  } finally {
    setIsSubmitting(false);
  }
};
```

## 🛠️ Fix 2: Update Payment Initialization

Replace the `handlePaymentInitialization` function in the same file:

```javascript
const handlePaymentInitialization = async (paymentData) => {
  if (!paymentData.attendeeId || currentPrice === 0) {
    console.log("No payment needed:", { attendeeId: paymentData.attendeeId, price: currentPrice });
    return;
  }

  setIsProcessingPayment(true);

  try {
    console.log("Initializing payment with data:", paymentData);
    
    const paymentResult = await paymentAPI.initializePayment({
      attendeeId: paymentData.attendeeId,
      amount: paymentData.amount
    });

    if (paymentResult.success && paymentResult.data.flutterwaveConfig) {
      const config = paymentResult.data.flutterwaveConfig;
      console.log("Payment config received, redirecting to Flutterwave");

      // Create form to submit to Flutterwave
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://checkout.flutterwave.com/v3/hosted/pay";
      form.style.display = "none";

      Object.keys(config).forEach((key) => {
        if (typeof config[key] === "object" && config[key] !== null) {
          Object.keys(config[key]).forEach((subKey) => {
            const input = document.createElement("input");
            input.name = `${key}[${subKey}]`;
            input.value = config[key][subKey];
            form.appendChild(input);
          });
        } else {
          const input = document.createElement("input");
          input.name = key;
          input.value = config[key];
          form.appendChild(input);
        }
      });

      document.body.appendChild(form);
      form.submit();
    } else {
      throw new Error(paymentResult.error || "Payment initialization failed");
    }
  } catch (error) {
    console.error("Payment initialization error:", error);
    setErrors({ payment: error.message || "Failed to initialize payment" });
    setIsProcessingPayment(false);
  }
};
```

## 🛠️ Fix 3: Ensure Service API Consistency

Update `client/src/services/supabaseService.js` to make sure `initializePayment` exists:

```javascript
export const paymentAPI = {
  // Initialize payment for an existing attendee
  initializePayment: async (paymentData) => {
    try {
      if (!paymentData || !paymentData.attendeeId) {
        throw new ApiError("Attendee ID is required for payment initialization", 400);
      }

      console.log("Payment API: Initializing payment for attendee:", paymentData.attendeeId);

      // Get the attendee record
      const attendeeResult = await getAttendeeById(paymentData.attendeeId);
      if (!attendeeResult.success) {
        throw new ApiError("Invalid attendee ID", 400);
      }

      const attendee = attendeeResult.data;
      const expectedAmount = REGISTRATION_PRICES[attendee.registration_type] || 0;

      if (expectedAmount === 0) {
        throw new ApiError(`No payment required for ${attendee.registration_type}`, 400);
      }

      // Validate amount if provided
      if (paymentData.amount && Math.abs(paymentData.amount - expectedAmount) > 1) {
        throw new ApiError(`Invalid amount. Expected ${expectedAmount} for ${attendee.registration_type}`, 400);
      }

      // Generate transaction reference
      const transactionRef = `BISUM_${Date.now()}_${attendee.registration_number}`;
      const flutterwaveTransactionId = `FW_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      console.log("Payment API: Creating payment record with transaction ref:", transactionRef);

      // Create payment record with valid attendee_id
      const paymentCreateData = {
        transactionRef,
        flutterwaveTransactionId,
        attendeeId: paymentData.attendeeId, // This is now guaranteed to exist
        amount: expectedAmount,
        currency: 'NGN',
        paymentMethod: 'card',
        paymentChannel: 'web',
        flutterwaveResponse: {
          registrationType: attendee.registration_type,
          attendeeName: `${attendee.first_name} ${attendee.last_name}`,
          attendeeEmail: attendee.email,
          registrationNumber: attendee.registration_number
        }
      };

      const result = await createPayment(paymentCreateData);

      if (!result.success) {
        throw new ApiError(result.error || "Failed to initialize payment", 400);
      }

      console.log("Payment API: Payment record created successfully:", result.data.id);

      // Return Flutterwave configuration
      return {
        success: true,
        data: {
          paymentId: result.data.id,
          transactionRef,
          flutterwaveTransactionId,
          amount: expectedAmount,
          currency: 'NGN',
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
              title: 'BISUM Conference 2025',
              description: `Registration fee for ${attendee.registration_type}`,
              logo: `${window.location.origin}/logo.png`
            },
            redirect_url: `${window.location.origin}/payment-success`
          }
        },
        message: "Payment initialized successfully",
      };
    } catch (error) {
      console.error("Payment API Error:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || "Failed to initialize payment", 500);
    }
  },

  // Keep backward compatibility
  initialize: async (paymentData) => {
    if (paymentData.attendeeId) {
      return await paymentAPI.initializePayment(paymentData);
    }
    throw new ApiError("attendeeId is required. Create attendee first using registrationAPI.register()", 400);
  },

  // ... rest of payment API methods
};
```

## ✅ How This Fix Works:

1. **Registration Form Submission:**
   - Always creates attendee record FIRST
   - Only then initializes payment with the attendee ID

2. **Payment Initialization:**
   - Requires an existing attendee ID
   - Creates payment record with valid foreign key reference

3. **Error Handling:**
   - Better error messages for common issues
   - Console logging for debugging

## 🧪 Test the Fix:

1. **Save the updated files**
2. **Restart your dev server:** `cd client && npm run dev`
3. **Fill out registration form**
4. **Submit form**
5. **Should see:** Registration success → Payment redirect (if payment required)

## 🔍 Expected Flow:

```
User fills form → 
Submit → 
Create attendee in database → 
✅ Attendee created with ID → 
Initialize payment with attendee ID → 
✅ Payment record created → 
Redirect to Flutterwave
```

The key fix is ensuring the attendee exists BEFORE trying to create the payment record.