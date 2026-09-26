"use client";

import React from "react";
import Image from "next/image";
import { Session } from "../types";
import { Clock, MapPin, ChevronDown, ChevronUp } from "lucide-react";

interface ScheduleItemProps {
  session: Session;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function ScheduleItem({ session, isExpanded, onToggle }: ScheduleItemProps) {
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
      case "registration":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden transition-all duration-200 hover:border-blue-400">
      <div
        className="p-5 sm:p-6 cursor-pointer flex flex-col justify-between"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-4">
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border uppercase tracking-wider ${getTypeBadgeColor(session.type)}`}>
                {session.type}
              </span>
              <span className="text-xs text-slate-500 font-medium flex items-center bg-slate-100 px-2.5 py-1 rounded-md">
                <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {session.time} {session.endTime ? `– ${session.endTime}` : ""}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1 leading-snug">
              {session.title}
            </h3>

            {/* Speaker Info */}
            <div className="flex items-center space-x-3 mt-3">
              {session.speaker.avatar ? (
                <div className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-200 flex-shrink-0">
                  <Image
                    src={session.speaker.avatar}
                    alt={session.speaker.name}
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {session.speaker.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {session.speaker.name}
                </p>
                {session.speaker.title && (
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {session.speaker.title}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>

        {/* Venue Info */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center font-medium">
            <MapPin className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            {session.venue}
          </span>
          <span className="font-semibold text-blue-600 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md">
            {session.day}
          </span>
        </div>
      </div>

      {/* Expanded Description */}
      {isExpanded && session.description && (
        <div className="px-5 sm:px-6 pb-5 pt-2 text-sm text-slate-600 border-t border-slate-100 bg-slate-50/70 leading-relaxed">
          <p>{session.description}</p>
        </div>
      )}
    </div>
  );
}
