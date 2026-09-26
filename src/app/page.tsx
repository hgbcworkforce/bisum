"use client";

import React from "react";
import {
  Navigation,
  Hero,
  AboutSection,
  SpeakersSection,
  ScheduleSection,
  MerchandiseSection,
  Footer,
} from "../components";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main>
        <Hero />
        <AboutSection />
        <SpeakersSection />
        <ScheduleSection />
        <MerchandiseSection />
      </main>
      <Footer />
    </div>
  );
}
