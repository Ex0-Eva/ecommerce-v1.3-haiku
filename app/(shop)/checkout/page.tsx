"use client";

import { useState } from "react";
import { useCartStore, selectCartTotal } from "@/store/useCartStore";

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore(selectCartTotal);
  const clearCart = useCartStore((state) => state.clearCart);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) {
      setStatus("ไม่มีสินค้าในตะกร้า");
      return;
    }

    setLoading(true);
    setStatus(null);

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setStatus(data.error || "เกิดข้อผิดพลาดในการชำระเงิน");
      return;
    }

    // ล้าง cart แล้ว redirect ไป Stripe Checkout
    clearCart();
    window.location.href = data.checkout.stripeUrl;
  };

  const handleProviderCheckout = async (provider: "maemanee" | "kshop") => {
    if (items.length === 0) {
      setStatus("ไม่มีสินค้าในตะกร้า");
      return;
    }

    setLoading(true);
    setStatus(null);

    const response = await fetch(`/api/${provider}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setStatus(data.error || `เกิดข้อผิดพลาดกับ ${provider}`);
      return;
    }

    // Redirect to provider payment URL (hosted payment page / instructions)
    clearCart();
    if (data.checkout?.paymentUrl) {
      window.location.href = data.checkout.paymentUrl;
    } else {
      setStatus("ไม่พบ paymentUrl จากผู้ให้บริการ");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-10 shadow-xl shadow-slate-200">
        <h1 className="text-4xl font-semibold">Checkout</h1>
        <p className="mt-3 text-slate-600">ยืนยันรายการสั่งซื้อและชำระเงินผ่าน Stripe</p>

        <section className="mt-8 space-y-6">
          {/* Order Summary */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-2xl font-semibold">สรุปรายการ</h2>
            {items.length === 0 ? (
              <p className="mt-4 text-slate-600">ไม่มีสินค้าในตะกร้า</p>
            ) : (
              <ul className="mt-4 space-y-3 text-slate-700">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
                  >
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="ml-2 text-sm text-slate-400">x {item.quantity}</span>
                    </div>
                    <span className="font-semibold">฿{(item.price * item.quantity).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Total + Pay Button */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-2xl font-semibold">สรุปยอด</h2>
            <div className="mt-4 flex items-center justify-between text-lg font-semibold text-slate-900">
              <span>ยอดรวมทั้งหมด</span>
              <span>฿{total.toLocaleString()}</span>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading || items.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3 text-white font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: "var(--primary)" }}
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    กำลังเชื่อมต่อ Stripe...
                  </>
                ) : (
                  <>
                    {/* Stripe logo icon */}
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
                    </svg>
                    ชำระเงินด้วย Stripe
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleProviderCheckout("maemanee")}
                disabled={loading || items.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-slate-800 font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ชำระด้วย แม่มณี
              </button>

              <button
                type="button"
                onClick={() => handleProviderCheckout("kshop")}
                disabled={loading || items.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-slate-800 font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ชำระด้วย KShop
              </button>
            </div>

            {status && <p className="mt-4 text-sm text-red-600">{status}</p>}

            {/* Security note */}
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              ชำระเงินปลอดภัยด้วย SSL encryption
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
