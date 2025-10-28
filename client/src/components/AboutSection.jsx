
const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-gray-800">
            <h2 className="text-4xl font-bold mb-6">About BISUM Conference</h2>
            <p className="text-lg mb-4">
              The BISUM Conference is a transformative event designed to empower students and young professionals with the knowledge, skills, and mindset needed to excel in business, investment, leadership, and personal development.
            </p>
            <p className="text-lg mb-6">
              Through engaging sessions, expert insights, and practical discussions, BISUM inspires participants to think beyond academics, embrace innovation, and take actionable steps toward building successful and purpose-driven futures.
            </p>
            <a href="#speakers" className="text-blue-600 hover:underline font-semibold">
              Meet Our Speakers &rarr;
            </a>
          </div>

          {/* Image/Graphic */}
          <div className="relative">
            {/* <img
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1932&q=80"
              alt="Professional networking at a conference"
              className="rounded-lg shadow-2xl w-full h-auto"
            />*/}
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-blue-200 rounded-full opacity-50"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-200 rounded-full opacity-50"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
