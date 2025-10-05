import { useState } from "react";
import { Navigation, Footer } from "../components";
import {
  registrationAPI,
  paymentAPI,
  handleApiError,
  registrationTypes,
  formatCurrency,
} from "../services/supabaseService";

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

  // Registration types are now imported from supabaseService

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

  // Get current registration type pricing
  const currentPrice =
    registrationTypes.find((type) => type.value === formData.registrationType)
      ?.price || 0;

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
      // Remove all non-digit characters for validation
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Register attendee
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        registrationType: formData.registrationType,
        referralSource: formData.referralSource,
        breakoutSessionChoice: formData.breakoutSessionChoice,
        expectations: formData.expectations,
      };

      const registrationResult = await registrationAPI.register(registrationData);

      if (registrationResult.success) {
        setAttendeeData(registrationResult.data);
        setSubmitSuccess(true);
        setRegistrationComplete(true);

        // If payment is required, proceed to payment
        if (currentPrice > 0) {
          await handlePaymentInitialization(registrationResult.data.attendeeId);
        } else {
          // Free registration (speakers)
          showSuccessMessage(
            "Registration completed successfully! Welcome to BISUM Conference 2025.",
          );
        }
      }
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error("Registration error:", error);

      if (errorInfo.data?.errors) {
        setErrors(errorInfo.data.errors);
      } else {
        setErrors({ general: errorInfo.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentInitialization = async (attendeeId) => {
    if (currentPrice === 0) return;

    setIsProcessingPayment(true);

    try {
      const paymentResult = await paymentAPI.initialize({
        attendeeId: attendeeId,
        amount: currentPrice,
        registrationType: formData.registrationType,
      });

      if (paymentResult.success && paymentResult.data.flutterwaveConfig) {
        // Use Flutterwave React SDK or redirect to payment page
        const config = paymentResult.data.flutterwaveConfig;

        // For now, we'll create a form and submit it to Flutterwave
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "https://checkout.flutterwave.com/v3/hosted/pay";
        form.style.display = "none";

        Object.keys(config).forEach((key) => {
          if (typeof config[key] === "object") {
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
        throw new Error("Payment initialization failed");
      }
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error("Payment initialization error:", error);
      setErrors({ payment: errorInfo.message });
      setIsProcessingPayment(false);
    }
  };

  const showSuccessMessage = (message) => {
    alert(message); // You can replace this with a more elegant modal/toast
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
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Registration Successful!
              </h2>
              <p className="text-gray-600 mb-4">
                Thank you for registering for BISUM Conference 2024.
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
                  <p>Redirecting to payment...</p>
                </div>
              ) : currentPrice > 0 ? (
                <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                  <p className="text-yellow-800">
                    Complete your registration by making payment of{" "}
                    <strong>{formatCurrency(currentPrice)}</strong>
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
      {/* Navigation */}
      <Navigation onNavigate={scrollToSection} />

      {/* Page Header */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 pt-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
            Register for BISUM Conference 2024
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            Join us for an inspiring day of innovation, learning, and networking
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 inline-block">
            <p className="text-lg font-semibold mb-2">
              November 15, 2025 • Lagos, Nigeria
            </p>
            <p className="text-blue-200">
              Secure your spot at Nigeria's premier tech conference
            </p>
          </div>
        </div>
      </section>

      {/* Registration Form */}
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

              {/* General Error Message */}
              {errors.general && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <svg
                      className="h-5 w-5 text-red-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm text-red-600">{errors.general}</p>
                    </div>
                  </div>
                </div>
              )}

              {errors.payment && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <svg
                      className="h-5 w-5 text-red-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm text-red-600">{errors.payment}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* First Name */}
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

                    {/* Last Name */}
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

                    {/* Email */}
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

                    {/* Phone Number */}
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

                {/* Registration Type */}
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

                {/* Referral Source */}
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
                      className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.referralSource
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

                {/* Breakout Session Choice */}
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
                      className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.breakoutSessionChoice
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

                {/* Expectations */}
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

                {/* Pricing Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Registration Summary
                  </h3>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">
                      {
                        registrationTypes.find(
                          (type) => type.value === formData.registrationType,
                        )?.label
                      }
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      {currentPrice === 0
                        ? "Free"
                        : `₦${currentPrice.toLocaleString()}`}
                    </span>
                  </div>
                  {currentPrice > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      Payment will be processed securely via Flutterwave
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex justify-center items-center px-8 py-4 border border-transparent text-lg font-semibold rounded-lg text-white transition-all duration-200 ${
                      isSubmitting
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
                        Processing...
                      </>
                    ) : (
                      <>
                        {currentPrice > 0
                          ? "Register & Pay Now"
                          : "Complete Registration"}
                        <svg
                          className="ml-2 -mr-1 h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </div>

                {/* Security Notice */}
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

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Registration;
