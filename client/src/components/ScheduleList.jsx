import { useState } from "react";
import ScheduleItem from "./ScheduleItem";

const ScheduleList = ({ sessions, groupByDay = true }) => {
  const [expandedSessions, setExpandedSessions] = useState(new Set());
  const [selectedDay, setSelectedDay] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'timeline'

  const toggleSession = (sessionId) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const expandAll = () => {
    const allSessionIds = sessions.map((session) => session.id);
    setExpandedSessions(new Set(allSessionIds));
  };

  const collapseAll = () => {
    setExpandedSessions(new Set());
  };

  // Group sessions by day if enabled
  const groupedSessions = groupByDay
    ? sessions.reduce((acc, session) => {
        const day = session.day || "Day 1";
        if (!acc[day]) acc[day] = [];
        acc[day].push(session);
        return acc;
      }, {})
    : { "All Sessions": sessions };

  // Filter sessions by selected day
  const filteredSessions =
    selectedDay === "all"
      ? groupedSessions
      : { [selectedDay]: groupedSessions[selectedDay] || [] };

  const days = Object.keys(groupedSessions);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
        {/* Day Filter */}
        {groupByDay && days.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedDay("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                selectedDay === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Days
            </button>
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  selectedDay === day
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        )}

        {/* View Controls */}
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                viewMode === "grid"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              Grid
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                viewMode === "timeline"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Timeline
            </button>
          </div>

          {/* Expand/Collapse All */}
          <div className="flex space-x-2">
            <button
              onClick={expandAll}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Expand All
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={collapseAll}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Sessions Display */}
      <div className="space-y-8">
        {Object.entries(filteredSessions).map(([day, daySessions]) => (
          <div key={day} className="relative">
            {/* Day Header (if grouping by day) */}
            {groupByDay && days.length > 1 && selectedDay === "all" && (
              <div className="mb-6">
                <div className="flex items-center">
                  <h2 className="text-2xl font-bold text-gray-900 mr-4">
                    {day}
                  </h2>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>
                {day === "Day 1" && (
                  <p className="text-gray-600 mt-2">November 15, 2025</p>
                )}
              </div>
            )}

            {/* Sessions */}
            <div className={viewMode === "timeline" ? "relative pl-8" : ""}>
              {/* Timeline Line */}
              {viewMode === "timeline" && (
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200"></div>
              )}

              {viewMode === "timeline" ? (
                /* Timeline View - Keep vertical layout */
                <div className="space-y-4 md:space-y-6">
                  {daySessions.map((session, index) => (
                    <div key={session.id} className="relative">
                      {/* Timeline Dot */}
                      <div className="absolute left-2.5 top-6 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-lg z-10"></div>
                      <ScheduleItem
                        session={session}
                        isExpanded={expandedSessions.has(session.id)}
                        onToggle={() => toggleSession(session.id)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                /* Grid View - 3 columns */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {daySessions.map((session) => (
                    <div key={session.id} className="h-fit">
                      <ScheduleItem
                        session={session}
                        isExpanded={expandedSessions.has(session.id)}
                        onToggle={() => toggleSession(session.id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Empty State */}
            {daySessions.length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="w-12 h-12 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-8 0l-1 12a2 2 0 002 2h8a2 2 0 002-2L19 7H5z"
                  />
                </svg>
                <p className="text-gray-500 text-lg">
                  No sessions scheduled for {day}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Session Statistics */}
      {/* <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {sessions.length}
            </div>
            <div className="text-sm text-gray-600">Total Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {sessions.filter(s => s.type === 'keynote').length}
            </div>
            <div className="text-sm text-gray-600">Keynotes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {sessions.filter(s => s.type === 'workshop').length}
            </div>
            <div className="text-sm text-gray-600">Workshops</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {sessions.filter(s => s.type === 'panel').length}
            </div>
            <div className="text-sm text-gray-600">Panel Discussions</div>
          </div>
        </div>
      </div>*/}
    </div>
  );
};

export default ScheduleList;
