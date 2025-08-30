import { useState } from "react";
import { Navigation, SpeakerCard, SpeakerModal, Footer } from "../components";

const Speakers = () => {
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock speaker data based on conference themes
  const speakers = [
    {
      id: 1,
      name: "Dr. Sarah Okafor",
      title: "AI Research Director",
      company: "University of Lagos",
      bio: "Dr. Sarah Okafor is a leading AI researcher with over 15 years of experience in machine learning and artificial intelligence. She has published over 50 research papers and leads groundbreaking research in AI applications for African contexts, focusing on healthcare and education solutions.\n\nHer work has been recognized internationally, and she serves on the editorial boards of several top-tier AI journals. She is passionate about making AI accessible and beneficial for developing nations.",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      expertise: [
        "Artificial Intelligence",
        "Machine Learning",
        "Healthcare AI",
        "Education Technology",
      ],
      category: "keynote",
      featured: true,
      experience:
        "15+ years in AI research, former Microsoft Research scientist, founded 3 AI startups",
      achievements: [
        "Published 50+ peer-reviewed papers in top AI conferences",
        "Led development of AI systems used by 2M+ healthcare workers",
        "Received UNESCO AI Innovation Award 2023",
        "TEDx speaker with 500k+ views",
      ],
      session: {
        title: "The Future of Artificial Intelligence in Africa",
        time: "10:00 AM - 10:45 AM",
        venue: "Main Auditorium",
      },
      social: {
        linkedin: "https://linkedin.com/in/sarah-okafor",
        twitter: "https://twitter.com/sarah_okafor_ai",
        website: "https://sarahokafor.ai",
      },
      quote:
        "AI should be a tool for equality, not division. Our role is to ensure it serves humanity's best interests.",
    },
    {
      id: 2,
      name: "Michael Chen",
      title: "Blockchain Solutions Architect",
      company: "BlockTech Solutions",
      bio: "Michael is a pioneering blockchain architect who has implemented secure digital transaction systems across multiple industries. With expertise in cryptocurrency, DeFi, and smart contracts, he has helped Fortune 500 companies integrate blockchain technology.\n\nHe is the author of 'Blockchain Revolution' and a frequent speaker at international tech conferences.",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      expertise: [
        "Blockchain",
        "Cryptocurrency",
        "Smart Contracts",
        "DeFi",
        "Web3",
      ],
      category: "keynote",
      featured: true,
      experience:
        "12+ years in blockchain development, architect of 3 major blockchain platforms",
      achievements: [
        "Architected blockchain systems processing $10B+ in transactions",
        "Author of bestselling book 'Blockchain Revolution'",
        "Founded successful blockchain startup acquired by IBM",
        "Advisory board member of 5+ blockchain companies",
      ],
      session: {
        title: "Blockchain Revolution: Building Trust in Digital Transactions",
        time: "11:30 AM - 12:15 PM",
        venue: "Main Auditorium",
      },
      social: {
        linkedin: "https://linkedin.com/in/michael-chen-blockchain",
        twitter: "https://twitter.com/mikechenblock",
      },
      quote:
        "Blockchain isn't just about cryptocurrency; it's about creating a more transparent and trustworthy digital world.",
    },
    {
      id: 3,
      name: "Dr. Jennifer Green",
      title: "Environmental Tech Researcher",
      company: "GreenTech Innovation Labs",
      bio: "Dr. Jennifer Green specializes in developing sustainable technology solutions and has led multiple green tech initiatives. Her research focuses on renewable energy systems, sustainable manufacturing, and environmental impact assessment of emerging technologies.\n\nShe has been instrumental in developing policies for sustainable tech adoption across Africa and serves as an advisor to several governments on environmental technology.",
      image:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      expertise: [
        "Sustainable Technology",
        "Green Energy",
        "Environmental Impact",
        "Clean Tech",
        "Renewable Systems",
      ],
      category: "keynote",
      featured: true,
      experience:
        "18+ years in environmental technology, former UN Environmental Programme advisor",
      achievements: [
        "Led development of solar systems powering 100k+ homes",
        "Advised 15+ African governments on sustainable tech policies",
        "Recipient of Global Green Tech Innovation Award",
        "Founded non-profit providing clean tech to rural communities",
      ],
      session: {
        title: "Sustainable Technology: Green Solutions for Tomorrow",
        time: "4:15 PM - 5:00 PM",
        venue: "Main Auditorium",
      },
      social: {
        linkedin: "https://linkedin.com/in/jennifer-green-greentech",
        website: "https://jennifergreentech.org",
      },
      quote:
        "Technology without sustainability is just sophisticated destruction. We must build for the planet we want to leave behind.",
    },
    {
      id: 4,
      name: "Amanda Rodriguez",
      title: "Senior Mobile Developer",
      company: "TechCorp Mobile Division",
      bio: "Amanda has over 8 years of experience in mobile app development and has built apps with millions of downloads. She specializes in cross-platform development using React Native and Flutter, and has led mobile development teams at three different startups.\n\nShe's passionate about creating accessible mobile experiences and has contributed to several open-source mobile frameworks.",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      expertise: [
        "Mobile Development",
        "React Native",
        "Flutter",
        "UI/UX Design",
        "App Architecture",
      ],
      category: "workshop",
      experience:
        "8+ years in mobile development, led teams at 3 successful startups",
      achievements: [
        "Built mobile apps with 5M+ combined downloads",
        "Core contributor to React Native framework",
        "Led mobile team that won 'App of the Year' award",
        "Speaker at 20+ mobile development conferences",
      ],
      session: {
        title: "Workshop: Building Your First Mobile App",
        time: "1:30 PM - 3:00 PM",
        venue: "Workshop Room A",
      },
      social: {
        linkedin: "https://linkedin.com/in/amanda-rodriguez-mobile",
        twitter: "https://twitter.com/amandadev",
        website: "https://amandarodriguez.dev",
      },
      quote:
        "Great mobile apps don't just work well; they feel like magic in the user's hands.",
    },
    {
      id: 5,
      name: "David Okonkwo",
      title: "Fintech Innovation Director",
      company: "AfriPay Solutions",
      bio: "David is a fintech pioneer who has revolutionized mobile payments across West Africa. His work has enabled millions of people to access financial services for the first time. He has deep expertise in mobile money, digital banking, and financial inclusion technologies.\n\nUnder his leadership, AfriPay has processed over $2 billion in transactions and serves 10+ million users across 8 African countries.",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      expertise: [
        "Fintech",
        "Mobile Payments",
        "Digital Banking",
        "Financial Inclusion",
        "API Development",
      ],
      category: "panel",
      experience:
        "10+ years in fintech, former Goldman Sachs technology division",
      achievements: [
        "Built payment platform processing $2B+ annually",
        "Enabled financial access for 10M+ previously unbanked users",
        "Winner of African Fintech Innovation Award 2022",
        "Advisor to Central Bank of Nigeria on digital currency",
      ],
      session: {
        title: "Panel: The Future of Digital Payments in Africa",
        time: "3:15 PM - 4:00 PM",
        venue: "Panel Hall",
      },
      social: {
        linkedin: "https://linkedin.com/in/david-okonkwo-fintech",
        twitter: "https://twitter.com/davidfintech",
      },
    },
    {
      id: 6,
      name: "Prof. Lisa Anderson",
      title: "Cybersecurity Research Lead",
      company: "SecureTech Institute",
      bio: "Professor Anderson is a world-renowned cybersecurity expert with expertise in threat detection, network security, and privacy protection. She has developed security frameworks used by major corporations and government agencies worldwide.\n\nHer research has been published in top security journals, and she regularly consults for international organizations on cybersecurity policy and best practices.",
      image:
        "https://images.unsplash.com/photo-1580894742444-42a597a51854?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      expertise: [
        "Cybersecurity",
        "Network Security",
        "Privacy Protection",
        "Threat Detection",
        "Security Architecture",
      ],
      category: "workshop",
      experience:
        "20+ years in cybersecurity, former NSA researcher, founded 2 security startups",
      achievements: [
        "Developed security frameworks used by Fortune 100 companies",
        "Published 80+ papers in top cybersecurity journals",
        "Discovered 15+ critical security vulnerabilities",
        "Testified before Congress on cybersecurity policy",
      ],
      session: {
        title: "Workshop: Essential Cybersecurity for Modern Businesses",
        time: "2:00 PM - 3:30 PM",
        venue: "Workshop Room B",
      },
      social: {
        linkedin: "https://linkedin.com/in/lisa-anderson-security",
        website: "https://lisaandersonsec.com",
      },
      quote:
        "Security is not a product, but a process. It's about building a culture of awareness and preparedness.",
    },
    {
      id: 7,
      name: "James Kim",
      title: "DevOps Engineering Manager",
      company: "CloudScale Technologies",
      bio: "James is a DevOps expert who has helped organizations scale their infrastructure from startups to enterprise level. He specializes in cloud architecture, containerization, and CI/CD pipeline optimization.\n\nHe has led digital transformation initiatives at several Fortune 500 companies and is a certified expert in AWS, Azure, and Google Cloud platforms.",
      image:
        "https://images.unsplash.com/photo-1622463267620-1e0e0d3c0aaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      expertise: [
        "DevOps",
        "Cloud Architecture",
        "Kubernetes",
        "CI/CD",
        "Infrastructure Automation",
      ],
      category: "technical",
      experience:
        "12+ years in DevOps, led infrastructure teams at Netflix and Spotify",
      achievements: [
        "Reduced deployment times by 90% across multiple organizations",
        "Built infrastructure serving 100M+ users daily",
        "Created open-source tools used by 10k+ developers",
        "AWS, Azure, and GCP certified solution architect",
      ],
      social: {
        linkedin: "https://linkedin.com/in/james-kim-devops",
        twitter: "https://twitter.com/jameskimdevops",
      },
    },
    {
      id: 8,
      name: "Dr. Rachel Thompson",
      title: "Data Science Director",
      company: "DataInsights Corp",
      bio: "Dr. Thompson is a data science leader with expertise in machine learning, big data analytics, and statistical modeling. She has helped organizations leverage data to make better business decisions and has built predictive models for various industries including healthcare, finance, and retail.\n\nShe holds a PhD in Statistics from Stanford University and has been recognized as one of the top data scientists under 40.",
      image:
        "https://images.unsplash.com/photo-1593104547489-5cfb3839a3b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      expertise: [
        "Data Science",
        "Machine Learning",
        "Big Data",
        "Statistical Analysis",
        "Predictive Modeling",
      ],
      category: "technical",
      experience:
        "14+ years in data science, former Google and Facebook data scientist",
      achievements: [
        "Built ML models processing 1TB+ data daily",
        "Led data science teams of 50+ people",
        "Published research cited 1000+ times",
        "Created data science curriculum for 3 universities",
      ],
      social: {
        linkedin: "https://linkedin.com/in/rachel-thompson-data",
        website: "https://rachelthompsondata.com",
      },
    },
  ];

  // Filter and search functionality
  const categories = ["all", "keynote", "workshop", "panel", "technical"];

  const filteredSpeakers = speakers.filter((speaker) => {
    const matchesCategory =
      filterCategory === "all" || speaker.category === filterCategory;
    const matchesSearch =
      speaker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      speaker.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      speaker.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      speaker.expertise.some((exp) =>
        exp.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    return matchesCategory && matchesSearch;
  });

  const handleSpeakerClick = (speaker) => {
    setSelectedSpeaker(speaker);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedSpeaker(null), 300);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div>
        {/* Navigation */}
        <Navigation onNavigate={scrollToSection} />

        {/* Page Header */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 pt-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
                Our Speakers
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8">
                Meet the industry leaders and experts who will be sharing their
                insights at BISUM Conference 2025
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-lg">
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                    />
                  </svg>
                  <span>{speakers.length} Expert Speakers</span>
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
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9"
                    />
                  </svg>
                  <span>Global Industry Leaders</span>
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

        {/* Speakers Content */}
        <section className="py-20">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filter and Search Controls */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 space-y-6 lg:space-y-0">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setFilterCategory(category)}
                    className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                      filterCategory === category
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-white text-gray-700 hover:bg-blue-50 shadow-md hover:shadow-lg"
                    }`}
                  >
                    {category === "all"
                      ? "All Speakers"
                      : category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full lg:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search speakers, topics, or companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-8">
              <p className="text-gray-600">
                Showing {filteredSpeakers.length} of {speakers.length} speakers
                {searchTerm && ` for "${searchTerm}"`}
              </p>
            </div>

            {/* Speakers Grid */}
            {filteredSpeakers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredSpeakers.map((speaker) => (
                  <SpeakerCard
                    key={speaker.id}
                    speaker={speaker}
                    onSpeakerClick={handleSpeakerClick}
                  />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-20">
                <svg
                  className="w-20 h-20 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  No speakers found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or filter selection
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterCategory("all");
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Call to Action */}
            <div className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Don't Miss These Amazing Speakers
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Register now to secure your spot and learn from the best minds
                in technology
              </p>
              <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                Register for BISUM 2025
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Speaker Modal */}
      <SpeakerModal
        speaker={selectedSpeaker}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Speakers;
