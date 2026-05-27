"use client";

import { useState, useEffect, useCallback } from "react";
import { updateSiteConfig, defaultSettings, type SiteConfig } from "@/lib/siteConfig";

// Theme presets — ตรงกับ ThemePreviewManager
const THEME_PRESETS: Record<string, Partial<SiteConfig>> = {
  modern:   { primary_color: "#0f172a", secondary_color: "#64748b", border_radius: "1.5rem" },
  minimal:  { primary_color: "#111827", secondary_color: "#6b7280", border_radius: "0.5rem" },
  warm:     { primary_color: "#ea580c", secondary_color: "#fb923c", border_radius: "1rem" },
  cyberpunk:{ primary_color: "#00ff41", secondary_color: "#ff00ff", border_radius: "0px" },
};

const ALL_THEME_CLASSES = ["theme-cyberpunk", "theme-minimal", "theme-warm"];

function applyThemeToDOM(config: SiteConfig) {
  const theme = config.theme_name ?? "modern";
  const root = document.documentElement;

  // swap class
  ALL_THEME_CLASSES.forEach((c) => { root.classList.remove(c); document.body.classList.remove(c); });
  if (theme !== "modern") {
    root.classList.add(`theme-${theme}`);
    document.body.classList.add(`theme-${theme}`);
  }

  // CSS vars
  root.style.setProperty("--primary", config.primary_color);
  root.style.setProperty("--secondary", config.secondary_color);
  root.style.setProperty("--radius", config.border_radius);

  // store name
  if (config.store_name) {
    document.querySelectorAll(".dynamic-store-name").forEach((el) => {
      el.textContent = config.store_name!;
    });
    document.title = config.store_name;
  }
}

const inputClass = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100";
const labelClass = "block text-sm font-medium text-slate-600";

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<SiteConfig>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  // โหลดจาก DB เสมอ (ไม่ใช้ localStorage เป็น source of truth)
  useEffect(() => {
    fetch("/api/site-config")
      .then((r) => r.json())
      .then((data) => {
        setConfig({ ...defaultSettings, ...data });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // เมื่อ theme_name เปลี่ยน → auto-fill preset colors
  const handleThemeChange = useCallback((themeName: string) => {
    const preset = THEME_PRESETS[themeName] ?? {};
    setConfig((prev) => ({ ...prev, theme_name: themeName, ...preset }));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    // Apply ทันทีก่อน save (ไม่ต้อง reload)
    applyThemeToDOM(config);
    // เก็บ localStorage ด้วยเพื่อให้ ThemePreviewManager ใช้หลัง hard reload
    localStorage.setItem("site_config_fallback", JSON.stringify(config));

    const result = await updateSiteConfig(config);
    setSaving(false);

    if (result.success) {
      setMessage({ text: "✅ บันทึกเรียบร้อยแล้ว", ok: true });
    } else {
      setMessage({ text: "⚠️ บันทึกลง DB ไม่สำเร็จ แต่ theme ถูก apply แล้ว (localStorage)", ok: false });
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-slate-400">กำลังโหลดการตั้งค่า...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">Store Settings</h1>
        <p className="mt-1 text-sm text-slate-500">ปรับแต่งธีม สี และข้อมูลร้านค้า — เปลี่ยนแปลงมีผลทันที</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid gap-5 lg:grid-cols-2">

          {/* ── Theme Engine ── */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
            <h2 className="font-semibold text-slate-800">🎨 Theme Engine</h2>

            {/* Theme selector with visual cards */}
            <div>
              <label className={labelClass}>เลือก Template</label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {[
                  { value: "modern",   label: "Modern",    bg: "#f8fafc", accent: "#0f172a", desc: "Clean & Professional" },
                  { value: "minimal",  label: "Minimal",   bg: "#ffffff", accent: "#111827", desc: "Zen White" },
                  { value: "warm",     label: "Warm",      bg: "#fffbf7", accent: "#ea580c", desc: "Cozy Orange" },
                  { value: "cyberpunk",label: "Cyberpunk", bg: "#0a0a0f", accent: "#00ff41", desc: "Neon Night" },
                ].map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => handleThemeChange(t.value)}
                    className={`relative rounded-xl border-2 p-3 text-left transition ${
                      config.theme_name === t.value
                        ? "border-slate-900 shadow-md"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                    style={{ backgroundColor: t.bg }}
                  >
                    {config.theme_name === t.value && (
                      <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] text-white">✓</span>
                    )}
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-4 w-4 rounded-full" style={{ backgroundColor: t.accent }} />
                      <span className="text-xs font-bold" style={{ color: t.accent === "#0a0a0f" ? "#fff" : t.accent === "#00ff41" ? "#00ff41" : "#1c1917" }}>
                        {t.label}
                      </span>
                    </div>
                    <p className="text-[10px]" style={{ color: t.bg === "#0a0a0f" ? "#666" : "#9ca3af" }}>{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Primary color */}
            <div>
              <label className={labelClass}>Primary Color</label>
              <div className="mt-1 flex gap-2">
                <input
                  type="color"
                  value={config.primary_color}
                  onChange={(e) => setConfig((p) => ({ ...p, primary_color: e.target.value }))}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-slate-200 p-1"
                />
                <input
                  type="text"
                  value={config.primary_color}
                  onChange={(e) => setConfig((p) => ({ ...p, primary_color: e.target.value }))}
                  className={inputClass + " flex-1"}
                  placeholder="#0f172a"
                />
              </div>
            </div>

            {/* Border radius */}
            <div>
              <label className={labelClass}>Border Radius</label>
              <div className="mt-1 grid grid-cols-4 gap-2">
                {[
                  { value: "0px",    label: "Square" },
                  { value: "0.5rem", label: "Soft" },
                  { value: "1.5rem", label: "Round" },
                  { value: "9999px", label: "Pill" },
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setConfig((p) => ({ ...p, border_radius: r.value }))}
                    className={`rounded-lg border py-2 text-xs font-medium transition ${
                      config.border_radius === r.value
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Store Identity ── */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
            <h2 className="font-semibold text-slate-800">🏢 Store Identity</h2>
            <div>
              <label className={labelClass}>ชื่อร้านค้า</label>
              <input name="store_name" value={config.store_name ?? ""} onChange={(e) => setConfig((p) => ({ ...p, store_name: e.target.value }))} className={inputClass} placeholder="Next E-commerce" />
            </div>
            <div>
              <label className={labelClass}>Logo URL</label>
              <input name="logo_url" value={config.logo_url ?? ""} onChange={(e) => setConfig((p) => ({ ...p, logo_url: e.target.value }))} className={inputClass} placeholder="https://..." />
            </div>
          </div>

          {/* ── Payment ── */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
            <h2 className="font-semibold text-slate-800">💳 ข้อมูลการชำระเงิน</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>ธนาคาร</label>
                <select value={config.bank_name ?? ""} onChange={(e) => setConfig((p) => ({ ...p, bank_name: e.target.value }))} className={inputClass}>
                  <option value="">-- เลือกธนาคาร --</option>
                  <option value="kbank">กสิกรไทย (KBank)</option>
                  <option value="scb">ไทยพาณิชย์ (SCB)</option>
                  <option value="bbl">กรุงเทพ (BBL)</option>
                  <option value="ktb">กรุงไทย (KTB)</option>
                  <option value="krungsri">กรุงศรี (Krungsri)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>ชื่อบัญชี</label>
                <input value={config.account_name ?? ""} onChange={(e) => setConfig((p) => ({ ...p, account_name: e.target.value }))} className={inputClass} placeholder="ชื่อ นามสกุล" />
              </div>
              <div>
                <label className={labelClass}>เลขที่บัญชี</label>
                <input value={config.account_number ?? ""} onChange={(e) => setConfig((p) => ({ ...p, account_number: e.target.value }))} className={inputClass} placeholder="xxx-x-xxxxx-x" />
              </div>
              <div>
                <label className={labelClass}>PromptPay</label>
                <input value={config.promptpay_number ?? ""} onChange={(e) => setConfig((p) => ({ ...p, promptpay_number: e.target.value }))} className={inputClass} placeholder="เบอร์ / บัตรประชาชน" />
              </div>
            </div>
            <div>
              <label className={labelClass}>QR Code URL</label>
              <div className="flex gap-3">
                <input value={config.qr_code_url ?? ""} onChange={(e) => setConfig((p) => ({ ...p, qr_code_url: e.target.value }))} className={inputClass + " flex-1"} placeholder="https://..." />
                {config.qr_code_url && (
                  <img src={config.qr_code_url} alt="QR" className="h-10 w-10 rounded-lg border border-slate-200 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                )}
              </div>
            </div>
          </div>

          {/* ── Social Media ── */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
            <h2 className="font-semibold text-slate-800">🌐 Social Media</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: "facebook_url",  label: "Facebook",  placeholder: "https://facebook.com/..." },
                { key: "twitter_url",   label: "Twitter/X", placeholder: "https://twitter.com/..." },
                { key: "instagram_url", label: "Instagram", placeholder: "https://instagram.com/..." },
                { key: "line_url",      label: "LINE",      placeholder: "https://line.me/..." },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className={labelClass}>{label}</label>
                  <input
                    value={(config as any)[key] ?? ""}
                    onChange={(e) => setConfig((p) => ({ ...p, [key]: e.target.value }))}
                    className={inputClass}
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Save bar */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4">
          {message ? (
            <p className={`text-sm font-medium ${message.ok ? "text-green-600" : "text-amber-600"}`}>
              {message.text}
            </p>
          ) : (
            <p className="text-sm text-slate-400">การเปลี่ยนแปลงจะมีผลทันทีหลังบันทึก</p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl px-8 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: config.primary_color || "#0f172a" }}
          >
            {saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
          </button>
        </div>
      </form>
    </div>
  );
}
