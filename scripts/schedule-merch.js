const fs = require("fs");

const scheduleListCode = `"use client";

import { useState } from "react";
import ScheduleItem from "./ScheduleItem";

export default function ScheduleList({ sessions = [] }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {sessions.map((session, index) => (
        <ScheduleItem
          key={session.id || index}
          session={session}
          isExpanded={expandedId === (session.id || index)}
          onToggle={() => toggleExpand(session.id || index)}
        />
      ))}
    </div>
  );
}
`;
fs.writeFileSync("D:/bisum/src/components/ScheduleList.jsx", scheduleListCode, "utf8");

const scheduleItemCode = `"use client";

import { Clock, MapPin, User, ChevronDown, ChevronUp } from "lucide-react";

export default function ScheduleItem({ session, isExpanded, onToggle }) {
  const typeStyles = {
    registration: "bg-slate-100 text-slate-700 border-slate-200",
    worship: "bg-purple-50 text-purple-700 border-purple-200",
    keynote: "bg-primary-50 text-primary border-primary-200",
    breakout: "bg-amber-50 text-amber-700 border-amber-200",
    panel: "bg-emerald-50 text-emerald-700 border-emerald-200",
    welcome: "bg-blue-50 text-blue-700 border-blue-200",
  };

  const badgeClass =
    typeStyles[session.type?.toLowerCase()] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-primary/40 hover:shadow-sm transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Timing & Title */}
        <div className="flex items-start space-x-4">
          <div className="w-24 flex-shrink-0 flex flex-col items-center justify-center p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
            <Clock className="w-3.5 h-3.5 text-primary mb-1" />
            <span className="text-xs font-extrabold text-slate-900">{session.time}</span>
            {session.endTime && (
              <span className="text-[10px] font-semibold text-slate-500">to {session.endTime}</span>
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className={\`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border \${badgeClass}\`}>
                {session.type || "Session"}
              </span>
              <span className="text-xs font-semibold text-slate-400">{session.day}</span>
            </div>
            <h4 className="text-base sm:text-lg font-extrabold text-slate-900">
              {session.title}
            </h4>
            {session.venue && (
              <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{session.venue}</span>
              </div>
            )}
          </div>
        </div>

        {/* Speaker preview & toggle */}
        <div className="flex items-center justify-between sm:justify-end space-x-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          {session.speaker && (
            <div className="flex items-center space-x-2.5">
              {session.speaker.avatar ? (
                <img
                  src={session.speaker.avatar}
                  alt={session.speaker.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center text-primary font-bold text-xs border border-primary-100">
                  <User className="w-4 h-4" />
                </div>
              )}
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900">{session.speaker.name}</p>
                <p className="text-[10px] text-slate-500 font-medium truncate max-w-[150px]">
                  {session.speaker.title}
                </p>
              </div>
            </div>
          )}

          {session.description && (
            <button
              onClick={onToggle}
              className="p-2 text-slate-400 hover:text-primary rounded-lg transition-colors cursor-pointer"
              title="Session details"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {isExpanded && session.description && (
        <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl">
          {session.description}
        </div>
      )}
    </div>
  );
}
`;
fs.writeFileSync("D:/bisum/src/components/ScheduleItem.jsx", scheduleItemCode, "utf8");

const merchCode = `"use client";

import Link from "next/link";
import { merchandiseItems } from "../data/merchandiseData";
import { ShoppingBag, ArrowRight } from "lucide-react";

export default function MerchandiseSection() {
  return (
    <section id="merchandise" className="py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <span className="text-primary font-bold text-xs uppercase tracking-wider bg-primary-50 px-3.5 py-1.5 rounded-full border border-primary-100">
              Official Store
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
              Conference Apparel & Souvenirs
            </h2>
            <p className="text-base text-slate-600 mt-2 max-w-xl">
              Equip yourself with premium BISUM branded tees, caps, and custom hoodies.
            </p>
          </div>

          <Link
            href="/merchandise"
            className="inline-flex items-center space-x-2 text-sm font-bold text-primary hover:text-primary-hover mt-4 md:mt-0"
          >
            <span>Browse Complete Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {merchandiseItems.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group"
            >
              <div className="relative h-64 bg-slate-100 overflow-hidden">
                <img
                  src={item.colors?.[0]?.image || item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 right-4 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xs">
                  {item.price}
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1.5">
                    {item.name}
                  </h3>
                  <p className="text-slate-600 text-xs mb-4 line-clamp-2">
                    {item.description}
                  </p>
                </div>
                <Link
                  href={\`/merchandisedetails/\${item.id}\`}
                  className="inline-flex items-center justify-center space-x-2 w-full bg-primary hover:bg-primary-hover text-white font-bold text-xs py-3 px-4 rounded-xl transition-colors shadow-xs"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Configure & Purchase</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
fs.writeFileSync("D:/bisum/src/components/MerchandiseSection.jsx", merchCode, "utf8");

const footerCode = `"use client";

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { FacebookIcon, InstagramIcon, LinkedinIcon } from "./SocialIcons";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white pt-16 pb-10 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <img
                  src="https://media.hgbcinfluencers.org/bisum/BISUM logo.png"
                  alt="BISUM Logo"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">BISUM</span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Empowering Christian leaders, entrepreneurs, and students to excel in business, technology, and global kingdom impact.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Navigation</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">Home Overview</Link>
              </li>
              <li>
                <Link href="/schedule" className="hover:text-primary transition-colors">Event Timetable</Link>
              </li>
              <li>
                <Link href="/speakers" className="hover:text-primary transition-colors">Speaker Faculty</Link>
              </li>
              <li>
                <Link href="/merchandise" className="hover:text-primary transition-colors">Conference Apparel</Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-primary transition-colors">Seat Registration</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Contact Venue</h4>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-400">
              <li className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Higher Ground Baptist Church, Ogbomoso, Oyo State, Nigeria.</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span>info@bisum.hgbcinfluencers.org</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span>+234 (0) 800-BISUM-CONF</span>
              </li>
            </ul>
          </div>

          {/* Social & Admin */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Social Community</h4>
            <div className="flex space-x-3 mb-6">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-slate-900 hover:bg-primary text-slate-400 hover:text-white rounded-full border border-slate-800 transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-slate-900 hover:bg-primary text-slate-400 hover:text-white rounded-full border border-slate-800 transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-slate-900 hover:bg-primary text-slate-400 hover:text-white rounded-full border border-slate-800 transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
            </div>
            <Link
              href="/admin/signin"
              className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg transition-colors"
            >
              Admin Management Portal
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>? {new Date().getFullYear()} BISUM Conference. All rights reserved. Higher Ground Baptist Church.</p>
          <div className="flex space-x-6 text-slate-500">
            <span>Faith & Marketplace Excellence</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
`;
fs.writeFileSync("D:/bisum/src/components/Footer.jsx", footerCode, "utf8");

console.log("Schedule, Merch, and Footer updated");
