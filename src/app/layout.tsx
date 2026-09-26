import type { Metadata } from "next";
import { SITE_CONFIG } from "../data/REUSEABLE";
import "./globals.css";

export const metadata: Metadata = {
  title: SITE_CONFIG.title,
  description: SITE_CONFIG.description,
  icons: {
    icon: "https://media.hgbcinfluencers.org/favicon.ico",
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
        <link rel="icon" href="https://media.hgbcinfluencers.org/favicon.ico" />
      </head>
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
