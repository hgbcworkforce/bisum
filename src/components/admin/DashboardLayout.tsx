"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
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
    { name: "Registrations", href: "/admin/registrations", icon: Users, aliasHref: "/admin/attendees" },
    { name: "Merchandise", href: "/admin/merchandise", icon: ShoppingBag },
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
      {/* Desktop Light Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white text-slate-800 border-r border-slate-200/90 p-6 flex-shrink-0 justify-between">
        <div className="space-y-8">
          {/* Main Logo from /public */}
          <Link href="/admin" className="flex items-center space-x-3 group">
            <Image
              src="/BISUM logo.webp"
              alt="BISUM Conference Logo"
              width={140}
              height={42}
              priority
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.aliasHref && pathname === item.aliasHref);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-xs font-extrabold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4 pt-6 border-t border-slate-200">
          <Link
            href="/"
            className="flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Live Site</span>
          </Link>

          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 w-full py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 text-xs font-bold transition-colors cursor-pointer"
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
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Verified Administrator</span>
            </div>
          </div>
        </header>

        {sidebarOpen && (
          <div className="lg:hidden bg-white text-slate-800 p-6 border-b border-slate-200 space-y-4 shadow-sm">
            <div className="pb-3 border-b border-slate-100">
              <Image
                src="/BISUM logo.webp"
                alt="BISUM Logo"
                width={130}
                height={38}
                className="h-9 w-auto object-contain"
              />
            </div>
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.aliasHref && pathname === item.aliasHref);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold ${
                      isActive
                        ? "bg-blue-600 text-white font-bold"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              <Link href="/" className="text-xs font-semibold text-slate-600">
                Public Site
              </Link>
              <button
                onClick={handleSignOut}
                className="text-xs font-bold text-rose-600 cursor-pointer"
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
