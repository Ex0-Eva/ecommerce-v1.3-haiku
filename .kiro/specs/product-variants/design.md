# Design — Product Variants System

## 1. Database Schema

### New Table: `product_variants`

```sql
CREATE TABLE public.product_variants (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id  UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  label       TEXT NOT NULL,           -- "S", "500g", "1kg", "Team"
  price       DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sku         TEXT,                    -- optional
  is_active   BOOLEAN DEFAULT true,
  sort_order  INTEGER DEFAULT 0,       -- ลำดับแสดงผล
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);
```

### ไม่แก้ `products` table

`products.price` และ `products.stock` ยังคงอยู่ — ใช้เป็น fallback สำหรับสินค้าที่ไม่มี variant

### RPC: `decrement_variant_stock`

```sql
CREATE OR REPLACE FUNCTION public.decrement_variant_stock(
  p_variant_id UUID,
  p_quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.product_variants
  SET stock = GREATEST(stock - p_quantity, 0)
  WHERE id = p_variant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 2. TypeScript Types

### `types/index.ts` — เพิ่ม

```ts
export type ProductVariantDB = {
  id: string;
  product_id: string;
  label: string;
  price: number;
  stock: number;
  sku?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};
```

### `lib/products.ts` — อัปเดต `Product`

```ts
export type Product = {
  // ... fields เดิม ...
  variants?: ProductVariantDB[];   // populated เมื่อ fetch พร้อม variants
};
```

### `store/useCartStore.ts` — อัปเดต `CartItem`

```ts
export type CartItem = {
  id: string;           // product_id
  variantId?: string;   // product_variant id (ถ้ามี)
  name: string;
  variantLabel?: string; // เช่น "500g" — แสดงใน cart UI
  price: number;
  stock: number;
  quantity: number;
  type?: ProductType;
};
```

---

## 3. API Changes

### `GET /api/admin/products` — เพิ่ม variants

```ts
// Response เพิ่ม variants array
{
  id, name, price, stock, ...
  variants: [
    { id, label, price, stock, sku, sort_order }
  ]
}
```

### `POST /api/admin/products` — รับ variants

```ts
// Request body เพิ่ม
{
  name, price, stock, ...
  variants?: Array<{ label, price, stock, sku? }>
}
```

### `PATCH /api/admin/products/[id]` — จัดการ variants

```ts
// Request body
{
  // fields เดิม...
  variants?: Array<{
    id?: string;      // มี id = update, ไม่มี = create
    label, price, stock, sku?,
    _delete?: boolean // true = ลบ variant นี้
  }>
}
```

### `POST /api/checkout` — รองรับ variantId

```ts
// Cart item ใหม่
{
  id: string;          // product_id
  variantId?: string;  // ถ้ามี → หัก stock จาก variant
  name: string;
  price: number;
  quantity: number;
}
```

---

## 4. Frontend Changes

### `app/(shop)/products/page.tsx`

- สินค้าที่มี variant → แสดง variant selector (dropdown หรือ button group)
- ราคาแสดงเป็น "เริ่มต้น ฿XXX" ถ้ามี variant
- ปุ่ม "เพิ่มลงตะกร้า" disabled จนกว่าจะเลือก variant

### `app/admin/products/page.tsx`

- เพิ่ม section "Variants" ใน product form
- Toggle "สินค้านี้มีหลาย option" → แสดง variant editor
- Variant editor: เพิ่ม/ลบ row ได้ (label, price, stock, sku)

---

## 5. Migration Plan

ไม่ต้อง migrate ข้อมูลเดิม — เพิ่ม table ใหม่เท่านั้น

```sql
-- รันใน Supabase SQL Editor (migration เพิ่มเติม)
-- ไม่กระทบ products เดิม
CREATE TABLE IF NOT EXISTS public.product_variants (...);
```

---

## 6. Implementation Order

1. **DB** — เพิ่ม `product_variants` table + RPC ใน `supabase-schema.sql`
2. **Types** — อัปเดต `types/index.ts` และ `lib/products.ts`
3. **Cart Store** — อัปเดต `CartItem` type ใน `store/useCartStore.ts`
4. **API** — อัปเดต admin products API (GET/POST/PATCH) รองรับ variants
5. **API** — อัปเดต checkout API รองรับ `variantId`
6. **Admin UI** — เพิ่ม variant editor ใน admin products form
7. **Shop UI** — เพิ่ม variant selector ใน products page
