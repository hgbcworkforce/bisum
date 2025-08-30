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
      <div className="p-4 lg:p-6 cursor-pointer flex-1" onClick={onToggle}>
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
                  : session.type === "workshop"
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

          {/* Expand/Collapse Icon */}
          <div
            className={`mt-4 flex justify-center transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          >
            <svg
              className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
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

      {/* Expanded Content */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="pt-3 lg:pt-4">
            {/* Session Description */}
            {session.description && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Description
                </h4>
                <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
                  {session.description}
                </p>
              </div>
            )}

            {/* Key Topics */}
            {session.topics && session.topics.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Key Topics
                </h4>
                <div className="flex flex-wrap gap-2">
                  {session.topics.map((topic, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs lg:text-sm rounded-md"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Speaker Bio (if expanded) */}
            {session.speaker.bio && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  About the Speaker
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {session.speaker.bio}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 mt-4">
              <button className="inline-flex items-center justify-center px-3 lg:px-4 py-2 bg-blue-600 text-white text-xs lg:text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                Add to Favorites
              </button>

              {session.hasReminder && (
                <button className="inline-flex items-center justify-center px-3 lg:px-4 py-2 bg-gray-100 text-gray-700 text-xs lg:text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-5 5v-5zM4 17h5v5l-5-5zM12 8a4 4 0 100-8 4 4 0 000 8z"
                    />
                  </svg>
                  Set Reminder
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleItem;
