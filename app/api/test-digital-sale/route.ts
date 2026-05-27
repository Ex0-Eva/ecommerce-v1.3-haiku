import { NextResponse } from "next/server";
import { createOrder } from "@/lib/orders";

export async function GET() {
  try {
    // จำลองการซื้อสินค้า Digital
    const mockDigitalItems = [
      {
        id: "p4",
        name: "E-commerce Template",
        price: 4900,
        quantity: 1,
        product_type: 'digital' as const,
        digital_file_url: "https://example.com/download/template.zip"
      },
      {
        id: "p5",
        name: "Software License Key",
        price: 990,
        quantity: 1,
        product_type: 'digital' as const
      }
    ];

    const order = await createOrder({
      items: mockDigitalItems,
      customerName: "Demo User",
      customerEmail: "demo@example.com",
      userId: "u1"
    });

    return NextResponse.json({
      message: "ระบบจำลองการขายทำงานได้จริง! นี่คือผลลัพธ์ของออเดอร์ Digital",
      order: {
        id: order.id,
        status: order.status,
        total: order.total,
        digital_assets: order.items.map(item => ({
          product: item.name,
          licenseKey: item.license_key,
          downloadUrl: item.digital_file_url
        }))
      },
      next_steps: [
        "1. เชื่อมต่อ Supabase เพื่อเก็บข้อมูลจริง",
        "2. ตั้งค่า .env.local สำหรับ Production",
        "3. เชื่อมต่อ Stripe Webhook เพื่อเปลี่ยนสถานะเป็น 'paid' อัตโนมัติ"
      ]
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
