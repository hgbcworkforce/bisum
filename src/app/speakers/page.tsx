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

  const activeCategoryLabel =
    filterCategory === "all"
      ? SPEAKERS_PAGE_CONTENT.allCategoryLabel
      : filterCategory.charAt(0).toUpperCase() + filterCategory.slice(1);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="flex flex-wrap gap-2">
              {speakerCategories.map((category) => {
                const isActive = filterCategory === category;
                const label = category === "all" ? SPEAKERS_PAGE_CONTENT.allCategoryLabel : category.charAt(0).toUpperCase() + category.slice(1);

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setFilterCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={SPEAKERS_PAGE_CONTENT.searchPlaceholder}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        <div className="mb-8 flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-slate-600">
            {SPEAKERS_PAGE_CONTENT.showingResultsPrefix} <span className="font-semibold text-slate-900">{filteredSpeakers.length}</span> {SPEAKERS_PAGE_CONTENT.showingResultsOf} <span className="font-semibold text-slate-900">{speakersData.length}</span> {SPEAKERS_PAGE_CONTENT.showingResultsSuffix} · <span className="font-medium text-blue-600">{activeCategoryLabel}</span>
          </p>
        </div>

        {filteredSpeakers.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{SPEAKERS_PAGE_CONTENT.emptyStateTitle}</h3>
            <p className="text-slate-600 mb-6">{SPEAKERS_PAGE_CONTENT.emptyStateDescription}</p>
            <button
              type="button"
              onClick={() => {
                setFilterCategory("all");
                setSearchTerm("");
              }}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              {SPEAKERS_PAGE_CONTENT.emptyStateButtonText}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredSpeakers.map((speaker) => (
              <SpeakerCard
                key={speaker.id}
                speaker={speaker}
                onSpeakerClick={handleSpeakerClick}
              />
            ))}
          </div>
        )}

        <div className="mt-16 rounded-3xl bg-slate-950 px-6 py-10 text-white shadow-sm sm:px-8 lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300 mb-3">{SPEAKERS_PAGE_CONTENT.ctaTitle}</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-white">{SPEAKERS_PAGE_CONTENT.ctaTitle}</h2>
              <p className="mt-3 max-w-2xl text-slate-300">{SPEAKERS_PAGE_CONTENT.ctaSubtitle}</p>
            </div>

            <Link
              href={SPEAKERS_PAGE_CONTENT.ctaButtonHref}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              <span>{SPEAKERS_PAGE_CONTENT.ctaButtonText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

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
