const fs = require("fs");

// 1. schedule/page.js
const schedulePageCode = `"use client";

import { useState } from "react";
import { Navigation, Footer, ScheduleList } from "@/components";
import { sessions } from "@/data/scheduleData";
import { Search, Calendar, Sparkles } from "lucide-react";

export default function SchedulePage() {
  const [selectedDay, setSelectedDay] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const days = [
    { id: "all", label: "All Sessions" },
    { id: "Day 1", label: "Day 1 (Nov 13)" },
    { id: "Day 2", label: "Day 2 (Nov 14)" },
    { id: "Day 3", label: "Day 3 (Nov 15)" },
  ];

  const filteredSessions = sessions.filter((session) => {
    const matchesDay = selectedDay === "all" || session.day === selectedDay;
    const matchesSearch =
      searchQuery === "" ||
      session.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.speaker?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.type?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDay && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <main className="pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-primary font-bold text-xs uppercase tracking-wider bg-primary-50 px-3.5 py-1.5 rounded-full border border-primary-100 mb-3 inline-block">
              Interactive Timetable
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Conference Schedule
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              Explore keynote talks, technical workshops, panel deliberations, and ministry sessions scheduled across the summit.
            </p>
          </div>

          {/* Filter Toolbar */}
          <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-xs border border-slate-200/80 mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Day Selector Pills */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {days.map((day) => (
                <button
                  key={day.id}
                  onClick={() => setSelectedDay(day.id)}
                  className={\`px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer \${
                    selectedDay === day.id
                      ? "bg-primary text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }\`}
                >
                  {day.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search topic or speaker..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Sessions List */}
          {filteredSessions.length > 0 ? (
            <ScheduleList sessions={filteredSessions} />
          ) : (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-bold text-slate-900">No sessions match your filter</h3>
              <p className="text-sm text-slate-500 mt-1">Try switching the day filter or clearing your search term.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
`;
fs.writeFileSync("D:/bisum/src/app/schedule/page.js", schedulePageCode, "utf8");

// 2. speakers/page.js
const speakersPageCode = `"use client";

import { useState } from "react";
import { Navigation, Footer, SpeakerCard, SpeakerModal } from "@/components";
import { speakersData } from "@/data/speakersData";
import { Search, Users } from "lucide-react";

export default function SpeakersPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = [
    { id: "all", label: "All Faculty" },
    { id: "keynote", label: "Keynote Speakers" },
    { id: "breakout", label: "Breakout Leaders" },
    { id: "panelist", label: "Panelists" },
  ];

  const filteredSpeakers = speakersData.filter((speaker) => {
    const speakerCategories = Array.isArray(speaker.category)
      ? speaker.category
      : [speaker.category];

    const matchesCategory =
      selectedCategory === "all" ||
      speakerCategories.includes(selectedCategory);

    const matchesSearch =
      searchQuery === "" ||
      speaker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      speaker.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      speaker.company?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleOpenModal = (speaker) => {
    setSelectedSpeaker(speaker);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSpeaker(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <main className="pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-primary font-bold text-xs uppercase tracking-wider bg-primary-50 px-3.5 py-1.5 rounded-full border border-primary-100 mb-3 inline-block">
              Distinguished Faculty
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Conference Speakers
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              Meet seasoned pastors, business executives, tech leaders, and innovators bringing high-impact insights to BISUM 2025.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-xs border border-slate-200/80 mb-12 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={\`px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer \${
                    selectedCategory === cat.id
                      ? "bg-primary text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }\`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search speaker by name or organization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Speakers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSpeakers.map((speaker) => (
              <SpeakerCard
                key={speaker.id}
                speaker={speaker}
                onLearnMore={() => handleOpenModal(speaker)}
              />
            ))}
          </div>

          {filteredSpeakers.length === 0 && (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80">
              <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-bold text-slate-900">No speakers found</h3>
              <p className="text-sm text-slate-500 mt-1">Try another category or clear your search term.</p>
            </div>
          )}
        </div>
      </main>

      <SpeakerModal
        speaker={selectedSpeaker}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      <Footer />
    </div>
  );
}
`;
fs.writeFileSync("D:/bisum/src/app/speakers/page.js", speakersPageCode, "utf8");

// 3. merchandise/page.js
const merchPageCode = `"use client";

import Link from "next/link";
import { Navigation, Footer } from "@/components";
import { merchandiseItems } from "@/data/merchandiseData";
import { ShoppingBag, ArrowRight } from "lucide-react";

export default function MerchandisePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <main className="pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-primary font-bold text-xs uppercase tracking-wider bg-primary-50 px-3.5 py-1.5 rounded-full border border-primary-100 mb-3 inline-block">
              Official Store
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Conference Apparel
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              Order official BISUM Conference branded tees, custom hoodies, caps, and souvenirs.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {merchandiseItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                <div className="relative h-72 bg-slate-100 overflow-hidden">
                  <img
                    src={item.colors?.[0]?.image || item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-4 right-4 bg-slate-900 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-xs">
                    {item.price}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1.5">
                      {item.name}
                    </h3>
                    <p className="text-slate-600 text-xs leading-relaxed mb-4 line-clamp-3">
                      {item.description}
                    </p>
                    <div className="flex items-center space-x-2 mb-6">
                      <span className="text-xs font-semibold text-slate-500">Colors:</span>
                      <div className="flex space-x-1.5">
                        {item.colors?.map((c, i) => (
                          <span
                            key={i}
                            className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs inline-block"
                            style={{ backgroundColor: c.name.toLowerCase() }}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={\`/merchandisedetails/\${item.id}\`}
                    className="flex items-center justify-center space-x-2 w-full bg-primary hover:bg-primary-hover text-white font-bold text-xs py-3.5 px-4 rounded-xl transition-colors shadow-xs"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Select Size & Purchase</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
`;
fs.writeFileSync("D:/bisum/src/app/merchandise/page.js", merchPageCode, "utf8");

console.log("Public pages updated");
