/**
 * Global Reusable Text and UI Content Configuration
 * Centralized content for BISUM Conference web platform.
 */

export const SITE_CONFIG = {
  name: "BISUM Conference 2025",
  shortName: "BISUM 2025",
  title: "BISUM Conference 2025 - Annual Technology Summit",
  description: "Join premier software engineers, architects, and technology leaders for 3 days of transformative keynotes, masterclasses, and networking.",
  conferenceDate: "November 13, 2025 17:00:00",
  dateRange: "November 13 - 15, 2025",
  location: "Higher Ground Baptist Church, Ogbomoso, Nigeria.",
  shortLocation: "HGBC Auditorium, Ogbomoso",
  logoAlt: "BISUM Logo",
};

export const NAVIGATION_CONTENT = {
  logoAlt: "BISUM Logo",
  navItems: [
    { id: "home", label: "Home", href: "/", isRoute: true },
    { id: "about", label: "About", href: "/#about", isSection: true },
    { id: "speakers", label: "Speakers", href: "/speakers", isRoute: true },
    { id: "schedule", label: "Schedule", href: "/schedule", isRoute: true },
    { id: "merchandise", label: "Merchandise", href: "/merchandise", isRoute: true },
    { id: "register", label: "Register", href: "/register", isRoute: true, isCTA: true },
  ],
};

export const HERO_CONTENT = {
  titlePrefix: "BISUM Conference",
  highlightYear: "2025",
  description: "Join us to experience an atmosphere of learning, connection, and transformation. Gain practical insights, meet inspiring leaders, and take bold steps toward your future.",
  dates: "November 13 - 15, 2025",
  location: "Higher Ground Baptist Church, Ogbomoso, Nigeria.",
  targetDate: "November 13, 2025 17:00:00",
  ctaText: "Register Now",
  ctaHref: "/register",
  imageAlt: "BISUM Conference 2025 Background",
};

export const ABOUT_CONTENT = {
  sectionId: "about",
  title: "About BISUM Conference",
  p1: "The BISUM Conference is a transformative event designed to empower students and young professionals with the knowledge, skills, and mindset needed to excel in business, investment, leadership, and personal development.",
  p2: "Through engaging sessions, expert insights, and practical discussions, BISUM inspires participants to think beyond academics, embrace innovation, and take actionable steps toward building successful and purpose-driven futures.",
  ctaText: "Meet Our Speakers",
  ctaHref: "/speakers",
  bannerAlt: "Bisum'25 banner",
};

export const SPEAKERS_SECTION_CONTENT = {
  sectionId: "speakers",
  badge: "Featured Mentors",
  title: "Meet Our Speakers",
  subtitle: "Learn from industry leaders, seasoned entrepreneurs, and educators who are transforming communities.",
  ctaText: "View All Speakers",
  ctaHref: "/speakers",
};

export const SCHEDULE_SECTION_CONTENT = {
  sectionId: "schedule-preview",
  badge: "3-Day Agenda",
  title: "Conference Program",
  subtitle: "Discover keynotes, breakout masterclasses, and transformative sessions tailored for your career and business growth.",
  ctaText: "Explore Full 3-Day Schedule",
  ctaHref: "/schedule",
};

export const MERCHANDISE_SECTION_CONTENT = {
  sectionId: "merchandise",
  badge: "Official Gear",
  title: "Conference Merchandise",
  subtitle: "Grab your exclusive BISUM Conference merchandise and show your support!",
  orderClosesPrefix: "Order Closes:",
  orderNowText: "Order Now",
};

export const SPEAKERS_PAGE_CONTENT = {
  bannerTitle: "Our Speakers",
  bannerSubtitle: "Meet the industry leaders and experts who will be sharing their insights at BISUM Conference 2025",
  badge1: "10+ Inspiring Leaders",
  badge2: "Visionary Entrepreneurs",
  searchPlaceholder: "Search speakers, topics, or companies...",
  allCategoryLabel: "All Speakers",
  showingResultsPrefix: "Showing",
  showingResultsOf: "of",
  showingResultsSuffix: "speakers",
  emptyStateTitle: "No speakers found",
  emptyStateDescription: "Try adjusting your search criteria or filter selection",
  emptyStateButtonText: "Clear Filters",
  ctaTitle: "Don't Miss These Amazing Speakers",
  ctaSubtitle: "Register now to secure your spot and gain practical insights from leaders across business, ministry, and technology.",
  ctaButtonText: "Register for BISUM 2025",
  ctaButtonHref: "/register",
};

export const SCHEDULE_PAGE_CONTENT = {
  bannerTitle: "Conference Schedule",
  bannerSubtitle: "Explore the comprehensive 3-day program featuring keynotes, success stories, and breakout masterclasses",
  badge1: "Nov 13 - 15, 2025",
  badge2: "HGBC Auditorium, Ogbomoso",
  ctaTitle: "Ready to Attend BISUM 2025?",
  ctaSubtitle: "Secure your registration today to participate in all keynotes, breakout sessions, and networking opportunities.",
  ctaButtonText: "Register Now",
  ctaButtonHref: "/register",
};

export const MERCHANDISE_PAGE_CONTENT = {
  bannerTitle: "Official Merchandise",
  bannerSubtitle: "Grab your exclusive BISUM Conference merchandise and show your support!",
  badge1: "Premium Quality Apparel",
  badge2: "Limited Edition 2025",
};

export const MERCHANDISE_DETAILS_CONTENT = {
  backLinkText: "Back to Merchandise",
  backLinkHref: "/merchandise",
  countdownHeading: "Pre-Order Deadline Countdown",
  selectColorLabel: "Select Color:",
  selectSizeLabel: "Select Size",
  quantityLabel: "Quantity",
  submitButtonPrefix: "Pre-Order Now",
  trustBadge1: "Official HGBC Store",
  trustBadge2: "Conference Onsite Pickup",
  successTitle: "Pre-Order Received!",
  successMessageTemplate: (quantity: number, itemName: string, colorName: string, size: string) =>
    `Thank you for ordering ${quantity}x ${itemName} (${colorName}, ${size}). Pickup details will be sent to your email.`,
};

export const REGISTER_PAGE_CONTENT = {
  bannerTitle: "Register for BISUM 2025",
  bannerSubtitle: "November 13 - 15, 2025 | Higher Ground Baptist Church, Ogbomoso",
  formTitle: "Personal & Conference Details",
  submitButtonText: "Complete Registration",
  submittingButtonText: "Processing Registration...",
  successTitle: "Registration Successful!",
  successSubtitle: "Welcome to BISUM Conference 2025. We look forward to having you!",
  registrationNumberLabel: "Your Registration Number",
  emailNoticePrefix: "A confirmation email has been dispatched to",
  defaultErrorMessage: "Registration failed. Please try again.",

  registrationTypes: [
    { value: "regular", label: "Regular Attendee", price: 0, description: "Full access to all 3-day general sessions, keynotes, and breakout rooms." },
    { value: "student", label: "Student Tier", price: 0, description: "Subsidized full conference admission with valid student ID verification." },
    { value: "vip", label: "VIP Executive", price: 5000, description: "Priority front-row seating, executive lunch lounge, and speaker networking." },
  ],

  genderOptions: [
    { value: "", label: "Select Gender" },
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
  ],

  ageRangeOptions: [
    { value: "", label: "Select Age Range" },
    { value: "15-20", label: "15 - 20" },
    { value: "21-25", label: "21 - 25" },
    { value: "26-30", label: "26 - 30" },
    { value: "31-40", label: "31 - 40" },
    { value: "40+", label: "40+" },
  ],

  referralSourceOptions: [
    { value: "", label: "Select Referral Source" },
    { value: "church", label: "Church" },
    { value: "instagram", label: "Instagram" },
    { value: "recommendation_from_friend", label: "Friend Recommendation" },
    { value: "whatsapp", label: "WhatsApp" },
    { value: "facebook", label: "Facebook" },
    { value: "flyer", label: "Flyer / Banner" },
  ],

  breakoutSessionOptions: [
    { value: "", label: "Select Breakout Session" },
    { value: "investment", label: "Investment & Wealth Creation" },
    { value: "tech", label: "Technology & Digital Skills" },
    { value: "fashion", label: "Fashion, Styling & Branding" },
    { value: "agriculture", label: "Agribusiness & Farming" },
    { value: "foods", label: "Confectionery & Food Business" },
  ],

  labels: {
    firstName: "First Name *",
    lastName: "Last Name *",
    email: "Email Address *",
    phone: "Phone Number *",
    gender: "Gender *",
    ageRange: "Age Range *",
    referralSource: "How did you hear about BISUM? *",
    breakoutSessionChoice: "Breakout Masterclass Choice *",
    expectations: "Expectations (Optional)",
  },

  placeholders: {
    firstName: "e.g. John",
    lastName: "e.g. Doe",
    email: "john.doe@example.com",
    phone: "+234 800 000 0000",
    expectations: "What do you hope to gain from BISUM 2025?",
  },

  validationMessages: {
    firstName: "First name is required",
    lastName: "Last name is required",
    emailRequired: "Email is required",
    emailInvalid: "Please enter a valid email",
    phone: "Phone number is required",
    gender: "Gender is required",
    ageRange: "Age range is required",
    referralSource: "Please select how you heard about BISUM",
    breakoutSessionChoice: "Please select a breakout session",
  },
};

export const FOOTER_CONTENT = {
  brandName: "BISUM",
  brandSubtitle: "Conference 2025",
  description: "Join us to experience an atmosphere of learning, connection, and transformation. Gain practical insights, meet inspiring leaders, and take bold steps toward your future.",
  quickLinksHeading: "Quick Links",
  contactInfoHeading: "Contact Info",

  quickLinks: [
    { name: "Home", href: "/" },
    { name: "Schedule", href: "/schedule" },
    { name: "Speakers", href: "/speakers" },
    { name: "Merchandise", href: "/merchandise" },
    { name: "Register", href: "/register" },
  ],

  contactInfo: [
    { type: "location", text: "Ogbomoso, Nigeria" },
    { type: "email", text: "bisum@hgbcinfluencers.org" },
    { type: "phone", text: "+234 (0) 123 456 7890" },
  ],

  socialLinks: [
    { name: "Facebook", href: "https://facebook.com/hgbcinfluencers" },
    { name: "Instagram", href: "https://instagram.com/hgbcinfluencers" },
    { name: "YouTube", href: "https://youtube.com/@hgbcinfluencers" },
  ],

  copyright: "BISUM Conference. All rights reserved. Powered by Higher Ground Baptist Church.",
};
