import {
  Navigation,
  Hero,
  AboutSection,
  SpeakersSection,
  Testimonials,
  Footer,
} from "../components";

const Homepage = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <Navigation onNavigate={scrollToSection} />

      {/* Hero Section */}
      <Hero />

      {/* About Section */}
      <AboutSection />

      {/* Placeholder sections for navigation */}
      <section
        id="schedule"
        className="min-h-screen bg-white flex items-center justify-center"
      >
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Schedule</h2>
          <p className="text-xl text-gray-600">
            Conference schedule coming soon...
          </p>
        </div>
      </section>

      {/* Speakers Section */}
      <SpeakersSection />

      {/* Testimonials and Sponsors Section */}
      <Testimonials />

      {/* Registration Section */}
      <section
        id="register"
        className="min-h-screen bg-white flex items-center justify-center"
      >
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Register</h2>
          <p className="text-xl text-gray-600">
            Registration form coming soon...
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Homepage;
