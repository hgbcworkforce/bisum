"use client";

import React, { useState } from "react";
import Link from "next/link";
import SpeakerCard from "./SpeakerCard";
import SpeakerModal from "./SpeakerModal";
import { speakersData } from "../data/speakersData";
import { Speaker } from "../types";
import { SPEAKERS_SECTION_CONTENT } from "./REUSEABLE";
import { Users, ArrowRight } from "lucide-react";

export default function SpeakersSection() {
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const featuredSpeakers = speakersData.slice(0, 3);

  const handleSpeakerClick = (speaker: Speaker) => {
    setSelectedSpeaker(speaker);
    setIsModalOpen(true);
  };

  return (
    <section id={SPEAKERS_SECTION_CONTENT.sectionId} className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-full text-blue-700 text-xs font-semibold uppercase tracking-wider mb-4">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>{SPEAKERS_SECTION_CONTENT.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            {SPEAKERS_SECTION_CONTENT.title}
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            {SPEAKERS_SECTION_CONTENT.subtitle}
          </p>
        </div>

        {/* Speakers Grid - 3 Keynote Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredSpeakers.map((speaker) => (
            <SpeakerCard
              key={speaker.id}
              speaker={speaker}
              onSpeakerClick={handleSpeakerClick}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href={SPEAKERS_SECTION_CONTENT.ctaHref}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl transition-colors"
          >
            <span>{SPEAKERS_SECTION_CONTENT.ctaText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Speaker Modal */}
      <SpeakerModal
        speaker={selectedSpeaker}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSpeaker(null);
        }}
      />
    </section>
  );
}
