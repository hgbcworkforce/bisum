import type { Metadata, Viewport } from "next";
import { SITE_CONFIG } from "../data/REUSEABLE";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.title,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: SITE_CONFIG.keywords,
  authors: [
    { name: "Higher Ground Baptist Church", url: "https://hgbcinfluencers.org" },
    { name: "BISUM Conference Team" },
  ],
  creator: "Higher Ground Baptist Church (HGBC)",
  publisher: "BISUM Conference",
  applicationName: "BISUM Conference 2025",
  category: "Conference / Business, Investment & Leadership",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: SITE_CONFIG.url,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: "/hero.webp",
        width: 1200,
        height: 630,
        alt: "BISUM Conference 2025 - Annual Business, Investment & Leadership Summit",
      },
      {
        url: "/BISUM logo.webp",
        width: 600,
        height: 300,
        alt: "BISUM Conference Official Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: ["/hero.webp"],
    creator: "@hgbcinfluencers",
    site: "@hgbcinfluencers",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/BISUM logo.webp",
    shortcut: "/BISUM logo.webp",
    apple: "/BISUM logo.webp",
  },
};

const jsonLdEvent = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "BISUM Conference 2025",
  description: SITE_CONFIG.description,
  startDate: "2025-11-13T17:00:00+01:00",
  endDate: "2025-11-15T21:00:00+01:00",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  location: {
    "@type": "Place",
    name: "Higher Ground Baptist Church Auditorium",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Higher Ground Baptist Church",
      addressLocality: "Ogbomoso",
      addressRegion: "Oyo State",
      addressCountry: "NG",
    },
  },
  image: ["https://bisum.hgbcinfluencers.org/hero.webp"],
  offers: [
    {
      "@type": "Offer",
      name: "Student Pass",
      price: "1000",
      priceCurrency: "NGN",
      availability: "https://schema.org/InStock",
      url: "https://bisum.hgbcinfluencers.org/register",
      validFrom: "2025-01-01T00:00:00+01:00",
    },
    {
      "@type": "Offer",
      name: "Professional Pass",
      price: "2000",
      priceCurrency: "NGN",
      availability: "https://schema.org/InStock",
      url: "https://bisum.hgbcinfluencers.org/register",
      validFrom: "2025-01-01T00:00:00+01:00",
    },
  ],
  organizer: {
    "@type": "Organization",
    name: "Higher Ground Baptist Church",
    url: "https://hgbcinfluencers.org",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/BISUM logo.webp" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdEvent) }}
        />
      </head>
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
