/**
 * KShop (mock) client helper
 *
 * This file provides a small wrapper to create a payment with KShop.
 * Replace the placeholder implementation with real API calls when you
 * have the provider credentials.
 */
function getApiKey() {
  return process.env.KSHOP_API_KEY;
}

export type KShopPayment = {
  id: string;
  paymentUrl: string;
  expiresAt?: number;
  instructions?: string;
};

export async function createKShopPayment(params: {
  amount: number; // THB
  description: string;
  orderId: string;
  customerEmail?: string;
  callbackUrl: string;
  successUrl: string;
}): Promise<KShopPayment> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Missing KSHOP_API_KEY environment variable");
  }

  // Placeholder stub — replace with KShop API integration
  const paymentId = `kshop_${params.orderId}`;
  const paymentUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/checkout/instructions?provider=kshop&orderId=${params.orderId}`;

  return {
    id: paymentId,
    paymentUrl,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24, // 24 hours
    instructions: "ไปยังหน้า KShop เพื่อชำระเงิน (ต้องเชื่อมต่อ API จริง)",
  };
}
