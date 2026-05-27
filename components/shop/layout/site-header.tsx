"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useCartStore, selectCartCount } from "@/store/useCartStore";
import { useState } from "react";

export default function SiteHeader() {
  const { data: session } = useSession();
  // selectCartCount เป็น stable selector — re-render เฉพาะเมื่อจำนวนรวมเปลี่ยน
  const cartCount = useCartStore(selectCartCount);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/products", label: "สินค้า" },
    {
      href: "/live",
      label: (
        <span className="flex items-center gap-1.5 font-bold text-red-600">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
          </span>
          LIVE
        </span>
      ),
    },
    { href: "/about", label: "เกี่ยวกับเรา" },
    { href: "/contact", label: "ติดต่อเรา" },
    ...(session?.user ? [{ href: "/my-downloads", label: "My Downloads" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="dynamic-store-name shrink-0 text-xl font-bold tracking-tighter"
          style={{ color: "var(--primary)" }}
        >
          Kiro E-commerce V1.2
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 text-sm text-slate-600 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
            aria-label="ตะกร้าสินค้า"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: "var(--primary)" }}
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* Auth */}
          <div className="hidden items-center gap-2 md:flex">
            {session?.user ? (
              <>
                {(session.user as any).role === "admin" ? (
                  <Link
                    href="/admin/dashboard"
                    className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-200"
                  >
                    {session.user.name}
                  </Link>
                ) : (
                  <span className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700">
                    {session.user.name}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: "var(--primary)" }}
              >
                เข้าสู่ระบบ
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="เมนู"
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-6 pb-4 md:hidden">
          <nav className="flex flex-col gap-1 pt-3 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl px-3 py-2.5 text-slate-700 transition hover:bg-slate-100"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 border-t border-slate-100 pt-3">
              {session?.user ? (
                <div className="flex flex-col gap-2">
                  <span className="px-3 py-2 text-sm text-slate-500">{session.user.name}</span>
                  <button
                    type="button"
                    onClick={() => { signOut(); setMobileOpen(false); }}
                    className="rounded-xl border border-slate-200 px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="block rounded-xl px-3 py-2.5 text-center text-sm font-semibold text-white transition hover:opacity-90"
                  style={{ backgroundColor: "var(--primary)" }}
                  onClick={() => setMobileOpen(false)}
                >
                  เข้าสู่ระบบ
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
