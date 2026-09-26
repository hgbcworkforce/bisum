const fs = require("fs");

const navCode = `"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Schedule", href: "/schedule" },
    { name: "Speakers", href: "/speakers" },
    { name: "Merchandise", href: "/merchandise" },
  ];

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header
      className={\`fixed top-0 left-0 right-0 z-50 transition-all duration-300 \${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-3"
          : "bg-white/80 backdrop-blur-xs border-b border-slate-200/40 py-4"
      }\`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-xs group-hover:bg-primary-hover transition-colors">
              <img
                src="https://media.hgbcinfluencers.org/bisum/BISUM logo.png"
                alt="BISUM Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
                BISUM<span className="text-primary ml-0.5">.</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase mt-0.5">
                Conference 2025
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/60">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={\`px-5 py-2 text-sm font-semibold rounded-full transition-all duration-200 \${
                    active
                      ? "bg-white text-primary shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }\`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Action CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/register"
              className="inline-flex items-center space-x-2 bg-primary hover:bg-primary-hover text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <span>Register Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:text-primary hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 pb-4 border-t border-slate-200 bg-white/95 rounded-2xl p-4 shadow-xl border">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={\`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors \${
                      active
                        ? "bg-primary-50 text-primary font-bold"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }\`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              <div className="pt-2 border-t border-slate-100">
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center space-x-2 w-full bg-primary hover:bg-primary-hover text-white text-sm font-bold py-3 rounded-xl shadow-sm"
                >
                  <span>Register Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
`;
fs.writeFileSync("D:/bisum/src/components/Navigation.jsx", navCode, "utf8");
console.log("Navigation updated");
