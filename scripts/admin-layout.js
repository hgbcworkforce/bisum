const fs = require("fs");

const dashboardLayoutCode = `"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  Users,
  X,
  LogOut,
  Menu,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [adminProfile, setAdminProfile] = useState(null);

  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/admin/signin");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: adminData } = await supabase
          .from("admin_users")
          .select("*")
          .eq("user_id", user.id)
          .single();
        setAdminProfile(adminData);
      }
    };
    getProfile();
  }, [router]);

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "Attendees",
      href: "/admin/attendees",
      icon: <Users className="w-5 h-5" />,
    },
    {
      name: "Payments",
      href: "/admin/payments",
      icon: <CreditCard className="w-5 h-5" />,
    },
  ];

  const isActive = (href) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/signin");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={\`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col justify-between \${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }\`}
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-xs">
                <img
                  src="https://media.hgbcinfluencers.org/bisum/BISUM logo.png"
                  alt="BISUM Logo"
                  className="w-7 h-7 object-contain"
                />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-white leading-none">
                  BISUM
                </span>
                <span className="block text-[10px] font-bold text-primary-300 tracking-wider uppercase">
                  Admin Panel
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="px-4 py-6 space-y-1.5">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Management
            </span>
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={\`flex items-center px-4 py-3 text-xs sm:text-sm font-bold rounded-xl transition-colors \${
                    active
                      ? "bg-primary text-white shadow-xs"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }\`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* User & Live Website Links */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 rounded-xl transition-colors"
          >
            <span>View Public Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-black text-xs flex-shrink-0">
                {adminProfile?.full_name?.charAt(0) || "A"}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate max-w-[120px]">
                  {adminProfile?.full_name || "Admin"}
                </p>
                <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                  {adminProfile?.email || "admin@bisum.org"}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content View */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Top Header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-700 hover:text-slate-900"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-sm font-black text-slate-900">BISUM Admin</span>
          <div className="w-6" />
        </div>

        {/* Content Body */}
        <main className="flex-1 p-6 sm:p-10 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
`;
fs.writeFileSync("D:/bisum/src/components/admin/DashboardLayout.jsx", dashboardLayoutCode, "utf8");
console.log("DashboardLayout updated");
