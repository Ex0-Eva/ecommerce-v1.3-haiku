import crypto from "crypto";

const OPENNODE_API_URL = "https://api.opennode.com";
const OPENNODE_DEV_API_URL = "https://dev-api.opennode.com";

function getBaseUrl() {
  return process.env.OPENNODE_ENV === "dev" ? OPENNODE_DEV_API_URL : OPENNODE_API_URL;
}

function getApiKey() {
  const key = process.env.OPENNODE_API_KEY;
  if (!key) throw new Error("Missing OPENNODE_API_KEY environment variable");
  return key;
}

export type OpenNodeCharge = {
  id: string;
  status: "unpaid" | "processing" | "paid" | "expired" | "underpaid" | "refunded";
  amount: number;           // satoshis
  source_fiat_value: number;
  fiat_value: number;
  currency: string;
  description: string;
  order_id: string;
  callback_url: string;
  success_url: string;
  hosted_checkout_url: string;
  lightning_invoice: {
    payreq: string;
    expires_at: number;
  };
  chain_invoice: {
    address: string;
  };
  uri: string;              // BIP21 URI (on-chain + lightning)
  created_at: number;
};

export type OpenNodeWebhookPayload = {
  id: string;
  status: OpenNodeCharge["status"];
  order_id: string;
  description: string;
  price: string;            // satoshis as string
  fee: string;
  hashed_order: string;     // HMAC-SHA256 signature
  callback_url: string;
  success_url: string;
  auto_settle: string;
};

/**
 * สร้าง OpenNode charge (Lightning + on-chain)
 * amount ใส่เป็น THB — OpenNode จะแปลงเป็น BTC/sats อัตโนมัติ
 */
export async function createOpenNodeCharge(params: {
  amount: number;           // ยอดเงิน THB
  description: string;
  orderId: string;
  customerEmail?: string;
  callbackUrl: string;
  successUrl: string;
  ttl?: number;             // นาที, default 1440 (24h)
}): Promise<OpenNodeCharge> {
  const res = await fetch(`${getBaseUrl()}/v1/charges`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getApiKey(),
    },
    body: JSON.stringify({
      amount: params.amount,
      description: params.description,
      currency: "THB",
      order_id: params.orderId,
      customer_email: params.customerEmail,
      callback_url: params.callbackUrl,
      success_url: params.successUrl,
      ttl: params.ttl ?? 1440,
      auto_settle: false,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`OpenNode createCharge failed: ${res.status} ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  return data.data as OpenNodeCharge;
}

/**
 * ดึงข้อมูล charge จาก OpenNode (ใช้ poll สถานะ)
 */
export async function getOpenNodeCharge(chargeId: string): Promise<OpenNodeCharge> {
  const res = await fetch(`${getBaseUrl()}/v1/charge/${chargeId}`, {
    headers: { Authorization: getApiKey() },
  });

  if (!res.ok) {
    throw new Error(`OpenNode getCharge failed: ${res.status}`);
  }

  const data = await res.json();
  return data.data as OpenNodeCharge;
}

/**
 * ตรวจสอบ webhook signature จาก OpenNode
 * HMAC-SHA256(api_key, charge_id) === hashed_order
 */
export function verifyOpenNodeWebhook(payload: OpenNodeWebhookPayload): boolean {
  const apiKey = process.env.OPENNODE_API_KEY;
  if (!apiKey) return false;

  const calculated = crypto
    .createHmac("sha256", apiKey)
    .update(payload.id)
    .digest("hex");

  return calculated === payload.hashed_order;
}
