"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { merchandiseAPI, adminAPI, handleApiError, formatCurrency } from "@/services/supabaseService";
import { MerchandiseOrder } from "@/types";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  Search,
  FileSpreadsheet,
  FileText,
  ShoppingBag,
  Package,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Mail,
  MapPin,
  TrendingUp,
} from "lucide-react";

export default function AdminMerchandisePage() {
  const router = useRouter();
  const [orders, setOrders] = useState<MerchandiseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [fulfillmentFilter, setFulfillmentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [isExporting, setIsExporting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<MerchandiseOrder | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [resendingEmailId, setResendingEmailId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<{ id: string; msg: string; isError?: boolean } | null>(null);

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

  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const result = await merchandiseAPI.getAll({ limit: 2000 });
      if (result.success && result.data) {
        setOrders(result.data);
      } else {
        throw new Error(result.message || "Failed to load merchandise orders");
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
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateFulfillment = async (orderId: string, newStatus: 'unfulfilled' | 'ready' | 'picked_up') => {
    setUpdatingId(orderId);
    setActionNotice(null);
    try {
      // 1. Try backend API
      const res = await adminAPI.updateMerchandiseOrder(orderId, { fulfillmentStatus: newStatus });
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, fulfillmentStatus: newStatus } : o))
        );
        setActionNotice({ id: orderId, msg: `Order marked as ${newStatus.replace('_', ' ')}` });
      } else {
        // Fallback Supabase direct update
        const { error: sbErr } = await supabase
          .from("merchandise_orders")
          .update({ fulfillment_status: newStatus, updated_at: new Date().toISOString() })
          .eq("id", orderId);

        if (sbErr) throw sbErr;
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, fulfillmentStatus: newStatus } : o))
        );
        setActionNotice({ id: orderId, msg: `Order marked as ${newStatus.replace('_', ' ')}` });
      }
    } catch (err: any) {
      setActionNotice({ id: orderId, msg: err.message || "Failed to update status", isError: true });
    } finally {
      setUpdatingId(null);
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const handleResendEmail = async (order: MerchandiseOrder) => {
    if (!order.id) return;
    setResendingEmailId(order.id);
    setActionNotice(null);
    try {
      const res = await adminAPI.resendMerchandiseEmail(order.id);
      if (res.success) {
        setActionNotice({ id: order.id, msg: "Receipt & pickup email resent successfully!" });
      } else {
        setActionNotice({ id: order.id, msg: res.message || "Failed to send email", isError: true });
      }
    } catch (err: any) {
      setActionNotice({ id: order.id, msg: err.message || "Failed to send email", isError: true });
    } finally {
      setResendingEmailId(null);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const matchesSearch =
          searchTerm === "" ||
          (order.orderNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.customerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.customerEmail || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.customerPhone || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.itemName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.paymentReference || "").toLowerCase().includes(searchTerm.toLowerCase());

        const orderPayStatus = (order.paymentStatus || "").toLowerCase();
        let matchesPayment = true;
        if (paymentFilter === "paid") {
          matchesPayment = orderPayStatus === "paid" || orderPayStatus === "success";
        } else if (paymentFilter === "pending") {
          matchesPayment = orderPayStatus === "pending";
        } else if (paymentFilter === "failed") {
          matchesPayment = orderPayStatus === "failed";
        }

        const orderFulfillStatus = (order.fulfillmentStatus || "unfulfilled").toLowerCase();
        let matchesFulfillment = true;
        if (fulfillmentFilter !== "all") {
          matchesFulfillment = orderFulfillStatus === fulfillmentFilter.toLowerCase();
        }

        return matchesSearch && matchesPayment && matchesFulfillment;
      })
      .sort((a, b) => {
        if (sortBy === "date-desc") {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        if (sortBy === "date-asc") {
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        }
        if (sortBy === "amount-desc") {
          return (Number(b.totalAmount) || 0) - (Number(a.totalAmount) || 0);
        }
        if (sortBy === "name-asc") {
          return (a.customerName || "").localeCompare(b.customerName || "");
        }
        return 0;
      });
  }, [orders, searchTerm, paymentFilter, fulfillmentFilter, sortBy]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, paymentFilter, fulfillmentFilter, sortBy]);

  const handleCopy = (orderNum: string) => {
    navigator.clipboard.writeText(orderNum);
    setCopiedId(orderNum);
    setTimeout(() => setCopiedId(null), 2000);
  };

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

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return;
    setIsExporting(true);

    const headers = [
      "S/N",
      "Order Number",
      "Customer Name",
      "Email",
      "Phone",
      "Item Name",
      "Color",
      "Size",
      "Qty",
      "Unit Price (NGN)",
      "Total Amount (NGN)",
      "Payment Status",
      "Fulfillment Status",
      "Pickup Option",
      "Order Date",
    ];

    const rows = filteredOrders.map((ord, idx) => [
      idx + 1,
      ord.orderNumber || "N/A",
      ord.customerName || "",
      ord.customerEmail || "",
      ord.customerPhone || "N/A",
      ord.itemName || "",
      ord.color || "",
      ord.size || "",
      ord.quantity || 1,
      ord.unitPrice || 0,
      ord.totalAmount || 0,
      (ord.paymentStatus || "pending").toUpperCase(),
      (ord.fulfillmentStatus || "unfulfilled").toUpperCase(),
      ord.pickupOption || "On-site Conference Pickup",
      ord.createdAt ? new Date(ord.createdAt).toISOString() : "N/A",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BISUM_Merchandise_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsExporting(false);
  };

  const handleExportPDF = () => {
    if (filteredOrders.length === 0) return;
    setIsExporting(true);

    try {
      const doc = new jsPDF("landscape") as any;

      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text("BISUM Conference 2025 - Merchandise Orders", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Generated on: ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })} | Total Orders: ${filteredOrders.length}`,
        14,
        28
      );

      const tableData = filteredOrders.map((ord, idx) => [
        idx + 1,
        ord.orderNumber || "N/A",
        ord.customerName || "",
        `${ord.itemName || ""} (${ord.color}, ${ord.size}, Qty: ${ord.quantity})`,
        formatCurrency(Number(ord.totalAmount) || 0),
        (ord.paymentStatus || "pending").toUpperCase(),
        (ord.fulfillmentStatus || "unfulfilled").toUpperCase(),
        formatDate(ord.createdAt),
      ]);

      if (typeof doc.autoTable === "function") {
        doc.autoTable({
          startY: 34,
          head: [["#", "Order #", "Customer", "Item Specs", "Total", "Payment", "Fulfillment", "Date"]],
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

      doc.save(`BISUM_Merchandise_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (err) {
      console.error("PDF export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const stats = useMemo(() => {
    const total = orders.length;
    const paid = orders.filter((o) => (o.paymentStatus || "").toLowerCase() === "paid" || (o.paymentStatus || "").toLowerCase() === "success").length;
    const fulfilled = orders.filter((o) => (o.fulfillmentStatus || "").toLowerCase() === "picked_up" || (o.fulfillmentStatus || "").toLowerCase() === "ready").length;
    const totalRevenue = orders
      .filter((o) => (o.paymentStatus || "").toLowerCase() === "paid" || (o.paymentStatus || "").toLowerCase() === "success")
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    return { total, paid, fulfilled, totalRevenue };
  }, [orders]);

  const getFulfillmentBadge = (status?: string) => {
    const s = (status || "unfulfilled").toLowerCase();
    if (s === "picked_up") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (s === "ready") {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Merchandise Orders
              </h1>
              <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                {orders.length} Total
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Track store pre-orders, manage pickup status, and audit merchandise sales.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Orders"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={isExporting || orders.length === 0}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleExportPDF}
              disabled={isExporting || orders.length === 0}
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
                Total Orders
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">{stats.total}</div>
            <span className="text-xs text-slate-400 mt-0.5 block">Store pre-orders</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Paid & Confirmed
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">{stats.paid}</div>
            <span className="text-xs text-slate-400 mt-0.5 block">Payment verified</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Ready / Picked Up
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">{stats.fulfilled}</div>
            <span className="text-xs text-slate-400 mt-0.5 block">Onsite fulfilled</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Merchandise Revenue
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                ₦
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <span className="text-xs text-emerald-600 font-bold mt-0.5 flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Gross item sales</span>
            </span>
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
                placeholder="Search order #, customer name, email, item, phone..."
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
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors cursor-pointer"
              >
                <option value="all">All Payment Statuses</option>
                <option value="paid">Paid & Verified</option>
                <option value="pending">Pending Payment</option>
                <option value="failed">Failed / Abandoned</option>
              </select>
            </div>

            <div className="md:col-span-4">
              <select
                value={fulfillmentFilter}
                onChange={(e) => setFulfillmentFilter(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors cursor-pointer"
              >
                <option value="all">All Fulfillment Statuses</option>
                <option value="unfulfilled">Unfulfilled (Awaiting Pickup)</option>
                <option value="ready">Ready for Pickup</option>
                <option value="picked_up">Picked Up (Complete)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-900">{filteredOrders.length}</strong> matching orders
            </span>
            <div className="flex items-center space-x-2">
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 border-0 focus:ring-0 cursor-pointer p-0"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="amount-desc">Highest Amount</option>
                <option value="name-asc">Customer Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-slate-200 border-t-blue-600 mx-auto mb-4" />
              <p className="text-sm font-semibold text-slate-500">Loading merchandise orders...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-rose-600 text-sm">
              {error}
              <div className="mt-4">
                <button
                  onClick={() => fetchOrders()}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : paginatedOrders.length === 0 ? (
            <div className="p-16 text-center">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No merchandise orders found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No orders matched your search criteria or filter options.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Order #</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Item & Specs</th>
                    <th className="py-3.5 px-4">Total</th>
                    <th className="py-3.5 px-4">Payment</th>
                    <th className="py-3.5 px-4">Fulfillment</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedOrders.map((order) => {
                    const isCopied = copiedId === order.orderNumber;
                    const isPaid = (order.paymentStatus || "").toLowerCase() === "paid" || (order.paymentStatus || "").toLowerCase() === "success";
                    return (
                      <tr key={order.id || order.orderNumber} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                          <div className="flex items-center space-x-1.5">
                            <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-800 text-[11px] font-black">
                              {order.orderNumber || "BISUM-MERCH"}
                            </span>
                            {order.orderNumber && (
                              <button
                                onClick={() => handleCopy(order.orderNumber!)}
                                className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                                title="Copy Order #"
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
                          <div className="font-bold text-slate-900">{order.customerName}</div>
                          <div className="text-[11px] text-slate-500">{order.customerEmail}</div>
                          <div className="text-[10px] text-slate-400">{order.customerPhone}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{order.itemName}</div>
                          <div className="text-[11px] text-slate-500">
                            Color: <strong className="text-slate-700">{order.color}</strong> • Size:{" "}
                            <strong className="text-slate-700">{order.size}</strong> • Qty:{" "}
                            <strong className="text-slate-700">{order.quantity}</strong>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {formatCurrency(Number(order.totalAmount) || 0)}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              isPaid
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {isPaid ? "Paid" : "Pending"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <select
                            value={order.fulfillmentStatus || "unfulfilled"}
                            disabled={updatingId === order.id}
                            onChange={(e) =>
                              order.id &&
                              handleUpdateFulfillment(
                                order.id,
                                e.target.value as "unfulfilled" | "ready" | "picked_up"
                              )
                            }
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide border cursor-pointer focus:outline-none ${getFulfillmentBadge(
                              order.fulfillmentStatus
                            )}`}
                          >
                            <option value="unfulfilled">Unfulfilled</option>
                            <option value="ready">Ready for Pickup</option>
                            <option value="picked_up">Picked Up</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                              title="View Order Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleResendEmail(order)}
                              disabled={resendingEmailId === order.id}
                              className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer disabled:opacity-50"
                              title="Resend Receipt Email"
                            >
                              <Mail
                                className={`w-3.5 h-3.5 ${
                                  resendingEmailId === order.id ? "animate-pulse" : ""
                                }`}
                              />
                            </button>
                          </div>
                          {actionNotice && actionNotice.id === order.id && (
                            <p
                              className={`text-[10px] mt-1 ${
                                actionNotice.isError ? "text-rose-600" : "text-emerald-600"
                              }`}
                            >
                              {actionNotice.msg}
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
          {filteredOrders.length > itemsPerPage && (
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

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => setSelectedOrder(null)}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    Order {selectedOrder.orderNumber}
                  </h3>
                  <p className="text-xs text-slate-400">Merchandise Pre-order Details</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">
                      Total Charged
                    </span>
                    <span className="font-mono text-xl font-black text-slate-900">
                      {formatCurrency(Number(selectedOrder.totalAmount) || 0)}
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] border ${getFulfillmentBadge(
                      selectedOrder.fulfillmentStatus
                    )}`}
                  >
                    {(selectedOrder.fulfillmentStatus || "unfulfilled").replace('_', ' ')}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white space-y-1">
                  <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">
                    Item Specifications
                  </span>
                  <div className="text-sm font-bold text-slate-900">{selectedOrder.itemName}</div>
                  <div className="text-slate-600">
                    Color: <strong className="text-slate-800">{selectedOrder.color}</strong> | Size:{" "}
                    <strong className="text-slate-800">{selectedOrder.size}</strong> | Qty:{" "}
                    <strong className="text-slate-800">{selectedOrder.quantity}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white">
                    <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">
                      Customer Name
                    </span>
                    <span className="font-semibold text-slate-900">{selectedOrder.customerName}</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white">
                    <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">
                      Phone Number
                    </span>
                    <span className="font-semibold text-slate-900">{selectedOrder.customerPhone || "N/A"}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white">
                  <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">
                    Pickup Location
                  </span>
                  <div className="flex items-center space-x-1.5 text-slate-800 font-semibold mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>{selectedOrder.pickupOption || "On-site Conference Pickup"}</span>
                  </div>
                </div>

                {selectedOrder.paymentReference && (
                  <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white">
                    <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">
                      Payment Reference
                    </span>
                    <span className="font-mono text-slate-800 font-semibold">{selectedOrder.paymentReference}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex space-x-3">
                <button
                  onClick={() => handleResendEmail(selectedOrder)}
                  disabled={resendingEmailId === selectedOrder.id}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Resend Confirmation Email</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
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
