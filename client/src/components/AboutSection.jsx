
const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-gray-800">
            <h2 className="text-4xl font-bold mb-6">About BISUM Conference</h2>
            <p className="text-lg mb-4">
              The BISUM Conference is a premier event that brings together leading experts, innovators, and enthusiasts from various fields to explore the future of technology and its impact on society.
            </p>
            <p className="text-lg mb-6">
              Our key themes for this year include Artificial Intelligence, Blockchain, Sustainable Technology, and the Future of Work. We aim to foster collaboration, inspire new ideas, and provide a platform for meaningful discussions.
            </p>
            <a href="#speakers" className="text-blue-600 hover:underline font-semibold">
              Meet Our Speakers &rarr;
            </a>
          </div>

          {/* Image/Graphic */}
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1932&q=80" 
              alt="Professional networking at a conference"
              className="rounded-lg shadow-2xl w-full h-auto"
            />
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-blue-200 rounded-full opacity-50"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-200 rounded-full opacity-50"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
