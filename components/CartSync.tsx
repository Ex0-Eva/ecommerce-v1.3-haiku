"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/useCartStore";

export function CartSync() {
  const { status } = useSession();
  // Subscribe เฉพาะ items.length ไม่ใช่ทั้ง array
  // ป้องกัน re-render จาก reference ใหม่ของ items ทุกครั้ง
  const itemCount = useCartStore((state) => state.items.length);
  const isSyncing = useRef(false);
  const hasSynced = useRef(false);

  useEffect(() => {
    // sync เฉพาะครั้งแรกที่ authenticated และมีสินค้าในตะกร้า
    // ไม่ sync ซ้ำทุกครั้งที่ items เปลี่ยน (นั่นคือหน้าที่ของ checkout)
    if (status !== "authenticated" || itemCount === 0) return;
    if (hasSynced.current || isSyncing.current) return;

    isSyncing.current = true;

    const items = useCartStore.getState().items;

    fetch("/api/cart/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })
      .catch((err) => console.error("Cart sync failed:", err))
      .finally(() => {
        isSyncing.current = false;
        hasSynced.current = true;
      });
  }, [status, itemCount]);

  // reset hasSynced เมื่อ logout
  useEffect(() => {
    if (status === "unauthenticated") {
      hasSynced.current = false;
    }
  }, [status]);

  return null;
}
