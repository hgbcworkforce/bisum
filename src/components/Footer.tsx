import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail, Phone } from "lucide-react";
import { FacebookIcon, InstagramIcon, YouTubeIcon } from "./SocialIcons";
import { FOOTER_CONTENT } from "./REUSEABLE";
import { NAVIGATION_CONTENT } from "./REUSEABLE";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const getSocialIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "facebook":
        return <FacebookIcon className="w-4 h-4" />;
      case "instagram":
        return <InstagramIcon className="w-4 h-4" />;
      case "youtube":
        return <YouTubeIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getContactIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "location":
        return <MapPin className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />;
      case "email":
        return <Mail className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />;
      case "phone":
        return <Phone className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <footer className="bg-slate-950 text-white border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-5">
            <div className="mb-2">
              <Image
                              src="/BISUM logo white.webp"
                              alt={NAVIGATION_CONTENT.logoAlt}
                              width={140}
                              height={42}
                              priority
                              className="h-24 w-auto object-contain"
                            />
            </div>
            <p className="text-slate-400 mb-6 leading-relaxed text-sm max-w-md">
              {FOOTER_CONTENT.description}
            </p>

            {/* Social Media Links */}
            <div className="flex space-x-2.5">
              {FOOTER_CONTENT.socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl transition-colors"
                  aria-label={`Follow us on ${social.name}`}
                >
                  {getSocialIcon(social.name)}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-5">{FOOTER_CONTENT.quickLinksHeading}</h4>
            <ul className="space-y-3">
              {FOOTER_CONTENT.quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="lg:col-span-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-5">{FOOTER_CONTENT.contactInfoHeading}</h4>
            <ul className="space-y-3.5">
              {FOOTER_CONTENT.contactInfo.map((info, index) => (
                <li key={index} className="flex items-start space-x-3 text-sm text-slate-400">
                  {getContactIcon(info.type)}
                  <span className="leading-snug">{info.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-900 my-10" />

        {/* Bottom Footer */}
        <div className="text-center text-slate-500 text-xs">
          © {currentYear} {FOOTER_CONTENT.copyright}
        </div>
      </div>
    </footer>
  );
}
