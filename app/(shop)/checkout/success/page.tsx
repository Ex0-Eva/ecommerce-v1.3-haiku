"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  // รองรับทั้ง ?orderId= (fallback) และ ?session_id= (จาก Stripe)
  const orderId = searchParams.get("orderId");
  const sessionId = searchParams.get("session_id");

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-10">
      <div className="mx-auto max-w-lg w-full rounded-3xl bg-white p-10 shadow-xl shadow-slate-200 text-center">
        {/* Success icon */}
        <div
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: "color-mix(in srgb, var(--primary) 12%, transparent)" }}
        >
          <svg
            className="h-10 w-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            style={{ color: "var(--primary)" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="mt-6 text-3xl font-bold text-slate-900">ชำระเงินสำเร็จ</h1>
        <p className="mt-3 text-slate-500">
          ขอบคุณสำหรับการสั่งซื้อ เราได้รับการชำระเงินของคุณแล้ว
        </p>

        {/* Reference */}
        {(orderId || sessionId) && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-left">
            {orderId && (
              <div className="mb-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  หมายเลขคำสั่งซื้อ
                </p>
                <p className="mt-0.5 font-mono text-sm font-semibold text-slate-700 break-all">
                  {orderId}
                </p>
              </div>
            )}
            {sessionId && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Stripe Session
                </p>
                <p className="mt-0.5 font-mono text-xs text-slate-500 break-all">
                  {sessionId}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Note */}
        <p className="mt-6 text-sm text-slate-400">
          หากสินค้าเป็น Digital Product สามารถดาวน์โหลดได้ที่หน้า My Downloads
          <br />
          (อาจใช้เวลาสักครู่ในการประมวลผล)
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/my-downloads"
            className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            My Downloads
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            ช้อปต่อ
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700" />
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
