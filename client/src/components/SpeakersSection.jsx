
const speakers = [
  {
    name: 'John Doe',
    title: 'CEO, Tech Innovations',
    imageUrl: 'https://images.unsplash.com/photo-1580894742444-42a597a51854?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80',
  },
  {
    name: 'Jane Smith',
    title: 'Lead AI Researcher',
    imageUrl: 'https://images.unsplash.com/photo-1593104547489-5cfb3839a3b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80',
  },
  {
    name: 'Samuel Green',
    title: 'Blockchain Pioneer',
    imageUrl: 'https://images.unsplash.com/photo-1622463067133-2499c4526134?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80',
  },
];

const SpeakersSection = () => {
  return (
    <section id="speakers" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800">Keynote Speakers</h2>
          <p className="text-xl text-gray-600 mt-2">Meet the experts who will be sharing their insights.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {speakers.map((speaker, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <img src={speaker.imageUrl} alt={speaker.name} className="w-full h-64 object-cover"/>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900">{speaker.name}</h3>
                <p className="text-md text-blue-600 font-semibold">{speaker.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpeakersSection;
