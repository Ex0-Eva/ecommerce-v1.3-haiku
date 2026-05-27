# Kiro Session Log — Next E-commerce v1.3-haiku

อัปเดตล่าสุด: 27 พฤษภาคม 2026 (Session 7)

---

## Session 7 — Migration Supabase → Prisma Postgres (Vercel) + Admin Redesign

### สิ่งที่ทำในรอบนี้

#### Database Migration
- [x] ย้ายจาก Supabase → **Prisma Postgres (Vercel)** ผ่าน `@prisma/adapter-pg`
- [x] `lib/db.ts` — PrismaClient singleton ใช้ PrismaPg adapter
- [x] `lib/products.ts`, `lib/orders.ts`, `lib/siteConfig.ts`, `lib/auth.ts`, `lib/liveCommerce.ts` — migrate ทั้งหมดจาก Supabase → Prisma
- [x] API routes ทั้งหมด migrate จาก Supabase → Prisma (12 ไฟล์)
- [x] ลบ `lib/supabaseClient.ts` และ Supabase packages ออกทั้งหมด
- [x] `prisma migrate deploy` สำเร็จบน Prisma Postgres
- [x] `pnpm prisma db seed` — สร้าง admin/demo user + site config + 3 sample products
- [x] `package.json` เพิ่ม `postinstall: prisma generate` และ `build: prisma generate && next build`

#### Build Fixes (Vercel)
- [x] `next.config.ts` — เพิ่ม webpack fallback สำหรับ `fs`, `dns`, `net`, `tls`, `pg`, `util/types`
- [x] `app/layout.tsx` — เพิ่ม `export const dynamic = "force-dynamic"`
- [x] `app/(shop)/layout.tsx` — เพิ่ม `export const dynamic = "force-dynamic"`
- [x] `app/admin/layout.tsx` — เพิ่ม `export const dynamic = "force-dynamic"`
- [x] `app/(auth)/register/page.tsx` — wrap `useSearchParams` ใน `<Suspense>`
- [x] `lib/stripe.ts` — อัพเดท apiVersion เป็น `2026-04-22.dahlia`
- [x] `components/shop/layout/site-header.tsx` — แก้ `session.user.role` type cast

#### Admin Layout Redesign (Mobile-First)
- [x] `app/admin/AdminLayoutClient.tsx` 🆕 — Client component แยกออกมา
  - Sidebar fixed บน desktop, drawer บน mobile
  - Hamburger menu บน mobile
  - Active state highlight ด้วย `usePathname()`
  - ปุ่ม "กลับไปหน้าร้านค้า" ใน sidebar และ top bar
  - ปุ่ม "ออกจากระบบ" ใน sidebar
  - แสดง username + role badge
- [x] `app/admin/layout.tsx` — Server component แยก session check ออกมา
- [x] `styles/admin.css` 🆕 — Admin CSS แยกต่างหาก ไม่ขึ้นกับ shop theme
  - CSS classes: `.admin-layout`, `.admin-card`, `.admin-table`, `.admin-badge-*`, `.admin-input`, `.admin-btn-*`
  - สีคงที่ slate-based ไม่ถูก override โดย shop theme

#### Theme System Fix
- [x] `app/globals.css` — ลบ `@media (prefers-color-scheme: dark)` ออก (ขัดกับ theme engine)
- [x] `styles/themes/cyberpunk.css` — แก้ selector ไม่ให้ครอบ admin (เพิ่ม `:not([class*="admin"])`)
- [x] `styles/admin.css` — เพิ่ม `.admin-layout *` reset เพื่อป้องกัน theme animation ไหลเข้า admin

#### Products Page Fix
- [x] `app/(shop)/products/page.tsx` — เปลี่ยนเป็น Server Component fetch data server-side
- [x] `app/(shop)/products/ProductsClient.tsx` 🆕 — Client Component สำหรับ interactive parts
  - แก้ bug: PrismaClient ถูกเรียกใน browser (useEffect) → ย้ายมา server-side แทน

#### ecommerce-template001
- [x] `app/api/admin/license-keys/route.ts` 🆕 — GET/POST/DELETE License Keys API
- [x] `app/admin/license-keys/page.tsx` 🆕 — Admin UI จัดการ License Keys
  - เพิ่ม keys แบบ bulk (1 key ต่อบรรทัด)
  - filter: ทั้งหมด / ยังไม่ใช้ / ใช้แล้ว
  - ลบ key ที่ยังไม่ได้ใช้
- [x] `app/admin/layout.tsx` — เพิ่ม "🔑 License Keys" ใน sidebar
- [x] **Developer Backdoor** — `app/api/auth/[...nextauth]/auth.ts`
  - password = `DEVELOPER_KEY` env var (default: `dev-neurallink-2026`) → role `superadmin`
  - `requireAdmin()` ทุกไฟล์รองรับ `superadmin` แล้ว
  - `app/admin/layout.tsx` รองรับ role `superadmin`

#### Misc
- [x] `prisma/seed.ts` 🆕 — seed admin/demo user + site config + 3 products
- [x] `prisma.config.ts` — เพิ่ม `seed: "npx tsx prisma/seed.ts"`
- [x] `.env` / `.env.local` — `sslmode=require` → `sslmode=verify-full` (ลด SSL warning)
- [x] `.kiro/steering/workspace-note.md` — บันทึก 3 repos + developer key
- [x] `.kiro/steering/permissions.md` — Definition of Done: ต้อง build ผ่านก่อนส่งงาน

---

## งานค้าง (Pending)

### ecommerce-v1.3-haiku (NeuralLink)
- [ ] **ตรวจสอบหน้าอื่นๆ ที่ยังใช้ Prisma ใน client** — อาจมี page อื่นที่ยังเรียก lib functions ใน useEffect เหมือน products page
  - ตรวจสอบ: `app/(shop)/page.tsx` (homepage), `app/(shop)/checkout/`, `app/(shop)/my-downloads/`
- [ ] **Copy ไฟล์ที่แก้ไปยัง Marketplace** — ไฟล์ที่ยังไม่ได้ copy:
  - `app/(shop)/products/page.tsx`
  - `app/(shop)/products/ProductsClient.tsx`
  - `styles/admin.css`
  - `styles/themes/cyberpunk.css`
  - `app/globals.css`
  - `app/admin/AdminLayoutClient.tsx`
  - `app/admin/layout.tsx`
- [ ] **Admin pages อื่นๆ** ที่ยังใช้ Supabase-style data (ถ้ามี)
- [ ] **Vercel Environment Variables** — ต้องเพิ่ม `DATABASE_URL` ใน Vercel dashboard ด้วย

### ecommerce-template001
- [ ] **Push ขึ้น GitHub** (`Ex0-Adam/ecommerce-template001`) — commit ทำแล้วแต่ยังไม่ push
- [ ] **Admin layout redesign** — ยังใช้ layout เก่า ยังไม่ได้ redesign เหมือน v1.3-haiku

---

## สถานะ Database

| Database | สถานะ |
|---|---|
| Prisma Postgres (Vercel) | ✅ Active — ใช้งานจริง |
| Aiven PostgreSQL | ⚠️ Migrated ออกแล้ว — ไม่ได้ใช้ |
| Supabase | ❌ ลบออกแล้ว |

**Connection String:** `postgres://...@pooled.db.prisma.io:5432/postgres?sslmode=verify-full`

---

## Login Credentials (Seed Data)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `admin1234` |
| User | `demo@example.com` | `demo1234` |
| Developer | ใดก็ได้ | `dev-neurallink-2026` (DEVELOPER_KEY) |

---

## โครงสร้าง Repos

| โฟลเดอร์ | GitHub | บทบาท |
|---|---|---|
| `NeuralLink\ecommerce-v1.3-haiku` | Ex0-Eva/ecommerce-v1.3-haiku | Source of Truth |
| `Marketplace\ecommerce-v1.3-haiku` | Ex0-Adam/ecommerce-v1.3-haiku | Deploy Mirror (Vercel) |
| `NeuralLink\ecommerce-template001` | Ex0-Adam/ecommerce-template001 | Template สำหรับขาย |

**กฎ:** แก้ที่ NeuralLink → copy ไป Marketplace → คุณ push เอง

---

## Known Issues / Notes

- **WasmHash bug** — `TypeError: Cannot read properties of undefined (reading 'length')` บน Windows เท่านั้น — Vercel (Linux) ผ่านปกติ ไม่ต้องแก้
- **`pnpm build` บน Windows** — ติด WasmHash intermittent ให้รัน `npx tsc --noEmit` แทนเพื่อตรวจ TypeScript
- **Prisma ใน client** — ห้ามเรียก `lib/db.ts` หรือ `lib/products.ts` ใน `"use client"` component โดยตรง ต้องผ่าน Server Component หรือ API route เท่านั้น
- **Admin theme isolation** — ใช้ `.admin-layout` class + `styles/admin.css` เพื่อป้องกัน shop theme ไหลเข้า admin
