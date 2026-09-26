"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import CountdownTimer from "./CountdownTimer";
import { HERO_CONTENT } from "./REUSEABLE";
import { Calendar, MapPin, ArrowRight } from "lucide-react";

export default function Hero() {
  const conferenceDate = new Date(HERO_CONTENT.targetDate).getTime();

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center text-white text-center pt-28 pb-20 overflow-hidden bg-slate-950"
    >
      {/* Background Image */}
      <Image
        src="/hero.webp"
        alt={HERO_CONTENT.imageAlt}
        fill
        priority
        className="object-cover object-center"
      />
      {/* Clean Dark Overlay for Text Contrast */}
      <div className="absolute inset-0 bg-slate-950/65" />

      <div className="relative z-10 flex flex-col items-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight tracking-tight text-white">
          {HERO_CONTENT.titlePrefix}{" "}
          <span className="text-blue-500">{HERO_CONTENT.highlightYear}</span>
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg lg:text-xl text-slate-300 mb-8 max-w-3xl mx-auto font-normal leading-relaxed">
          {HERO_CONTENT.description}
        </p>

        {/* Conference Date & Location Info Box */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 bg-slate-900/90 border border-slate-800 rounded-2xl px-6 py-4 mb-8 text-sm">
          <div className="flex items-center space-x-2.5 text-slate-200">
            <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span className="font-semibold">{HERO_CONTENT.dates}</span>
          </div>
          <div className="hidden sm:block text-slate-700">|</div>
          <div className="flex items-center space-x-2.5 text-slate-300 text-center sm:text-left">
            <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span>{HERO_CONTENT.location}</span>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="mb-10 w-full max-w-2xl">
          <CountdownTimer targetDate={conferenceDate} />
        </div>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={HERO_CONTENT.ctaHref}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl text-base font-bold transition-colors"
          >
            <span>{HERO_CONTENT.ctaText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/schedule"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-slate-800/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 px-7 py-3.5 rounded-xl text-base font-semibold transition-colors"
          >
            <span>View Schedule</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
