"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { paymentAPI, handleApiError, formatCurrency } from "@/services/supabaseService";
import { PaymentRecord } from "@/types";
import {
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.push("/admin/signin");
          return;
        }

        const { data: adminData, error: adminError } = await supabase
          .from("admin_users")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (adminError || !adminData || !adminData.is_approved) {
          router.push("/admin/auth");
        }
      } catch (err) {
        console.error("Auth check error:", err);
        router.push("/admin/signin");
      }
    };

    checkAuth();
  }, [router]);

  const fetchPayments = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const result = await paymentAPI.getAll({ limit: 1000 });
      if (result.success && result.data) {
        setPayments(result.data);
      } else {
        throw new Error(result.message || "Failed to load payment records");
      }
    } catch (err: any) {
      const errInfo = handleApiError(err);
      setError(errInfo.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const kpis = useMemo(() => {
    let totalRevenue = 0;
    let successfulCount = 0;
    let pendingCount = 0;
    let failedCount = 0;

    payments.forEach((p) => {
      const st = (p.status || "").toLowerCase();
      const amt = Number(p.amount) || 0;

      if (st === "success" || st === "successful" || st === "paid") {
        totalRevenue += amt;
        successfulCount++;
      } else if (st === "pending" || st === "processing") {
        pendingCount++;
      } else {
        failedCount++;
      }
    });

    const avgTicket = successfulCount > 0 ? totalRevenue / successfulCount : 0;

    return {
      totalRevenue,
      successfulCount,
      pendingCount,
      failedCount,
      avgTicket,
      totalCount: payments.length,
    };
  }, [payments]);

  const filteredPayments = useMemo(() => {
    return payments
      .filter((tx) => {
        const matchesSearch =
          searchTerm === "" ||
          (tx.transaction_reference || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (tx.customer_email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (tx.customer_name || "").toLowerCase().includes(searchTerm.toLowerCase());

        const txStatus = (tx.status || "").toLowerCase();
        let matchesStatus = true;
        if (statusFilter === "success") {
          matchesStatus = txStatus === "success" || txStatus === "successful" || txStatus === "paid";
        } else if (statusFilter === "pending") {
          matchesStatus = txStatus === "pending" || txStatus === "processing";
        } else if (statusFilter === "failed") {
          matchesStatus = txStatus === "failed" || txStatus === "abandoned" || txStatus === "cancelled";
        }

        const matchesChannel =
          channelFilter === "all" ||
          (tx.channel || "").toLowerCase().includes(channelFilter.toLowerCase());

        return matchesSearch && matchesStatus && matchesChannel;
      })
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }, [payments, searchTerm, statusFilter, channelFilter]);

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage) || 1;
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(start, start + itemsPerPage);
  }, [filteredPayments, currentPage, itemsPerPage]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status?: string) => {
    const st = (status || "").toLowerCase();
    if (st === "success" || st === "successful" || st === "paid") {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Paid</span>
        </span>
      );
    }
    if (st === "pending" || st === "processing") {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>Pending</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
        <XCircle className="w-3 h-3 text-rose-600" />
        <span>Failed</span>
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Payment Transactions
              </h1>
              <span className="bg-primary text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                {payments.length} Transactions
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Real-time audit log of Paystack conference registrations and merchandise payments.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => fetchPayments(true)}
              disabled={refreshing}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
              <span>Refresh Feed</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Revenue
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                ₦
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-3 tracking-tight">
              {formatCurrency(kpis.totalRevenue)}
            </div>
            <span className="text-xs text-emerald-600 font-bold mt-1 flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{kpis.successfulCount} Settled Transactions</span>
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Average Value
              </span>
              <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-3 tracking-tight">
              {formatCurrency(kpis.avgTicket)}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">Per successful checkout</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Pending Checkout
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-3 tracking-tight">
              {kpis.pendingCount}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">Awaiting gateway confirmation</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Failed / Abandoned
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-3 tracking-tight">
              {kpis.failedCount}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">Incomplete or declined</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 text-center w-12">#</th>
                  <th className="py-3.5 px-4">Transaction Reference</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Channel</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      Loading transaction records...
                    </td>
                  </tr>
                ) : paginatedPayments.length > 0 ? (
                  paginatedPayments.map((tx, idx) => (
                    <tr key={tx.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-center text-xs text-slate-400">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {tx.transaction_reference || tx.reference || "N/A"}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{tx.customer_name || "Attendee"}</div>
                        <div className="text-xs text-slate-500">{tx.customer_email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="py-3.5 px-4 capitalize text-xs text-slate-600">
                        {tx.channel || "Paystack"}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {formatDate(tx.created_at)}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(tx.status)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      No payments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
