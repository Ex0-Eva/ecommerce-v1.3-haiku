# Next E-commerce v1.3-haiku

แพลตฟอร์มอีคอมเมิร์ซสร้างด้วย **Next.js 16.2.6 App Router** พร้อมระบบ Auth, Cart, Checkout, Digital Products, Live Commerce และ Admin Dashboard ครบในที่เดียว

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.6 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | NextAuth.js v4 + bcryptjs |
| State | Zustand v5 |
| Runtime | React 19 |
| Package Manager | pnpm |

---

## โครงสร้างโปรเจกต์

```
app/
├── (auth)/
│   ├── login/          # หน้า Login
│   └── register/       # หน้า Register
├── (shop)/
│   ├── products/       # หน้าแสดงสินค้า
│   ├── cart/           # ตะกร้าสินค้า
│   ├── live/           # Live Commerce (ฝั่งลูกค้า)
│   └── my-downloads/   # ดาวน์โหลดสินค้า Digital
├── admin/
│   ├── dashboard/      # Admin Dashboard
│   ├── products/       # จัดการสินค้า
│   ├── orders/         # จัดการออเดอร์
│   ├── customers/      # จัดการลูกค้า
│   ├── live/           # จัดการ Live Stream
│   ├── pages/          # จัดการเนื้อหาหน้าต่างๆ
│   └── settings/       # ตั้งค่าร้านค้า + Theme Engine
├── api/
│   ├── auth/           # NextAuth + Register endpoint
│   ├── cart/sync/      # Sync cart กับ server
│   ├── checkout/       # สร้าง Order
│   └── my-downloads/   # ดึงรายการ Digital downloads
├── checkout/
│   ├── page.tsx        # หน้า Checkout
│   └── success/        # หน้ายืนยันคำสั่งซื้อ
└── themes/
    ├── cyberpunk.css   # Theme: Cyberpunk
    ├── minimal.css     # Theme: Minimal
    └── warm.css        # Theme: Warm Commerce

components/
├── layout/
│   ├── site-header.tsx # Header + Mobile menu + Cart badge
│   └── site-footer.tsx # Footer + Social links
├── modules/
│   └── product-card.tsx
└── theme/
    └── theme-preview-manager.tsx

lib/                    # Server-side utilities
store/                  # Zustand stores (cart)
services/               # Auth & Product services
types/                  # TypeScript types
```

---

## เริ่มต้นใช้งาน

### 1. ติดตั้ง dependencies

```bash
pnpm install
```

### 2. ตั้งค่า Environment Variables

คัดลอก `.env.local` และกรอกค่าให้ครบ:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth
NEXTAUTH_SECRET=your-random-secret-string
NEXTAUTH_URL=http://localhost:3000

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. ตั้งค่า Database

รันไฟล์ `supabase-schema.sql` ใน **Supabase SQL Editor** เพื่อสร้างตารางทั้งหมด:

- `users` — ข้อมูลผู้ใช้ (ต่อจาก `auth.users`)
- `products` — สินค้า (physical / digital)
- `orders` + `order_items` — คำสั่งซื้อ
- `license_keys` — คีย์สำหรับสินค้า Digital
- `site_config` — ตั้งค่าร้านค้าและ Theme
- `live_streams` — Live Commerce

### 4. รัน Development Server

```bash
pnpm dev
```

เปิด [http://localhost:3000](http://localhost:3000)

---

## ฟีเจอร์หลัก

### Theme Engine
ปรับแต่งสีหลัก, border radius และ theme ได้จาก Admin → Settings โดยไม่ต้องแก้โค้ด รองรับ 4 themes:
- **Modern** (default) — clean, rounded, slate
- **Minimal** — white, subtle border, sharp edges
- **Warm Commerce** — ครีม/ส้ม, cozy สำหรับร้านค้าทั่วไป
- **Cyberpunk** — dark background, neon green

### Digital Products
สินค้าประเภท `digital` รองรับ:
- ลิงก์ดาวน์โหลดไฟล์ (`digital_file_url`)
- License Key อัตโนมัติ (`license_key_required`)
- หน้า My Downloads หลังชำระเงิน

### Live Commerce
Admin สามารถเปิด Live Stream และ pin สินค้าแนะนำแบบ real-time ผ่าน `/admin/live`

### Cart Sync
ตะกร้าสินค้าเก็บใน Zustand (localStorage) และ sync กับ Supabase เมื่อผู้ใช้ login ผ่าน `/api/cart/sync`

---

## Build & Deploy

```bash
# ตรวจสอบ build
pnpm build

# รัน production
pnpm start
```

รองรับ deploy บน **Vercel** ได้ทันที — เพียงเชื่อม repo และตั้งค่า Environment Variables ใน Vercel Dashboard

---

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Development server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Production server |
| `pnpm lint` | ESLint |
