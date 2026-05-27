import { Metadata } from "next";
import Link from "next/link";
import { getSiteConfig } from "@/lib/siteConfig";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: `เกี่ยวกับเรา | ${config.store_name || "Next E-commerce"}`,
    description: "ทำความรู้จักกับเราให้มากขึ้น",
  };
}

export default async function AboutPage() {
  const config = await getSiteConfig();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl" style={{ color: 'var(--primary)' }}>
          เกี่ยวกับ <span className="dynamic-store-name">{config.store_name || "Next E-commerce"}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          เราเริ่มต้นจากแพสชั่นเล็กๆ สู่การเป็นผู้นำด้านเทคโนโลยีและคอมเมิร์ซ มุ่งมั่นนำเสนอสินค้าคุณภาพพร้อมประสบการณ์ช้อปปิ้งที่ดีที่สุดให้กับคุณ
        </p>
      </div>

      <div className="mt-16 space-y-16">
        {/* Mission Section */}
        <section className="rounded-custom border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
          <div className="flex flex-col items-center gap-8 md:flex-row">
            <div className="flex-1">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">วิสัยทัศน์ & พันธกิจ</h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                เป้าหมายหลักของเราคือการทำให้เทคโนโลยีการช้อปปิ้งเข้าถึงได้ง่ายและรวดเร็วที่สุด ด้วย Next.js 16 และระบบ Live Commerce แบบ Real-time ที่จะทำให้การซื้อขายไม่เหมือนเดิมอีกต่อไป
              </p>
            </div>
            <div className="h-48 w-full flex-1 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200 md:w-auto">
              {/* Placeholder graphic */}
              <svg className="w-16 h-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 text-center mb-8">ทำไมถึงต้องเลือกเรา?</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-custom border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">คุณภาพที่เชื่อถือได้</h3>
              <p className="mt-2 text-sm text-slate-600">คัดสรรแต่สิ่งที่ดีที่สุด เพื่อให้คุณได้รับความพึงพอใจสูงสุด</p>
            </div>
            <div className="rounded-custom border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">รวดเร็วทันใจ</h3>
              <p className="mt-2 text-sm text-slate-600">แพลตฟอร์มที่ตอบสนองไวที่สุด หมดปัญหารอโหลดนาน</p>
            </div>
            <div className="rounded-custom border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">ชำระเงินปลอดภัย</h3>
              <p className="mt-2 text-sm text-slate-600">รองรับระบบจ่ายเงินที่มั่นคง ปลอดภัย 100%</p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center mt-12">
          <Link 
            href="/products" 
            className="inline-flex items-center justify-center rounded-custom bg-primary px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-primary/90"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            เริ่มช้อปปิ้งเลย
          </Link>
        </section>
      </div>
    </div>
  );
}
