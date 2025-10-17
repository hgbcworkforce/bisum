export const sessions = [
  {
    id: 1,
    day: "Day 1",
    time: "08:00",
    endTime: "09:00",
    title: "Onsite Registration",
    type: "registration",
    speaker: {
      name: "Conference Team",
      title: "Event Organizers",
      avatar:
        "https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    venue: "Main Auditorium",
    description:
      "Join us for registration, networking, and coffee before the conference begins.",
    hasReminder: true,
  },
  {
    id: 2,
    day: "Day 1",
    time: "09:00",
    endTime: "09:45",
    title: "Worship Session",
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
    title: "Welcome Remarks",
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
    title: "Theme Interpretation",
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
    title: "Session 1",
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
    title: "Session 2",
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
    title: "Closing and Announcements",
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

  // Day 2
  {
    id: 8,
    day: "Day 2",
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
    day: "Day 2",
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
    day: "Day 2",
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
  {
    id: 11,
    day: "Day 2",
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
    id: 12,
    day: "Day 2",
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
    id: 13,
    day: "Day 2",
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

  // Day 3
  {
    id: 14,
    day: "Day 3",
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
    id: 15,
    day: "Day 3",
    time: "16:15",
    endTime: "17:00",
    title: "Sustainable Technology: Green Solutions for Tomorrow",
    type: "keynote",
    speaker: {
      name: "Dr. Jennifer Green",
      title: "Environmental Tech Researcher",
      avatar:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
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
    id: 16,
    day: "Day 3",
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
  {
    id: 17,
    day: "Day 3",
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
    id: 18,
    day: "Day 3",
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
    id: 19,
    day: "Day 3",
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
