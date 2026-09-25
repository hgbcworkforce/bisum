const fs = require("fs");

const dashboardCode = `"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/admin/DashboardLayout";
import {
  registrationAPI,
  paymentAPI,
  handleApiError,
  formatCurrency,
} from "@/services/supabaseService";
import { useDashboardRealtime } from "@/hooks/useSupabaseRealtime";
import { Users, DollarSign, UserCheck, GraduationCap, Briefcase, ArrowUpRight, Activity } from "lucide-react";

export default function AdminDashboardPage() {
  const [initialStats, setInitialStats] = useState({
    totalAttendees: 0,
    totalRevenue: 0,
    byType: {},
    popularSession: { name: "N/A", count: 0 },
  });
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const { stats: realTimeStats, isConnected } = useDashboardRealtime();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push("/admin/signin");
          return;
        }
        setLoading(true);
        setError(null);

        const registrationStatsResult = await registrationAPI.getStats();
        const paymentStatsResult = await paymentAPI.getStats();

        const recentAttendeesResult = await registrationAPI.getAllAttendees({
          page: 1,
          limit: 6,
          sortBy: "created_at",
          sortOrder: "desc",
        });

        if (registrationStatsResult.success && paymentStatsResult.success) {
          const regStats = registrationStatsResult.data;
          const payStats = paymentStatsResult.data;

          setInitialStats({
            totalAttendees: regStats.totalRegistrations || 0,
            totalRevenue: payStats.successfulAmount || 0,
            byType: regStats.byType || {},
            popularSession: regStats.popularSession || { name: "N/A", count: 0 },
          });
        }

        if (recentAttendeesResult.success) {
          setRecentRegistrations(recentAttendeesResult.data || []);
        }
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
        const errorInfo = handleApiError(err);
        setError(errorInfo.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const stats = realTimeStats.totalAttendees > 0 ? realTimeStats : initialStats;

  const statCards = [
    {
      title: "Total Registrations",
      value: stats.totalAttendees || 0,
      icon: <Users className="w-5 h-5 text-primary" />,
      bg: "bg-primary-50",
      border: "border-primary-100",
    },
    {
      title: "Gross Revenue",
      value: formatCurrency(stats.totalRevenue || 0),
      icon: <DollarSign className="w-5 h-5 text-emerald-600" />,
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      title: "Students",
      value: stats.byType?.student || 0,
      icon: <GraduationCap className="w-5 h-5 text-purple-600" />,
      bg: "bg-purple-50",
      border: "border-purple-100",
    },
    {
      title: "Professionals",
      value: stats.byType?.professional || 0,
      icon: <Briefcase className="w-5 h-5 text-amber-600" />,
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Executive Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Live metrics and recent attendee transactions for BISUM 2025.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-2xs">
            <span className={\`w-2 h-2 rounded-full \${isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}\`} />
            <span className="text-xs font-bold text-slate-700">
              {isConnected ? "Realtime Sync" : "Syncing"}
            </span>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((card, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={\`w-9 h-9 rounded-xl \${card.bg} \${card.border} border flex items-center justify-center\`}>
                  {card.icon}
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {card.value}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Registrations Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Recent Registrations</h3>
              <p className="text-xs text-slate-500">Latest delegates who reserved their seats.</p>
            </div>

            <Link
              href="/admin/attendees"
              className="inline-flex items-center space-x-1 text-xs font-bold text-primary hover:text-primary-hover"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">Reg No.</th>
                  <th className="py-3 px-6">Attendee</th>
                  <th className="py-3 px-6">Tier</th>
                  <th className="py-3 px-6">Track</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {recentRegistrations.length > 0 ? (
                  recentRegistrations.map((row) => (
                    <tr key={row.id || row.registrationNumber} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 font-bold text-primary">
                        {row.registrationNumber || row.registration_number}
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {row.fullName || \`\${row.firstName} \${row.lastName}\`}
                        <span className="block text-[10px] text-slate-400 font-normal">{row.email}</span>
                      </td>
                      <td className="py-4 px-6 capitalize">
                        {row.registrationType}
                      </td>
                      <td className="py-4 px-6 capitalize">
                        {row.breakoutSessionChoice || "General"}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={\`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize \${
                            row.paymentStatus === "completed"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }\`}
                        >
                          {row.paymentStatus || "pending"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-400 text-[10px]">
                        {row.registrationDate ? new Date(row.registrationDate).toLocaleDateString() : "Today"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No attendee records loaded.
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
`;
fs.writeFileSync("D:/bisum/src/app/admin/page.js", dashboardCode, "utf8");
console.log("Admin dashboard updated");
