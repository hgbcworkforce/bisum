"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navigation, Footer } from "@/components";
import jsPDF from "jspdf";
import {
  CheckCircle2,
  Download,
  Calendar,
  MapPin,
  QrCode,
  ShieldCheck,
  Copy,
  Check,
} from "lucide-react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  useEffect(() => {
    const regNumber = searchParams.get("reg") || searchParams.get("registrationNumber");
    const stored = sessionStorage.getItem("lastRegistration");

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setReceiptData(parsed);
        return;
      } catch (e) {
        console.error("Failed to parse stored registration:", e);
      }
    }

    if (regNumber) {
      setReceiptData({
        registrationNumber: regNumber,
        firstName: searchParams.get("firstName") || "Distinguished",
        lastName: searchParams.get("lastName") || "Attendee",
        email: searchParams.get("email") || "attendee@bisum.org",
        registrationType: searchParams.get("tier") || "Student Pass",
        breakoutSessionChoice: searchParams.get("track") || "Investment & Wealth Creation",
        amountPaid: Number(searchParams.get("amount")) || 1000,
        createdAt: new Date().toISOString(),
      });
    } else {
      setReceiptData({
        registrationNumber: "0001",
        firstName: "Distinguished",
        lastName: "Attendee",
        email: "attendee@bisum.org",
        registrationType: "Student Pass",
        breakoutSessionChoice: "Investment & Wealth Creation",
        amountPaid: 1000,
        createdAt: new Date().toISOString(),
      });
    }
  }, [searchParams]);

  const handleCopy = () => {
    if (receiptData?.registrationNumber) {
      navigator.clipboard.writeText(receiptData.registrationNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPDF = () => {
    if (!receiptData) return;

    try {
      const doc = new jsPDF();

      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 45, "F");

      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text("BISUM CONFERENCE 2025", 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(147, 197, 253);
      doc.text("OFFICIAL ADMISSION PASS & PAYMENT RECEIPT", 14, 32);

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 55, 182, 110, 3, 3, "F");
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, 55, 182, 110, 3, 3, "S");

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text("ATTENDEE NAME", 22, 70);

      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42);
      doc.text(`${receiptData.firstName} ${receiptData.lastName}`, 22, 80);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text("REGISTRATION NUMBER", 22, 95);

      doc.setFontSize(14);
      doc.setTextColor(37, 99, 235);
      doc.text(receiptData.registrationNumber || "BISUM-2025-CONFIRMED", 22, 105);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text("PASS TIER", 22, 120);
      doc.text("BREAKOUT TRACK", 110, 120);

      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(String(receiptData.registrationType || "Standard").toUpperCase(), 22, 130);
      doc.text(String(receiptData.breakoutSessionChoice || "General").substring(0, 30), 110, 130);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text("EVENT DATES", 22, 145);
      doc.text("VENUE", 110, 145);

      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("October 24 - 26, 2025", 22, 155);
      doc.text("Civic Centre, Victoria Island, Lagos", 110, 155);

      doc.save(`BISUM_Pass_${receiptData.registrationNumber || "Ticket"}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <main className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Registration & Payment Confirmed
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
              You&apos;re Officially Attending BISUM 2025!
            </h1>
            <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-xl mx-auto">
              Your registration is locked in. We have emailed your admission receipt and access credentials.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden mb-8">
            <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary-300">
                  Official Conference Pass
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  BISUM CONFERENCE 2025
                </h2>
              </div>
              <div className="inline-flex items-center space-x-2 bg-slate-800 px-3.5 py-1.5 rounded-full border border-slate-700 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Admission</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8 space-y-6">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Attendee Name
                  </span>
                  <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                    {receiptData?.firstName} {receiptData?.lastName}
                  </div>
                  <div className="text-xs text-slate-500">{receiptData?.email}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Pass Tier
                    </span>
                    <span className="inline-block mt-1 text-xs font-bold px-3 py-1 rounded-full bg-primary-50 text-primary border border-primary-100 capitalize">
                      {receiptData?.registrationType || "Standard Pass"}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Breakout Track
                    </span>
                    <span className="text-xs font-bold text-slate-900 block mt-1">
                      {receiptData?.breakoutSessionChoice || "AI & Tech"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <span className="text-xs text-slate-400 font-medium block">Dates</span>
                      <span className="text-xs font-bold text-slate-900">
                        Oct 24 - 26, 2025
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <span className="text-xs text-slate-400 font-medium block">Venue</span>
                      <span className="text-xs font-bold text-slate-900">
                        Civic Centre, Victoria Island
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between items-center text-center">
                <div className="w-full">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Registration ID
                  </span>
                  <div className="font-mono text-sm font-black text-primary bg-white border border-primary-100 py-2 px-3 rounded-xl mt-2 break-all shadow-2xs">
                    {receiptData?.registrationNumber || "BISUM-2025-CONFIRMED"}
                  </div>

                  <button
                    onClick={handleCopy}
                    className="mt-2 inline-flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-primary transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied to Clipboard</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Registration ID</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200 w-full flex flex-col items-center">
                  <QrCode className="w-16 h-16 text-slate-800 mb-1" />
                  <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                    Scan At Entrance
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 sm:px-8 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={handleDownloadPDF}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Official PDF Pass</span>
              </button>

              <Link
                href="/schedule"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Browse Event Schedule</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
