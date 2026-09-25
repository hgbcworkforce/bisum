"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { LinkedInIcon, TwitterIcon, InstagramIcon, FacebookIcon } from "./SocialIcons";
import { Speaker } from "../types";

interface SpeakerModalProps {
  speaker: Speaker | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SpeakerModal({ speaker, isOpen, onClose }: SpeakerModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !speaker) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-3xl bg-white text-left border border-slate-200 transition-all sm:my-8 sm:w-full sm:max-w-3xl max-h-[90vh] flex flex-col">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header - Solid Slate 900 */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 border-b border-slate-800">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Speaker Avatar */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-slate-700 flex-shrink-0 bg-slate-800">
                <Image
                  src={speaker.image}
                  alt={speaker.name}
                  fill
                  sizes="112px"
                  className="object-cover object-top"
                />
              </div>

              {/* Speaker Details */}
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-2xl sm:text-3xl font-extrabold mb-1 tracking-tight">
                  {speaker.name}
                </h2>
                <p className="text-blue-400 font-semibold text-base mb-1">
                  {speaker.title}
                </p>
                {speaker.company && (
                  <p className="text-slate-400 text-sm mb-3">{speaker.company}</p>
                )}

                {/* Social Links */}
                {speaker.social && (
                  <div className="flex justify-center sm:justify-start space-x-2.5 mt-2">
                    {speaker.social.linkedin && (
                      <a
                        href={speaker.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-lg transition-colors"
                        aria-label="LinkedIn"
                      >
                        <LinkedInIcon className="w-4 h-4" />
                      </a>
                    )}
                    {speaker.social.twitter && (
                      <a
                        href={speaker.social.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-lg transition-colors"
                        aria-label="Twitter"
                      >
                        <TwitterIcon className="w-4 h-4" />
                      </a>
                    )}
                    {speaker.social.instagram && (
                      <a
                        href={speaker.social.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-lg transition-colors"
                        aria-label="Instagram"
                      >
                        <InstagramIcon className="w-4 h-4" />
                      </a>
                    )}
                    {speaker.social.facebook && (
                      <a
                        href={speaker.social.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-lg transition-colors"
                        aria-label="Facebook"
                      >
                        <FacebookIcon className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Bio & Topics */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-3 border-b border-slate-200 pb-2">
                    About {speaker.name}
                  </h3>
                  <div className="text-slate-600 leading-relaxed space-y-3 text-sm">
                    {speaker.bio.split("\n").map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>

                {/* Expertise */}
                {speaker.expertise && speaker.expertise.length > 0 && (
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-3 border-b border-slate-200 pb-2">
                      Areas of Expertise
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {speaker.expertise.map((exp, i) => (
                        <span
                          key={i}
                          className="bg-blue-50 text-blue-700 border border-blue-200/70 text-xs px-2.5 py-1 rounded-md font-medium"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quote */}
                {speaker.quote && (
                  <div className="bg-slate-50 border-l-4 border-blue-600 p-4 rounded-r-xl">
                    <p className="italic text-slate-800 text-sm">"{speaker.quote}"</p>
                    <p className="text-xs text-slate-500 mt-2 font-semibold">— {speaker.name}</p>
                  </div>
                )}
              </div>

              {/* Right Column: Experience & Achievements */}
              <div className="space-y-6">
                {speaker.experience && (
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-3 border-b border-slate-200 pb-2">
                      Professional Background
                    </h3>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-sm text-slate-700 leading-relaxed">
                      {speaker.experience}
                    </div>
                  </div>
                )}

                {speaker.achievements && speaker.achievements.length > 0 && (
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-3 border-b border-slate-200 pb-2">
                      Key Highlights & Achievements
                    </h3>
                    <ul className="space-y-2.5 text-sm text-slate-700">
                      {speaker.achievements.map((item, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="text-blue-600 font-bold mt-0.5">•</span>
                          <span className="text-slate-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
            <button
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-5 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
