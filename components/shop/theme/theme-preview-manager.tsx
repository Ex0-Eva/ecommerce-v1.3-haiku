"use client";

import { useEffect } from "react";

const THEME_PRESETS: Record<string, Record<string, string>> = {
  cyberpunk: {
    "--primary": "#00ff41",
    "--secondary": "#ff00ff",
    "--radius": "0px",
    "--background": "#0a0a0f",
    "--foreground": "#e0ffe0",
  },
  minimal: {
    "--background": "#ffffff",
    "--foreground": "#111827",
    "--radius": "0.5rem",
  },
  warm: {
    "--primary": "#ea580c",
    "--secondary": "#fb923c",
    "--background": "#fffbf7",
    "--foreground": "#1c1917",
    "--radius": "1rem",
  },
};

const ALL_THEME_CLASSES = ["theme-cyberpunk", "theme-minimal", "theme-warm"];

interface ThemePreviewManagerProps {
  /** theme class จาก server (เช่น "theme-cyberpunk") — ใช้ apply บน <html> ทันทีหลัง hydration */
  themeClass?: string;
}

export default function ThemePreviewManager({ themeClass }: ThemePreviewManagerProps) {
  useEffect(() => {
    const root = document.documentElement;

    // Remove all theme classes first
    ALL_THEME_CLASSES.forEach((cls) => root.classList.remove(cls));

    // Apply server-side theme class onto <html> (shop layout ใส่ไว้บน wrapper div แล้ว แต่ theme CSS selector ชี้ที่ html.theme-X)
    if (themeClass) {
      root.classList.add(themeClass);
    }

    // Override with localStorage if available (live preview from admin settings)
    const raw = localStorage.getItem("site_config_fallback");
    if (!raw) return;

    try {
      const config = JSON.parse(raw);
      const theme: string = config.theme_name ?? "modern";

      // Re-apply from localStorage (overrides server value for live preview)
      ALL_THEME_CLASSES.forEach((cls) => root.classList.remove(cls));
      if (theme !== "modern") {
        root.classList.add(`theme-${theme}`);
      }

      // Apply CSS variables — preset overrides DB values for special themes
      const preset = THEME_PRESETS[theme] ?? {};
      const vars: Record<string, string> = {
        "--primary": preset["--primary"] ?? config.primary_color ?? "#0f172a",
        "--secondary": preset["--secondary"] ?? config.secondary_color ?? "#64748b",
        "--radius": preset["--radius"] ?? config.border_radius ?? "1.5rem",
        "--background": preset["--background"] ?? "#f8fafc",
        "--foreground": preset["--foreground"] ?? "#0f172a",
      };

      Object.entries(vars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });

      // Update dynamic store name elements
      if (config.store_name) {
        document.querySelectorAll(".dynamic-store-name").forEach((el) => {
          el.textContent = config.store_name;
        });
        document.title = config.store_name;
      }
    } catch (e) {
      console.error("ThemePreviewManager: failed to parse config", e);
    }
  }, [themeClass]);

  return null;
}
