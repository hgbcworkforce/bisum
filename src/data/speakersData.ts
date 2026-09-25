import { Speaker } from '../types';

export const speakersData: Speaker[] = [
  {
    id: 1,
    name: "Pastor Samson Ayangoke",
    title: "Lead Pastor",
    company: "Higher Ground Baptist Church",
    bio: "Samson Oluwaseun Ayangoke was born to the family of Mr. & Mrs. Johnson Olufunke Ayangoke at Ilasamaja, Lagos State. He is the second born in a family of three, and the first of two males. He attended the University of Lagos, Akoka, from 2010–2015, where he obtained his B.Sc in Business Administration. He also holds a diploma in Computer Engineering and is a member of the Nigerian Institute of Management.\n\nHe gave his life to Christ in August 2008 during a BSF program at Surulere Baptist Church, Ojuelegba, and has remained steadfast in faith. Over the years, he has served in various ministry capacities within the R.A, BSF, Youth Fellowship, and NCCF. After his university education, he worked in the financial sector with FCMB for three years before answering the call into full-time ministry in May 2020.\n\nHe is married to his beautiful wife, Victory Tolulope Ayangoke, and their union is blessed with a lovely son, Judah Ireti-Ogo Ayangoke. Samson is currently a student at the Nigerian Baptist Theological Seminary, Ogbomoso, studying Missions in Theology. He is also an entrepreneur, and a technology and fashion enthusiast. A lover of God, prayer, and His Word, he is passionate about raising a generation that will advance God’s kingdom and walk in divine power in their spheres of influence.",
    image: "/speakers/ayangoke.webp",
    expertise: [
      "Missions",
      "Leadership",
      "Faith Development",
      "Entrepreneurship",
      "Technology & Innovation"
    ],
    category: ["keynote"],
    experience: "Former FCMB staff, now full-time missionary and entrepreneur with strong leadership and ministry experience.",
    achievements: [
      "Served in leadership roles across BSF, NCCF, and Youth Fellowship.",
      "Transitioned from the financial sector to full-time ministry in 2020.",
      "Founder of faith-driven initiatives combining technology and missions.",
      "Actively training to advance global missions through theological education."
    ],
    social: {
      linkedin: "https://linkedin.com/in/samson-ayangoke",
      facebook: "https://facebook.com/samson.ayangoke",
      instagram: "https://instagram.com/samsonayangoke"
    },
    quote: "Raising a generation that will advance God’s kingdom and walk in divine power in their spheres of influence."
  },
  {
    id: 2,
    name: "Dr Adebayo Adekunle",
    title: "Consultant Obstetrician & Gynaecologist, Entrepreneur, Educator",
    company: "Bowen University Teaching Hospital",
    bio: "Dr Adebayo Adekunle is a distinguished Consultant Obstetrician and Gynaecologist at the Bowen University Teaching Hospital (BUTH), Ogbomoso, where he also serves as a Senior Lecturer in the Department of Obstetrics and Gynaecology. With over two decades of experience in clinical practice, research, and medical education, Dr Adekunle has contributed significantly to maternal and child healthcare delivery and training in Nigeria.\n\nBeyond medicine, he is an astute entrepreneur and visionary investor with growing interests across real estate, agriculture, and hospitality sectors. He is deeply committed to youth mentorship, leadership development, and economic empowerment.",
    image: "/speakers/adebayo.webp",
    expertise: [
      "Maternal & Child Health",
      "Medical Education & Research",
      "Real Estate & Land Investment",
      "Agribusiness Management",
      "Mentorship & Youth Empowerment"
    ],
    category: "keynote",
    experience: "Over 20 years in medical practice, higher education leadership, and multi-sector entrepreneurship.",
    achievements: [
      "Senior Lecturer and Consultant Gynaecologist at BUTH Ogbomoso.",
      "Published numerous peer-reviewed research papers in reproductive health.",
      "Built resilient investment portfolios in real estate and agriculture.",
      "Mentored hundreds of medical doctors and aspiring entrepreneurs."
    ],
    social: {
      linkedin: "https://linkedin.com/in/adebayo-adekunle",
      facebook: "https://facebook.com/dradebayoadekunle"
    },
    quote: "Integrity and excellence in professional service provide the strongest foundation for entrepreneurial impact."
  },
  {
    id: 3,
    name: "Taiwo Olaonipekun",
    title: "Founder & CEO, Farmfixers",
    company: "Farmfixers",
    bio: "Taiwo Olaonipekun is an agritech innovator, commercial farmer, and the Founder and CEO of Farmfixers. With deep domain knowledge in sustainable crop production, farm mechanization, and rural farmer inclusion, Taiwo has built Farmfixers into a fast-growing agribusiness that connects farmland investors with experienced farm managers to maximize yields and financial returns.",
    image: "/speakers/olanipekun.webp",
    expertise: [
      "Agri-Tech Innovation",
      "Commercial Farmland Management",
      "Agricultural Value Chain",
      "Rural Development"
    ],
    category: "keynote",
    experience: "10+ years in hands-on commercial farming, agribusiness incubation, and agri-technology.",
    achievements: [
      "Founder of Farmfixers, a pioneering agri-tech company",
      "Successfully managed 400+ acres of farmland",
      "Created platforms for local farmers to showcase innovative practices",
      "Empowered rural farmers and youth with modern agricultural training",
      "Delivered consistent returns to investors while improving community livelihoods"
    ],
    social: {
      linkedin: "https://www.linkedin.com/in/taiwo-olaonipekun-33b455120",
      twitter: "https://x.com/taiwothefarmer",
      instagram: "https://www.instagram.com/ola.onipekuntaiwo/",
      facebook: "https://web.facebook.com/taiwo.olaonipekun.94/"
    }
  }
];

export const speakerCategories = [
  "all",
  "keynote",
  "breakout",
  "story",
];

export const getFeaturedSpeakers = (): Speaker[] => {
  return speakersData.filter((speaker) => speaker.featured || (Array.isArray(speaker.category) ? speaker.category.includes("keynote") : speaker.category === "keynote"));
};

export const getSpeakersByCategory = (category: string): Speaker[] => {
  if (category === "all") return speakersData;
  return speakersData.filter((speaker) => {
    if (Array.isArray(speaker.category)) {
      return speaker.category.includes(category);
    }
    return speaker.category === category;
  });
};

export const searchSpeakers = (searchTerm: string): Speaker[] => {
  if (!searchTerm) return speakersData;
  const term = searchTerm.toLowerCase();
  return speakersData.filter(
    (speaker) =>
      speaker.name.toLowerCase().includes(term) ||
      speaker.title.toLowerCase().includes(term) ||
      speaker.company.toLowerCase().includes(term) ||
      speaker.expertise.some((exp) => exp.toLowerCase().includes(term))
  );
};

export const filterAndSearchSpeakers = (category: string = "all", searchTerm: string = ""): Speaker[] => {
  let filtered = getSpeakersByCategory(category);
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (speaker) =>
        speaker.name.toLowerCase().includes(term) ||
        speaker.title.toLowerCase().includes(term) ||
        speaker.company.toLowerCase().includes(term) ||
        speaker.expertise.some((exp) => exp.toLowerCase().includes(term))
    );
  }
  return filtered;
};
