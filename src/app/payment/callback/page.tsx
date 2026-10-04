"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navigation, Footer } from "@/components";
import { paymentAPI, handleApiError } from "@/services/supabaseService";
import { CheckCircle2, AlertCircle, ArrowRight, ShoppingBag, Ticket } from "lucide-react";
import Link from "next/link";

function PaymentCallbackContent() {
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("Verifying your transaction with Paystack...");
  const [resultData, setResultData] = useState<any>(null);
  const [transactionType, setTransactionType] = useState<"registration" | "merchandise">("registration");
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

      const isMerch = transactionId.startsWith("BISUM-MERCH");
      setTransactionType(isMerch ? "merchandise" : "registration");

      try {
        const verificationResult = await paymentAPI.verifyTransaction(transactionId);

        if (verificationResult.success && verificationResult.data) {
          const type = (verificationResult.data as any).type || (isMerch ? "merchandise" : "registration");
          setTransactionType(type);

          if (type === "merchandise") {
            setResultData((verificationResult.data as any).order);
            setStatus("success");
            setMessage("Your merchandise pre-order is confirmed! A receipt with pickup details has been emailed to you.");
          } else {
            const reg = (verificationResult.data as any).registration;
            setResultData(reg);
            setStatus("success");
            setMessage("Registration complete! Welcome to BISUM Conference 2025. Your confirmation email has been dispatched.");
            if (reg) {
              sessionStorage.setItem("lastRegistration", JSON.stringify(reg));
            }
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

      <main className="py-24 px-4 sm:px-6 lg:px-8 flex-1 flex items-center justify-center">
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

              {/* Order / Registration Details Card */}
              {resultData && (
                <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-200 text-left text-xs space-y-2">
                  {transactionType === "merchandise" ? (
                    <>
                      <div className="flex items-center text-blue-600 font-bold mb-1">
                        <ShoppingBag className="w-3.5 h-3.5 mr-1" />
                        <span>Merchandise Order Details</span>
                      </div>
                      <div className="text-slate-400">Order Pickup Code:</div>
                      <div className="font-mono text-sm font-bold text-slate-900">
                        {resultData.order_number || resultData.orderNumber}
                      </div>
                      <div className="text-slate-500 pt-1 border-t border-slate-200">
                        Item: <span className="font-semibold text-slate-800">{resultData.item_name || resultData.itemName}</span> ({resultData.quantity}x • {resultData.color} • {resultData.size})
                      </div>
                      <div className="text-slate-500">
                        Pickup: <span className="font-semibold text-slate-800">{resultData.pickup_option || resultData.pickupOption}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center text-blue-600 font-bold mb-1">
                        <Ticket className="w-3.5 h-3.5 mr-1" />
                        <span>Conference Pass Details</span>
                      </div>
                      <div className="text-slate-400">Registration ID:</div>
                      <div className="font-mono text-base font-extrabold text-slate-900">
                        {resultData.registration_number || resultData.registrationNumber || "0001"}
                      </div>
                      <div className="text-slate-500 pt-1 border-t border-slate-200">
                        Attendee: <span className="font-semibold text-slate-800">{resultData.first_name || resultData.firstName} {resultData.last_name || resultData.lastName}</span>
                      </div>
                      {/*
                      <div className="text-slate-500">
                        Category: <span className="font-semibold text-slate-800 capitalize">{(resultData.registration_type || resultData.registrationType || "student")} Pass</span>
                      </div>
                      */}
                      <div className="text-slate-500">
                        Pass Type: <span className="font-semibold text-slate-800 capitalize">{(resultData.registration_type || resultData.registrationType || "Conference")} Pass</span>
                      </div>
                      {(resultData.attendance_mode || resultData.attendanceMode) && (
                        <div className="text-slate-500">
                          Attendance: <span className="font-semibold text-slate-800">{resultData.attendance_mode || resultData.attendanceMode}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {transactionType === "registration" ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/"
                    className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    <span>Return to Home</span>
                  </Link>
                  <Link
                    href="/schedule"
                    className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors"
                  >
                    <span>Browse Schedule</span>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/"
                    className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors"
                  >
                    <span>Return to Home</span>
                  </Link>
                  <Link
                    href="/merchandise"
                    className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    <span>Return to Store</span>
                  </Link>
                </div>
              )}
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
                href="/"
                className="block w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors"
              >
                Return to Home
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
