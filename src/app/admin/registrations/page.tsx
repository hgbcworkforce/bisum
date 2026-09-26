"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { registrationAPI, handleApiError, adminAPI } from "@/services/supabaseService";
import { Attendee } from "@/types";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  Search,
  FileSpreadsheet,
  FileText,
  Users,
  Award,
  Copy,
  Check,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Mail,
  Calendar,
  Phone,
  Bookmark,
} from "lucide-react";

export default function AdminRegistrationsPage() {
  const router = useRouter();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterBreakout, setFilterBreakout] = useState("all");
  const [sortBy, setSortBy] = useState("registration_date-desc");
  const [isExporting, setIsExporting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);
  const [resendingEmailId, setResendingEmailId] = useState<string | null>(null);
  const [emailStatusMsg, setEmailStatusMsg] = useState<{ id: string; msg: string; isError?: boolean } | null>(null);

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
        console.error("Auth verification error:", err);
        router.push("/admin/signin");
      }
    };

    checkAuth();
  }, [router]);

  const fetchAttendees = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const result = await registrationAPI.getAll({ limit: 2000 });
      if (result.success && result.data) {
        setAttendees(result.data);
      } else {
        throw new Error(result.message || "Failed to load registrations");
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
    fetchAttendees();
  }, [fetchAttendees]);

  const handleResendEmail = async (attendee: Attendee) => {
    if (!attendee.id) return;
    setResendingEmailId(attendee.id);
    setEmailStatusMsg(null);
    try {
      const res = await adminAPI.resendAttendeeEmail(attendee.id);
      if (res.success) {
        setEmailStatusMsg({ id: attendee.id, msg: "Confirmation email sent successfully!" });
      } else {
        setEmailStatusMsg({ id: attendee.id, msg: res.message || "Failed to send email", isError: true });
      }
    } catch (err: any) {
      setEmailStatusMsg({ id: attendee.id, msg: err.message || "Error sending email", isError: true });
    } finally {
      setResendingEmailId(null);
      setTimeout(() => setEmailStatusMsg(null), 4000);
    }
  };

  const filteredAttendees = useMemo(() => {
    return attendees
      .filter((attendee) => {
        const matchesSearch =
          searchTerm === "" ||
          (attendee.firstName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (attendee.lastName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (attendee.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (attendee.registrationNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (attendee.phone || "").toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType =
          filterType === "all" ||
          (attendee.registrationType || "").toLowerCase() === filterType.toLowerCase();

        const matchesBreakout =
          filterBreakout === "all" ||
          (attendee.breakoutSessionChoice || "").toLowerCase().includes(filterBreakout.toLowerCase());

        return matchesSearch && matchesType && matchesBreakout;
      })
      .sort((a, b) => {
        if (sortBy === "registration_date-desc") {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        if (sortBy === "registration_date-asc") {
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        }
        if (sortBy === "name-asc") {
          return (a.firstName || "").localeCompare(b.firstName || "");
        }
        if (sortBy === "name-desc") {
          return (b.firstName || "").localeCompare(a.firstName || "");
        }
        if (sortBy === "reg_number-asc") {
          return (a.registrationNumber || "").localeCompare(b.registrationNumber || "");
        }
        return 0;
      });
  }, [attendees, searchTerm, filterType, filterBreakout, sortBy]);

  const totalPages = Math.ceil(filteredAttendees.length / itemsPerPage) || 1;
  const paginatedAttendees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAttendees.slice(start, start + itemsPerPage);
  }, [filteredAttendees, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, filterBreakout, sortBy]);

  const handleCopy = (regNumber: string) => {
    navigator.clipboard.writeText(regNumber);
    setCopiedId(regNumber);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleExportCSV = () => {
    if (filteredAttendees.length === 0) return;
    setIsExporting(true);

    const headers = [
      "S/N",
      "Registration ID",
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Category",
      "Breakout Session",
      "Payment Status",
      "Amount (NGN)",
      "Registration Date",
    ];

    const rows = filteredAttendees.map((att, idx) => [
      idx + 1,
      att.registrationNumber || "N/A",
      att.firstName || "",
      att.lastName || "",
      att.email || "",
      att.phone || "N/A",
      (att.registrationType || "student").toUpperCase(),
      att.breakoutSessionChoice || "N/A",
      (att.paymentStatus || "pending").toUpperCase(),
      att.amountPaid || (att.registrationType === "professional" ? 2000 : 1000),
      att.createdAt ? new Date(att.createdAt).toISOString() : "N/A",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BISUM_Registrations_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsExporting(false);
  };

  const handleExportPDF = () => {
    if (filteredAttendees.length === 0) return;
    setIsExporting(true);

    try {
      const doc = new jsPDF("landscape") as any;

      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text("BISUM Conference 2025 - Registrations", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Generated on: ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })} | Total Registrations: ${filteredAttendees.length}`,
        14,
        28
      );

      const tableData = filteredAttendees.map((att, idx) => [
        idx + 1,
        att.registrationNumber || "N/A",
        `${att.firstName || ""} ${att.lastName || ""}`.trim(),
        att.email || "N/A",
        (att.registrationType || "student").toUpperCase(),
        att.breakoutSessionChoice || "N/A",
        (att.paymentStatus || "pending").toUpperCase(),
        formatDate(att.createdAt),
      ]);

      if (typeof doc.autoTable === "function") {
        doc.autoTable({
          startY: 34,
          head: [["#", "Reg ID", "Full Name", "Email", "Category", "Breakout Masterclass", "Payment", "Date Registered"]],
          body: tableData,
          headStyles: {
            fillColor: [37, 99, 235],
            textColor: 255,
            fontSize: 9,
            fontStyle: "bold",
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252],
          },
          styles: {
            fontSize: 8.5,
            cellPadding: 3,
          },
        });
      }

      doc.save(`BISUM_Registrations_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (err) {
      console.error("PDF export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const stats = useMemo(() => {
    const total = attendees.length;
    const student = attendees.filter((a) => (a.registrationType || "").toLowerCase() === "student").length;
    const professional = attendees.filter((a) => (a.registrationType || "").toLowerCase() === "professional").length;
    const paid = attendees.filter((a) => (a.paymentStatus || "").toLowerCase() === "paid").length;
    return { total, student, professional, paid };
  }, [attendees]);

  const getTypeBadge = (type?: string) => {
    const t = (type || "").toLowerCase();
    if (t === "professional") {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }
    if (t === "student") {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Registrations
              </h1>
              <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                {attendees.length} Total
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Search, filter, manage, and export all registered conference participants.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => fetchAttendees(true)}
              disabled={refreshing}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Registrations"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={isExporting || attendees.length === 0}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleExportPDF}
              disabled={isExporting || attendees.length === 0}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Registrations
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">{stats.total}</div>
            <span className="text-xs text-slate-400 mt-0.5 block">Live system count</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Student Passes (₦1k)
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">{stats.student}</div>
            <span className="text-xs text-slate-400 mt-0.5 block">Student admission</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Professional Passes (₦2k)
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">{stats.professional}</div>
            <span className="text-xs text-slate-400 mt-0.5 block">Professional admission</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Paid & Confirmed
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">{stats.paid}</div>
            <span className="text-xs text-slate-400 mt-0.5 block">Settled passes</span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search name, email, reg number, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="md:col-span-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors cursor-pointer"
              >
                <option value="all">All Categories (Student & Professional)</option>
                <option value="student">Student (₦1,000)</option>
                <option value="professional">Professional (₦2,000)</option>
              </select>
            </div>

            <div className="md:col-span-4">
              <select
                value={filterBreakout}
                onChange={(e) => setFilterBreakout(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors cursor-pointer"
              >
                <option value="all">All Breakout Masterclasses</option>
                <option value="investment">Investment & Wealth Creation</option>
                <option value="tech">Technology & Digital Skills</option>
                <option value="fashion">Fashion, Styling & Branding</option>
                <option value="agriculture">Agribusiness & Farming</option>
                <option value="foods">Confectionery & Food Business</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-900">{filteredAttendees.length}</strong> matching registrations
            </span>
            <div className="flex items-center space-x-2">
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 border-0 focus:ring-0 cursor-pointer p-0"
              >
                <option value="registration_date-desc">Newest First</option>
                <option value="registration_date-asc">Oldest First</option>
                <option value="reg_number-asc">Reg ID (0001...)</option>
                <option value="name-asc">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Attendees / Registrations Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-slate-200 border-t-blue-600 mx-auto mb-4" />
              <p className="text-sm font-semibold text-slate-500">Loading registrations...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-rose-600 text-sm">
              {error}
              <div className="mt-4">
                <button
                  onClick={() => fetchAttendees()}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : paginatedAttendees.length === 0 ? (
            <div className="p-16 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No registrations found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No participant registrations matched your search query or filter settings.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Reg ID</th>
                    <th className="py-3.5 px-4">Attendee</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Breakout Track</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedAttendees.map((attendee) => {
                    const isCopied = copiedId === attendee.registrationNumber;
                    const isPaid = (attendee.paymentStatus || "").toLowerCase() === "paid";
                    return (
                      <tr key={attendee.id || attendee.email} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                          <div className="flex items-center space-x-1.5">
                            <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-800 text-[11px] font-black">
                              {attendee.registrationNumber || "0001"}
                            </span>
                            {attendee.registrationNumber && (
                              <button
                                onClick={() => handleCopy(attendee.registrationNumber!)}
                                className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                                title="Copy Reg ID"
                              >
                                {isCopied ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">
                            {attendee.firstName} {attendee.lastName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">
                            {formatDate(attendee.createdAt)}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-slate-700 font-medium">{attendee.email}</div>
                          <div className="text-[11px] text-slate-400">{attendee.phone || "No phone"}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${getTypeBadge(
                              attendee.registrationType
                            )}`}
                          >
                            {attendee.registrationType || "Student"} Pass
                          </span>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs truncate text-slate-600">
                          {attendee.breakoutSessionChoice || "General Session"}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              isPaid
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {isPaid ? "Paid (₦" + (attendee.amountPaid || (attendee.registrationType === "professional" ? 2000 : 1000)).toLocaleString() + ")" : "Pending"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => setSelectedAttendee(attendee)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                              title="View Full Profile"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleResendEmail(attendee)}
                              disabled={resendingEmailId === attendee.id}
                              className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer disabled:opacity-50"
                              title="Resend Confirmation Email"
                            >
                              <Mail className={`w-3.5 h-3.5 ${resendingEmailId === attendee.id ? "animate-pulse" : ""}`} />
                            </button>
                          </div>
                          {emailStatusMsg && emailStatusMsg.id === attendee.id && (
                            <p className={`text-[10px] mt-1 ${emailStatusMsg.isError ? "text-rose-600" : "text-emerald-600"}`}>
                              {emailStatusMsg.msg}
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {filteredAttendees.length > itemsPerPage && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Page <strong className="text-slate-900">{currentPage}</strong> of{" "}
                <strong className="text-slate-900">{totalPages}</strong>
              </span>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Attendee Profile Modal */}
        {selectedAttendee && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => setSelectedAttendee(null)}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl">
                  {selectedAttendee.firstName[0]}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {selectedAttendee.firstName} {selectedAttendee.lastName}
                  </h3>
                  <p className="text-xs text-slate-400">Pass Holder Profile</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">
                      Registration ID
                    </span>
                    <span className="font-mono text-lg font-black text-slate-900">
                      {selectedAttendee.registrationNumber || "0001"}
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] border ${getTypeBadge(
                      selectedAttendee.registrationType
                    )}`}
                  >
                    {selectedAttendee.registrationType || "Student"} Pass
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white">
                    <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">
                      Email Address
                    </span>
                    <span className="font-semibold text-slate-900 break-all">{selectedAttendee.email}</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white">
                    <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">
                      Phone Number
                    </span>
                    <span className="font-semibold text-slate-900">{selectedAttendee.phone || "N/A"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white">
                    <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">
                      Gender & Age
                    </span>
                    <span className="font-semibold text-slate-900 capitalize">
                      {selectedAttendee.gender || "Not specified"} ({selectedAttendee.ageRange || "N/A"})
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white">
                    <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">
                      Payment Status
                    </span>
                    <span className="font-semibold text-emerald-600 capitalize">
                      {selectedAttendee.paymentStatus || "Paid"}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white">
                  <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">
                    Breakout Masterclass
                  </span>
                  <span className="font-semibold text-slate-900">
                    {selectedAttendee.breakoutSessionChoice || "General Sessions"}
                  </span>
                </div>

                {selectedAttendee.expectations && (
                  <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white">
                    <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">
                      Expectations
                    </span>
                    <p className="text-slate-700 italic mt-0.5">{selectedAttendee.expectations}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex space-x-3">
                <button
                  onClick={() => handleResendEmail(selectedAttendee)}
                  disabled={resendingEmailId === selectedAttendee.id}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Resend Confirmation Email</span>
                </button>
                <button
                  onClick={() => setSelectedAttendee(null)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
