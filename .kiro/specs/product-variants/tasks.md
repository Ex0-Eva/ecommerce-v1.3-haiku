# Tasks — Product Variants System

## Task 1: Database

- [x] เพิ่ม `product_variants` table ใน `supabase-schema.sql`
- [x] เพิ่ม RPC `decrement_variant_stock` ใน `supabase-schema.sql`
- [x] เพิ่ม RLS policies สำหรับ `product_variants`
- [x] เพิ่ม trigger `handle_updated_at` สำหรับ `product_variants`

## Task 2: Types & Lib

- [x] เพิ่ม `ProductVariantDB` type ใน `types/index.ts`
- [x] อัปเดต `Product` type ใน `lib/products.ts` เพิ่ม `variants?: ProductVariantDB[]`
- [x] อัปเดต `getAllProducts()` ให้ fetch variants พร้อมกัน (Supabase join)
- [x] อัปเดต `getProductById()` ให้ fetch variants พร้อมกัน

## Task 3: Cart Store

- [x] อัปเดต `CartItem` type ใน `store/useCartStore.ts` เพิ่ม `variantId?` และ `variantLabel?`
- [x] อัปเดต `addItem` ให้ใช้ `variantId` เป็น unique key (product ชิ้นเดียวกันแต่ต่าง variant = คนละ item)

## Task 4: Admin API

- [x] อัปเดต `GET /api/admin/products` — include variants ใน response
- [x] อัปเดต `POST /api/admin/products` — รับและ insert variants
- [x] อัปเดต `PATCH /api/admin/products/[id]` — upsert/delete variants

## Task 5: Checkout API

- [x] อัปเดต `POST /api/checkout` — stock check จาก variant ถ้ามี `variantId`
- [x] อัปเดต `createOrder` ใน `lib/orders.ts` — เก็บ `variant_id` ใน `order_items`
- [x] เพิ่ม column `variant_id` และ `variant_label` ใน `order_items` table

## Task 6: Admin UI

- [x] เพิ่ม toggle "มีหลาย option" ใน admin products form
- [x] เพิ่ม variant editor (add/remove rows: label, price, stock, sku)
- [x] แสดง variant count ใน products list

## Task 7: Shop UI

- [x] อัปเดต products page — แสดง variant selector เมื่อสินค้ามี variants
- [x] แสดงราคา "เริ่มต้น ฿XXX" สำหรับสินค้าที่มี variants
- [x] ปุ่ม "เพิ่มลงตะกร้า" disabled จนกว่าจะเลือก variant
- [x] Cart page — แสดง variant label ใต้ชื่อสินค้า
