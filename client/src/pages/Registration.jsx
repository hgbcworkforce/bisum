import { useState, useCallback, useRef } from "react";
import { Navigation, Footer } from "../components";
import {
  registrationAPI,
  paymentAPI,
  handleApiError,
  registrationTypes,
  formatCurrency,
} from "../services/supabaseService";
import { Check, XCircle, ArrowRight, AlertCircle } from "lucide-react";

const Registration = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    registrationType: "professional",
    referralSource: "",
    breakoutSessionChoice: "",
    expectations: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [attendeeData, setAttendeeData] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [currentTransactionRef, setCurrentTransactionRef] = useState(null);

  // Prevent double submissions
  const isProcessingRef = useRef(false);

  const sessionOptions = [
    "Artificial Intelligence & Machine Learning",
    "Blockchain & Cryptocurrency",
    "Sustainable Technology",
    "Mobile App Development",
    "Fintech & Digital Payments",
    "Cybersecurity",
    "DevOps & Cloud Computing",
    "Data Science & Analytics",
  ];

  // Calculate Paystack charges
  const calculatePaystackCharge = (amount) => {
    if (amount === 0) return 0;

    // 1.5% of amount
    let paystackCharge = 0.015 * amount;

    // Add ₦100 if amount >= 2500
    if (amount >= 2500) {
      paystackCharge += 100;
    }

    // Cap at ₦2000
    paystackCharge = Math.min(paystackCharge, 2000);

    return Math.round(paystackCharge); // Round to nearest naira
  };

  // Get current registration type pricing
  const currentPrice =
    registrationTypes.find((type) => type.value === formData.registrationType)
      ?.price || 0;

  // Calculate total price with Paystack charges
  const paystackFee = calculatePaystackCharge(currentPrice);
  const chargedPrice = currentPrice + paystackFee;

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      if (name === "sessionPreferences") {
        const session = value;
        setFormData((prev) => ({
          ...prev,
          sessionPreferences: checked
            ? [...prev.sessionPreferences, session]
            : prev.sessionPreferences.filter((s) => s !== session),
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.trim().length > 50) {
      newErrors.firstName = "First name cannot exceed 50 characters";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length > 50) {
      newErrors.lastName = "Last name cannot exceed 50 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else {
      const digitsOnly = formData.phoneNumber.replace(/\D/g, "");
      if (digitsOnly.length < 10 || digitsOnly.length > 15) {
        newErrors.phoneNumber = "Please enter a valid phone number (10-15 digits)";
      }
    }

    if (!formData.referralSource) {
      newErrors.referralSource = "Referral source is required";
    }

    if (!formData.breakoutSessionChoice) {
      newErrors.breakoutSessionChoice = "Breakout session choice is required";
    }

    if (!formData.registrationType) {
      newErrors.registrationType = "Please select a registration type";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showSuccessMessage = (message) => {
    alert(message);
  };

  const showErrorMessage = (message) => {
    alert(message);
  };

  // Improved payment handler with timeout and better error handling
  const handlePaystackPayment = useCallback(async (response) => {
    console.log("Paystack payment successful", response);

    // Prevent duplicate processing
    if (isProcessingRef.current) {
      console.log("Payment already being processed");
      return;
    }

    isProcessingRef.current = true;
    setIsProcessingPayment(true);

    try {
      // Add timeout for verification (30 seconds)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Payment verification timeout. Please contact support with your transaction reference.')), 30000)
      );

      const verificationPromise = paymentAPI.verifyPayment({
        transaction_ref: response.reference,
      });

      const verificationResult = await Promise.race([verificationPromise, timeoutPromise]);

      if (verificationResult.success) {
        setAttendeeData(verificationResult.data);
        setSubmitSuccess(true);
        setRegistrationComplete(true);
        sessionStorage.removeItem("registrationData");
        sessionStorage.removeItem("lastPaymentRef");
        showSuccessMessage("Registration completed successfully! Welcome to BISUM Conference 2025.");
      } else {
        throw new Error(verificationResult.error || "Payment verification failed.");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      const errorMessage = error.message || "Payment verification failed. Please contact support.";
      setErrors({ payment: errorMessage });
      showErrorMessage(`${errorMessage}\n\nTransaction Reference: ${response.reference}\nPlease save this reference for support.`);
      sessionStorage.setItem("failedPaymentRef", response.reference);
    } finally {
      setIsSubmitting(false);
      setIsProcessingPayment(false);
      isProcessingRef.current = false;
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double submissions
    if (isProcessingRef.current) {
      console.log("Form already being processed");
      return;
    }

    try {
      // Validate form
      if (!validateForm()) {
        const firstErrorField = Object.keys(errors)[0];
        if (firstErrorField) {
          const element = document.querySelector(`[name="${firstErrorField}"]`);
          element?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }

      // Prepare submission
      setIsSubmitting(true);
      setErrors({});
      isProcessingRef.current = true;
      sessionStorage.setItem("registrationData", JSON.stringify(formData));

      // If payment is required
      if (currentPrice > 0) {
        const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
        console.log("Paystack Public Key:", paystackPublicKey, typeof paystackPublicKey);

        if (!paystackPublicKey) {
          throw new Error("Payment configuration error. Please contact support.");
        }

        if (typeof PaystackPop === "undefined") {
          throw new Error("Payment system not loaded. Please refresh the page and try again.");
        }

        const email = formData.email;
        const amount = chargedPrice * 100; // Convert to kobo
        const reference = `BISUM-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        setCurrentTransactionRef(reference);
        sessionStorage.setItem("lastPaymentRef", reference);

        console.log("Initializing Paystack with:", { email, amount, reference });

        try {
          const handler = PaystackPop.setup({
            key: paystackPublicKey,
            email: email,
            amount: amount,
            currency: "NGN",
            ref: reference,
            metadata: {
              custom_fields: [
                {
                  display_name: "Full Name",
                  variable_name: "full_name",
                  value: `${formData.firstName} ${formData.lastName}`,
                },
                {
                  display_name: "Phone",
                  variable_name: "phone",
                  value: formData.phoneNumber,
                },
                {
                  display_name: "Registration Type",
                  variable_name: "registration_type",
                  value: formData.registrationType,
                },
              ],
              registration_type: formData.registrationType,
              breakout_session: formData.breakoutSessionChoice,
              referral_source: formData.referralSource,
            },
            callback: function(response) {
              handlePaystackPayment(response);
            },
            onClose: function() {
              setIsSubmitting(false);
              isProcessingRef.current = false;
              console.log("Payment window closed by user");
              const message = "Payment window was closed. If you completed the payment, please wait for confirmation or contact support.\n\nTransaction Reference: " + reference;
              console.log(message);
            },
          });

          handler.openIframe();
        } catch (paystackError) {
          console.error("Paystack initialization error:", paystackError);
          isProcessingRef.current = false;
          throw new Error("Failed to initialize payment. Please try again.");
        }

      } else {
        // Free registration (no payment)
        try {
          const registrationResult = await registrationAPI.registerAttendee(formData);

          if (registrationResult.success) {
            setAttendeeData(registrationResult.data);
            setSubmitSuccess(true);
            setRegistrationComplete(true);
            sessionStorage.removeItem("registrationData");
            showSuccessMessage(
              "Registration completed successfully! Welcome to BISUM Conference 2025."
            );
          } else {
            throw new Error(registrationResult.error || "Registration failed. Please try again.");
          }
        } catch (regError) {
          console.error("Registration error:", regError);
          throw regError;
        } finally {
          isProcessingRef.current = false;
        }
      }
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error("Registration error:", error);
      setErrors({ general: errorInfo.message });
      showErrorMessage(errorInfo.message);
      setIsSubmitting(false);
      isProcessingRef.current = false;
    }
  };

  // Retry payment function
  const retryPayment = () => {
    setErrors({});
    setIsSubmitting(false);
    isProcessingRef.current = false;
  };

  // Show success page after registration completion
  if (registrationComplete && submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation onNavigate={scrollToSection} />
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg text-center">
            <div>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Registration Successful!
              </h2>
              <p className="text-gray-600 mb-4">
                Thank you for registering for BISUM Conference 2025.
                {attendeeData && (
                  <>
                    {" "}
                    Your registration number is:{" "}
                    <strong>{attendeeData.registrationNumber}</strong>
                  </>
                )}
              </p>
              {isProcessingPayment ? (
                <div className="text-blue-600">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p>Processing payment verification...</p>
                </div>
              ) : currentPrice > 0 ? (
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <p className="text-green-800">
                    Payment of <strong>{formatCurrency(chargedPrice)}</strong> has been completed successfully!
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <p className="text-green-800">
                    Your registration is complete! No payment required.
                  </p>
                </div>
              )}
              <p className="text-sm text-gray-500">
                A confirmation email has been sent to your email address.
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation onNavigate={scrollToSection} />

      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 pt-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
            Register for BISUM Conference 2025
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            Join us for an inspiring experience of innovation, learning, and networking
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 inline-block">
            <p className="text-lg font-semibold mb-2">
              November 13-15, 2025 • Higher Ground Baptist Church, Ogbomoso, Nigeria.
            </p>
            <p className="text-blue-200">
              Secure your spot at BISUM'25
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 sm:p-12">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Registration Form
                </h2>
                <p className="text-gray-600">
                  Please fill out all required information to secure your spot.
                </p>
              </div>

              {errors.general && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <XCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-600">{errors.general}</p>
                    </div>
                  </div>
                </div>
              )}

              {errors.payment && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="ml-3 flex-1">
                      <p className="text-sm text-red-600 mb-2">{errors.payment}</p>
                      {currentTransactionRef && (
                        <p className="text-xs text-red-500 mb-2">
                          Reference: {currentTransactionRef}
                        </p>
                      )}
                      <button
                        onClick={retryPayment}
                        className="text-sm font-medium text-red-600 hover:text-red-500 underline"
                      >
                        Clear and Try Again
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {typeof PaystackPop === "undefined" && currentPrice > 0 && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Payment system is loading... If this message persists, please refresh the page.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        id="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.firstName
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter your first name"
                        maxLength="50"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        id="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.lastName
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter your last name"
                        maxLength="50"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.lastName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.email
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="your.email@example.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="phoneNumber"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.phoneNumber
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="+234 801 234 5678"
                      />
                      {errors.phoneNumber && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.phoneNumber}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-gray-500">
                        Include country code for international numbers.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Registration Type
                  </h3>
                  <div className="space-y-3">
                    {registrationTypes.map((type) => (
                      <div key={type.value} className="flex items-center">
                        <input
                          id={type.value}
                          name="registrationType"
                          type="radio"
                          value={type.value}
                          checked={formData.registrationType === type.value}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label
                          htmlFor={type.value}
                          className="ml-3 block text-sm font-medium text-gray-700"
                        >
                          {type.label}
                        </label>
                      </div>
                    ))}
                    {errors.registrationType && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.registrationType}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    How did you hear about us? *
                  </h3>
                  <div>
                    <select
                      id="referralSource"
                      name="referralSource"
                      value={formData.referralSource}
                      onChange={handleInputChange}
                      className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.referralSource
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select an option</option>
                      <option value="church">Church</option>
                      <option value="instagram">Instagram</option>
                      <option value="recommendation_from_friend">Recommendation from a friend</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="facebook">Facebook</option>
                      <option value="flyer">Flyer</option>
                    </select>
                    {errors.referralSource && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.referralSource}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Breakout Session Choice *
                  </h3>
                  <div>
                    <select
                      id="breakoutSessionChoice"
                      name="breakoutSessionChoice"
                      value={formData.breakoutSessionChoice}
                      onChange={handleInputChange}
                      className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.breakoutSessionChoice
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select an option</option>
                      <option value="investment">Investment</option>
                      <option value="tech">Tech</option>
                      <option value="fashion">Fashion</option>
                      <option value="agriculture">Agriculture</option>
                      <option value="foods">Foods</option>
                    </select>
                    {errors.breakoutSessionChoice && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.breakoutSessionChoice}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Expectations (Optional)
                  </h3>
                  <div>
                    <textarea
                      id="expectations"
                      name="expectations"
                      value={formData.expectations}
                      onChange={handleInputChange}
                      rows={3}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="What do you hope to gain from the conference?"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Registration Summary
                  </h3>

                  {currentPrice > 0 ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-gray-700">
                        <span>
                          {registrationTypes.find(
                            (type) => type.value === formData.registrationType,
                          )?.label}
                        </span>
                        <span className="font-semibold">
                          {formatCurrency(currentPrice)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Payment processing fee</span>
                        <span>{formatCurrency(paystackFee)}</span>
                      </div>

                      <div className="border-t border-blue-200 pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-900">Total Amount</span>
                          <span className="text-2xl font-bold text-blue-600">
                            {formatCurrency(chargedPrice)}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mt-2">
                        Payment will be processed securely via Paystack
                      </p>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">
                        {registrationTypes.find(
                          (type) => type.value === formData.registrationType,
                        )?.label}
                      </span>
                      <span className="text-2xl font-bold text-blue-600">Free</span>
                    </div>
                  )}
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting || (typeof PaystackPop === "undefined" && currentPrice > 0)}
                    className={`w-full flex justify-center items-center px-8 py-4 border border-transparent text-lg font-semibold rounded-lg text-white transition-all duration-200 ${
                      isSubmitting || (typeof PaystackPop === "undefined" && currentPrice > 0)
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform cursor-pointer shadow-lg hover:shadow-xl"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        {isProcessingPayment ? "Verifying Payment..." : "Processing..."}
                      </>
                    ) : typeof PaystackPop === "undefined" && currentPrice > 0 ? (
                      <>Loading Payment System...</>
                    ) : (
                      <>
                        {currentPrice > 0
                          ? "Register & Pay Now"
                          : "Complete Registration"}
                        <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center text-sm text-gray-500 mt-4">
                  <p>
                    🔒 Your information is encrypted and secure. We never store
                    credit card details.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Registration;
