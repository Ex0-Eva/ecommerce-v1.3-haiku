"use client";

import Link from "next/link";
import { useCartStore, selectCartTotal } from "@/store/useCartStore";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  // ใช้ selector แทน state.total() เพื่อให้ Zustand memoize ได้ถูกต้อง
  const total = useCartStore(selectCartTotal);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-3xl bg-white p-8 shadow-lg shadow-slate-200">
          <h1 className="text-4xl font-semibold">ตะกร้าสินค้า</h1>
          <p className="mt-2 text-slate-600">ตรวจสอบรายการสินค้าก่อนไปยัง Checkout</p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
          <div className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
            {items.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                ตะกร้าว่างเปล่า
              </div>
            ) : (
              items.map((item) => (
                <div key={`${item.id}-${item.variantId ?? ""}`} className="rounded-3xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xl font-semibold">{item.name}</p>
                      {item.variantLabel && (
                        <p className="mt-0.5 text-sm text-slate-500">{item.variantLabel}</p>
                      )}
                      <p className="mt-1 text-slate-600">
                        ฿{item.price.toLocaleString()} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.variantId)}
                        className="rounded-full border border-slate-300 px-3 py-1 text-slate-700 transition hover:bg-slate-100"
                      >
                        -
                      </button>
                      <span className="w-10 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.variantId)}
                        className="rounded-full border border-slate-300 px-3 py-1 text-slate-700 transition hover:bg-slate-100"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id, item.variantId)}
                        className="rounded-2xl border border-red-200 px-3 py-1 text-red-600 transition hover:bg-red-50"
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <aside className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">สรุปคำสั่งซื้อ</h2>
            <div className="mt-6 space-y-4 text-slate-700">
              <div className="flex items-center justify-between">
                <span>ราคารวม</span>
                <span>฿{total.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>ค่าจัดส่ง</span>
                <span>฿0</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-lg font-semibold">
                <span>รวมทั้งหมด</span>
                <span>฿{total.toLocaleString()}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-white transition hover:bg-slate-700"
            >
              ไปยัง Checkout
            </Link>
          </aside>
        </section>
      </div>
    </main>
  );
}
