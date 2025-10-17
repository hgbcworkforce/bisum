import {
  Navigation,
  Hero,
  AboutSection,
  SpeakersSection,
  Testimonials,
  Footer,
  ScheduleList,
} from "../components";
import { sessions } from "../data/scheduleData";
import { Link } from "react-router-dom";

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
        className="py-20 bg-white"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Event Schedule
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore the exciting lineup of sessions and workshops that will take place during the BISUM Conference.
            </p>
          </div>
          <ScheduleList sessions={sessions.slice(0, 3)} />
          <div className="text-center mt-8">
            <Link
              to="/schedule"
              className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              View Full Schedule
            </Link>
          </div>
        </div>
      </section>

      {/* Speakers Section */}
      <SpeakersSection />

      {/* Testimonials and Sponsors Section */}
      <Testimonials />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Homepage;
