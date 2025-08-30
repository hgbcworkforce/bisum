import { useState } from "react";
import { Navigation } from "../components";

const Registration = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    ageRange: "",
    attendanceType: "",
    howHeardAbout: "",
    employmentStatus: "",
    expectations: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const ageRangeOptions = [
    { value: "", label: "Select Age Range" },
    { value: "under-18", label: "Under 18" },
    { value: "18-24", label: "18-24" },
    { value: "25-34", label: "25-34" },
    { value: "35-44", label: "35-44" },
    { value: "45+", label: "45+" },
  ];

  const howHeardOptions = [
    { value: "", label: "Select how you heard about us" },
    { value: "church", label: "Church" },
    { value: "flyer", label: "Flyer" },
    { value: "social-media", label: "Social Media" },
    { value: "friend-recommendation", label: "Friend's Recommendation" },
    { value: "website", label: "Website" },
    { value: "email", label: "Email Newsletter" },
    { value: "other", label: "Other" },
  ];

  const employmentOptions = [
    { value: "", label: "Select Employment Status" },
    { value: "student", label: "Student" },
    { value: "working-class", label: "Working Class" },
    { value: "business-owner", label: "Business Owner" },
    { value: "unemployed", label: "Unemployed" },
    { value: "retired", label: "Retired" },
    { value: "other", label: "Other" },
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

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
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    if (!formData.ageRange) {
      newErrors.ageRange = "Please select your age range";
    }

    if (!formData.attendanceType) {
      newErrors.attendanceType = "Please select your attendance type";
    }

    if (!formData.howHeardAbout) {
      newErrors.howHeardAbout = "Please tell us how you heard about BISUM";
    }

    if (!formData.employmentStatus) {
      newErrors.employmentStatus = "Please select your employment status";
    }

    if (!formData.expectations.trim()) {
      newErrors.expectations =
        "Please share your expectations for the conference";
    } else if (formData.expectations.trim().length < 10) {
      newErrors.expectations =
        "Please provide more detail about your expectations";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call to backend
      // const response = await apiService.registerAttendee(formData);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Registration Data:", formData);

      // TODO: After successful registration, redirect to payment page
      // window.location.href = '/payment';

      setSubmitSuccess(true);

      // Reset form after success
      setTimeout(() => {
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          ageRange: "",
          attendanceType: "",
          howHeardAbout: "",
          employmentStatus: "",
          expectations: "",
        });
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Registration error:", error);
      // Handle registration error
      alert("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation onNavigate={scrollToSection} />

      {/* Page Header */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 pt-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
            Register for BISUM Conference
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            Join us for an inspiring day of innovation, learning, and networking
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-lg">
            <div className="flex items-center space-x-2">
              <svg
                className="w-6 h-6 text-blue-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-8 0l-1 12a2 2 0 002 2h8a2 2 0 002-2L19 7H5z"
                />
              </svg>
              <span>November 15, 2025</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg
                className="w-6 h-6 text-blue-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>Lagos, Nigeria</span>
            </div>
          </div>
        </div>

        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            className="w-full h-12"
            preserveAspectRatio="none"
            viewBox="0 0 1200 120"
            fill="none"
          >
            <path
              d="M0,120 L0,40 C200,20 400,60 600,40 C800,20 1000,60 1200,40 L1200,120 Z"
              fill="rgb(249, 250, 251)"
            />
          </svg>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Message */}
          {submitSuccess && (
            <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center">
                <svg
                  className="w-8 h-8 text-green-500 mr-3"
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
                <div>
                  <h3 className="text-lg font-semibold text-green-800">
                    Registration Successful!
                  </h3>
                  <p className="text-green-700">
                    Thank you for registering. You will be redirected to
                    complete your payment shortly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Introduction */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Secure Your Spot Today
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Fill out the form below to register for BISUM Conference 2025. All
              fields marked with * are required.
            </p>
          </div>

          {/* Registration Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <svg
                    className="w-6 h-6 text-blue-600 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                        errors.firstName ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your first name"
                      aria-describedby={
                        errors.firstName ? "firstName-error" : undefined
                      }
                    />
                    {errors.firstName && (
                      <p
                        id="firstName-error"
                        className="mt-1 text-sm text-red-600"
                      >
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                        errors.lastName ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your last name"
                      aria-describedby={
                        errors.lastName ? "lastName-error" : undefined
                      }
                    />
                    {errors.lastName && (
                      <p
                        id="lastName-error"
                        className="mt-1 text-sm text-red-600"
                      >
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Email Address */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="your.email@example.com"
                      aria-describedby={
                        errors.email ? "email-error" : undefined
                      }
                    />
                    {errors.email && (
                      <p id="email-error" className="mt-1 text-sm text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label
                      htmlFor="phoneNumber"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                        errors.phoneNumber
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="+234 123 456 7890"
                      aria-describedby={
                        errors.phoneNumber ? "phoneNumber-error" : undefined
                      }
                    />
                    {errors.phoneNumber && (
                      <p
                        id="phoneNumber-error"
                        className="mt-1 text-sm text-red-600"
                      >
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Demographics */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <svg
                    className="w-6 h-6 text-blue-600 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Demographics & Preferences
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Age Range */}
                  <div>
                    <label
                      htmlFor="ageRange"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Age Range *
                    </label>
                    <select
                      id="ageRange"
                      name="ageRange"
                      value={formData.ageRange}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                        errors.ageRange ? "border-red-500" : "border-gray-300"
                      }`}
                      aria-describedby={
                        errors.ageRange ? "ageRange-error" : undefined
                      }
                    >
                      {ageRangeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.ageRange && (
                      <p
                        id="ageRange-error"
                        className="mt-1 text-sm text-red-600"
                      >
                        {errors.ageRange}
                      </p>
                    )}
                  </div>

                  {/* Employment Status */}
                  <div>
                    <label
                      htmlFor="employmentStatus"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Employment Status *
                    </label>
                    <select
                      id="employmentStatus"
                      name="employmentStatus"
                      value={formData.employmentStatus}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                        errors.employmentStatus
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      aria-describedby={
                        errors.employmentStatus
                          ? "employmentStatus-error"
                          : undefined
                      }
                    >
                      {employmentOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.employmentStatus && (
                      <p
                        id="employmentStatus-error"
                        className="mt-1 text-sm text-red-600"
                      >
                        {errors.employmentStatus}
                      </p>
                    )}
                  </div>
                </div>

                {/* Attendance Type */}
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Attendance Type *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        formData.attendanceType === "in-person"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-blue-300"
                      }`}
                      onClick={() =>
                        handleInputChange({
                          target: {
                            name: "attendanceType",
                            value: "in-person",
                          },
                        })
                      }
                    >
                      <input
                        type="radio"
                        id="in-person"
                        name="attendanceType"
                        value="in-person"
                        checked={formData.attendanceType === "in-person"}
                        onChange={handleInputChange}
                        className="absolute top-4 right-4"
                      />
                      <div className="flex items-center space-x-3">
                        <svg
                          className="w-8 h-8 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            In-Person
                          </h4>
                          <p className="text-sm text-gray-600">
                            Join us at the venue in Lagos, Nigeria
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        formData.attendanceType === "virtual"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-blue-300"
                      }`}
                      onClick={() =>
                        handleInputChange({
                          target: { name: "attendanceType", value: "virtual" },
                        })
                      }
                    >
                      <input
                        type="radio"
                        id="virtual"
                        name="attendanceType"
                        value="virtual"
                        checked={formData.attendanceType === "virtual"}
                        onChange={handleInputChange}
                        className="absolute top-4 right-4"
                      />
                      <div className="flex items-center space-x-3">
                        <svg
                          className="w-8 h-8 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            Virtual
                          </h4>
                          <p className="text-sm text-gray-600">
                            Attend online from anywhere in the world
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {errors.attendanceType && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.attendanceType}
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <svg
                    className="w-6 h-6 text-blue-600 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Additional Information
                </h3>

                {/* How you heard about BISUM */}
                <div className="mb-6">
                  <label
                    htmlFor="howHeardAbout"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    How did you hear about BISUM Conference? *
                  </label>
                  <select
                    id="howHeardAbout"
                    name="howHeardAbout"
                    value={formData.howHeardAbout}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                      errors.howHeardAbout
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    aria-describedby={
                      errors.howHeardAbout ? "howHeardAbout-error" : undefined
                    }
                  >
                    {howHeardOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.howHeardAbout && (
                    <p
                      id="howHeardAbout-error"
                      className="mt-1 text-sm text-red-600"
                    >
                      {errors.howHeardAbout}
                    </p>
                  )}
                </div>

                {/* Expectations */}
                <div>
                  <label
                    htmlFor="expectations"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    What are your expectations for the conference? *
                  </label>
                  <textarea
                    id="expectations"
                    name="expectations"
                    value={formData.expectations}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 resize-vertical ${
                      errors.expectations ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Tell us what you hope to gain from attending BISUM Conference 2025. What specific topics or aspects are you most excited about?"
                    aria-describedby={
                      errors.expectations ? "expectations-error" : undefined
                    }
                  />
                  {errors.expectations && (
                    <p
                      id="expectations-error"
                      className="mt-1 text-sm text-red-600"
                    >
                      {errors.expectations}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Minimum 10 characters required
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02] ${
                    isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
                  } text-white focus:outline-none focus:ring-4 focus:ring-blue-300`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
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
                      <span>Processing Registration...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="w-5 h-5"
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
                      <span>Complete Registration</span>
                    </div>
                  )}
                </button>

                <p className="mt-4 text-sm text-gray-600 text-center">
                  By registering, you agree to our{" "}
                  <a href="/terms" className="text-blue-600 hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </form>
          </div>

          {/* Payment Information */}
          <div className="mt-12 bg-blue-50 rounded-2xl p-8">
            <div className="text-center">
              <svg
                className="w-16 h-16 text-blue-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Secure Payment Processing
              </h3>
              <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
                After completing your registration, you will be redirected to
                our secure payment gateway powered by Flutterwave to complete
                your conference fee payment.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="bg-white rounded-lg p-4 shadow-md mb-3">
                    <svg
                      className="w-8 h-8 text-green-600 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900">Secure</h4>
                  <p className="text-sm text-gray-600">
                    256-bit SSL encryption
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-white rounded-lg p-4 shadow-md mb-3">
                    <svg
                      className="w-8 h-8 text-blue-600 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900">
                    Multiple Options
                  </h4>
                  <p className="text-sm text-gray-600">
                    Card, Bank Transfer, USSD
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-white rounded-lg p-4 shadow-md mb-3">
                    <svg
                      className="w-8 h-8 text-purple-600 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900">Instant</h4>
                  <p className="text-sm text-gray-600">
                    Real-time confirmation
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border-l-4 border-blue-500">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Conference Fee
                </h4>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  ₦15,000
                </div>
                <p className="text-gray-600 text-sm">
                  Includes conference materials, lunch, and networking sessions
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Registration;
