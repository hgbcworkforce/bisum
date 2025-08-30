import { Navigation, ScheduleList, Footer } from "../components";

const Schedule = () => {
  // Mock session data based on typical conference structure
  const sessions = [
    {
      id: 1,
      day: "Day 1",
      time: "08:00",
      endTime: "09:00",
      title: "Registration & Welcome Coffee",
      type: "registration",
      speaker: {
        name: "Conference Team",
        title: "Event Organizers",
        avatar:
          "https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      },
      venue: "Main Lobby",
      description:
        "Join us for registration, networking, and coffee before the conference begins.",
      hasReminder: true,
    },
    {
      id: 2,
      day: "Day 1",
      time: "09:00",
      endTime: "09:45",
      title: "Opening Ceremony & Welcome Address",
      type: "keynote",
      speaker: {
        name: "Dr. Adebayo Johnson",
        title: "Conference Chair & Tech Innovation Leader",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
        bio: "Dr. Johnson is a renowned tech innovation leader with over 15 years of experience in emerging technologies and digital transformation.",
      },
      venue: "Main Auditorium",
      description:
        "Official opening of BISUM Conference 2025 with welcome remarks and conference overview.",
      topics: ["Conference Overview", "Innovation Trends", "Digital Future"],
      hasReminder: true,
    },
    {
      id: 3,
      day: "Day 1",
      time: "10:00",
      endTime: "10:45",
      title: "The Future of Artificial Intelligence in Africa",
      type: "keynote",
      speaker: {
        name: "Prof. Sarah Okafor",
        title: "AI Research Director, University of Lagos",
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
        bio: "Prof. Okafor leads groundbreaking research in AI applications for African contexts, focusing on healthcare and education solutions.",
      },
      venue: "Main Auditorium",
      description:
        "Exploring how AI technologies can be leveraged to solve unique challenges across African nations.",
      topics: [
        "Artificial Intelligence",
        "African Innovation",
        "Healthcare AI",
        "Education Technology",
      ],
      hasReminder: true,
    },
    {
      id: 4,
      day: "Day 1",
      time: "11:00",
      endTime: "11:30",
      title: "Networking Break",
      type: "break",
      speaker: {
        name: "All Attendees",
        title: "Networking Session",
      },
      venue: "Exhibition Hall",
      description:
        "Connect with fellow attendees, speakers, and sponsors over refreshments.",
      hasReminder: false,
    },
    {
      id: 5,
      day: "Day 1",
      time: "11:30",
      endTime: "12:15",
      title: "Blockchain Revolution: Building Trust in Digital Transactions",
      type: "keynote",
      speaker: {
        name: "Michael Chen",
        title: "Blockchain Solutions Architect",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
        bio: "Michael is a leading blockchain architect who has implemented secure digital transaction systems across multiple industries.",
      },
      venue: "Main Auditorium",
      description:
        "Understanding blockchain technology and its applications in creating secure, transparent digital ecosystems.",
      topics: ["Blockchain", "Cryptocurrency", "Digital Security", "Fintech"],
      hasReminder: true,
    },
    {
      id: 6,
      day: "Day 1",
      time: "12:30",
      endTime: "13:30",
      title: "Lunch Break & Sponsor Showcase",
      type: "break",
      speaker: {
        name: "All Attendees",
        title: "Lunch & Networking",
      },
      venue: "Main Hall",
      description:
        "Enjoy lunch while exploring sponsor exhibitions and networking opportunities.",
      hasReminder: false,
    },
    {
      id: 7,
      day: "Day 1",
      time: "13:30",
      endTime: "15:00",
      title: "Workshop: Building Your First Mobile App",
      type: "workshop",
      speaker: {
        name: "Amanda Rodriguez",
        title: "Senior Mobile Developer",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
        bio: "Amanda has over 8 years of experience in mobile app development and has built apps with millions of downloads.",
      },
      venue: "Workshop Room A",
      description:
        "Hands-on workshop where you'll learn to build and deploy your first mobile application using modern development frameworks.",
      topics: [
        "Mobile Development",
        "React Native",
        "App Deployment",
        "UI/UX Design",
      ],
      hasReminder: true,
    },
    {
      id: 8,
      day: "Day 1",
      time: "15:15",
      endTime: "16:00",
      title: "Panel Discussion: The Future of Work in a Digital Age",
      type: "panel",
      speaker: {
        name: "Industry Leaders Panel",
        title: "Tech CEOs & HR Directors",
        avatar:
          "https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      },
      venue: "Main Auditorium",
      description:
        "A dynamic panel discussion with industry leaders exploring how digital transformation is reshaping the workplace.",
      topics: [
        "Remote Work",
        "Digital Skills",
        "Career Development",
        "Industry Trends",
      ],
      hasReminder: true,
    },
    {
      id: 9,
      day: "Day 1",
      time: "16:15",
      endTime: "17:00",
      title: "Sustainable Technology: Green Solutions for Tomorrow",
      type: "keynote",
      speaker: {
        name: "Dr. Jennifer Green",
        title: "Environmental Tech Researcher",
        avatar:
          "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
        bio: "Dr. Green specializes in developing sustainable technology solutions and has led multiple green tech initiatives.",
      },
      venue: "Main Auditorium",
      description:
        "Exploring innovative technologies that promote environmental sustainability and green business practices.",
      topics: [
        "Sustainable Tech",
        "Green Energy",
        "Environmental Impact",
        "Clean Technology",
      ],
      hasReminder: true,
    },
    {
      id: 10,
      day: "Day 1",
      time: "17:00",
      endTime: "17:30",
      title: "Closing Remarks & Next Steps",
      type: "closing",
      speaker: {
        name: "Conference Organizers",
        title: "BISUM Team",
        avatar:
          "https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      },
      venue: "Main Auditorium",
      description:
        "Conference wrap-up, key takeaways, and information about future events and community initiatives.",
      hasReminder: false,
    },
  ];

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
                Explore our comprehensive agenda featuring keynotes, workshops,
                and networking sessions
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-6 h-6 text-blue-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-8 0l-1 12a2 2 0 002 2h8a2 2 0 002-2L19 7H5z"
                    />
                  </svg>
                  <span className="text-lg">November 15, 2025</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-6 h-6 text-blue-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-lg">Lagos, Nigeria</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-6 h-6 text-blue-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-lg">9:00 AM - 6:00 PM</span>
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
            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {sessions.length}
                    </p>
                    <p className="text-gray-600">Total Sessions</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {sessions.filter((s) => s.type === "keynote").length}
                    </p>
                    <p className="text-gray-600">Keynote Speakers</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-8 h-8 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {sessions.filter((s) => s.type === "workshop").length}
                    </p>
                    <p className="text-gray-600">Hands-on Workshops</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Schedule */}
            <ScheduleList sessions={sessions} groupByDay={true} />

            {/* Important Notes */}
            <div className="mt-16 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-yellow-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-yellow-800">
                    Important Notes
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700 space-y-1">
                    <p>• Please arrive 15 minutes early for each session</p>
                    <p>• Workshop materials will be provided on-site</p>
                    <p>• Sessions may be subject to minor time adjustments</p>
                    <p>
                      • Networking breaks include refreshments and sponsor
                      booths
                    </p>
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
