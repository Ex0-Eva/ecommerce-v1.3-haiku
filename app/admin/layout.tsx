import type { ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

export const metadata = {
  title: "Admin Dashboard",
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error("NextAuth getServerSession failed:", error);

    const isJWTError =
      typeof error === "object" &&
      error !== null &&
      ("name" in error ? (error as any).name === "JWEDecryptionFailed" : false);

    if (isJWTError) {
      const cookieStore = await cookies();
      [
        "next-auth.session-token",
        "__Secure-next-auth.session-token",
        "next-auth.csrf-token",
        "__Secure-next-auth.csrf-token",
        "next-auth.callback-url",
      ].forEach((name) => cookieStore.delete(name));
    }
  }

  // ไม่ได้ login → ไปหน้า login
  if (!session) {
    redirect("/login");
  }

  // login แล้วแต่ไม่ใช่ admin → กลับหน้าแรก
  if ((session.user as any)?.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:flex-row lg:gap-8">
        <aside className="mb-6 w-full rounded-3xl bg-white p-6 shadow-lg lg:mb-0 lg:w-80">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Admin</h2>
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
              {(session.user as any)?.name || session.user?.email}
            </span>
          </div>
          <nav className="mt-6 space-y-1 text-sm text-slate-700">
            <Link className="block rounded-2xl px-4 py-3 transition hover:bg-slate-100" href="/admin/dashboard">
              📊 Dashboard
            </Link>
            <Link className="block rounded-2xl px-4 py-3 transition hover:bg-slate-100" href="/admin/products">
              📦 Products
            </Link>
            <Link className="block rounded-2xl px-4 py-3 font-bold text-red-600 transition hover:bg-red-50" href="/admin/live">
              🎥 Live Commerce
            </Link>
            <Link className="block rounded-2xl px-4 py-3 transition hover:bg-slate-100" href="/admin/orders">
              🧾 Orders
            </Link>
            <Link className="block rounded-2xl px-4 py-3 transition hover:bg-slate-100" href="/admin/customers">
              👥 Customers
            </Link>
            <Link className="block rounded-2xl px-4 py-3 transition hover:bg-slate-100" href="/admin/pages">
              📝 Pages Content
            </Link>
            <Link className="block rounded-2xl px-4 py-3 transition hover:bg-slate-100" href="/admin/settings">
              ⚙️ Settings
            </Link>
          </nav>
        </aside>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
