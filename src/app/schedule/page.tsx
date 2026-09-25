"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Navigation, ScheduleList, Footer } from "../../components";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { SCHEDULE_PAGE_CONTENT } from "../../data/REUSEABLE";

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      {/* Page Header */}
      <section className="relative text-white py-24 pt-36 overflow-hidden bg-slate-950">
        <Image
          src="/section_banner.webp"
          alt="Schedule Banner"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-slate-950/65" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight text-white">
              {SCHEDULE_PAGE_CONTENT.bannerTitle}
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 font-normal leading-relaxed">
              {SCHEDULE_PAGE_CONTENT.bannerSubtitle}
            </p>
            <div className="inline-flex flex-col sm:flex-row bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:px-6 items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm font-medium">
              <div className="flex items-center space-x-2 text-slate-300">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>{SCHEDULE_PAGE_CONTENT.badge1}</span>
              </div>
              <div className="hidden sm:block text-slate-700">|</div>
              <div className="flex items-center space-x-2 text-slate-300">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>{SCHEDULE_PAGE_CONTENT.badge2}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Schedule Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScheduleList initialDay="all" showFilters={true} />

          {/* Registration CTA */}
          <div className="mt-16 bg-slate-900 rounded-3xl p-8 md:p-12 text-center text-white border border-slate-800">
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-3 tracking-tight">
              {SCHEDULE_PAGE_CONTENT.ctaTitle}
            </h2>
            <p className="text-base text-slate-300 mb-8 max-w-2xl mx-auto font-normal">
              {SCHEDULE_PAGE_CONTENT.ctaSubtitle}
            </p>
            <Link
              href={SCHEDULE_PAGE_CONTENT.ctaButtonHref}
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl text-base font-bold transition-colors"
            >
              <span>{SCHEDULE_PAGE_CONTENT.ctaButtonText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
