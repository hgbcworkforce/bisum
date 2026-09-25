const fs = require("fs");

const aboutCode = `"use client";

import { Lightbulb, TrendingUp, Cpu, Sparkles, Compass } from "lucide-react";

export default function AboutSection() {
  const pillars = [
    {
      icon: <Lightbulb className="w-6 h-6 text-primary" />,
      title: "Spiritual & Leadership Maturity",
      description:
        "Rooted in sound biblical principles, equipping Christian leaders to govern their spheres of influence without breaking rank.",
    },
    {
      icon: <Cpu className="w-6 h-6 text-primary" />,
      title: "Technology & AI Innovation",
      description:
        "Demystifying modern tech paradigms, software engineering, and AI tools to build scalable solutions for community and enterprise.",
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-primary" />,
      title: "Wealth Creation & Investment",
      description:
        "Actionable financial literacy, investment strategies, and agribusiness opportunities taught by proven industry leaders.",
    },
    {
      icon: <Compass className="w-6 h-6 text-primary" />,
      title: "Enterprise & Global Relevance",
      description:
        "Building sustainable organizations, creating jobs, and mastering creative industry tracks including fashion and culinary arts.",
    },
  ];

  const stats = [
    { label: "Days of Immersion", value: "3" },
    { label: "Distinguished Speakers", value: "15+" },
    { label: "Specialized Tracks", value: "5" },
    { label: "Delegates & Leaders", value: "1,000+" },
  ];

  return (
    <section className="py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center space-x-2 text-primary font-bold text-xs uppercase tracking-wider bg-primary-50 px-3.5 py-1.5 rounded-full border border-primary-100 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Conference Vision & Mandate</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            A Gathering of Purpose, Wisdom, and Global Enterprise.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            The Business & Investment Summit (BISUM) is an annual catalyst organized by Higher Ground Baptist Church. We bridge the sacred divide between godly devotion and marketplace excellence.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="p-8 bg-slate-50 rounded-3xl border border-slate-200/70 hover:border-primary/50 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-6 shadow-xs">
                  {pillar.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {pillar.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Row */}
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
            {stats.map((stat, i) => (
              <div key={i} className={i > 0 ? "pt-6 lg:pt-0" : ""}>
                <div className="text-4xl sm:text-5xl font-black text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
`;
fs.writeFileSync("D:/bisum/src/components/AboutSection.jsx", aboutCode, "utf8");

const speakerCardCode = `"use client";

import { ArrowUpRight } from "lucide-react";
import { FacebookIcon as Facebook, TwitterIcon as Twitter, InstagramIcon as Instagram, LinkedinIcon as Linkedin } from "./SocialIcons";

export default function SpeakerCard({ speaker, onLearnMore }) {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group">
      {/* Speaker Image */}
      <div className="relative h-72 bg-slate-100 overflow-hidden">
        <img
          src={speaker.image}
          alt={speaker.name}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />
        {/* Category Pill Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-slate-900/90 text-white text-xs font-bold px-3.5 py-1.5 rounded-full border border-slate-700 capitalize shadow-xs">
            {Array.isArray(speaker.category) ? speaker.category[0] : speaker.category}
          </span>
        </div>
      </div>

      {/* Speaker Info */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-primary transition-colors">
            {speaker.name}
          </h3>
          <p className="text-xs font-bold text-primary mt-1 mb-2">
            {speaker.title}
          </p>
          <p className="text-xs text-slate-500 font-semibold mb-4">
            {speaker.company}
          </p>
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-6">
            {speaker.experience || speaker.bio}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {/* Social Links */}
          <div className="flex items-center space-x-2 text-slate-400">
            {speaker.social?.linkedin && (
              <a
                href={speaker.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors p-1"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {speaker.social?.instagram && (
              <a
                href={speaker.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors p-1"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {speaker.social?.facebook && (
              <a
                href={speaker.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors p-1"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            )}
          </div>

          <button
            onClick={onLearnMore}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-primary hover:text-primary-hover bg-primary-50 hover:bg-primary-100 px-3.5 py-2 rounded-full transition-colors cursor-pointer"
          >
            <span>View Profile</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync("D:/bisum/src/components/SpeakerCard.jsx", speakerCardCode, "utf8");

const speakerModalCode = `"use client";

import { useEffect } from "react";
import { X, Quote, CheckCircle2 } from "lucide-react";
import { FacebookIcon, InstagramIcon, LinkedinIcon } from "./SocialIcons";

export default function SpeakerModal({ speaker, isOpen, onClose }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !speaker) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto z-10 border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {/* Left Column: Portrait & Social */}
          <div className="bg-slate-50 p-8 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between items-center text-center">
            <div className="w-full">
              <div className="w-40 h-40 sm:w-48 sm:h-48 mx-auto rounded-3xl overflow-hidden shadow-md border-4 border-white mb-6">
                <img
                  src={speaker.image}
                  alt={speaker.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-1">{speaker.name}</h3>
              <p className="text-xs font-bold text-primary mb-2">{speaker.title}</p>
              <p className="text-xs text-slate-500 font-semibold">{speaker.company}</p>
            </div>

            {/* Social Links */}
            <div className="flex space-x-3 mt-6 pt-6 border-t border-slate-200 w-full justify-center">
              {speaker.social?.linkedin && (
                <a
                  href={speaker.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white text-slate-600 hover:text-primary hover:bg-primary-50 rounded-full border border-slate-200 shadow-xs transition-colors"
                >
                  <LinkedinIcon className="w-4 h-4" />
                </a>
              )}
              {speaker.social?.instagram && (
                <a
                  href={speaker.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white text-slate-600 hover:text-primary hover:bg-primary-50 rounded-full border border-slate-200 shadow-xs transition-colors"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
              {speaker.social?.facebook && (
                <a
                  href={speaker.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white text-slate-600 hover:text-primary hover:bg-primary-50 rounded-full border border-slate-200 shadow-xs transition-colors"
                >
                  <FacebookIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Right Column: Biography & Highlights */}
          <div className="p-8 md:col-span-2 space-y-6">
            {speaker.quote && (
              <div className="bg-primary-50 p-5 rounded-2xl border border-primary-100 flex items-start space-x-3">
                <Quote className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm font-medium italic text-slate-700 leading-relaxed">
                  "{speaker.quote}"
                </p>
              </div>
            )}

            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Biography</h4>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {speaker.bio}
              </p>
            </div>

            {speaker.expertise && (
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Core Expertise</h4>
                <div className="flex flex-wrap gap-2">
                  {speaker.expertise.map((exp, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200"
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {speaker.achievements && (
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Key Highlights</h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  {speaker.achievements.map((ach, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-accent-green flex-shrink-0 mt-0.5" />
                      <span>{ach}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync("D:/bisum/src/components/SpeakerModal.jsx", speakerModalCode, "utf8");

console.log("About and Speakers components updated");
