"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { sessions } from "../data/scheduleData";
import { SCHEDULE_SECTION_CONTENT } from "./REUSEABLE";
import { Calendar, Clock, MapPin, ArrowRight, Sparkles } from "lucide-react";

export default function ScheduleSection() {
  const [activeDay, setActiveDay] = useState<string>("Day 1");

  const days = [
    { id: "Day 1", label: "Day 1", date: "Thursday, Nov 13", theme: "Opening & Vision" },
    { id: "Day 2", label: "Day 2", date: "Friday, Nov 14", theme: "Leadership & Enterprise" },
    { id: "Day 3", label: "Day 3", date: "Saturday, Nov 15", theme: "Masterclasses & Impartation" },
  ];

  // Get top highlight sessions for the active day (filter out simple registration/breaks for a punchy preview, but show key sessions)
  const daySessions = sessions
    .filter((s) => s.day.toLowerCase() === activeDay.toLowerCase())
    .slice(0, 4);

  const getTypeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "keynote":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "worship":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "story":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "panel":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "breakout":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <section id={SCHEDULE_SECTION_CONTENT.sectionId} className="py-20 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-full text-blue-700 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>{SCHEDULE_SECTION_CONTENT.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            {SCHEDULE_SECTION_CONTENT.title}
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            {SCHEDULE_SECTION_CONTENT.subtitle}
          </p>
        </div>

        {/* Day Selector Tabs */}
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

        {/* Schedule Highlights List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
          {daySessions.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 hover:border-blue-400 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Session Top Bar */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-md border uppercase tracking-wider ${getTypeBadgeColor(
                      session.type
                    )}`}
                  >
                    {session.type}
                  </span>
                  <span className="inline-flex items-center text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {session.time} {session.endTime ? `– ${session.endTime}` : ""}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                  {session.title}
                </h3>

                {session.description && (
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                    {session.description}
                  </p>
                )}
              </div>

              {/* Speaker & Venue Foot */}
              <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  {session.speaker.avatar ? (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 flex-shrink-0">
                      <Image
                        src={session.speaker.avatar}
                        alt={session.speaker.name}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {session.speaker.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-slate-800 text-xs">
                      {session.speaker.name}
                    </p>
                    {session.speaker.title && (
                      <p className="text-slate-500 text-[11px] line-clamp-1 max-w-[180px]">
                        {session.speaker.title}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center text-slate-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-blue-600" />
                  <span>{session.venue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Banner Area */}
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-800 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Calendar className="w-4 h-4" />
              <span>Full Interactive Schedule</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Looking for the complete itinerary?
            </h3>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Access the detailed list of all 24+ sessions, breakout rooms, worship times, and panel discussions across the 3 conference days.
            </p>
          </div>

          <Link
            href={SCHEDULE_SECTION_CONTENT.ctaHref}
            className="flex-shrink-0 inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-7 rounded-xl text-base transition-colors"
          >
            <span>{SCHEDULE_SECTION_CONTENT.ctaText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
