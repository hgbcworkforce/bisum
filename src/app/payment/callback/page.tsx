"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navigation, Footer } from "@/components";
import { paymentAPI, registrationAPI, handleApiError } from "@/services/supabaseService";
import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

function PaymentCallbackContent() {
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("Verifying your transaction with Paystack...");
  const [attendeeData, setAttendeeData] = useState<any>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyPayment = async () => {
      const transactionId =
        searchParams.get("reference") ||
        searchParams.get("trxref") ||
        searchParams.get("transaction_id");

      if (!transactionId) {
        setStatus("error");
        setMessage("Transaction reference not found. Your payment could not be validated.");
        return;
      }

      try {
        const verificationResult = await paymentAPI.verifyTransaction(transactionId);

        if (verificationResult.success) {
          setMessage("Payment verified! Finalizing your conference seat...");

          const storedData = sessionStorage.getItem("registrationData");
          if (!storedData) {
            setStatus("success");
            setMessage("Your transaction has been verified and confirmed.");
            return;
          }

          const formData = JSON.parse(storedData);
          const registrationResult = await registrationAPI.register(formData);

          if (registrationResult.success) {
            setAttendeeData(registrationResult.data);
            setStatus("success");
            setMessage("Registration complete! Welcome to BISUM Conference 2025.");
            sessionStorage.setItem("lastRegistration", JSON.stringify(registrationResult.data));
          } else {
            setStatus("success");
            setMessage("Payment verified successfully.");
          }
        } else {
          throw new Error(verificationResult.message || "Payment verification failed.");
        }
      } catch (error: any) {
        const errorInfo = handleApiError(error);
        setStatus("error");
        setMessage(errorInfo.message);
      } finally {
        sessionStorage.removeItem("registrationData");
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navigation />

      <main className="py-20 px-4 sm:px-6 lg:px-8 flex-1 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-200 text-center">
          {status === "processing" && (
            <div>
              <div className="animate-spin rounded-full h-14 w-14 border-4 border-slate-200 border-t-primary mx-auto mb-6" />
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-2">
                Verifying Transaction
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">{message}</p>
            </div>
          )}

          {status === "success" && (
            <div>
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
                Payment Confirmed!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mb-6">{message}</p>

              {attendeeData && (
                <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-200 text-left text-xs space-y-1.5">
                  <div className="text-slate-400">Registration ID:</div>
                  <div className="font-mono text-sm font-bold text-slate-900">
                    {attendeeData.registrationNumber}
                  </div>
                </div>
              )}

              <Link
                href="/payment-success"
                className="flex items-center justify-center space-x-2 w-full py-3.5 px-4 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-xl shadow-sm transition-colors"
              >
                <span>View Official Pass & Receipt</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {status === "error" && (
            <div>
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
                Verification Issue
              </h2>
              <p className="text-xs sm:text-sm text-rose-600 mb-6">{message}</p>

              <Link
                href="/register"
                className="block w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors"
              >
                Return to Registration
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
