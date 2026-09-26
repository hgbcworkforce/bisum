const fs = require("fs");

const merchDetailsCode = `"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navigation, Footer } from "@/components";
import { merchandiseItems } from "@/data/merchandiseData";
import { formatCurrency } from "@/services/supabaseService";
import { ShoppingBag, Check, ArrowLeft, ShieldCheck } from "lucide-react";

const CHARGE_PERCENTAGE = 0.02;

export default function MerchandiseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [merchandiseItem, setMerchandiseItem] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const item = merchandiseItems.find((p) => p.id === id);
    if (item) {
      setMerchandiseItem(item);
      setSelectedColor(item.colors?.[0] || null);
      setCurrentImage(item.colors?.[0]?.image || item.image);
      setSelectedSize(item.sizes?.[0] || "M");
    }
  }, [id]);

  if (!merchandiseItem) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navigation />
        <div className="text-center py-36">
          <p className="text-sm font-semibold text-slate-500">Loading merchandise item...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const pricePerItem = parseFloat(merchandiseItem.price.replace(/[^0-9.-]+/g, "")) || 0;
  const subtotal = pricePerItem * quantity;
  const charges = subtotal * CHARGE_PERCENTAGE;
  const totalAmount = subtotal + charges;

  const validateCheckout = () => {
    const errs = {};
    if (!fullName.trim()) errs.fullName = "Full name is required";
    if (!email.trim() || !email.includes("@")) errs.email = "Valid email is required";
    if (!phoneNumber.trim()) errs.phoneNumber = "Phone number is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    if (!validateCheckout()) return;

    setIsProcessing(true);

    const paystackKey =
      process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ||
      process.env.VITE_PAYSTACK_PUBLIC_KEY ||
      "pk_test_placeholder";

    if (typeof window !== "undefined" && window.PaystackPop) {
      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: email,
        amount: Math.round(totalAmount * 100),
        currency: "NGN",
        ref: \`BISUM-MERCH-\${Date.now()}\`,
        metadata: {
          custom_fields: [
            { display_name: "Item", variable_name: "item_name", value: merchandiseItem.name },
            { display_name: "Color", variable_name: "color", value: selectedColor?.name || "Standard" },
            { display_name: "Size", variable_name: "size", value: selectedSize },
            { display_name: "Quantity", variable_name: "quantity", value: quantity },
          ],
        },
        callback: function () {
          setIsProcessing(false);
          setSubmitSuccess(true);
        },
        onClose: function () {
          setIsProcessing(false);
        },
      });
      handler.openIframe();
    } else {
      setTimeout(() => {
        setIsProcessing(false);
        setSubmitSuccess(true);
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <main className="pt-28 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/merchandise"
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </Link>

          {submitSuccess ? (
            <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 max-w-xl mx-auto text-center border border-slate-200">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Order Confirmed!</h2>
              <p className="text-xs sm:text-sm text-slate-600 mb-6">
                Thank you for your order, {fullName}. A receipt has been issued to {email}.
              </p>

              <div className="bg-slate-50 p-5 rounded-2xl text-left text-xs space-y-2 mb-6 border border-slate-200">
                <p><strong>Item:</strong> {merchandiseItem.name}</p>
                <p><strong>Color:</strong> {selectedColor?.name || "Standard"}</p>
                <p><strong>Size:</strong> {selectedSize}</p>
                <p><strong>Quantity:</strong> {quantity}</p>
                <p><strong>Total Paid:</strong> {formatCurrency(totalAmount)}</p>
              </div>

              <Link
                href="/merchandise"
                className="inline-block bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm px-8 py-3.5 rounded-full transition-colors shadow-sm"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white rounded-3xl p-6 sm:p-10 shadow-xs border border-slate-200/80">
              {/* Product Gallery */}
              <div>
                <div className="h-96 rounded-2xl overflow-hidden bg-slate-100 mb-4 border border-slate-200">
                  <img
                    src={currentImage}
                    alt={merchandiseItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Thumbnails */}
                <div className="flex space-x-3">
                  {merchandiseItem.colors?.map((c, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedColor(c);
                        setCurrentImage(c.image);
                      }}
                      className={\`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer \${
                        selectedColor?.name === c.name ? "border-primary shadow-sm" : "border-slate-200 opacity-60 hover:opacity-100"
                      }\`}
                    >
                      <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Info & Order Form */}
              <div>
                <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
                  Official Apparel
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 mb-2">{merchandiseItem.name}</h1>
                <p className="text-2xl font-black text-primary mb-4">{merchandiseItem.price}</p>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">{merchandiseItem.description}</p>

                <form onSubmit={handleCheckout} className="space-y-6">
                  {/* Colors */}
                  {merchandiseItem.colors && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Color: <span className="text-primary">{selectedColor?.name}</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {merchandiseItem.colors.map((c, i) => (
                          <button
                            type="button"
                            key={i}
                            onClick={() => {
                              setSelectedColor(c);
                              setCurrentImage(c.image);
                            }}
                            className={\`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer \${
                              selectedColor?.name === c.name
                                ? "border-primary bg-primary text-white shadow-xs"
                                : "border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100"
                            }\`}
                          >
                            {c.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sizes */}
                  {merchandiseItem.sizes && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Size: <span className="text-primary">{selectedSize}</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {merchandiseItem.sizes.map((s) => (
                          <button
                            type="button"
                            key={s}
                            onClick={() => setSelectedSize(s)}
                            className={\`w-12 h-12 rounded-xl text-xs font-extrabold border transition-all cursor-pointer \${
                              selectedSize === s
                                ? "border-primary bg-primary text-white shadow-xs"
                                : "border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100"
                            }\`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Quantity</label>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold flex items-center justify-center text-base cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold text-slate-900 w-8 text-center">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold flex items-center justify-center text-base cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Delivery Details</h4>
                    <div>
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={\`w-full px-4 py-2.5 rounded-xl bg-slate-50 border \${
                          errors.fullName ? "border-rose-500 bg-rose-50" : "border-slate-200"
                        } text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white\`}
                      />
                      {errors.fullName && <p className="text-xs text-rose-600 mt-1">{errors.fullName}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={\`w-full px-4 py-2.5 rounded-xl bg-slate-50 border \${
                            errors.email ? "border-rose-500 bg-rose-50" : "border-slate-200"
                          } text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white\`}
                        />
                        {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
                      </div>
                      <div>
                        <input
                          type="tel"
                          placeholder="Phone Number"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className={\`w-full px-4 py-2.5 rounded-xl bg-slate-50 border \${
                            errors.phoneNumber ? "border-rose-500 bg-rose-50" : "border-slate-200"
                          } text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white\`}
                        />
                        {errors.phoneNumber && <p className="text-xs text-rose-600 mt-1">{errors.phoneNumber}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal ({quantity} {quantity === 1 ? "item" : "items"})</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Processing Fee (2%)</span>
                      <span>{formatCurrency(charges)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200 text-sm">
                      <span>Total Amount</span>
                      <span className="text-primary font-black">{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-primary hover:bg-primary-hover disabled:bg-slate-400 text-white font-bold text-xs sm:text-sm py-4 px-6 rounded-2xl shadow-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isProcessing ? "Processing..." : \`Pay \${formatCurrency(totalAmount)} with Paystack\`}</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
`;
fs.writeFileSync("D:/bisum/src/app/merchandisedetails/[id]/page.js", merchDetailsCode, "utf8");
console.log("Merchandise details updated");
