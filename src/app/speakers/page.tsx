"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navigation, SpeakerCard, SpeakerModal, Footer } from "../../components";
import { speakersData, speakerCategories, filterAndSearchSpeakers } from "../../data/speakersData";
import { Speaker } from "../../types";
import { Users, Globe, Search, ArrowRight } from "lucide-react";
import { SPEAKERS_PAGE_CONTENT } from "../../data/REUSEABLE";

export default function SpeakersPage() {
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSpeakers = filterAndSearchSpeakers(filterCategory, searchTerm);

  const handleSpeakerClick = (speaker: Speaker) => {
    setSelectedSpeaker(speaker);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      {/* Page Header */}
      <section className="relative text-white py-24 pt-36 overflow-hidden bg-slate-950">
        <Image
          src="/section_banner.webp"
          alt="Speakers Banner"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-slate-950/65" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight text-white">
              {SPEAKERS_PAGE_CONTENT.bannerTitle}
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 font-normal leading-relaxed">
              {SPEAKERS_PAGE_CONTENT.bannerSubtitle}
            </p>
            <div className="inline-flex flex-col sm:flex-row bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:px-6 items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm font-medium">
              <div className="flex items-center space-x-2 text-slate-300">
                <Users className="w-4 h-4 text-blue-400" />
                <span>{SPEAKERS_PAGE_CONTENT.badge1}</span>
              </div>
              <div className="hidden sm:block text-slate-700">|</div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Globe className="w-4 h-4 text-blue-400" />
                <span>{SPEAKERS_PAGE_CONTENT.badge2}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Speakers Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter and Search Controls */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-4">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {speakerCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                    filterCategory === category
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {category === "all"
                    ? SPEAKERS_PAGE_CONTENT.allCategoryLabel
                    : category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative w-full lg:w-80">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder={SPEAKERS_PAGE_CONTENT.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider">
              {SPEAKERS_PAGE_CONTENT.showingResultsPrefix} {filteredSpeakers.length} {SPEAKERS_PAGE_CONTENT.showingResultsOf} {speakersData.length} {SPEAKERS_PAGE_CONTENT.showingResultsSuffix}
              {searchTerm && ` for "${searchTerm}"`}
            </p>
          </div>

          {/* Speakers Grid */}
          {filteredSpeakers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {SPEAKERS_PAGE_CONTENT.emptyStateTitle}
              </h3>
              <p className="text-slate-600 mb-6 text-sm">
                {SPEAKERS_PAGE_CONTENT.emptyStateDescription}
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterCategory("all");
                }}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm"
              >
                {SPEAKERS_PAGE_CONTENT.emptyStateButtonText}
              </button>
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-20 bg-slate-900 rounded-3xl p-8 md:p-12 text-center text-white border border-slate-800">
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-3 tracking-tight">
              {SPEAKERS_PAGE_CONTENT.ctaTitle}
            </h2>
            <p className="text-base text-slate-300 mb-8 max-w-2xl mx-auto font-normal">
              {SPEAKERS_PAGE_CONTENT.ctaSubtitle}
            </p>
            <Link
              href={SPEAKERS_PAGE_CONTENT.ctaButtonHref}
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl text-base font-bold transition-colors"
            >
              <span>{SPEAKERS_PAGE_CONTENT.ctaButtonText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <SpeakerModal
        speaker={selectedSpeaker}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSpeaker(null);
        }}
      />

      <Footer />
    </div>
  );
}
