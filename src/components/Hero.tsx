"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import CountdownTimer from "./CountdownTimer";
import { HERO_CONTENT } from "./REUSEABLE";
import { Calendar, MapPin, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export default function Hero() {
  const conferenceDate = new Date(HERO_CONTENT.targetDate).getTime();
  const slides = HERO_CONTENT.slides && HERO_CONTENT.slides.length > 0
    ? HERO_CONTENT.slides
    : [
      { src: "/slides/slide-1.webp", alt: "BISUM Conference Slide 1" },
      { src: "/slides/slide-2.webp", alt: "BISUM Conference Slide 2" },
      { src: "/slides/slide-3.webp", alt: "BISUM Conference Slide 3" },
      { src: "/slides/slide-4.webp", alt: "BISUM Conference Slide 4" },
    ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, [slides.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto slide transition effect
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      goToNext();
    }, 5500);

    return () => clearInterval(timer);
  }, [goToNext, isPaused, currentIndex]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      goToNext();
    } else if (distance < -minSwipeDistance) {
      goToPrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center text-white text-center pt-28 pb-20 overflow-hidden bg-slate-950 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Slides Slider with Smooth Crossfade & Ken Burns Zoom */}
      <div className="absolute inset-0 overflow-hidden">
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide.src}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? "opacity-100 z-1" : "opacity-0 z-0 pointer-events-none"
                }`}
            >
              <div
                className={`relative w-full h-full transition-transform duration-[6500ms] ease-out ${isActive ? "scale-105" : "scale-100"
                  }`}
              >
                <Image
                  src={slide.src}
                  alt={slide.alt || `BISUM Conference Slide ${index + 1}`}
                  fill
                  priority={index === 0}
                  className="object-cover object-center"
                  sizes="100vw"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Dark Multi-Layer Gradient Overlays for Readability & Cinematic Contrast */}
      <div className="absolute inset-0 bg-slate-950/10 z-[2]" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 z-[2]" />
      <div className="absolute inset-0 bg-radial from-transparent via-slate-950/20 to-slate-950/30 z-[2]" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight tracking-tight text-white drop-shadow-sm">
          {HERO_CONTENT.titlePrefix}{" "}
          <span className="text-blue-500">{HERO_CONTENT.highlightYear}</span>
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg lg:text-xl text-slate-200 mb-8 max-w-3xl mx-auto font-normal leading-relaxed drop-shadow-sm">
          {HERO_CONTENT.description}
        </p>

        {/* Conference Date & Location Info Box */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 bg-slate-900/90 backdrop-blur-md border border-slate-800/80 shadow-2xl rounded-2xl px-6 py-4 mb-8 text-sm">
          <div className="flex items-center space-x-2.5 text-slate-200">
            <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span className="font-semibold">{HERO_CONTENT.dates}</span>
          </div>
          <div className="hidden sm:block text-slate-700">|</div>
          <div className="flex items-center space-x-2.5 text-slate-300 text-center sm:text-left">
            <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span>{HERO_CONTENT.location}</span>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="mb-10 w-full max-w-2xl">
          <CountdownTimer targetDate={conferenceDate} />
        </div>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={HERO_CONTENT.ctaHref}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl text-base font-bold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all active:scale-[0.98]"
          >
            <span>{HERO_CONTENT.ctaText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/schedule"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-slate-800/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 backdrop-blur-sm px-7 py-3.5 rounded-xl text-base font-semibold shadow-lg hover:border-slate-600 transition-all active:scale-[0.98]"
          >
            <span>View Schedule</span>
          </Link>
        </div>
      </div>

      {/* Interactive Slide Indicator Dots / Pills */}
      {/* <div className="absolute bottom-6 z-20 flex items-center justify-center space-x-2.5">
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <button
              key={slide.src}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${isActive
                ? "w-8 bg-blue-500 shadow-md shadow-blue-500/50"
                : "w-2 bg-white/40 hover:bg-white/75"
                }`}
            />
          );
        })}
      </div> */}
    </section>
  );
}

