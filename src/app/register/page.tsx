"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Navigation, Footer } from "../../components";
import { registrationAPI, handleApiError } from "../../services/supabaseService";
import { ArrowRight, CheckCircle } from "lucide-react";
import { REGISTER_PAGE_CONTENT } from "../../data/REUSEABLE";

export default function RegistrationPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    ageRange: "",
    institution: "",
    church: "",
    referralSource: "",
    breakoutSessionChoice: "",
    expectations: "",
    registrationType: "regular",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const registrationTypes = REGISTER_PAGE_CONTENT.registrationTypes;
  const selectedTypeObj = registrationTypes.find((t) => t.value === formData.registrationType) || registrationTypes[0];
  const currentPrice = selectedTypeObj.price;
  const paystackFee = currentPrice > 0 ? Math.round(currentPrice * 0.015 + 100) : 0;
  const chargedPrice = currentPrice + paystackFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = REGISTER_PAGE_CONTENT.validationMessages.firstName;
    if (!formData.lastName.trim()) newErrors.lastName = REGISTER_PAGE_CONTENT.validationMessages.lastName;
    if (!formData.email.trim()) {
      newErrors.email = REGISTER_PAGE_CONTENT.validationMessages.emailRequired;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = REGISTER_PAGE_CONTENT.validationMessages.emailInvalid;
    }
    if (!formData.phone.trim()) newErrors.phone = REGISTER_PAGE_CONTENT.validationMessages.phone;
    if (!formData.gender) newErrors.gender = REGISTER_PAGE_CONTENT.validationMessages.gender;
    if (!formData.ageRange) newErrors.ageRange = REGISTER_PAGE_CONTENT.validationMessages.ageRange;
    if (!formData.institution.trim()) newErrors.institution = REGISTER_PAGE_CONTENT.validationMessages.institution;
    if (!formData.church.trim()) newErrors.church = REGISTER_PAGE_CONTENT.validationMessages.church;
    if (!formData.referralSource) newErrors.referralSource = REGISTER_PAGE_CONTENT.validationMessages.referralSource;
    if (!formData.breakoutSessionChoice) newErrors.breakoutSessionChoice = REGISTER_PAGE_CONTENT.validationMessages.breakoutSessionChoice;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const result = await registrationAPI.register({
        ...formData,
        amountPaid: chargedPrice,
        paymentStatus: currentPrice > 0 ? "pending" : "free",
      });

      if (result.success && result.data) {
        setRegistrationNumber(result.data.registrationNumber || "BISUM-2025-" + Math.floor(1000 + Math.random() * 9000));
        setIsSuccess(true);
      } else {
        setErrorMessage(result.message || REGISTER_PAGE_CONTENT.defaultErrorMessage);
      }
    } catch (err: any) {
      const errorInfo = handleApiError(err);
      setErrorMessage(errorInfo.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      {/* Header Banner */}
      <section className="relative text-white py-24 pt-36 overflow-hidden bg-slate-950">
        <Image
          src="/section_banner.webp"
          alt="Registration Banner"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-slate-950/65" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight text-white">
              {REGISTER_PAGE_CONTENT.bannerTitle}
            </h1>
            <p className="text-lg md:text-xl text-slate-300 font-normal leading-relaxed">
              {REGISTER_PAGE_CONTENT.bannerSubtitle}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {isSuccess ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">{REGISTER_PAGE_CONTENT.successTitle}</h2>
            <p className="text-base text-slate-600 mb-6">
              {REGISTER_PAGE_CONTENT.successSubtitle}
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 inline-block text-left max-w-md w-full">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">{REGISTER_PAGE_CONTENT.registrationNumberLabel}</p>
              <p className="text-2xl font-mono font-extrabold text-slate-900 mt-1">{registrationNumber}</p>
              <p className="text-xs text-slate-500 mt-2">{REGISTER_PAGE_CONTENT.emailNoticePrefix} {formData.email}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 lg:p-12">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">{REGISTER_PAGE_CONTENT.formTitle}</h2>

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">{REGISTER_PAGE_CONTENT.labels.firstName}</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
                    placeholder={REGISTER_PAGE_CONTENT.placeholders.firstName}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">{REGISTER_PAGE_CONTENT.labels.lastName}</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
                    placeholder={REGISTER_PAGE_CONTENT.placeholders.lastName}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">{REGISTER_PAGE_CONTENT.labels.email}</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
                    placeholder={REGISTER_PAGE_CONTENT.placeholders.email}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">{REGISTER_PAGE_CONTENT.labels.phone}</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
                    placeholder={REGISTER_PAGE_CONTENT.placeholders.phone}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>

              {/* Gender and Age Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">{REGISTER_PAGE_CONTENT.labels.gender}</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
                  >
                    {REGISTER_PAGE_CONTENT.genderOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">{REGISTER_PAGE_CONTENT.labels.ageRange}</label>
                  <select
                    name="ageRange"
                    value={formData.ageRange}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
                  >
                    {REGISTER_PAGE_CONTENT.ageRangeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.ageRange && <p className="text-red-500 text-xs mt-1">{errors.ageRange}</p>}
                </div>
              </div>

              {/* Institution and Church */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">{REGISTER_PAGE_CONTENT.labels.institution}</label>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
                    placeholder={REGISTER_PAGE_CONTENT.placeholders.institution}
                  />
                  {errors.institution && <p className="text-red-500 text-xs mt-1">{errors.institution}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">{REGISTER_PAGE_CONTENT.labels.church}</label>
                  <input
                    type="text"
                    name="church"
                    value={formData.church}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
                    placeholder={REGISTER_PAGE_CONTENT.placeholders.church}
                  />
                  {errors.church && <p className="text-red-500 text-xs mt-1">{errors.church}</p>}
                </div>
              </div>

              {/* Referral Source & Breakout Session */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">{REGISTER_PAGE_CONTENT.labels.referralSource}</label>
                  <select
                    name="referralSource"
                    value={formData.referralSource}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
                  >
                    {REGISTER_PAGE_CONTENT.referralSourceOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.referralSource && <p className="text-red-500 text-xs mt-1">{errors.referralSource}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">{REGISTER_PAGE_CONTENT.labels.breakoutSessionChoice}</label>
                  <select
                    name="breakoutSessionChoice"
                    value={formData.breakoutSessionChoice}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
                  >
                    {REGISTER_PAGE_CONTENT.breakoutSessionOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.breakoutSessionChoice && <p className="text-red-500 text-xs mt-1">{errors.breakoutSessionChoice}</p>}
                </div>
              </div>

              {/* Expectations */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">{REGISTER_PAGE_CONTENT.labels.expectations}</label>
                <textarea
                  name="expectations"
                  rows={3}
                  value={formData.expectations}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
                  placeholder={REGISTER_PAGE_CONTENT.placeholders.expectations}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl transition-colors flex items-center justify-center space-x-2 text-base disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>{REGISTER_PAGE_CONTENT.submittingButtonText}</span>
                  ) : (
                    <>
                      <span>{REGISTER_PAGE_CONTENT.submitButtonText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
