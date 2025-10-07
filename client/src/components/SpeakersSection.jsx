import { Link } from "react-router-dom";
import { speakersData } from "../data/speakersData";

const SpeakersSection = () => {
  // Get the first 4 speakers from the data file
  const speakers = speakersData.slice(0, 4);

  return (
    <section id="speakers" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800">Keynote Speakers</h2>
          <p className="text-xl text-gray-600 mt-2">
            Meet the experts who will be sharing their insights.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {speakers.map((speaker) => (
            <div
              key={speaker.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 flex flex-col"
            >
              <img
                src={speaker.image}
                alt={speaker.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-2xl font-bold text-gray-900">
                  {speaker.name}
                </h3>
                <p className="text-md text-blue-600 font-semibold">
                  {speaker.title}
                </p>
                <div className="mt-4 flex space-x-4">
                  {speaker.social.twitter && (
                    <a
                      href={speaker.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-blue-500"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775.998-.6 1.767-1.548 2.122-2.717-.935.55-1.972.948-3.08 1.175-.88-.942-2.14-1.53-3.54-1.53-2.68 0-4.85 2.17-4.85 4.85 0 .38.04.75.12 1.11-4.02-.2-7.59-2.12-9.98-5.06-.42.72-.66 1.56-.66 2.45 0 1.68.86 3.17 2.16 4.04-.8-.02-1.55-.24-2.2-.61v.06c0 2.35 1.67 4.31 3.88 4.76-.4.11-.82.17-1.25.17-.31 0-.62-.03-.91-.09.62 1.92 2.4 3.31 4.51 3.35-1.66 1.3-3.76 2.08-6.04 2.08-.39 0-.78-.02-1.17-.07 2.15 1.38 4.7 2.19 7.46 2.19 8.96 0 13.86-7.42 13.86-13.86 0-.21 0-.42-.02-.63.96-.69 1.79-1.56 2.45-2.54z" />
                      </svg>
                    </a>
                  )}
                  {speaker.social.linkedin && (
                    <a
                      href={speaker.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-blue-700"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20.447 20.45h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.284zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.017H3.555V9h3.564v11.45z" />
                      </svg>
                    </a>
                  )}
                  {speaker.social.instagram && (
                    <a
                      href={speaker.social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-pink-500"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.059 1.689.073 4.948.073s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.44-.645 1.44-1.44s-.645-1.44-1.44-1.44z" />
                      </svg>
                    </a>
                  )}
                  {speaker.social.facebook && (
                    <a
                      href={speaker.social.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-blue-800"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.323-1.325z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/speakers"
            className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            View All Speakers
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SpeakersSection;
