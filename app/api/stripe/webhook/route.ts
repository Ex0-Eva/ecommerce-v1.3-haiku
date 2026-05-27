import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { fulfillOrder } from "@/lib/orders";
import { revalidatePath } from "next/cache";

/**
 * Stripe Webhook — รับ event จาก Stripe หลัง payment สำเร็จ
 *
 * ตั้งค่า webhook ใน Stripe Dashboard:
 * - Endpoint URL: https://yourdomain.com/api/stripe/webhook
 * - Events: checkout.session.completed
 *
 * Local testing:
 *   stripe listen --forward-to localhost:3000/api/stripe/webhook
 */
export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // จัดการ event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;

      try {
        const result = await fulfillOrder(session.id);
        if (!result.alreadyFulfilled) {
          revalidatePath("/admin/orders");
          revalidatePath("/admin/dashboard");
          console.log(`Order fulfilled: ${result.id}`);
        }
      } catch (err) {
        console.error("fulfillOrder failed:", err);
        // คืน 500 เพื่อให้ Stripe retry
        return NextResponse.json({ error: "Fulfillment failed" }, { status: 500 });
      }
      break;
    }

    case "checkout.session.expired": {
      // Optional: mark order cancelled
      const session = event.data.object;
      console.log(`Checkout session expired: ${session.id}`);
      break;
    }

    default:
      // Event อื่นๆ ที่ไม่ได้ handle — ไม่ต้องทำอะไร
      break;
  }

  return NextResponse.json({ received: true });
}
