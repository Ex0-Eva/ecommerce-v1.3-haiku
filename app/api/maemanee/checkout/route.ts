import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth";
import { createOrder } from "@/lib/orders";
import { createMaemaneePayment } from "@/lib/maemanee";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { items, shippingAddress } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "ตะกร้าสินค้าไม่ถูกต้อง" }, { status: 400 });
    }

    const total = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    const order = await createOrder({
      items,
      userId: (session?.user as any)?.id,
      customerName: session?.user?.name ?? undefined,
      customerEmail: session?.user?.email ?? undefined,
      shippingAddress: shippingAddress ?? undefined,
      status: "pending",
    });

    const payment = await createMaemaneePayment({
      amount: total,
      description: `Order #${order.id}`,
      orderId: order.id,
      customerEmail: session?.user?.email ?? undefined,
      callbackUrl: `${origin}/api/maemanee/webhook`,
      successUrl: `${origin}/checkout/success?orderId=${order.id}`,
    });

    // Try to update order with provider id; ignore failures if column doesn't exist
    try {
      await db.order.update({
        where: { id: order.id },
        data: { lnbitsCheckingId: payment.id },
      });
    } catch (e) {
      // ignore
    }

    return NextResponse.json({
      success: true,
      checkout: {
        orderId: order.id,
        paymentId: payment.id,
        paymentUrl: payment.paymentUrl,
        expiresAt: payment.expiresAt,
      },
    });
  } catch (error: any) {
    console.error("Maemanee checkout error:", error);
    return NextResponse.json(
      { error: error?.message || "เกิดข้อผิดพลาดระหว่าง checkout" },
      { status: 500 }
    );
  }
}
