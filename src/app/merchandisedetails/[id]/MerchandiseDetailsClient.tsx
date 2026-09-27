"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navigation, CountdownTimer, Footer } from "../../../components";
import { merchandiseItems, getMerchandiseItemById } from "../../../data/merchandiseData";
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck, Loader2, X } from "lucide-react";
import { MERCHANDISE_DETAILS_CONTENT } from "../../../data/REUSEABLE";
import { merchandiseAPI, handleApiError, formatCurrency } from "../../../services/supabaseService";

interface MerchandiseDetailsClientProps {
  id: string;
}

export default function MerchandiseDetailsClient({ id }: MerchandiseDetailsClientProps) {
  const item = getMerchandiseItemById(id) || merchandiseItems[0];

  const [selectedColor, setSelectedColor] = useState(item.colors[0]);
  const [selectedSize, setSelectedSize] = useState(item.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [customerData, setCustomerData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    pickupOption: "On-site Conference Pickup",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Parse unit price
  const numericPrice = Number(item.price.replace(/[^0-9.-]+/g, "")) || 0;
  const totalPrice = numericPrice * quantity;
  const paystackFee = Math.round(totalPrice * 0.015 + 100);
  const totalWithFee = totalPrice + paystackFee;

  const orderDeadline = new Date(item.timeFrame).getTime();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateCustomerForm = () => {
    const errors: Record<string, string> = {};
    if (!customerData.customerName.trim()) errors.customerName = "Please enter your full name";
    if (!customerData.customerEmail.trim()) {
      errors.customerEmail = "Please enter your email";
    } else if (!/\S+@\S+\.\S+/.test(customerData.customerEmail)) {
      errors.customerEmail = "Please enter a valid email address";
    }
    if (!customerData.customerPhone.trim()) errors.customerPhone = "Please enter your phone number";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCustomerForm()) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const payload = {
        customerName: customerData.customerName,
        customerEmail: customerData.customerEmail,
        customerPhone: customerData.customerPhone,
        itemId: item.id,
        itemName: item.name,
        color: selectedColor.name,
        size: selectedSize,
        quantity,
        unitPrice: numericPrice,
        pickupOption: customerData.pickupOption,
        callbackUrl: `${window.location.origin}/payment/callback`,
      };

      const result = await merchandiseAPI.initiate(payload);

      if (result.success && result.data?.authorizationUrl) {
        // Save to session for fallback reference
        sessionStorage.setItem("lastMerchOrder", JSON.stringify(result.data));
        // Redirect to Paystack Checkout
        window.location.href = result.data.authorizationUrl;
      } else {
        setErrorMessage(result.message || "Failed to initiate payment. Please try again.");
      }
    } catch (err: any) {
      const errInfo = handleApiError(err);
      setErrorMessage(errInfo.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        {/* Back Link */}
        <Link
          href={MERCHANDISE_DETAILS_CONTENT.backLinkHref}
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold mb-8 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>{MERCHANDISE_DETAILS_CONTENT.backLinkText}</span>
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 p-6 sm:p-10 lg:p-12">
            {/* Product Image Column */}
            <div className="space-y-6">
              <div className="w-full h-[420px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative flex items-center justify-center">
                <Image
                  src={selectedColor.image}
                  alt={`${item.name} - ${selectedColor.name}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>

              {/* Color Thumbnails */}
              <div>
                <p className="text-sm font-semibold text-slate-800 mb-3">
                  {MERCHANDISE_DETAILS_CONTENT.selectColorLabel} <span className="text-blue-600 font-bold">{selectedColor.name}</span>
                </p>
                <div className="flex gap-3.5">
                  {item.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`relative rounded-xl overflow-hidden w-20 h-20 border-2 transition-all ${
                        selectedColor.name === color.name
                          ? "border-blue-600 ring-2 ring-blue-600/20 scale-105"
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <Image
                        src={color.image}
                        alt={color.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Details & Ordering Column */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{item.name}</h1>
                    <p className="text-blue-600 text-3xl font-extrabold mt-1">{item.price}</p>
                  </div>
                </div>

                {/* Countdown Badge */}
                <div className="bg-blue-200 border border-slate-200 rounded-2xl p-4 my-6">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2 text-center">
                    {MERCHANDISE_DETAILS_CONTENT.countdownHeading}
                  </p>
                  <CountdownTimer targetDate={orderDeadline} />
                </div>

                <p className="text-slate-600 leading-relaxed mb-6 text-sm sm:text-base font-normal">
                  {item.fullDescription}
                </p>

                {/* Size Selection */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-slate-800 mb-2">{MERCHANDISE_DETAILS_CONTENT.selectSizeLabel}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
                          selectedSize === size
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="mb-8">
                  <p className="text-sm font-semibold text-slate-800 mb-2">{MERCHANDISE_DETAILS_CONTENT.quantityLabel}</p>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center border border-slate-200 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-lg font-bold text-slate-900 w-8 text-center">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center border border-slate-200 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Action Button */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 text-base"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Pre-Order & Checkout ({formatCurrency(totalPrice)})</span>
                </button>
                <div className="flex items-center justify-center space-x-6 text-xs text-slate-500 pt-3">
                  <span className="flex items-center"><ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" /> {MERCHANDISE_DETAILS_CONTENT.trustBadge1}</span>
                  <span className="flex items-center"><Truck className="w-4 h-4 mr-1 text-blue-600" /> {MERCHANDISE_DETAILS_CONTENT.trustBadge2}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Details Checkout Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-slate-900 mb-1">Confirm Pre-Order Details</h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-5">
              Enter your contact information for pickup accreditation and receipt delivery.
            </p>

            {/* Order Summary Pill */}
            <div className="bg-slate-50 rounded-2xl p-4 mb-5 border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between font-bold text-slate-900">
                <span>{item.name} ({quantity}x)</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <div className="text-slate-500">
                Color: <span className="font-semibold text-slate-700">{selectedColor.name}</span> • Size: <span className="font-semibold text-slate-700">{selectedSize}</span>
              </div>
              <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200">
                <span>Payment Processing Fee:</span>
                <span>{formatCurrency(paystackFee)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-blue-600 pt-1 text-sm">
                <span>Total to Pay:</span>
                <span>{formatCurrency(totalWithFee)}</span>
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs mb-4 border border-red-200">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleProceedToPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="customerName"
                  value={customerData.customerName}
                  onChange={handleInputChange}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                />
                {formErrors.customerName && <p className="text-red-500 text-xs mt-1">{formErrors.customerName}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="customerEmail"
                  value={customerData.customerEmail}
                  onChange={handleInputChange}
                  placeholder="john.doe@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                />
                {formErrors.customerEmail && <p className="text-red-500 text-xs mt-1">{formErrors.customerEmail}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={customerData.customerPhone}
                  onChange={handleInputChange}
                  placeholder="+234 800 000 0000"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                />
                {formErrors.customerPhone && <p className="text-red-500 text-xs mt-1">{formErrors.customerPhone}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Pickup Option</label>
                <select
                  name="pickupOption"
                  value={customerData.pickupOption}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
                >
                  <option value="On-site Conference Pickup">On-site Conference Pickup (Higher Ground Baptist Church)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 text-sm mt-6"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Redirecting to Paystack...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Proceed to Pay {formatCurrency(totalWithFee)}</span>
                  </>
                )}
              </button>
              <div className="mt-3 flex items-center justify-center space-x-1.5 text-[11px] text-slate-500 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Secured by Paystack • Supports <strong>OPay</strong>, <strong>Cards</strong>, <strong>Bank Transfer</strong> & <strong>USSD</strong></span>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
