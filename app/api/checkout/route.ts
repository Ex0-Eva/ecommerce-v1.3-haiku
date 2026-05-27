import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/auth";
import { createOrder } from "@/lib/orders";
import { getProductById } from "@/lib/products";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { items, shippingAddress } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "ตะกร้าสินค้าไม่ถูกต้อง" }, { status: 400 });
    }

    // Validate & stock check
    for (const item of items) {
      if (item.variantId) {
        // Req 3.4, 3.6, 5.4 — ตรวจสอบ stock จาก product_variants
        const variant = await db.productVariant.findUnique({
          where: { id: item.variantId },
          select: { id: true, stock: true, label: true, isActive: true },
        });

        if (!variant) {
          return NextResponse.json(
            { error: `ไม่พบ variant ที่เลือก (variantId: ${item.variantId}) สำหรับสินค้า: ${item.name}` },
            { status: 400 }
          );
        }

        if (variant.stock < item.quantity) {
          return NextResponse.json(
            {
              error: `สินค้า ${item.name} (${variant.label}) มีสต็อกไม่พอ (คงเหลือ ${variant.stock})`,
            },
            { status: 400 }
          );
        }
      } else {
        // Req 3.5 — ตรวจสอบ stock จาก products table (legacy)
        const product = await getProductById(item.id);
        if (!product) {
          return NextResponse.json({ error: `ไม่พบสินค้า: ${item.name}` }, { status: 404 });
        }
        if (product.stock < item.quantity) {
          return NextResponse.json(
            { error: `สินค้า ${product.name} มีสต็อกไม่พอ (คงเหลือ ${product.stock})` },
            { status: 400 }
          );
        }
      }
    }

    const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    // สร้าง Stripe Checkout Session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: session?.user?.email ?? undefined,
      line_items: items.map((item: any) => ({
        price_data: {
          currency: "thb",
          product_data: {
            // แสดง variant label ใน Stripe ถ้ามี เช่น "เสื้อยืด (M)"
            name: item.variantLabel ? `${item.name} (${item.variantLabel})` : item.name,
          },
          unit_amount: Math.round(item.price * 100), // Stripe ใช้ satang
        },
        quantity: item.quantity,
      })),
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      metadata: {
        userId: (session?.user as any)?.id ?? "",
        customerName: session?.user?.name ?? "",
        customerEmail: session?.user?.email ?? "",
      },
    });

    // สร้าง order ใน DB สถานะ pending รอ webhook ยืนยัน
    const order = await createOrder({
      items,
      userId: (session?.user as any)?.id,
      customerName: session?.user?.name ?? undefined,
      customerEmail: session?.user?.email ?? undefined,
      shippingAddress: shippingAddress ?? undefined,
      status: "pending",
      stripeSessionId: stripeSession.id,
    });

    return NextResponse.json({
      success: true,
      checkout: {
        orderId: order.id,
        stripeUrl: stripeSession.url, // redirect ไปหน้า Stripe
      },
    });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error?.message || "เกิดข้อผิดพลาดระหว่าง checkout" },
      { status: 500 }
    );
  }
}
