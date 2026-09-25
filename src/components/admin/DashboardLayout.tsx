"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  LogOut,
  Menu,
  X,
  Shield,
  ArrowLeft,
} from "lucide-react";

export interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: "Dashboard Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Attendee Directory", href: "/admin/attendees", icon: Users },
    { name: "Payment Transactions", href: "/admin/payments", icon: CreditCard },
  ];

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/admin/signin");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-950 text-white border-r border-slate-800 p-6 flex-shrink-0 justify-between">
        <div className="space-y-8">
          <Link href="/admin" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black text-lg">
              B
            </div>
            <div>
              <span className="font-extrabold text-base text-white tracking-tight">
                BISUM ADMIN
              </span>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Control Center
              </span>
            </div>
          </Link>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-xs"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4 pt-6 border-t border-slate-800">
          <Link
            href="/"
            className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Live Site</span>
          </Link>

          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-rose-400 text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 hidden sm:inline">
              BISUM Conference Management Platform
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span>Verified Administrator</span>
            </div>
          </div>
        </header>

        {sidebarOpen && (
          <div className="lg:hidden bg-slate-950 text-white p-6 border-b border-slate-800 space-y-4">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-900"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
            <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
              <Link href="/" className="text-xs font-semibold text-slate-400">
                Public Site
              </Link>
              <button
                onClick={handleSignOut}
                className="text-xs font-bold text-rose-400 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        <main className="p-4 sm:p-6 lg:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
