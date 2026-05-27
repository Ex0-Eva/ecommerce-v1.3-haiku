/**
 * LNbits API client
 *
 * LNbits เป็น self-hosted Lightning wallet platform
 * ต้องมี LNbits instance ของตัวเอง (self-hosted หรือ cloud)
 *
 * ตัวเลือก hosting:
 * - Self-hosted: https://github.com/lnbits/lnbits
 * - Legend.lnbits.com (public demo — ไม่แนะนำสำหรับ production)
 * - Voltage.cloud (managed hosting)
 *
 * API Keys:
 * - Invoice Key — สร้าง invoice และตรวจสอบสถานะ (read + receive)
 * - Admin Key — จ่ายเงินออกด้วย (ระวัง! อย่า expose)
 */

function getLnbitsUrl() {
  const url = process.env.LNBITS_URL;
  if (!url) throw new Error("Missing LNBITS_URL environment variable");
  return url.replace(/\/$/, ""); // ตัด trailing slash
}

function getInvoiceKey() {
  const key = process.env.LNBITS_INVOICE_KEY;
  if (!key) throw new Error("Missing LNBITS_INVOICE_KEY environment variable");
  return key;
}

export type LNbitsInvoice = {
  payment_hash: string;
  payment_request: string; // BOLT11 invoice string
  checking_id: string;
};

export type LNbitsPaymentStatus = {
  paid: boolean;
  details: {
    checking_id: string;
    amount: number;         // satoshis
    fee: number;            // millisatoshis
    memo: string;
    status: "pending" | "success" | "failed";
    time: number;           // unix timestamp
    extra?: Record<string, unknown>;
  };
};

/**
 * สร้าง Lightning invoice
 * amount ใส่เป็น satoshis
 *
 * หมายเหตุ: LNbits ทำงานกับ satoshis โดยตรง
 * ต้องแปลง THB → sats ก่อนเรียก (ใช้ exchange rate API)
 */
export async function createLNbitsInvoice(params: {
  amountSats: number;
  memo: string;
  webhookUrl?: string;
  expiry?: number;          // วินาที, default 3600 (1h)
  extra?: Record<string, unknown>;
}): Promise<LNbitsInvoice> {
  const res = await fetch(`${getLnbitsUrl()}/api/v1/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": getInvoiceKey(),
    },
    body: JSON.stringify({
      out: false,
      amount: params.amountSats,
      memo: params.memo,
      webhook: params.webhookUrl,
      expiry: params.expiry ?? 3600,
      extra: params.extra,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`LNbits createInvoice failed: ${res.status} ${JSON.stringify(err)}`);
  }

  return res.json() as Promise<LNbitsInvoice>;
}

/**
 * ตรวจสอบสถานะ invoice (polling)
 */
export async function getLNbitsPaymentStatus(checkingId: string): Promise<LNbitsPaymentStatus> {
  const res = await fetch(`${getLnbitsUrl()}/api/v1/payments/${checkingId}`, {
    headers: { "X-Api-Key": getInvoiceKey() },
  });

  if (!res.ok) {
    throw new Error(`LNbits getPaymentStatus failed: ${res.status}`);
  }

  return res.json() as Promise<LNbitsPaymentStatus>;
}

/**
 * ดึง exchange rate THB → sats จาก LNbits
 * LNbits มี /api/v1/rate/{currency} endpoint
 */
export async function getThbToSatsRate(): Promise<number> {
  try {
    const res = await fetch(`${getLnbitsUrl()}/api/v1/rate/THB`, {
      headers: { "X-Api-Key": getInvoiceKey() },
    });

    if (!res.ok) throw new Error("Rate fetch failed");

    const data = await res.json();
    // data.rate = THB per BTC
    // 1 BTC = 100,000,000 sats
    const thbPerBtc: number = data.rate;
    const satsPerThb = 100_000_000 / thbPerBtc;
    return satsPerThb;
  } catch {
    // fallback: ใช้ CoinGecko
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=thb"
    );
    const data = await res.json();
    const thbPerBtc: number = data.bitcoin.thb;
    return 100_000_000 / thbPerBtc;
  }
}

/**
 * แปลง THB → satoshis
 */
export async function thbToSats(thbAmount: number): Promise<number> {
  const satsPerThb = await getThbToSatsRate();
  return Math.ceil(thbAmount * satsPerThb);
}
