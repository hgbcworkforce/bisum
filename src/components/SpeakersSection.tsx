"use client";

import React, { useState } from "react";
import Link from "next/link";
// SpeakerCard, SpeakerModal, and speakersData commented out until speakers are confirmed
// import SpeakerCard from "./SpeakerCard";
// import SpeakerModal from "./SpeakerModal";
// import { speakersData } from "../data/speakersData";
// import { Speaker } from "../types";
import { SPEAKERS_SECTION_CONTENT } from "./REUSEABLE";
import { Users, Sparkles, ArrowRight } from "lucide-react";

export default function SpeakersSection() {
  // State preserved for when speaker data is confirmed:
  // const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const featuredSpeakers = speakersData.slice(0, 3);

  return (
    <section id={SPEAKERS_SECTION_CONTENT.sectionId} className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-full text-blue-700 text-xs font-semibold uppercase tracking-wider mb-4">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>{SPEAKERS_SECTION_CONTENT.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            {SPEAKERS_SECTION_CONTENT.title}
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Speaker details are currently being finalized. Stay tuned for our distinguished lineup!
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 mb-6 shadow-inner">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 animate-pulse" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200/80 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Coming Soon...</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
              Speaker Lineup Announcing Soon
            </h3>
            <p className="text-slate-600 max-w-lg mx-auto text-sm sm:text-base leading-relaxed mb-8">
              We are assembling an inspiring roster of keynote ministers, industry trailblazers, and seasoned entrepreneurs for BISUM 2026. The full speaker lineup will be unveiled shortly!
            </p>

            <Link
              href="/register"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl text-sm transition-colors shadow-sm active:scale-[0.98]"
            >
              <span>Register for the Summit</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 
        ========================================================================
        Speakers Grid & Modal - Commented out until speaker details are finalized
        ========================================================================
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredSpeakers.map((speaker) => (
            <SpeakerCard
              key={speaker.id}
              speaker={speaker}
              onSpeakerClick={handleSpeakerClick}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href={SPEAKERS_SECTION_CONTENT.ctaHref}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl transition-colors"
          >
            <span>{SPEAKERS_SECTION_CONTENT.ctaText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <SpeakerModal
          speaker={selectedSpeaker}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSpeaker(null);
          }}
        />
        */}
      </div>
    </section>
  );
}
