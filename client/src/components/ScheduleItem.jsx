import { useState } from "react";

const ScheduleItem = ({ session, isExpanded, onToggle }) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatTime = (time) => {
    return new Date(`2025-01-01 ${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden h-full flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4 lg:p-6  flex-1">
        <div className="flex flex-col h-full">
          <div className="flex-1">
            {/* Time Badge */}
            <div className="inline-flex items-center px-2 py-1 lg:px-3 lg:py-1 rounded-full text-xs lg:text-sm font-medium bg-blue-100 text-blue-800 mb-3">
              <svg
                className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2"
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
              {formatTime(session.time)} - {formatTime(session.endTime)}
            </div>

            {/* Session Title */}
            <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 leading-tight line-clamp-2">
              {session.title}
            </h3>

            {/* Session Type */}
            <span
              className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mb-3 ${
                session.type === "keynote"
                  ? "bg-purple-100 text-purple-800"
                  : session.type === "story"
                    ? "bg-green-100 text-green-800"
                    : session.type === "panel"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-gray-100 text-gray-800"
              }`}
            >
              {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
            </span>

            {/* Speaker Info */}
            <div className="flex items-center space-x-2 lg:space-x-3">
              {session.speaker.avatar && (
                <img
                  src={session.speaker.avatar}
                  alt={session.speaker.name}
                  className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover flex-shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-gray-900 font-medium text-sm lg:text-base truncate">
                  {session.speaker.name}
                </p>
                <p className="text-gray-600 text-xs lg:text-sm truncate">
                  {session.speaker.title}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Venue Info */}
        {session.venue && (
          <div className="flex items-center mt-3 text-xs lg:text-sm text-gray-600">
            <svg
              className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="truncate">{session.venue}</span>
          </div>
        )}
      </div>

    </div>
  );
};

export default ScheduleItem;
