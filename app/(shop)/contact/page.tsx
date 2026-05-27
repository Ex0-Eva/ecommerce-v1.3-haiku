import { Metadata } from "next";
import { getSiteConfig } from "@/lib/siteConfig";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: `ติดต่อเรา | ${config.store_name || "Next E-commerce"}`,
    description: "ช่องทางการติดต่อสอบถามข้อมูลต่างๆ",
  };
}

export default async function ContactPage() {
  const config = await getSiteConfig();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl" style={{ color: 'var(--primary)' }}>
          ติดต่อเรา
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          ช่องทางการติดต่อ <span className="dynamic-store-name">{config.store_name || "Next E-commerce"}</span>
        </p>
      </div>

      <div 
        className="rounded-custom border border-slate-200 bg-white p-8 shadow-sm sm:p-12 prose max-w-none text-slate-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: config.contact_content || "ยังไม่มีข้อมูลติดต่อเรา" }}
      />
    </div>
  );
}
