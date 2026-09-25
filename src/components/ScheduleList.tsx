"use client";

import React, { useState } from "react";
import ScheduleItem from "./ScheduleItem";
import { sessions } from "../data/scheduleData";
import { Calendar, Search, LayoutGrid, List } from "lucide-react";

interface ScheduleListProps {
  initialDay?: string;
  showFilters?: boolean;
}

export default function ScheduleList({ initialDay = "all", showFilters = true }: ScheduleListProps) {
  const [selectedDay, setSelectedDay] = useState(initialDay);
  const [selectedType, setSelectedType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"timeline" | "grid">("timeline");
  const [expandedSessions, setExpandedSessions] = useState<Set<number | string>>(new Set());

  const days = [
    { id: "all", label: "All Days", date: "Nov 13 - 15" },
    { id: "Day 1", label: "Day 1", date: "Thursday, Nov 13" },
    { id: "Day 2", label: "Day 2", date: "Friday, Nov 14" },
    { id: "Day 3", label: "Day 3", date: "Saturday, Nov 15" },
  ];

  const toggleSession = (id: number | string) => {
    setExpandedSessions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesDay = selectedDay === "all" || session.day.toLowerCase() === selectedDay.toLowerCase();
    const matchesType = selectedType === "all" || session.type.toLowerCase() === selectedType.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.speaker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.venue.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesDay && matchesType && matchesSearch;
  });

  const getDayDisplayDate = (day: string) => {
    switch (day) {
      case "Day 1":
        return "Thursday, November 13, 2025";
      case "Day 2":
        return "Friday, November 14, 2025";
      case "Day 3":
        return "Saturday, November 15, 2025";
      default:
        return "November 13 - 15, 2025";
    }
  };

  const dayGroups = selectedDay === "all" ? ["Day 1", "Day 2", "Day 3"] : [selectedDay];

  return (
    <div className="w-full">
      {/* Controls & Filter Bar */}
      {showFilters && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Day Selector Tabs */}
            <div className="flex flex-wrap gap-2">
              {days.map((day) => {
                const isActive = selectedDay === day.id;
                return (
                  <button
                    key={day.id}
                    onClick={() => setSelectedDay(day.id)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>

            {/* View Mode & Search */}
            <div className="flex items-center space-x-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search sessions or speakers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <button
                  onClick={() => setViewMode("timeline")}
                  className={`p-2.5 transition-colors ${
                    viewMode === "timeline" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                  title="Timeline View"
                  aria-label="Timeline View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 transition-colors ${
                    viewMode === "grid" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                  title="Grid View"
                  aria-label="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Groups */}
      <div className="space-y-12">
        {dayGroups.map((dayName) => {
          const groupSessions = filteredSessions.filter((s) => s.day.toLowerCase() === dayName.toLowerCase());
          if (groupSessions.length === 0 && selectedDay !== "all") return null;

          return (
            <div key={dayName} className="space-y-5">
              {/* Day Section Header */}
              <div className="flex items-center space-x-3.5 border-b border-slate-200 pb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{dayName}</h3>
                  <p className="text-xs text-slate-500 font-medium">{getDayDisplayDate(dayName)}</p>
                </div>
              </div>

              {groupSessions.length > 0 ? (
                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                  {groupSessions.map((session) => (
                    <ScheduleItem
                      key={session.id}
                      session={session}
                      isExpanded={expandedSessions.has(session.id)}
                      onToggle={() => toggleSession(session.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
                  No sessions match current filters for {dayName}.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
