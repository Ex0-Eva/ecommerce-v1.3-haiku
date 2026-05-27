import type { Metadata } from "next";
import SiteHeader from "@/components/shop/layout/site-header";
import SiteFooter from "@/components/shop/layout/site-footer";
import ThemePreviewManager from "@/components/shop/theme/theme-preview-manager";
import { getSiteConfig } from "@/lib/siteConfig";

export const dynamic = "force-dynamic";
import "@/styles/themes/cyberpunk.css";
import "@/styles/themes/minimal.css";
import "@/styles/themes/warm.css";

const THEME_VARS: Record<string, Record<string, string>> = {
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

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: config.store_name || "Next E-commerce",
    description: "Next.js 16.2.6 App Router ecommerce architecture",
  };
}

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getSiteConfig();
  const theme = config.theme_name ?? "modern";

  // Build CSS variables — theme presets override DB values for special themes
  const themeOverrides = THEME_VARS[theme] ?? {};
  const cssVars = {
    "--primary": themeOverrides["--primary"] ?? config.primary_color ?? "#0f172a",
    "--secondary": themeOverrides["--secondary"] ?? config.secondary_color ?? "#64748b",
    "--radius": themeOverrides["--radius"] ?? config.border_radius ?? "1.5rem",
    "--background": themeOverrides["--background"] ?? "#f8fafc",
    "--foreground": themeOverrides["--foreground"] ?? "#0f172a",
  };

  const cssVarString = Object.entries(cssVars)
    .map(([k, v]) => `${k}: ${v};`)
    .join(" ");

  const themeClass = theme !== "modern" ? `theme-${theme}` : "";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `:root { ${cssVarString} }` }} />
      {/* Apply theme class to html element client-side via ThemePreviewManager */}
      <ThemePreviewManager themeClass={themeClass} />
      <div className={`min-h-screen flex flex-col bg-slate-50 text-slate-900 ${themeClass}`}>
        <SiteHeader />
        <main className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
