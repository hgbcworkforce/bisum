import { Navigation, ScheduleList, Footer } from "../components";
import { sessions } from "../data/scheduleData";
import { Calendar, MapPin, ClipboardList, Users, Lightbulb, AlertTriangle } from "lucide-react";

const Schedule = () => {


  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <Navigation onNavigate={scrollToSection} />

        {/* Page Header */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 pt-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
                Conference Schedule
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8">
                Explore our comprehensive agenda featuring every sessions of the conference.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-6 h-6 text-blue-200" />
                  <span className="text-lg">November 13 - 15, 2025</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-6 h-6 text-blue-200" />
                  <span className="text-lg">Higher Ground Baptist Church,Ogbomoso, Nigeria</span>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg
              className="w-full h-12"
              preserveAspectRatio="none"
              viewBox="0 0 1200 120"
              fill="none"
            >
              <path
                d="M0,120 L0,40 C200,20 400,60 600,40 C800,20 1000,60 1200,40 L1200,120 Z"
                fill="rgb(249, 250, 251)"
              />
            </svg>
          </div>
        </section>

        {/* Schedule Content */}
        <section className="py-20">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Main Schedule */}
            <ScheduleList sessions={sessions} groupByDay={true} />

            {/* Important Notes */}
            <div className="mt-16 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-yellow-800">
                    Important Notes
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700 space-y-1">
                    <p>• Please arrive 15 minutes early for each session</p>
                    <p>• Sessions may be subject to minor time adjustments</p>
                    <p>
                      • All sessions will be recorded for registered attendees
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Schedule;
