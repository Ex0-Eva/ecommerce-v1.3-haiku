# Kiro Session Log — Next E-commerce v1.2

อัปเดตล่าสุด: 24 พฤษภาคม 2026 (Session 5)

---

## สิ่งที่ทำไปแล้ว (Completed)

### Session 1 — UI & Bug Fixes
- [x] **Homepage** — Hero section, Feature cards, CTA section
- [x] **Site Header** — Cart badge, hamburger menu, sticky
- [x] **Products Page** — Skeleton loading, add-to-cart feedback animation
- [x] **CartSync** — แก้ infinite fetch loop (`isSyncing` + `hasSynced` ref)
- [x] **Cart store** — ลบ `total()` ออกจาก store, เพิ่ม `selectCartTotal` / `selectCartCount` selector
- [x] **bcrypt** — เปลี่ยนเป็น pre-computed hash แทน hash ทุกครั้งที่ import
- [x] **Admin route guard** — `getServerSession` + role check ใน `app/admin/layout.tsx`
- [x] **Docs** — README.md, MANUAL.md, AGENTS.md เขียนใหม่ทั้งหมด

### Session 2 — Core Features
- [x] **Admin Products form** — fields ครบ (name, description, price, stock, image_url, product_type, digital_file_url, license_key_required, is_active) + เชื่อม API จริง
- [x] **API** `POST /api/admin/products` — create product
- [x] **API** `PATCH /api/admin/products/[id]` — update product
- [x] **API** `DELETE /api/admin/products/[id]` — soft delete
- [x] **Checkout** — เพิ่มฟอร์มที่อยู่จัดส่ง (ซ่อนถ้า digital-only order)
- [x] **API** `PATCH /api/admin/orders/[id]` — เปลี่ยน order status
- [x] **Admin Orders** — expand detail, progress bar, เปลี่ยน status, print ใบปะหน้า
- [x] **Stock deduction** — หัก stock ผ่าน Supabase RPC `decrement_stock()`
- [x] **lib/orders.ts** — เพิ่ม `ShippingAddress` type, รองรับ shipping_address JSONB
- [x] **supabase-schema.sql** — เขียนใหม่ทั้งหมด แก้ลำดับ FK (orders ก่อน license_keys), รวม migration v2 เข้าไปแล้ว

### Session 3 — Theme Engine
- [x] **Theme: Cyberpunk** — เขียน CSS ใหม่ด้วย `html.theme-cyberpunk` high-specificity selector, glitch animation บน h1
- [x] **Theme: Minimal** — แก้ selector ไม่ให้ครอบ button ทุกปุ่ม (white-on-white bug)
- [x] **Theme: Warm Commerce** 🆕 — theme ใหม่ สีส้ม/ครีม (`styles/themes/warm.css`)
- [x] **layout.tsx** — import warm.css, รวม `THEME_VARS` object แทน hardcode if/else
- [x] **ThemePreviewManager** — รองรับ warm theme, ลบ class เก่าก่อน apply ใหม่
- [x] **lib/siteConfig.ts** — แก้ `updateSiteConfig` bug (hardcode `.eq('theme_name','modern')` → ใช้ `id` จริง)
- [x] **Admin Settings page** — เขียนใหม่: visual theme cards, auto-fill preset colors, apply ทันทีโดยไม่ต้อง reload
- [x] **API** `GET /api/site-config` — endpoint ใหม่สำหรับ settings page ดึง config จาก DB

### Session 4 — Shop/Admin Separation + Backlog
- [x] **`app/layout.tsx`** — ลด root layout ให้เป็น bare layout ครอบแค่ `<Providers>`
- [x] **`app/(shop)/layout.tsx`** 🆕 — shop layout ใหม่ ครอบ SiteHeader + SiteFooter + theme engine
- [x] **`styles/themes/`** 🆕 — ย้าย theme CSS จาก `app/themes/` → `styles/themes/`
- [x] **`components/shop/`** 🆕 — ย้าย SiteHeader, SiteFooter, ProductCard, ThemePreviewManager เข้า shop namespace
- [x] **`components/admin/`** 🆕 — สร้างโฟลเดอร์เตรียมไว้
- [x] **แสดง "สินค้าหมด"** — badge บน image + ปุ่ม disabled เมื่อ `stock === 0`
- [x] **Copy button สำหรับ license key** — `CopyButton` component ใน my-downloads
- [x] **Fallback สำหรับ `/api/my-downloads`** — error state + ปุ่ม "ลองใหม่"
- [x] **AGENTS.md** — อัปเดต Styling, Site Config, File Conventions

### Session 5 — Payment Gateway + Backlog Completion (24 พฤษภาคม 2026)
- [x] **Stripe Payment Gateway** 🆕 — ติดตั้ง `stripe@17.7.0`, implement Checkout Session flow จริง
- [x] **`lib/stripe.ts`** — Stripe client (apiVersion: `2025-02-24.acacia`)
- [x] **`app/api/checkout/route.ts`** — สร้าง Stripe Checkout Session → redirect ไป Stripe แทน mark paid ทันที
- [x] **`app/api/stripe/webhook/route.ts`** 🆕 — รับ `checkout.session.completed` → fulfill order (assign license key + หัก stock)
- [x] **`lib/orders.ts`** — เพิ่ม `fulfillOrder()`, รองรับ `status: "pending"` และ `stripeSessionId`
- [x] **`app/(shop)/checkout/success/page.tsx`** 🆕 — Checkout success page รองรับ `?session_id=` จาก Stripe
- [x] **`types/index.ts`** — รวม type: เปลี่ยน `type?` → `product_type` ใน `ProductVariant` ให้ตรงกับ DB schema
- [x] **แสดง stock ที่เหลือ** — `≤5 ชิ้น` สีส้ม (urgent), `>5 ชิ้น` สีเทา, digital ไม่แสดง
- [x] **แก้ `as any` ใน checkout** — ไม่มี type cast แล้ว ทุก `addItem()` call ใช้ `product_type` ถูกต้อง
- [x] **AGENTS.md** — อัปเดต Turbopack note, Tailwind v4.2–v4.3 features, codemod ที่ถูกต้อง
- [x] **MANUAL.md** — อัปเดต Stripe setup guide + user flow ใหม่

---

## สถานะ Flow ปัจจุบัน

| Flow | สถานะ |
|---|---|
| Login / Register | ✅ ทำงานได้ |
| Admin route guard (session + role) | ✅ ทำงานได้ |
| เพิ่ม/แก้ไข/ซ่อนสินค้า | ✅ ทำงานได้ (เชื่อม Supabase) |
| Cart (add, remove, update, persist) | ✅ ทำงานได้ |
| Checkout → Stripe → Webhook → Fulfill | ✅ ทำงานได้ (ต้องใส่ Stripe keys) |
| Stock deduction หลังซื้อ | ✅ ทำงานได้ (ผ่าน webhook) |
| Digital product → license key | ✅ ทำงานได้ (ผ่าน webhook) |
| Checkout success page | ✅ ทำงานได้ |
| My Downloads | ✅ ทำงานได้ |
| Admin Orders (detail + status + print) | ✅ ทำงานได้ |
| Theme Engine (4 themes) | ✅ ทำงานได้ |
| Admin Settings save/apply | ✅ ทำงานได้ |

---

## สิ่งที่ยังไม่ได้ทำ (Backlog)

- [ ] **Stripe keys จริง** — ใส่ `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` ใน `.env.local` ก่อน deploy
- [ ] **Omise** — ทางเลือก payment gateway สำหรับตลาดไทย (ถ้าต้องการ)
- [ ] **Order confirmation email** — ส่ง email หลัง webhook fulfill สำเร็จ
- [ ] **Admin: แสดง stripe_session_id** ใน order detail

---

## โครงสร้างไฟล์สำคัญ

```
app/
├── layout.tsx              ← bare root: Providers เท่านั้น
├── globals.css             ← global styles + CSS vars
├── providers.tsx           ← SessionProvider + CartSync
├── (shop)/
│   ├── layout.tsx          ← SiteHeader + SiteFooter + theme engine
│   ├── page.tsx            ← homepage
│   ├── products/
│   ├── cart/
│   ├── checkout/
│   │   ├── page.tsx        ← Stripe checkout redirect
│   │   └── success/page.tsx ← หน้าหลัง payment สำเร็จ
│   ├── live/
│   ├── my-downloads/
│   ├── about/ contact/ faq/ shipping/
├── (auth)/
│   ├── login/
│   └── register/
└── admin/
    ├── layout.tsx          ← sidebar + session guard
    ├── products/
    ├── orders/
    └── settings/

api/
├── checkout/route.ts           ← สร้าง Stripe Checkout Session
├── stripe/webhook/route.ts     ← รับ Stripe webhook → fulfill order
├── admin/products/route.ts
├── admin/products/[id]/route.ts
├── admin/orders/[id]/route.ts
└── site-config/route.ts

lib/
├── stripe.ts       ← Stripe client (apiVersion: 2025-02-24.acacia)
├── orders.ts       ← createOrder, fulfillOrder, getOrderById, getAllOrders
├── products.ts     ← getAllProducts, getProductById + fallback data
└── siteConfig.ts   ← getSiteConfig, updateSiteConfig

types/
└── index.ts        ← ProductVariant (product_type), CartItem, UserProfile

styles/themes/
├── cyberpunk.css
├── minimal.css
└── warm.css
```

---

## Stripe Payment Flow

```
ลูกค้ากด "ชำระเงิน"
    ↓
POST /api/checkout
    → validate items + stock
    → สร้าง order (status: "pending") ใน Supabase
    → สร้าง Stripe Checkout Session
    → return { stripeUrl }
    ↓
redirect → Stripe Checkout Page (hosted by Stripe)
    ↓
ลูกค้ากรอกบัตร + ชำระเงิน
    ↓
Stripe → POST /api/stripe/webhook (checkout.session.completed)
    → verify signature
    → fulfillOrder(stripeSessionId)
        → assign license keys
        → หัก stock
        → update order status → "paid"
    ↓
Stripe redirect → /checkout/success?session_id=...
```

---

## Theme System

### 4 Themes ที่มี

| Theme | Class | Primary | ลักษณะ |
|---|---|---|---|
| Modern (default) | — | `#0f172a` | Clean, rounded, slate |
| Minimal | `theme-minimal` | `#111827` | White, subtle border, sharp |
| Warm Commerce | `theme-warm` | `#ea580c` | ครีม/ส้ม, cozy |
| Cyberpunk | `theme-cyberpunk` | `#00ff41` | Dark, neon green, grid |

---

## ข้อมูลสำคัญ

### Test Accounts
| Email | Password | Role |
|---|---|---|
| `admin@example.com` | `admin123` | admin |
| `demo@example.com` | `password123` | user |

### Stripe Test Cards
| Card | ผลลัพธ์ |
|---|---|
| `4242 4242 4242 4242` | Payment สำเร็จ |
| `4000 0000 0000 9995` | Payment ล้มเหลว (insufficient funds) |
| `4000 0025 0000 3155` | ต้องการ 3D Secure |

### Environment Variables ที่จำเป็น
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

### Commands
```bash
pnpm dev      # development (webpack)
pnpm build    # production build
pnpm start    # production server
pnpm lint     # ESLint

# Stripe local testing
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Supabase Tables
`users`, `products`, `orders`, `order_items`, `license_keys`, `site_config`, `live_streams`

### หมายเหตุเทคนิค
- `selectCartTotal` / `selectCartCount` export จาก `store/useCartStore.ts`
- `ProductVariant.product_type` (ไม่ใช่ `type`) — ตรงกับ DB schema
- Order สร้างด้วย `status: "pending"` → เปลี่ยนเป็น `"paid"` ผ่าน webhook เท่านั้น
- `fulfillOrder()` เป็น idempotent — ถ้า paid แล้วจะ skip ไม่ทำซ้ำ
- Stripe webhook ต้อง verify signature ด้วย `STRIPE_WEBHOOK_SECRET` ทุกครั้ง


---

## Session 6 — Product Variants + Link Audit (25 พฤษภาคม 2026)

### สิ่งที่ทำในรอบนี้

#### Product Variants System (Spec: `.kiro/specs/product-variants/`)
- [x] **Task 3 (Cart Store)** — ยืนยัน `addItem` ใช้ `variantId` เป็น composite key แล้ว, `CartItem` มี `variantId?` และ `variantLabel?`
- [x] **Task 4 (Admin API)** — GET/POST/PATCH `/api/admin/products` รองรับ variants ครบ (join, insert, upsert/soft-delete)
- [x] **Task 5 (Checkout API)** — `/api/checkout` เช็ค stock จาก variant, `lib/orders.ts` เก็บ `variant_id`/`variant_label` ใน `order_items`, schema มี columns ครบ
- [x] **Task 6 (Admin UI)** — toggle "สินค้านี้มีหลาย option", variant editor (add/remove rows: label/price/stock/sku), variant count badge + effective stock ใน products list
- [x] **Task 7 (Shop UI)** — variant selector (button group), "เริ่มต้น ฿XXX" pricing, disabled add-to-cart จนกว่าจะเลือก variant, variant label ใน cart page

#### Bug Fixes
- [x] **`app/admin/page.tsx`** 🆕 — เพิ่ม redirect `/admin` → `/admin/dashboard` (เดิม 404)
- [x] **Login redirect** — หลัง login เช็ค role แล้ว redirect: admin → `/admin/dashboard`, user → `/`
- [x] **Build errors** — แก้ JSX indent ใน `app/admin/products/page.tsx` (syntax error line 314), แก้ implicit `any` ใน `app/api/admin/products/route.ts` (2 จุด)

#### Link & Route Audit (25 พฤษภาคม 2026)
ตรวจสอบทุก route และเมนูครบแล้ว ผลลัพธ์:

| Route | Page | Header | Footer | Admin Sidebar |
|---|---|---|---|---|
| `/` | ✅ | ✅ Logo | ✅ Logo | — |
| `/products` | ✅ | ✅ | ✅ | — |
| `/live` | ✅ | ✅ | ✅ | — |
| `/cart` | ✅ | ✅ | ✅ | — |
| `/checkout` | ✅ | — | — | — |
| `/checkout/success` | ✅ | — | — | — |
| `/about` | ✅ | ✅ (เพิ่งเพิ่ม) | ✅ | — |
| `/contact` | ✅ | ✅ (เพิ่งเพิ่ม) | ✅ | — |
| `/faq` | ✅ | — | ✅ | — |
| `/shipping` | ✅ | — | ✅ | — |
| `/my-downloads` | ✅ | ✅ (เมื่อ login) | — | — |
| `/login` | ✅ | ✅ | — | — |
| `/register` | ✅ | — (จาก login) | — | — |
| `/admin` | ✅ | — | — | → redirect dashboard |
| `/admin/dashboard` | ✅ | — | — | ✅ |
| `/admin/products` | ✅ | — | — | ✅ |
| `/admin/orders` | ✅ | — | — | ✅ |
| `/admin/customers` | ✅ | — | — | ✅ |
| `/admin/live` | ✅ | — | — | ✅ |
| `/admin/pages` | ✅ | — | — | ✅ |
| `/admin/settings` | ✅ | — | — | ✅ |

**สิ่งที่แก้ในรอบ audit:** เพิ่ม "เกี่ยวกับเรา" (`/about`) และ "ติดต่อเรา" (`/contact`) ใน `site-header.tsx` — ก่อนหน้านี้มีแค่ใน footer

---

## สถานะ Flow ปัจจุบัน (อัปเดต 25 พฤษภาคม 2026)

| Flow | สถานะ |
|---|---|
| Login / Register | ✅ ทำงานได้ + redirect ตาม role |
| Admin route guard (session + role) | ✅ ทำงานได้ |
| `/admin` redirect → dashboard | ✅ ทำงานได้ |
| เพิ่ม/แก้ไข/ซ่อนสินค้า | ✅ ทำงานได้ |
| Product Variants (admin + shop + cart + checkout) | ✅ ทำงานได้ |
| Cart (add, remove, update, persist) | ✅ ทำงานได้ |
| Checkout → Stripe → Webhook → Fulfill | ✅ ทำงานได้ (ต้องใส่ Stripe keys) |
| Stock deduction หลังซื้อ (product + variant) | ✅ ทำงานได้ |
| Digital product → license key | ✅ ทำงานได้ |
| My Downloads | ✅ ทำงานได้ |
| Admin Orders (detail + status + print) | ✅ ทำงานได้ |
| Theme Engine (4 themes) | ✅ ทำงานได้ |
| Admin Settings save/apply | ✅ ทำงานได้ |
| ทุกลิงก์เมนูครบ (header + footer + admin sidebar) | ✅ ตรวจสอบแล้ว |

---

## อัพเดทฐานข้อมูลสำหรับ ecommerce v1.2-kiro

**สถานการณ์:** มีฐานข้อมูล Supabase อยู่แล้ว ซึ่งอาจมีตารางเดิมจาก version ก่อนหน้า (เช่น `users`, `products`, `orders` ฯลฯ) ที่มีข้อมูล production จริงอยู่

**ข้อกำหนด:**
1. **ห้ามแตะตารางเดิม** — ไม่ DROP, ไม่ ALTER, ไม่ INSERT/UPDATE/DELETE ข้อมูลในตารางที่มีอยู่แล้ว
2. **สร้างตารางใหม่ทั้งหมดที่ขึ้นต้นด้วย `v2_`** เช่น:
   - `v12_users`
   - `v12_products`
   - `v12_product_variants`
   - `v12_orders`
   - `v12_order_items`
   - `v12_license_keys`
   - `v12_site_config`
   - `v12_live_streams`
3. **โค้ดทั้งหมดในโปรเจกต์นี้** จะอ้างอิงตาราง `v12_*` เท่านั้น — ไม่ query ตารางเดิม
4. **ใช้ Supabase instance เดิม** (URL/key เดิม) แต่แยก namespace ด้วย prefix `v12_`

**ผลลัพธ์ที่ได้:** โปรเจกต์ v1.2 นี้ทำงานบนตาราง `v12_*` ทั้งหมด โดยไม่กระทบข้อมูลเดิมในฐานข้อมูลเลย

---