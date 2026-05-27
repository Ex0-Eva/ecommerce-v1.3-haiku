import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth";
import { createOrder } from "@/lib/orders";
import { getProductById } from "@/lib/products";
import { createOpenNodeCharge } from "@/lib/opennode";
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

    const total = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    // สร้าง order pending ก่อน เพื่อได้ orderId ใส่ใน OpenNode order_id
    const order = await createOrder({
      items,
      userId: (session?.user as any)?.id,
      customerName: session?.user?.name ?? undefined,
      customerEmail: session?.user?.email ?? undefined,
      shippingAddress: shippingAddress ?? undefined,
      status: "pending",
    });

    // สร้าง OpenNode charge
    const charge = await createOpenNodeCharge({
      amount: total,
      description: `Order #${order.id}`,
      orderId: order.id,
      customerEmail: session?.user?.email ?? undefined,
      callbackUrl: `${origin}/api/opennode/webhook`,
      successUrl: `${origin}/checkout/success?orderId=${order.id}`,
    });

    // อัปเดต order ด้วย opennode_charge_id
    await db.order.update({
      where: { id: order.id },
      data: { opennodeChargeId: charge.id },
    });

    return NextResponse.json({
      success: true,
      checkout: {
        orderId: order.id,
        chargeId: charge.id,
        hostedUrl: charge.hosted_checkout_url,
        lightningInvoice: charge.lightning_invoice.payreq,
        onChainAddress: charge.chain_invoice.address,
        uri: charge.uri,
        amountSats: charge.amount,
        expiresAt: charge.lightning_invoice.expires_at,
      },
    });
  } catch (error: any) {
    console.error("OpenNode checkout error:", error);
    return NextResponse.json(
      { error: error?.message || "เกิดข้อผิดพลาดระหว่าง checkout" },
      { status: 500 }
    );
  }
}
