"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { registrationAPI, handleApiError } from "@/services/supabaseService";
import { Attendee } from "@/types";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  Search,
  FileSpreadsheet,
  FileText,
  Users,
  Award,
  Laptop,
  Copy,
  Check,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

export default function AdminAttendeesPage() {
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
      const result = await registrationAPI.getAll({ limit: 1000 });
      if (result.success && result.data) {
        setAttendees(result.data);
      } else {
        throw new Error(result.message || "Failed to load attendees");
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
      "Participant Type",
      "Breakout Session",
      "Registration Date",
    ];

    const rows = filteredAttendees.map((att, idx) => [
      idx + 1,
      att.registrationNumber || "N/A",
      att.firstName || "",
      att.lastName || "",
      att.email || "",
      att.phone || "N/A",
      att.registrationType || "Standard",
      att.breakoutSessionChoice || "N/A",
      att.createdAt ? new Date(att.createdAt).toISOString() : "N/A",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BISUM_Attendees_${new Date().toISOString().split("T")[0]}.csv`);
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
      doc.text("BISUM Conference 2025 - Attendee Registry", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Generated on: ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })} | Total Attendees: ${filteredAttendees.length}`,
        14,
        28
      );

      const tableData = filteredAttendees.map((att, idx) => [
        idx + 1,
        att.registrationNumber || "N/A",
        `${att.firstName || ""} ${att.lastName || ""}`.trim(),
        att.email || "N/A",
        att.registrationType || "Standard",
        att.breakoutSessionChoice || "N/A",
        formatDate(att.createdAt),
      ]);

      if (typeof doc.autoTable === "function") {
        doc.autoTable({
          startY: 34,
          head: [["#", "Reg ID", "Full Name", "Email", "Tier", "Breakout Session", "Date Registered"]],
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

      doc.save(`BISUM_Attendees_${new Date().toISOString().split("T")[0]}.pdf`);
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Attendee Directory
              </h1>
              <span className="bg-primary text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
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
              title="Refresh Attendee List"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
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
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Registered
              </span>
              <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary flex items-center justify-center">
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
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-colors"
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
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-colors cursor-pointer"
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
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-colors cursor-pointer"
              >
                <option value="all">All Breakout Sessions</option>
                <option value="investment">Investment & Wealth Creation</option>
                <option value="tech">Technology & Digital Skills</option>
                <option value="fashion">Fashion, Styling & Branding</option>
                <option value="agriculture">Agribusiness & Farming</option>
                <option value="foods">Confectionery & Food Business</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-colors cursor-pointer"
              >
                <option value="registration_date-desc">Newest First</option>
                <option value="registration_date-asc">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="reg_number-asc">Reg ID (Asc)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 text-center w-12">#</th>
                  <th className="py-3.5 px-4">Attendee</th>
                  <th className="py-3.5 px-4">Registration ID</th>
                  <th className="py-3.5 px-4">Tier</th>
                  <th className="py-3.5 px-4">Breakout Track</th>
                  <th className="py-3.5 px-4">Date Registered</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        <span className="text-xs text-slate-500 font-medium">
                          Loading attendee registry...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="text-rose-500 text-xs font-semibold bg-rose-50 py-3 px-4 rounded-xl inline-block">
                        {error}
                      </div>
                    </td>
                  </tr>
                ) : paginatedAttendees.length > 0 ? (
                  paginatedAttendees.map((att, idx) => {
                    const serial = (currentPage - 1) * itemsPerPage + idx + 1;
                    const initials = `${(att.firstName || "").charAt(0)}${(att.lastName || "").charAt(0)}`.toUpperCase() || "A";

                    return (
                      <tr
                        key={att.id || idx}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-3.5 px-4 text-center text-xs text-slate-400 font-medium">
                          {serial}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                              {initials}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 leading-tight">
                                {att.firstName} {att.lastName}
                              </div>
                              <div className="text-xs text-slate-500 font-normal">
                                {att.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="inline-flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                            <span className="font-mono text-xs font-bold text-slate-800">
                              {att.registrationNumber || "N/A"}
                            </span>
                            {att.registrationNumber && (
                              <button
                                onClick={() => handleCopy(att.registrationNumber!)}
                                className="text-slate-400 hover:text-primary transition-colors cursor-pointer"
                                title="Copy ID"
                              >
                                {copiedId === att.registrationNumber ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${getTypeBadge(
                              att.registrationType
                            )}`}
                          >
                            {att.registrationType || "Standard"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          <span className="font-medium">
                            {att.breakoutSessionChoice || "None Selected"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                          {formatDate(att.createdAt)}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedAttendee(att)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-primary hover:text-white text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="max-w-xs mx-auto text-slate-400">
                        <Users className="w-10 h-10 mx-auto stroke-1 mb-2 text-slate-300" />
                        <p className="font-bold text-slate-700 text-sm">No attendees found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredAttendees.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 bg-white border-t border-slate-100 gap-4">
              <div className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-bold text-slate-800">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-bold text-slate-800">
                  {Math.min(currentPage * itemsPerPage, filteredAttendees.length)}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-800">
                  {filteredAttendees.length}
                </span>{" "}
                attendees
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedAttendee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div>
                <span className="text-primary-300 text-xs font-bold uppercase tracking-wider">
                  Attendee Profile
                </span>
                <h3 className="text-xl font-extrabold text-white mt-0.5">
                  {selectedAttendee.firstName} {selectedAttendee.lastName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAttendee(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Registration ID</span>
                  <span className="font-mono text-base font-bold text-slate-900">
                    {selectedAttendee.registrationNumber || "N/A"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Email Address</span>
                  <span className="font-bold text-slate-900 text-sm break-all">
                    {selectedAttendee.email}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Pass Tier</span>
                  <span className="font-bold text-slate-900 uppercase">
                    {selectedAttendee.registrationType}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 font-medium block">Breakout Session</span>
                  <span className="font-bold text-slate-900">
                    {selectedAttendee.breakoutSessionChoice}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedAttendee(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
