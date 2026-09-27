"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { useDashboardRealtime } from "@/hooks/useSupabaseRealtime";
import { registrationAPI, formatCurrency } from "@/services/supabaseService";
import { Attendee } from "@/types";
import {
  Users,
  CreditCard,
  ShoppingBag,
  Clock,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const realtimeStats = useDashboardRealtime();
  const [recentAttendees, setRecentAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);

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
        console.error("Admin verification error:", err);
        router.push("/admin/signin");
      }
    };

    const fetchRecent = async () => {
      try {
        const res = await registrationAPI.getAll({ limit: 5 });
        if (res.success && res.data) {
          setRecentAttendees(res.data);
        }
      } catch (err) {
        console.error("Failed to load recent attendees:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    fetchRecent();
  }, [router]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Executive Overview
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Live registration metrics and operational health monitor.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Database Stream Active</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Registrations */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Registrations
                </span>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 mt-3 font-mono">
                {realtimeStats.totalRegistrations}
              </div>
            </div>
            <div className="text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-100 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Attendance:</span>
                <span className="font-semibold text-slate-700">
                  <strong className="text-blue-600">{realtimeStats.onsiteCount}</strong> On-site • <strong className="text-purple-600">{realtimeStats.onlineCount}</strong> Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Tiers:</span>
                <span className="text-slate-600">
                  {realtimeStats.studentCount} Student • {realtimeStats.professionalCount} Prof
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Total Merchandise Purchased */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Merchandise Purchased
              </span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mt-3 font-mono">
              {realtimeStats.totalMerchandisePurchased}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              {realtimeStats.paidMerchandiseOrders} paid store orders
            </span>
          </div>

          {/* Card 3: Total Revenue (reg + merch) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Revenue (reg + merch)
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                ₦
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mt-3 font-mono">
              {formatCurrency(realtimeStats.totalRevenue)}
            </div>
            <span className="text-xs text-emerald-600 font-bold mt-1 flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Settled Paystack transactions</span>
            </span>
          </div>

          {/* Card 4: Pending Transactions (reg + merch) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Pending Transactions (reg + merch)
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mt-3 font-mono">
              {realtimeStats.pendingTransactions}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              Awaiting payment settlement
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
            Quick Operational Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/admin/registrations"
              className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center space-x-3">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
                <span className="text-xs font-bold text-slate-800">Export Registrations CSV</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/admin/merchandise"
              className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-purple-600" />
                <span className="text-xs font-bold text-slate-800">Merchandise Orders</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/admin/payments"
              className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">Audit Transactions</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Recent Registrations
              </h3>
              <p className="text-xs text-slate-500">
                Latest signups streaming into the platform
              </p>
            </div>

            <Link
              href="/admin/registrations"
              className="text-xs font-bold text-primary hover:underline flex items-center space-x-1"
            >
              <span>View All Registrations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-6">Email</th>
                  <th className="py-3 px-6">Attendance</th>
                  <th className="py-3 px-6">Tier</th>
                  <th className="py-3 px-6">Registration ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAttendees.length > 0 ? (
                  recentAttendees.map((att, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3.5 px-6 font-bold text-slate-900">
                        {att.firstName} {att.lastName}
                      </td>
                      <td className="py-3.5 px-6 text-slate-500">{att.email}</td>
                      <td className="py-3.5 px-6">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            (att.attendanceMode || "On-site").toLowerCase() === "online"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {att.attendanceMode || "On-site"}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 uppercase font-bold text-[10px] text-primary">
                        {att.registrationType}
                      </td>
                      <td className="py-3.5 px-6 font-mono text-slate-700">
                        {att.registrationNumber}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No attendee signups recorded yet.
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
