import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductType } from "@/types";

export type CartItem = {
  id: string;            // product_id
  variantId?: string;    // product_variant id (ถ้ามี)
  name: string;
  variantLabel?: string; // เช่น "500g" — แสดงใน cart UI
  price: number;
  stock: number;
  quantity: number;
  type?: ProductType;
};

type CartState = {
  items: CartItem[];
  // total เป็น derived value — คำนวณจาก items โดยตรง ไม่ใช่ function ใน store
  // เพื่อให้ selector memoize ได้ถูกต้องและไม่ re-render โดยไม่จำเป็น
  addItem: (product: CartItem) => void;
  removeItem: (id: string, variantId?: string) => void;
  updateQuantity: (id: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (product) =>
        set((state) => {
          // Match on both id and variantId so different variants of the same product
          // are treated as separate cart entries
          const existing = state.items.find(
            (item) =>
              item.id === product.id && item.variantId === product.variantId
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === product.id && item.variantId === product.variantId
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return { items: [...state.items, { ...product, quantity: product.quantity ?? 1 }] };
        }),

      removeItem: (id, variantId) =>
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.id === id && item.variantId === variantId)
          ),
        })),

      updateQuantity: (id, quantity, variantId) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.id === id && item.variantId === variantId
                ? { ...item, quantity }
                : item
            )
            .filter((item) => item.quantity > 0),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "next-ecommerce-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// Selector helpers — ใช้แทนการเรียก total() ใน component โดยตรง
// ทำให้ Zustand เปรียบเทียบค่าได้ถูกต้องและ re-render เฉพาะเมื่อ items เปลี่ยน
export const selectCartTotal = (state: CartState) =>
  state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const selectCartCount = (state: CartState) =>
  state.items.reduce((sum, item) => sum + item.quantity, 0);
