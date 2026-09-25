"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navigation, CountdownTimer, Footer } from "../../../components";
import { merchandiseItems, getMerchandiseItemById } from "../../../data/merchandiseData";
import { ShoppingCart, ArrowLeft, Check, ShieldCheck, Truck } from "lucide-react";
import { MERCHANDISE_DETAILS_CONTENT } from "../../../data/REUSEABLE";

export default function MerchandiseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const item = getMerchandiseItemById(id) || merchandiseItems[0];

  const [selectedColor, setSelectedColor] = useState(item.colors[0]);
  const [selectedSize, setSelectedSize] = useState(item.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [isOrdered, setIsOrdered] = useState(false);

  const orderDeadline = new Date(item.timeFrame).getTime();

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOrdered(true);
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

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
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
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 my-6">
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

              {/* Order Submission Form */}
              <div>
                {isOrdered ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Check className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h4 className="text-lg font-bold text-emerald-900 mb-1">{MERCHANDISE_DETAILS_CONTENT.successTitle}</h4>
                    <p className="text-xs sm:text-sm text-emerald-700">
                      {MERCHANDISE_DETAILS_CONTENT.successMessageTemplate(quantity, item.name, selectedColor.name, selectedSize)}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleOrder} className="space-y-4">
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2 text-base"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>{MERCHANDISE_DETAILS_CONTENT.submitButtonPrefix} ({item.price})</span>
                    </button>
                    <div className="flex items-center justify-center space-x-6 text-xs text-slate-500 pt-1">
                      <span className="flex items-center"><ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" /> {MERCHANDISE_DETAILS_CONTENT.trustBadge1}</span>
                      <span className="flex items-center"><Truck className="w-4 h-4 mr-1 text-blue-600" /> {MERCHANDISE_DETAILS_CONTENT.trustBadge2}</span>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
