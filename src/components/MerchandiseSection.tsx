"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { merchandiseItems } from "../data/merchandiseData";
import { MerchandiseItem } from "../types";
import { MERCHANDISE_SECTION_CONTENT } from "./REUSEABLE";
import { ShoppingBag, ArrowRight } from "lucide-react";

function MerchandiseCard({ item }: { item: MerchandiseItem }) {
  const [currentImage, setCurrentImage] = useState(item.colors[0].image);
  const [colorIndex, setColorIndex] = useState(0);

  const handleMouseEnter = () => {
    setColorIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % item.colors.length;
      setCurrentImage(item.colors[nextIndex].image);
      return nextIndex;
    });
  };

  const handleMouseLeave = () => {
    setCurrentImage(item.colors[0].image);
    setColorIndex(0);
  };

  return (
    <div
      className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-500 overflow-hidden transition-all duration-200 flex flex-col"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="w-full h-80 bg-slate-100 overflow-hidden relative">
        <Image
          src={currentImage}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-xl font-bold text-slate-900">{item.name}</h3>
            <span className="text-xl font-extrabold text-blue-600">{item.price}</span>
          </div>

          <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          <div className="flex items-center justify-between gap-2 mb-6">
            <span className="bg-red-50 text-red-700 border border-red-200/80 rounded-full px-3 py-1 text-xs font-semibold">
              {MERCHANDISE_SECTION_CONTENT.orderClosesPrefix} {item.timeFrame.split(" ")[0]} {item.timeFrame.split(" ")[1]}
            </span>
            <span className="text-xs text-slate-400">
              {item.colors.length} {item.colors.length > 1 ? "colors" : "color"}
            </span>
          </div>
        </div>

        <Link
          href={`/merchandisedetails/${item.id}`}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors block text-center text-sm"
        >
          {MERCHANDISE_SECTION_CONTENT.orderNowText}
        </Link>
      </div>
    </div>
  );
}

export default function MerchandiseSection() {
  return (
    <section id={MERCHANDISE_SECTION_CONTENT.sectionId} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-full text-blue-700 text-xs font-semibold uppercase tracking-wider mb-4">
            <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
            <span>{MERCHANDISE_SECTION_CONTENT.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            {MERCHANDISE_SECTION_CONTENT.title}
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            {MERCHANDISE_SECTION_CONTENT.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {merchandiseItems.map((item) => (
            <MerchandiseCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
