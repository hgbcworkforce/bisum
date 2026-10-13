"use client";

import React, { useState } from "react";
import Link from "next/link";
// Schedule session components/data commented out until official schedule is confirmed
// import Image from "next/image";
// import { sessions } from "../data/scheduleData";
import { SCHEDULE_SECTION_CONTENT } from "./REUSEABLE";
import { Calendar, Clock, MapPin, ArrowRight, Sparkles } from "lucide-react";

export default function ScheduleSection() {
  // State and helpers preserved for when schedule is finalized:
  // const [activeDay, setActiveDay] = useState<string>("Day 1");
  // const days = [
  //   { id: "Day 1", label: "Day 1", date: "Thursday, Nov 13", theme: "Opening & Vision" },
  //   { id: "Day 2", label: "Day 2", date: "Friday, Nov 14", theme: "Leadership & Enterprise" },
  //   { id: "Day 3", label: "Day 3", date: "Saturday, Nov 15", theme: "Masterclasses & Impartation" },
  // ];

  return (
    <section id={SCHEDULE_SECTION_CONTENT.sectionId} className="py-20 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-full text-blue-700 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>{SCHEDULE_SECTION_CONTENT.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            {SCHEDULE_SECTION_CONTENT.title}
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            The full 3-day conference itinerary is currently being structured. Stay tuned for session schedules!
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm text-center relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-44 h-44 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 mb-6 shadow-inner">
              <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 animate-pulse" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200/80 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Coming Soon...</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
              Conference Program Announcing Soon
            </h3>
            <p className="text-slate-600 max-w-lg mx-auto text-sm sm:text-base leading-relaxed mb-8">
              We are finalizing the comprehensive 3-day agenda featuring keynote addresses, breakout masterclasses, worship sessions, and networking times across November 13–15, 2026.
            </p>

            <Link
              href="/register"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl text-sm transition-colors shadow-sm active:scale-[0.98]"
            >
              <span>Reserve Your Seat</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/*
        ========================================================================
        Schedule Tabs & Sessions - Commented out until schedule is confirmed
        ========================================================================
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 bg-slate-200/80 rounded-2xl gap-1.5 max-w-full overflow-x-auto">
            {days.map((day) => {
              const isActive = activeDay === day.id;
              return (
                <button
                  key={day.id}
                  onClick={() => setActiveDay(day.id)}
                  className={`px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap text-left ${
                    isActive
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200 font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className={isActive ? "text-blue-600 font-bold" : "text-slate-500 font-semibold"}>
                      {day.label}
                    </span>
                    <span className="text-xs text-slate-400">|</span>
                    <span className="text-xs font-normal text-slate-500">{day.date}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
          {daySessions.map((session) => (
            ...
          ))}
        </div>
        */}
      </div>
    </section>
  );
}
