"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navigation, Footer } from "@/components";
import {
  CheckCircle2,
  Copy,
  Check,
  Ticket,
} from "lucide-react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const regNumber = searchParams.get("reg") || searchParams.get("registrationNumber");
    const stored = sessionStorage.getItem("lastRegistration");

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setData(parsed);
        return;
      } catch (e) {
        console.error("Failed to parse stored registration:", e);
      }
    }

    if (regNumber) {
      setData({
        registrationNumber: regNumber,
        firstName: searchParams.get("firstName") || "Distinguished",
        lastName: searchParams.get("lastName") || "Attendee",
        email: searchParams.get("email") || "attendee@bisum.org",
        registrationType: searchParams.get("tier") || "Student Pass",
        breakoutSessionChoice: searchParams.get("track") || "General",
      });
    } else {
      setData({
        registrationNumber: "0001",
        firstName: "Distinguished",
        lastName: "Attendee",
        email: "attendee@bisum.org",
        registrationType: "Student Pass",
        breakoutSessionChoice: "General",
      });
    }
  }, [searchParams]);

  const handleCopy = () => {
    if (data?.registrationNumber) {
      navigator.clipboard.writeText(data.registrationNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navigation />

      <main className="py-24 px-4 sm:px-6 lg:px-8 flex-1 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-200 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
            Payment Confirmed!
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 mb-6">
            Registration complete! Welcome to BISUM Conference 2025. Your confirmation email has been dispatched to your inbox.
          </p>

          {/* Simple Details Card */}
          {data && (
            <div className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-200 text-left text-xs space-y-2.5">
              <div className="flex items-center text-primary font-bold mb-1">
                <Ticket className="w-3.5 h-3.5 mr-1" />
                <span>Conference Pass Confirmation</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Registration ID:</span>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="font-mono text-base font-extrabold text-slate-900">
                    {data.registrationNumber || "0001"}
                  </span>
                  {data.registrationNumber && (
                    <button
                      onClick={handleCopy}
                      className="text-xs font-semibold text-primary hover:underline cursor-pointer flex items-center space-x-1"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-slate-500">
                Attendee: <span className="font-semibold text-slate-800">{data.firstName} {data.lastName}</span>
              </div>

              <div className="text-slate-500">
                Category: <span className="font-semibold text-slate-800 capitalize">{data.registrationType || "Student"} Pass</span>
              </div>

              {(data.attendanceMode || data.attendance_mode) && (
                <div className="text-slate-500">
                  Attendance: <span className="font-semibold text-slate-800">{data.attendanceMode || data.attendance_mode}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 flex items-center justify-center py-3 px-4 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              <span>Return to Home</span>
            </Link>
            <Link
              href="/schedule"
              className="flex-1 flex items-center justify-center py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors"
            >
              <span>Browse Schedule</span>
            </Link>
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
