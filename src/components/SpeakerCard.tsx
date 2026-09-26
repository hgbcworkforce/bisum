"use client";

import React, { useState } from "react";
import Image from "next/image";
import { User, ArrowRight } from "lucide-react";
import { LinkedInIcon, TwitterIcon, InstagramIcon, FacebookIcon } from "./SocialIcons";
import { Speaker } from "../types";

interface SpeakerCardProps {
  speaker: Speaker;
  onSpeakerClick: (speaker: Speaker) => void;
}

export default function SpeakerCard({ speaker, onSpeakerClick }: SpeakerCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-blue-500 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col h-full"
      onClick={() => onSpeakerClick(speaker)}
    >
      {/* Speaker Image */}
      <div className="relative overflow-hidden w-full h-[360px] bg-slate-100">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
            <div className="animate-pulse w-12 h-12 bg-slate-200 rounded-full" />
          </div>
        )}

        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-white">
            <div className="text-center">
              <User className="w-12 h-12 mx-auto mb-2 text-slate-400" />
              <div className="text-lg font-bold text-slate-200">
                {speaker.name.split(" ").map((n) => n[0]).join("")}
              </div>
            </div>
          </div>
        ) : (
          <Image
            src={speaker.image}
            alt={speaker.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover object-top transition-transform duration-300 group-hover:scale-105 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />
        )}
      </div>

      {/* Speaker Info */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
            {speaker.name}
          </h3>

          <p className="text-blue-600 font-semibold mb-2 text-sm leading-snug">
            {speaker.title}
          </p>

          {speaker.company && (
            <p className="text-slate-500 text-xs font-medium mb-3">
              {speaker.company}
            </p>
          )}

          <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-4 font-normal">
            {speaker.bio}
          </p>

          {/* Topics/Expertise Tags */}
          {speaker.expertise && speaker.expertise.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {speaker.expertise.slice(0, 3).map((topic, index) => (
                <span
                  key={index}
                  className="inline-block bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200/60"
                >
                  {topic}
                </span>
              ))}
              {speaker.expertise.length > 3 && (
                <span className="inline-block bg-slate-100 text-slate-500 px-2 py-1 rounded-md text-xs">
                  +{speaker.expertise.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Social Links & View Profile */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
          <div className="flex space-x-3">
            {speaker.social?.linkedin && (
              <a
                href={speaker.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-blue-600 transition-colors"
                onClick={(e) => e.stopPropagation()}
                aria-label="LinkedIn"
              >
                <LinkedInIcon className="w-4 h-4" />
              </a>
            )}
            {speaker.social?.twitter && (
              <a
                href={speaker.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-blue-500 transition-colors"
                onClick={(e) => e.stopPropagation()}
                aria-label="Twitter"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
            )}
            {speaker.social?.instagram && (
              <a
                href={speaker.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-pink-600 transition-colors"
                onClick={(e) => e.stopPropagation()}
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
            )}
            {speaker.social?.facebook && (
              <a
                href={speaker.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-blue-700 transition-colors"
                onClick={(e) => e.stopPropagation()}
                aria-label="Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
            )}
          </div>

          <span className="text-xs font-bold text-blue-600 group-hover:underline inline-flex items-center space-x-1">
            <span>View Bio</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
