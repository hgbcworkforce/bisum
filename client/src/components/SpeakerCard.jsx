import { useState } from 'react';
import { User, Linkedin, Twitter, Eye } from 'lucide-react';

const SpeakerCard = ({ speaker, onSpeakerClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handleCardClick = () => {
    onSpeakerClick(speaker);
  };

  return (
    <div
      className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Speaker Image */}
      <div className="relative overflow-hidden">
        <div className="aspect-w-3 aspect-h-4 bg-gray-200">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-pulse">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          )}

          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-white">
              <div className="text-center">
                <User className="w-12 h-12 mx-auto mb-2 opacity-75" />
                <div className="text-xl font-bold">
                  {speaker.name.split(' ').map(n => n[0]).join('')}
                </div>
              </div>
            </div>
          ) : (
            <img
              src={speaker.image}
              alt={speaker.name}
              className={`w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
        </div>
      </div>

      {/* Speaker Info */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
          {speaker.name}
        </h3>

        <p className="text-blue-600 font-medium mb-3 text-sm">
          {speaker.title}
        </p>

        {speaker.company && (
          <p className="text-gray-600 text-sm mb-3">
            {speaker.company}
          </p>
        )}

        <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
          {speaker.bio}
        </p>

        {/* Topics/Expertise Tags */}
        {speaker.expertise && speaker.expertise.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {speaker.expertise.slice(0, 3).map((topic, index) => (
              <span
                key={index}
                className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium"
              >
                {topic}
              </span>
            ))}
            {speaker.expertise.length > 3 && (
              <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs">
                +{speaker.expertise.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Social Links */}
        {(speaker.social?.twitter || speaker.social?.linkedin) && (
          <div className="mt-4 flex space-x-3">
            {speaker.social.linkedin && (
              <a
                href={speaker.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            {speaker.social.twitter && (
              <a
                href={speaker.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <Twitter className="w-5 h-5" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Click indicator */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-blue-600 text-white rounded-full p-2">
          <Eye className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default SpeakerCard;
