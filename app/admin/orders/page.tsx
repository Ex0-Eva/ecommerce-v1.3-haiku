"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import type { Order } from "@/lib/orders";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: "รอดำเนินการ", color: "bg-amber-100 text-amber-700" },
  paid:      { label: "ชำระแล้ว",    color: "bg-blue-100 text-blue-700" },
  shipped:   { label: "จัดส่งแล้ว",  color: "bg-indigo-100 text-indigo-700" },
  delivered: { label: "ส่งถึงแล้ว",  color: "bg-green-100 text-green-700" },
  cancelled: { label: "ยกเลิก",      color: "bg-red-100 text-red-700" },
};

const STATUS_FLOW = ["pending", "paid", "shipped", "delivered"];

function PrintLabel({ order }: { order: Order }) {
  return (
    <div id={`print-${order.id}`} className="hidden print:block print:p-6 print:text-black">
      <div className="border-2 border-black p-6 font-sans text-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-lg font-bold">ใบปะหน้ากล่องพัสดุ</p>
            <p className="text-xs text-gray-500">Order: {order.id}</p>
            <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString("th-TH")}</p>
          </div>
          <div className="text-right">
            <p className="font-bold">ผู้ส่ง: ร้านค้าออนไลน์</p>
          </div>
        </div>

        <div className="border-t-2 border-black pt-4 mb-4">
          <p className="font-bold text-base mb-1">ผู้รับ:</p>
          {order.shippingAddress ? (
            <>
              <p className="font-semibold text-lg">{order.shippingAddress.fullName}</p>
              <p>โทร: {order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.district} {order.shippingAddress.province} {order.shippingAddress.postalCode}</p>
            </>
          ) : (
            <p className="text-gray-500">ไม่มีที่อยู่จัดส่ง (Digital Product)</p>
          )}
        </div>

        <div className="border-t border-gray-300 pt-3">
          <p className="font-bold mb-2">รายการสินค้า:</p>
          {order.items.map((item, i) => (
            <p key={i}>{item.name} x{item.quantity} — ฿{(item.price * item.quantity).toLocaleString()}</p>
          ))}
          <p className="mt-2 font-bold">รวม: ฿{order.total.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [printOrderId, setPrintOrderId] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    const { getAllOrders } = await import("@/lib/orders");
    setOrders(await getAllOrders());
    setLoading(false);
  };

  useEffect(() => { loadOrders(); }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as Order["status"] } : o))
      );
    }
    setUpdatingId(null);
  };

  const handlePrint = (orderId: string) => {
    setPrintOrderId(orderId);
    setTimeout(() => {
      window.print();
      setPrintOrderId(null);
    }, 100);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">จัดการคำสั่งซื้อ</h1>
            <p className="mt-1 text-sm text-slate-500">{orders.length} คำสั่งซื้อทั้งหมด</p>
          </div>
          <button
            onClick={loadOrders}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
          >
            🔄 รีเฟรช
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-400">
          ยังไม่มีคำสั่งซื้อ
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const statusInfo = STATUS_LABELS[order.status] ?? STATUS_LABELS.pending;
            const isExpanded = expandedId === order.id;
            const currentStep = STATUS_FLOW.indexOf(order.status);

            return (
              <div key={order.id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                {/* Header row */}
                <div
                  className="flex cursor-pointer flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">{isExpanded ? "▲" : "▼"}</span>
                    <div>
                      <p className="font-mono text-sm font-semibold text-slate-700">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(order.createdAt).toLocaleString("th-TH")}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {order.customerName && (
                      <span className="text-sm text-slate-600">{order.customerName}</span>
                    )}
                    <span className="text-sm font-bold text-slate-900">
                      ฿{order.total.toLocaleString()}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 space-y-5">
                    {/* Progress bar */}
                    {order.status !== "cancelled" && (
                      <div className="flex items-center gap-2">
                        {STATUS_FLOW.map((s, i) => (
                          <div key={s} className="flex items-center gap-2 flex-1">
                            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              i <= currentStep
                                ? "bg-slate-900 text-white"
                                : "bg-slate-100 text-slate-400"
                            }`}>
                              {i + 1}
                            </div>
                            <span className={`text-xs ${i <= currentStep ? "text-slate-700 font-medium" : "text-slate-400"}`}>
                              {STATUS_LABELS[s].label}
                            </span>
                            {i < STATUS_FLOW.length - 1 && (
                              <div className={`h-0.5 flex-1 ${i < currentStep ? "bg-slate-900" : "bg-slate-200"}`} />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid gap-5 md:grid-cols-2">
                      {/* ข้อมูลลูกค้า + ที่อยู่ */}
                      <div className="rounded-xl bg-slate-50 p-4 space-y-1 text-sm">
                        <p className="font-semibold text-slate-700 mb-2">ข้อมูลลูกค้า</p>
                        <p>👤 {order.customerName || "ไม่ระบุ"}</p>
                        <p>📧 {order.customerEmail || "ไม่ระบุ"}</p>
                        {order.shippingAddress ? (
                          <>
                            <p className="mt-2 font-semibold text-slate-700">ที่อยู่จัดส่ง</p>
                            <p>📞 {order.shippingAddress.phone}</p>
                            <p>🏠 {order.shippingAddress.address}</p>
                            <p>{order.shippingAddress.district} {order.shippingAddress.province} {order.shippingAddress.postalCode}</p>
                          </>
                        ) : (
                          <p className="mt-2 text-purple-600">💻 Digital Product — ไม่มีที่อยู่จัดส่ง</p>
                        )}
                      </div>

                      {/* รายการสินค้า */}
                      <div className="rounded-xl bg-slate-50 p-4 text-sm">
                        <p className="font-semibold text-slate-700 mb-2">รายการสินค้า</p>
                        <ul className="space-y-2">
                          {order.items.map((item, i) => (
                            <li key={i} className="flex justify-between">
                              <span>{item.name} x{item.quantity}</span>
                              <span className="font-medium">฿{(item.price * item.quantity).toLocaleString()}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 flex justify-between border-t border-slate-200 pt-2 font-bold">
                          <span>รวม</span>
                          <span>฿{order.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      {/* เปลี่ยน status */}
                      {order.status !== "cancelled" && order.status !== "delivered" && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-500">เปลี่ยนสถานะ:</span>
                          {STATUS_FLOW.slice(currentStep + 1).map((s) => (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(order.id, s)}
                              disabled={updatingId === order.id}
                              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                            >
                              → {STATUS_LABELS[s].label}
                            </button>
                          ))}
                          <button
                            onClick={() => handleStatusChange(order.id, "cancelled")}
                            disabled={updatingId === order.id}
                            className="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      )}

                      {/* Print */}
                      {order.shippingAddress && (
                        <button
                          onClick={() => handlePrint(order.id)}
                          className="ml-auto flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          🖨️ พิมพ์ใบปะหน้า
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Hidden print area */}
                {printOrderId === order.id && <PrintLabel order={order} />}
              </div>
            );
          })}
        </div>
      )}

      {/* Global print styles */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          .print\\:block { display: block !important; }
        }
      `}</style>
    </section>
  );
}
