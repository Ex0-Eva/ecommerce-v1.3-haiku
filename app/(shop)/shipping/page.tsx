import { Metadata } from "next";
import { getSiteConfig } from "@/lib/siteConfig";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: `นโยบายการจัดส่ง | ${config.store_name || "Next E-commerce"}`,
    description: "รายละเอียดการจัดส่งสินค้าและนโยบายที่เกี่ยวข้อง",
  };
}

export default async function ShippingPage() {
  const config = await getSiteConfig();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl" style={{ color: 'var(--primary)' }}>
          นโยบายการจัดส่ง
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          เงื่อนไขและรายละเอียดการจัดส่งสินค้าของ <span className="dynamic-store-name">{config.store_name || "Next E-commerce"}</span>
        </p>
      </div>

      <div 
        className="rounded-custom border border-slate-200 bg-white p-8 shadow-sm sm:p-12 prose max-w-none text-slate-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: config.shipping_content || "ยังไม่มีข้อมูลนโยบายการจัดส่ง" }}
      />
    </div>
  );
}
