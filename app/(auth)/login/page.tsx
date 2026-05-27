"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      redirect: false,
      callbackUrl: "/",
      email,
      password,
    });

    setLoading(false);

    if (result?.error || !result?.ok) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      return;
    }

    router.push("/");
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-10 shadow-xl shadow-slate-200">
        <h1 className="text-3xl font-semibold">Login</h1>
        <p className="mt-2 text-slate-600">ลงชื่อเข้าใช้เพื่อเข้าถึงบัญชีและตะกร้าสินค้าของคุณ</p>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
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
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-8 text-sm text-slate-600">
          ยังไม่มีบัญชี? <Link href="/register" className="font-semibold text-slate-900 underline">สร้างบัญชีใหม่</Link>
        </p>
      </div>
    </main>
  );
}
