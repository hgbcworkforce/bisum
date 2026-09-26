const fs = require("fs");

const regCode = `"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Navigation, Footer } from "@/components";
import {
  registrationAPI,
  paymentAPI,
  handleApiError,
  registrationTypes,
  formatCurrency,
} from "@/services/supabaseService";
import { Check, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";

export default function RegistrationPage() {
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
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [attendeeData, setAttendeeData] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const isProcessingRef = useRef(false);

  const calculatePaystackCharge = (amount) => {
    if (amount === 0) return 0;
    let paystackCharge = 0.015 * amount;
    if (amount >= 2500) paystackCharge += 100;
    paystackCharge = Math.min(paystackCharge, 2000);
    return Math.round(paystackCharge);
  };

  const currentPrice =
    registrationTypes.find((type) => type.value === formData.registrationType)
      ?.price || 0;

  const paystackFee = calculatePaystackCharge(currentPrice);
  const chargedPrice = currentPrice + paystackFee;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.trim().length > 50) {
      newErrors.firstName = "Max 50 characters";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length > 50) {
      newErrors.lastName = "Max 50 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else {
      const digitsOnly = formData.phoneNumber.replace(/\\D/g, "");
      if (digitsOnly.length < 10 || digitsOnly.length > 15) {
        newErrors.phoneNumber = "Enter valid phone number (10-15 digits)";
      }
    }

    if (!formData.referralSource) {
      newErrors.referralSource = "Please select referral channel";
    }

    if (!formData.breakoutSessionChoice) {
      newErrors.breakoutSessionChoice = "Please select a breakout session";
    }

    if (!formData.registrationType) {
      newErrors.registrationType = "Please select a registration tier";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePaystackPayment = useCallback(async (response) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsProcessingPayment(true);

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                "Payment verification timeout. Please contact support with your transaction reference."
              )
            ),
          30000
        )
      );

      const verificationPromise = paymentAPI.verifyPayment({
        transaction_ref: response.reference,
      });

      const verificationResult = await Promise.race([
        verificationPromise,
        timeoutPromise,
      ]);

      if (verificationResult.success) {
        setAttendeeData(verificationResult.data);
        setRegistrationComplete(true);
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("registrationData");
        }
      } else {
        throw new Error(verificationResult.error || "Payment verification failed.");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      const errorMessage =
        error.message || "Payment verification failed. Please contact support.";
      setErrors({ form: errorMessage });
    } finally {
      setIsSubmitting(false);
      setIsProcessingPayment(false);
      isProcessingRef.current = false;
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isProcessingRef.current) return;

    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(\`[name="\${firstErrorField}"]\`);
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    isProcessingRef.current = true;

    if (typeof window !== "undefined") {
      sessionStorage.setItem("registrationData", JSON.stringify(formData));
    }

    if (currentPrice > 0) {
      const paystackPublicKey =
        process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ||
        process.env.VITE_PAYSTACK_PUBLIC_KEY ||
        "pk_test_placeholder";

      if (typeof window === "undefined" || !window.PaystackPop) {
        setErrors({
          form: "Payment gateway is loading. Please wait a moment or refresh.",
        });
        setIsSubmitting(false);
        isProcessingRef.current = false;
        return;
      }

      const email = formData.email;
      const amount = chargedPrice * 100;
      const reference = \`BISUM-\${Date.now()}-\${Math.floor(Math.random() * 10000)}\`;

      try {
        const handler = window.PaystackPop.setup({
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
                value: \`\${formData.firstName} \${formData.lastName}\`,
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
          callback: function (response) {
            handlePaystackPayment(response);
          },
          onClose: function () {
            setIsSubmitting(false);
            isProcessingRef.current = false;
          },
        });

        handler.openIframe();
      } catch (paystackError) {
        console.error("Paystack initialization error:", paystackError);
        setIsSubmitting(false);
        isProcessingRef.current = false;
        setErrors({ form: "Failed to initialize payment gateway. Please try again." });
      }
    } else {
      try {
        const registrationResult = await registrationAPI.register(formData);

        if (registrationResult.success) {
          setAttendeeData(registrationResult.data);
          setRegistrationComplete(true);
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("registrationData");
          }
        } else {
          throw new Error(registrationResult.message || "Registration failed");
        }
      } catch (error) {
        const errorInfo = handleApiError(error);
        setErrors({ form: errorInfo.message });
      } finally {
        setIsSubmitting(false);
        isProcessingRef.current = false;
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <main className="pt-28 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-primary font-bold text-xs uppercase tracking-wider bg-primary-50 px-3.5 py-1.5 rounded-full border border-primary-100 mb-3 inline-block">
              Registration Portal
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Reserve Your Seat
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Join visionary Christian professionals and students for 3 power-packed days.
            </p>
          </div>

          {registrationComplete && attendeeData ? (
            <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 text-center max-w-xl mx-auto border border-slate-200">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
                Registration Confirmed!
              </h2>
              <p className="text-sm text-slate-600 mb-8">
                Welcome to BISUM Conference 2025. Your registration record has been created.
              </p>

              <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left border border-slate-200">
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Registration No.</span>
                    <span className="font-extrabold text-primary">
                      {attendeeData.registrationNumber || attendeeData.registration_number || "BISUM/2025/CONF"}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Attendee</span>
                    <span className="font-bold text-slate-900">
                      {formData.firstName} {formData.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Tier</span>
                    <span className="font-bold capitalize text-slate-900">
                      {formData.registrationType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Track</span>
                    <span className="font-bold capitalize text-slate-900">
                      {formData.breakoutSessionChoice}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/"
                  className="bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm py-3.5 px-6 rounded-full transition-colors shadow-sm"
                >
                  Return to Home
                </Link>
                <Link
                  href="/schedule"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm py-3.5 px-6 rounded-full transition-colors"
                >
                  View Schedule
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-10 border border-slate-200/80">
              {errors.form && (
                <div className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center space-x-3 text-rose-800">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-xs sm:text-sm font-semibold">{errors.form}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. Attendee Tier Selection */}
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">1</span>
                    <span>Select Registration Tier</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {registrationTypes.map((tier) => {
                      const selected = formData.registrationType === tier.value;
                      return (
                        <label
                          key={tier.value}
                          className={\`relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition-all \${
                            selected
                              ? "border-primary bg-primary-50/60 shadow-xs"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }\`}
                        >
                          <input
                            type="radio"
                            name="registrationType"
                            value={tier.value}
                            checked={selected}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-extrabold text-slate-900 text-base">{tier.label}</span>
                            <span className="font-black text-primary text-lg">
                              {formatCurrency(tier.price)}
                            </span>
                          </div>
                          <span className="text-xs text-slate-600 mt-1">{tier.description}</span>
                        </label>
                      );
                    })}
                  </div>
                  {errors.registrationType && (
                    <p className="mt-1.5 text-xs text-rose-600 font-semibold">{errors.registrationType}</p>
                  )}
                </div>

                {/* 2. Personal Information */}
                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">2</span>
                    <span>Personal Information</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="e.g. Samuel"
                        className={\`w-full px-4 py-3 rounded-xl bg-slate-50 border \${
                          errors.firstName ? "border-rose-500 bg-rose-50" : "border-slate-200"
                        } text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white\`}
                      />
                      {errors.firstName && <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.firstName}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="e.g. Adeyemi"
                        className={\`w-full px-4 py-3 rounded-xl bg-slate-50 border \${
                          errors.lastName ? "border-rose-500 bg-rose-50" : "border-slate-200"
                        } text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white\`}
                      />
                      {errors.lastName && <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="samuel@example.com"
                        className={\`w-full px-4 py-3 rounded-xl bg-slate-50 border \${
                          errors.email ? "border-rose-500 bg-rose-50" : "border-slate-200"
                        } text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white\`}
                      />
                      {errors.email && <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="+234 800 000 0000"
                        className={\`w-full px-4 py-3 rounded-xl bg-slate-50 border \${
                          errors.phoneNumber ? "border-rose-500 bg-rose-50" : "border-slate-200"
                        } text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white\`}
                      />
                      {errors.phoneNumber && <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.phoneNumber}</p>}
                    </div>
                  </div>
                </div>

                {/* 3. Track Selection */}
                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">3</span>
                    <span>Track & Referral Details</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Breakout Session Track *
                      </label>
                      <select
                        name="breakoutSessionChoice"
                        value={formData.breakoutSessionChoice}
                        onChange={handleInputChange}
                        className={\`w-full px-4 py-3 rounded-xl bg-slate-50 border \${
                          errors.breakoutSessionChoice ? "border-rose-500 bg-rose-50" : "border-slate-200"
                        } text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white\`}
                      >
                        <option value="">Choose a session track</option>
                        <option value="tech">Technology & AI Innovation</option>
                        <option value="investment">Investment & Wealth Creation</option>
                        <option value="fashion">Fashion & Creative Arts</option>
                        <option value="agriculture">Agribusiness & Sustainability</option>
                        <option value="foods">Food & Culinary Enterprises</option>
                      </select>
                      {errors.breakoutSessionChoice && (
                        <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.breakoutSessionChoice}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        How did you hear about BISUM? *
                      </label>
                      <select
                        name="referralSource"
                        value={formData.referralSource}
                        onChange={handleInputChange}
                        className={\`w-full px-4 py-3 rounded-xl bg-slate-50 border \${
                          errors.referralSource ? "border-rose-500 bg-rose-50" : "border-slate-200"
                        } text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white\`}
                      >
                        <option value="">Select referral channel</option>
                        <option value="church">Church Announcement</option>
                        <option value="instagram">Instagram</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="facebook">Facebook</option>
                        <option value="recommendation_from_friend">Friend / Colleague</option>
                        <option value="flyer">Flyer / Poster</option>
                      </select>
                      {errors.referralSource && (
                        <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.referralSource}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Expectations / Notes (Optional)
                    </label>
                    <textarea
                      name="expectations"
                      rows="3"
                      value={formData.expectations}
                      onChange={handleInputChange}
                      placeholder="What are your goals or questions for this conference?"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                    />
                  </div>
                </div>

                {/* 4. Payment Breakdown & Final Checkout */}
                <div className="pt-6 border-t border-slate-100">
                  {currentPrice > 0 && (
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 mb-6">
                      <div className="flex justify-between text-xs sm:text-sm text-slate-600 mb-2">
                        <span>Registration Fee ({formData.registrationType})</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(currentPrice)}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm text-slate-600 mb-3">
                        <span>Processing Fee</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(paystackFee)}</span>
                      </div>
                      <div className="flex justify-between text-sm sm:text-base font-black text-slate-900 pt-3 border-t border-slate-200">
                        <span>Total Payable</span>
                        <span className="text-primary">{formatCurrency(chargedPrice)}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || isProcessingPayment}
                    className="w-full bg-primary hover:bg-primary-hover disabled:bg-slate-400 text-white font-bold text-sm sm:text-base py-4 px-6 rounded-2xl shadow-lg hover:shadow-primary/30 transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {isSubmitting || isProcessingPayment ? (
                      <span>Processing Registration...</span>
                    ) : (
                      <>
                        <span>
                          {currentPrice > 0 ? \`Pay \${formatCurrency(chargedPrice)} & Register\` : "Complete Free Registration"}
                        </span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center space-x-2 text-slate-500 text-xs mt-4">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Secure 256-bit encrypted checkout via Paystack.</span>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
`;
fs.writeFileSync("D:/bisum/src/app/register/page.js", regCode, "utf8");
console.log("Register page updated successfully");
