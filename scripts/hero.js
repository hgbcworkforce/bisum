const fs = require("fs");

const countdownCode = `"use client";

import { useState, useEffect } from "react";

export default function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const units = [
    { label: "DAYS", value: timeLeft.days },
    { label: "HOURS", value: timeLeft.hours },
    { label: "MINS", value: timeLeft.minutes },
    { label: "SECS", value: timeLeft.seconds },
  ];

  return (
    <div className="inline-flex items-center gap-2 sm:gap-4 p-2 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl">
      {units.map((unit) => (
        <div
          key={unit.label}
          className="flex flex-col items-center justify-center w-16 sm:w-20 h-16 sm:h-20 bg-slate-950 rounded-xl border border-slate-800/80 px-2"
        >
          <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {String(unit.value).padStart(2, "0")}
          </span>
          <span className="text-[10px] font-bold text-slate-400 tracking-wider mt-0.5">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}
`;
fs.writeFileSync("D:/bisum/src/components/CountdownTimer.jsx", countdownCode, "utf8");

const heroCode = `"use client";

import Link from "next/link";
import { ArrowRight, Calendar, MapPin, CheckCircle2 } from "lucide-react";
import CountdownTimer from "./CountdownTimer";

export default function Hero() {
  const conferenceDate = new Date("November 13, 2025 17:00:00").getTime();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 bg-slate-950 text-white overflow-hidden">
      {/* Background Image with Dark Contrast Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25"
        style={{
          backgroundImage: "url('https://media.hgbcinfluencers.org/bisum/hero.jpg')",
        }}
      />
      <div className="absolute inset-0 bg-slate-950/85" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Live Badge Pill */}
        <div className="inline-flex items-center space-x-2.5 bg-slate-900 text-primary-300 text-xs font-bold px-4 py-2 rounded-full border border-slate-800 shadow-sm mb-6">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="tracking-wide">BISUM ANNUAL CONFERENCE 2025</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight mb-6 max-w-4xl">
          Equipping Visionaries. <br />
          <span className="text-primary">Advancing Kingdom Influence.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
          Join Christian leaders, entrepreneurs, and young professionals for 3 transformative days of keynote wisdom, tech innovation, and wealth creation masterclasses.
        </p>

        {/* Date & Location Pill Strip */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm font-semibold text-slate-300 mb-8 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-1.5 text-primary-300">
            <Calendar className="w-4 h-4" />
            <span>November 13 - 15, 2025</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">?</span>
          <div className="flex items-center space-x-1.5 text-slate-300">
            <MapPin className="w-4 h-4 text-primary" />
            <span>Higher Ground Baptist Church, Ogbomoso</span>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="mb-10">
          <CountdownTimer targetDate={conferenceDate} />
        </div>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            href="/register"
            className="flex items-center justify-center space-x-2 w-full sm:w-auto bg-primary hover:bg-primary-hover text-white font-bold text-base px-8 py-4 rounded-full shadow-lg hover:shadow-primary/30 transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <span>Register for Conference</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            href="/schedule"
            className="flex items-center justify-center space-x-2 w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base px-8 py-4 rounded-full border border-slate-800 transition-colors"
          >
            <span>Explore Schedule</span>
          </Link>
        </div>

        {/* Feature Highlights Pill Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-slate-800/80 w-full text-left">
          <div className="flex items-center space-x-2 text-slate-300 text-xs sm:text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
            <span>Keynote Addresses</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300 text-xs sm:text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
            <span>5 Breakout Tracks</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300 text-xs sm:text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
            <span>Executive Mentorship</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300 text-xs sm:text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
            <span>Official Certificates</span>
          </div>
        </div>
      </div>
    </section>
  );
}
`;
fs.writeFileSync("D:/bisum/src/components/Hero.jsx", heroCode, "utf8");
console.log("Hero and CountdownTimer updated");
