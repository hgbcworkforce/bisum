import { CountdownTimer } from "./";

const Hero = () => {
  // Conference date: November 15, 2025
  const conferenceDate = new Date("November 15, 2025 09:00:00").getTime();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center text-white text-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black opacity-60"></div>
      <div className="relative z-10 flex flex-col items-center px-4">
        {/* Main Heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-8xl font-extrabold mb-4 leading-tight">
          BISUM Conference <span className="text-blue-400">2025</span>
        </h1>

        {/* Description */}
        <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto font-light">
          Join us for the most innovative and inspiring conference of the year.
          Connect with industry leaders, discover cutting-edge technologies, and
          shape the future.
        </p>

        {/* Conference Dates */}
        <div className="mb-8">
          <p className="text-2xl sm:text-3xl text-blue-400 font-semibold mb-2">
            November 15, 2025
          </p>
          <p className="text-lg text-gray-200">
            Lagos, Nigeria • 9:00 AM - 6:00 PM
          </p>
        </div>

        {/* Countdown Timer */}
        <CountdownTimer targetDate={conferenceDate} />

        {/* Call to Action */}
        <div className="mt-10 space-y-4">
          <button
            onClick={() => scrollToSection("register")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full text-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/50"
          >
            Register Now
          </button>
          <p className="text-sm text-gray-400">
            Early bird pricing available until October 31st
          </p>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20">
        <div className="animate-bounce text-white">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default Hero;
