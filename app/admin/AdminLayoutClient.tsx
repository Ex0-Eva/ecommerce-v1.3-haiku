"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Session } from "next-auth";
import "@/styles/admin.css";

const navItems = [
  { href: "/admin/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/admin/products", icon: "📦", label: "Products" },
  { href: "/admin/orders", icon: "🧾", label: "Orders" },
  { href: "/admin/customers", icon: "👥", label: "Customers" },
  { href: "/admin/live", icon: "🎥", label: "Live Commerce", highlight: true },
  { href: "/admin/pages", icon: "📝", label: "Pages Content" },
  { href: "/admin/settings", icon: "⚙️", label: "Settings" },
];

function Sidebar({ session, onClose }: { session: Session; onClose?: () => void }) {
  const pathname = usePathname();
  const userName = (session.user as any)?.name || session.user?.email || "Admin";
  const role = (session.user as any)?.role || "admin";

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{userName}</p>
          <p className="text-xs text-slate-400 capitalize">{role}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          เมนูหลัก
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : item.highlight
                  ? "text-red-600 hover:bg-red-50"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className="w-5 text-center text-base leading-none">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.highlight && !isActive && (
                <span className="h-2 w-2 rounded-full bg-red-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 px-3 py-3 space-y-0.5">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          ลิงก์ด่วน
        </p>
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <span className="w-5 text-center text-base leading-none">🏪</span>
          กลับไปหน้าร้านค้า
        </Link>
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-red-50 hover:text-red-600"
        >
          <span className="w-5 text-center text-base leading-none">🚪</span>
          ออกจากระบบ
        </Link>
      </div>
    </div>
  );
}

export default function AdminLayoutClient({
  children,
  session,
}: {
  children: ReactNode;
  session: Session;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // หา label ของหน้าปัจจุบัน
  const currentPage = navItems.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  return (
    <div className="min-h-screen bg-slate-50 admin-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 shadow-xl transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar session={session} onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md">
          {/* Hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="เปิดเมนู"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Page title */}
          {currentPage && (
            <div className="flex items-center gap-2">
              <span className="text-base">{currentPage.icon}</span>
              <span className="text-sm font-semibold text-slate-700">{currentPage.label}</span>
            </div>
          )}

          <div className="flex-1" />

          {/* Back to store button */}
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <span>🏪</span>
            <span className="hidden sm:inline">หน้าร้านค้า</span>
          </Link>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
