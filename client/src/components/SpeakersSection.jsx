import { getFeaturedSpeakers } from "../data/speakersData";

const SpeakersSection = () => {
  // Get featured speakers from the data file
  const speakers = getFeaturedSpeakers();
  return (
    <section id="speakers" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800">Keynote Speakers</h2>
          <p className="text-xl text-gray-600 mt-2">
            Meet the experts who will be sharing their insights.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {speakers.map((speaker, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300"
            >
              <img
                src={speaker.image}
                alt={speaker.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {speaker.name}
                </h3>
                <p className="text-md text-blue-600 font-semibold">
                  {speaker.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpeakersSection;
