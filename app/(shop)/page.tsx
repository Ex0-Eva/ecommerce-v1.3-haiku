import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 opacity-60" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-slate-500 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Next.js E-commerce Platform
            </span>
            <h1 className="mt-6 text-5xl font-bold leading-tight tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
              ร้านค้าออนไลน์
              <br />
              <span style={{ color: "var(--primary)" }}>ที่ใช้งานได้จริง</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              โครงสร้าง App Router พร้อม Auth, Cart, Checkout และ Admin Dashboard — ครบในที่เดียว
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "var(--primary)" }}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                เลือกซื้อสินค้า
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-slate-900">ฟีเจอร์ครบครัน</h2>
          <p className="mt-3 text-slate-500">ทุกอย่างที่ร้านค้าออนไลน์ต้องการ</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: (
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              ),
              title: "ระบบตะกร้าสินค้า",
              desc: "เพิ่ม ลบ ปรับจำนวน พร้อม sync กับ server เมื่อ login",
              href: "/cart",
              color: "text-blue-600 bg-blue-50",
            },
            {
              icon: (
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              ),
              title: "Checkout & Payment",
              desc: "ระบบ checkout พร้อม Stripe integration และ order tracking",
              href: "/checkout",
              color: "text-green-600 bg-green-50",
            },
            {
              icon: (
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              ),
              title: "Live Commerce",
              desc: "ขายสินค้าผ่าน Live stream พร้อมระบบ real-time",
              href: "/live",
              color: "text-red-600 bg-red-50",
            },
            {
              icon: (
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ),
              title: "Auth System",
              desc: "ระบบ login/register พร้อม NextAuth และ session management",
              href: "/login",
              color: "text-purple-600 bg-purple-50",
            },
            {
              icon: (
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              ),
              title: "Digital Products",
              desc: "ขายสินค้าดิจิทัล พร้อมระบบ download หลังชำระเงิน",
              href: "/my-downloads",
              color: "text-amber-600 bg-amber-50",
            },
          ].map((feature) => (
            <a
              key={feature.title}
              href={feature.href}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
            >
              <div className={`inline-flex rounded-xl p-3 ${feature.color}`}>{feature.icon}</div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-primary transition-colors">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{feature.desc}</p>
            </a>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div
          className="relative overflow-hidden rounded-3xl p-10 text-white sm:p-16"
          style={{ backgroundColor: "var(--primary)" }}
        >
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white/5" />
          <div className="relative">
            <h2 className="text-3xl font-bold sm:text-4xl">พร้อมเริ่มต้นแล้วหรือยัง?</h2>
            <p className="mt-4 max-w-xl text-lg opacity-80">
              เข้าสู่ระบบหรือสร้างบัญชีใหม่เพื่อเริ่มช้อปปิ้ง
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="rounded-2xl bg-white px-8 py-3 font-semibold transition hover:bg-slate-100 active:scale-95"
                style={{ color: "var(--primary)" }}
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                className="rounded-2xl border-2 border-white/40 px-8 py-3 font-semibold text-white transition hover:border-white/70 active:scale-95"
              >
                สร้างบัญชีใหม่
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
