"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ABOUT_CONTENT } from "./REUSEABLE";
import { CheckCircle, ArrowRight, Target, Users, TrendingUp } from "lucide-react";

export default function AboutSection() {
  const highlights = [
    {
      icon: Target,
      title: "Purpose & Vision",
      desc: "Clarity on personal leadership and career positioning in modern industries.",
    },
    {
      icon: TrendingUp,
      title: "Business & Investment",
      desc: "Practical financial intelligence, entrepreneurship, and value creation.",
    },
    {
      icon: Users,
      title: "Networking & Mentorship",
      desc: "Direct access to accomplished mentors, pastors, and innovative founders.",
    },
  ];

  return (
    <section id={ABOUT_CONTENT.sectionId} className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Text & Features */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-full text-blue-700 text-xs font-semibold uppercase tracking-wider mb-4">
              <span>About The Summit</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
              {ABOUT_CONTENT.title}
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-5">
              {ABOUT_CONTENT.p1}
            </p>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8">
              {ABOUT_CONTENT.p2}
            </p>

            {/* Feature Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {highlights.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200/80"
                  >
                    <Icon className="w-5 h-5 text-blue-600 mb-2" />
                    <h4 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* CTA Link */}
            <div>
              <Link
                href={ABOUT_CONTENT.ctaHref}
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-bold text-base transition-colors group"
              >
                <span>{ABOUT_CONTENT.ctaText}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Right Column: Clean Image Container */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
              <Image
                src="/about_image.webp"
                alt={ABOUT_CONTENT.bannerAlt}
                width={700}
                height={900}
                priority
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
