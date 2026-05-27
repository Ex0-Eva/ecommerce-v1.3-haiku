"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type DigitalAsset = {
  orderId: string;
  productId: string;
  name: string;
  licenseKey?: string;
  downloadUrl?: string;
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback สำหรับ browser ที่ไม่รองรับ clipboard API
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`mt-2 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
        copied
          ? "bg-green-100 text-green-700"
          : "bg-slate-200 text-slate-600 hover:bg-slate-300"
      }`}
      aria-label="คัดลอก license key"
    >
      {copied ? (
        <>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          คัดลอกแล้ว
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          คัดลอก
        </>
      )}
    </button>
  );
}

export default function MyDownloadsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [assets, setAssets] = useState<DigitalAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetch("/api/my-downloads")
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setAssets(data);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("ไม่สามารถโหลดข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง");
          setLoading(false);
        });
    }
  }, [status, router]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center text-slate-500">
          <svg className="mx-auto mb-3 h-8 w-8 animate-spin text-slate-300" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          กำลังโหลดข้อมูล...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <span className="text-5xl">⚠️</span>
        <p className="mt-4 text-lg font-semibold text-slate-700">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ backgroundColor: "var(--primary)" }}
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">บัญชีของฉัน</p>
        <h1 className="mt-1 text-4xl font-bold tracking-tight">My Downloads</h1>
        {assets.length > 0 && (
          <p className="mt-1 text-sm text-slate-500">{assets.length} รายการ</p>
        )}
      </div>

      {assets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center shadow-sm">
          <span className="text-5xl">📦</span>
          <p className="mt-4 text-lg font-semibold text-slate-700">คุณยังไม่มีรายการซอฟต์แวร์ที่ซื้อ</p>
          <p className="mt-1 text-sm text-slate-400">สินค้าดิจิทัลที่ซื้อจะปรากฏที่นี่</p>
          <button
            type="button"
            onClick={() => router.push("/products")}
            className="mt-6 rounded-xl px-8 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: "var(--primary)" }}
          >
            เลือกซื้อซอฟต์แวร์
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset, index) => (
            <div
              key={`${asset.orderId}-${index}`}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-bold leading-snug text-slate-900">{asset.name}</h2>
                <span className="shrink-0 rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-purple-700">
                  Digital
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">Order: {asset.orderId}</p>

              {asset.licenseKey && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">License Key</p>
                  <code className="mt-1 block break-all font-mono text-sm font-bold text-blue-600">
                    {asset.licenseKey}
                  </code>
                  <CopyButton text={asset.licenseKey} />
                </div>
              )}

              {asset.downloadUrl && (
                <a
                  href={asset.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Software
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
