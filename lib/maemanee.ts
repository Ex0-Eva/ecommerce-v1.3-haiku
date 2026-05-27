/**
 * Maemanee (mock) client helper
 *
 * This file provides a small wrapper to create a payment with Maemanee.
 * Replace the placeholder implementation with real API calls when you
 * have the provider credentials.
 */
function getApiKey() {
  return process.env.MAEMANEE_API_KEY;
}

export type MaemaneePayment = {
  id: string;
  paymentUrl: string;
  expiresAt?: number;
  instructions?: string;
};

export async function createMaemaneePayment(params: {
  amount: number; // THB
  description: string;
  orderId: string;
  customerEmail?: string;
  callbackUrl: string;
  successUrl: string;
}): Promise<MaemaneePayment> {
  const apiKey = getApiKey();
  // Placeholder: when MAEMANEE API is available, make a fetch to the provider here
  if (!apiKey) {
    throw new Error("Missing MAEMANEE_API_KEY environment variable");
  }

  // Example stub response — replace with real provider response parsing
  const paymentId = `maemanee_${params.orderId}`;
  const paymentUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/checkout/instructions?provider=maemanee&orderId=${params.orderId}`;

  return {
    id: paymentId,
    paymentUrl,
    expiresAt: Date.now() + 1000 * 60 * 60, // 1 hour
    instructions: "ไปยังหน้าแม่มณีเพื่อชำระเงิน (ต้องเชื่อมต่อ API จริง)",
  };
}
