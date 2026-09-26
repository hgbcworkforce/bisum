"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { NAVIGATION_CONTENT } from "./REUSEABLE";

interface NavigationProps {
  onNavigate?: (sectionId: string) => void;
}

export default function Navigation({ onNavigate }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = NAVIGATION_CONTENT.navItems;

  const handleSectionClick = (e: React.MouseEvent, sectionId: string) => {
    if (pathname === "/") {
      e.preventDefault();
      const elem = document.getElementById(sectionId);
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth" });
      }
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200/90 transition-all duration-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-3 group">
              <Image
                src="/BISUM logo.webp"
                alt={NAVIGATION_CONTENT.logoAlt}
                width={140}
                height={42}
                priority
                className="h-10 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const isActive = item.isRoute && pathname === item.href;

              if (item.isCTA) {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="ml-3 inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
                  >
                    {item.label}
                  </Link>
                );
              }

              if (item.isSection) {
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={(e) => handleSectionClick(e, item.id)}
                    className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 rounded-md transition-colors"
                  >
                    {item.label}
                  </a>
                );
              }

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`px-3.5 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "text-blue-600 font-semibold bg-blue-50/60"
                      : "text-slate-700 hover:text-blue-600"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4 bg-white space-y-1">
            {navItems.map((item) => {
              const isActive = item.isRoute && pathname === item.href;

              if (item.isCTA) {
                return (
                  <div key={item.id} className="pt-2 px-2">
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-center py-3 rounded-lg transition-colors text-sm"
                    >
                      {item.label}
                    </Link>
                  </div>
                );
              }

              if (item.isSection) {
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={(e) => handleSectionClick(e, item.id)}
                    className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors"
                  >
                    {item.label}
                  </a>
                );
              }

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "text-blue-600 font-semibold bg-blue-50/60"
                      : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </header>
  );
}
