import { NextResponse } from "next/server";
import { verifyOpenNodeWebhook, type OpenNodeWebhookPayload } from "@/lib/opennode";
import { fulfillOrderByOpenNode } from "@/lib/orders";
import { revalidatePath } from "next/cache";

/**
 * OpenNode Webhook — รับ event เมื่อ charge เปลี่ยนสถานะ
 *
 * ตั้งค่า callback_url ใน createOpenNodeCharge:
 *   https://yourdomain.com/api/opennode/webhook
 *
 * OpenNode ส่ง payload เป็น application/x-www-form-urlencoded
 * Signature: HMAC-SHA256(api_key, charge_id) === hashed_order
 */
export async function POST(req: Request) {
  let payload: OpenNodeWebhookPayload;

  try {
    // OpenNode ส่งเป็น form-urlencoded
    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await req.text();
      const params = new URLSearchParams(text);
      payload = Object.fromEntries(params.entries()) as unknown as OpenNodeWebhookPayload;
    } else {
      // fallback JSON (OpenNode simulator ส่ง JSON)
      payload = await req.json();
    }
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Verify signature
  if (!verifyOpenNodeWebhook(payload)) {
    console.error("OpenNode webhook signature invalid", payload.id);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // จัดการเฉพาะ status=paid
  if (payload.status !== "paid") {
    // รับรู้ event อื่น (processing, underpaid, expired) แต่ไม่ต้องทำอะไร
    return NextResponse.json({ received: true, status: payload.status });
  }

  try {
    const result = await fulfillOrderByOpenNode(payload.id);
    if (!result.alreadyFulfilled) {
      revalidatePath("/admin/orders");
      revalidatePath("/admin/dashboard");
      console.log(`OpenNode order fulfilled: ${result.id}`);
    }
  } catch (err) {
    console.error("fulfillOrderByOpenNode failed:", err);
    // คืน 500 เพื่อให้ OpenNode retry
    return NextResponse.json({ error: "Fulfillment failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
