"use client";

import React from "react";
import Image from "next/image";
import { Navigation, MerchandiseSection, Footer } from "../../components";
import { ShoppingBag, Sparkles } from "lucide-react";
import { MERCHANDISE_PAGE_CONTENT } from "../../data/REUSEABLE";

export default function MerchandisePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      {/* Header Banner */}
      <section className="relative text-white py-24 pt-36 overflow-hidden bg-slate-950">
        <Image
          src="/section_banner.webp"
          alt="Merchandise Banner"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-slate-950/65" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight text-white">
              {MERCHANDISE_PAGE_CONTENT.bannerTitle}
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 font-normal leading-relaxed">
              {MERCHANDISE_PAGE_CONTENT.bannerSubtitle}
            </p>
            <div className="inline-flex flex-col sm:flex-row bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:px-6 items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm font-medium">
              <div className="flex items-center space-x-2 text-slate-300">
                <ShoppingBag className="w-4 h-4 text-blue-400" />
                <span>{MERCHANDISE_PAGE_CONTENT.badge1}</span>
              </div>
              <div className="hidden sm:block text-slate-700">|</div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>{MERCHANDISE_PAGE_CONTENT.badge2}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="py-4">
        <MerchandiseSection />
      </main>

      <Footer />
    </div>
  );
}
