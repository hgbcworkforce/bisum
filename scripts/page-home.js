const fs = require("fs");

const homeCode = `"use client";

import Link from "next/link";
import {
  Navigation,
  Hero,
  AboutSection,
  SpeakersSection,
  Footer,
  ScheduleList,
  MerchandiseSection,
} from "@/components";
import { sessions } from "@/data/scheduleData";
import { ArrowRight, Calendar, Sparkles } from "lucide-react";

export default function Homepage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <main>
        {/* Hero Section */}
        <Hero />

        {/* About Section */}
        <AboutSection />

        {/* Schedule Highlights Section */}
        <section id="schedule" className="py-20 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <span className="text-primary font-bold text-xs uppercase tracking-wider bg-primary-50 px-3.5 py-1.5 rounded-full border border-primary-100">
                  Conference Program
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
                  Key Schedule Highlights
                </h2>
                <p className="text-base text-slate-600 mt-2 max-w-xl">
                  A snapshot of the transformational sessions awaiting you at BISUM 2025.
                </p>
              </div>

              <Link
                href="/schedule"
                className="inline-flex items-center space-x-2 text-sm font-bold text-primary hover:text-primary-hover mt-4 md:mt-0"
              >
                <span>View Complete Timetable</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <ScheduleList sessions={sessions.slice(0, 4)} />

            <div className="mt-12 text-center">
              <Link
                href="/schedule"
                className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-8 py-3.5 rounded-full shadow-sm transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Explore Full 3-Day Program</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Speakers Section */}
        <SpeakersSection />

        {/* Merchandise Store Preview */}
        <MerchandiseSection />
      </main>

      <Footer />
    </div>
  );
}
`;
fs.writeFileSync("D:/bisum/src/app/page.js", homeCode, "utf8");
console.log("Homepage updated");
