"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    const key = searchParams.get("admin_key");
    if (key === "admin2026") {
      setIsAdminMode(true);
      setRole("admin");
    }
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "เกิดข้อผิดพลาดในการลงทะเบียน");
      return;
    }

    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-10 shadow-xl shadow-slate-200">
        <h1 className="text-3xl font-semibold">Register</h1>
        <p className="mt-2 text-slate-600">สร้างบัญชีใหม่เพื่อเก็บตะกร้าและดูประวัติคำสั่งซื้อ</p>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Name
              <input
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
              />
            </label>

            {isAdminMode && (
              <label className="block text-sm font-medium text-amber-700">
                Role
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value as "user" | "admin")}
                  className="mt-2 w-full rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 outline-none transition focus:border-amber-900"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            )}
          </div>

          {message ? <p className="text-sm text-red-600">{message}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-8 text-sm text-slate-600">
          มีบัญชีอยู่แล้ว? <Link href="/login" className="font-semibold text-slate-900 underline">เข้าสู่ระบบ</Link>
        </p>
      </div>
    </main>
  );
}
