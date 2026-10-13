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
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Coming Soon Card */}
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-14 border border-slate-200/90 shadow-sm text-center relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 mb-6 shadow-inner">
                <Calendar className="w-10 h-10 text-blue-600 animate-pulse" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 text-amber-700 border border-amber-200/80 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Coming Soon...</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                Full Schedule Announcing Soon
              </h2>
              <p className="text-slate-600 max-w-lg mx-auto text-base leading-relaxed mb-8">
                The detailed 3-day program featuring keynotes, breakout masterclasses, worship times, and panel sessions for November 13–15, 2026 is currently being finalized. Register today to secure your admission!
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl text-sm transition-colors shadow-sm active:scale-[0.98]"
                >
                  <span>Register for BISUM 2026</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/"
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3.5 px-6 rounded-xl text-sm transition-colors"
                >
                  <span>Return to Home</span>
                </Link>
              </div>
            </div>
          </div>

          {/* 
          ========================================================================
          ScheduleList - Preserved for when schedule details are finalized
          ========================================================================
          <ScheduleList initialDay="all" showFilters={true} />
          */}
        </div>
      </section>

      <Footer />
    </div>
  );
}
