# คู่มือการใช้งาน — Next E-commerce v1.3-haiku

> อัปเดตล่าสุด: 24 พฤษภาคม 2026

คู่มือนี้ครอบคลุมการใช้งานระบบทั้งในมุมมองของ **ลูกค้า** และ **ผู้ดูแลระบบ** รวมถึงขั้นตอนการตั้งค่าระบบชำระเงิน Stripe

---

## สารบัญ

1. [สำหรับลูกค้า](#สำหรับลูกค้า)
2. [สำหรับผู้ดูแลระบบ (Admin)](#สำหรับผู้ดูแลระบบ-admin)
3. [การตั้งค่าระบบ (Setup Guide)](#การตั้งค่าระบบ-setup-guide)

---

## สำหรับลูกค้า

### การสมัครสมาชิกและเข้าสู่ระบบ

**สมัครสมาชิก**
1. คลิก **"เข้าสู่ระบบ"** บน Header → เลือก **"สร้างบัญชีใหม่"**
2. กรอก ชื่อ, อีเมล, รหัสผ่าน แล้วกด **Register**
3. ระบบจะพาไปหน้า Login อัตโนมัติ

**เข้าสู่ระบบ**
1. คลิก **"เข้าสู่ระบบ"** บน Header
2. กรอกอีเมลและรหัสผ่าน แล้วกด **Login**
3. เมื่อสำเร็จ จะเห็นชื่อผู้ใช้บน Header และเมนู **My Downloads** ปรากฏขึ้น

> บัญชีทดสอบ: `demo@example.com` / `password123`

---

### การเลือกซื้อสินค้า

1. ไปที่หน้า **สินค้า** จาก Header หรือหน้าแรก
2. สินค้าแบ่งเป็น 2 ประเภท:
   - **สินค้าทั่วไป** — จัดส่งทางกายภาพ
   - **Digital Product** (ป้ายสีม่วง) — ดาวน์โหลดได้ทันทีหลังชำระเงิน
3. ดูจำนวนสินค้าคงเหลือใต้ราคา:
   - **สีส้ม "เหลือ X ชิ้น"** — ใกล้หมด (≤5 ชิ้น)
   - **สีเทา "คงเหลือ X ชิ้น"** — ยังมีพอ
   - **ป้าย "สินค้าหมด"** — ไม่สามารถสั่งซื้อได้
4. กดปุ่ม **"เพิ่มลงตะกร้า"** — ปุ่มจะเปลี่ยนเป็นสีเขียวพร้อมเครื่องหมายถูกเพื่อยืนยัน
5. ไอคอนตะกร้าบน Header จะแสดงจำนวนสินค้าที่เพิ่มไว้

---

### ตะกร้าสินค้าและ Checkout

**ตะกร้าสินค้า** (`/cart`)
- ปรับจำนวนสินค้าด้วยปุ่ม **+** / **-**
- ลบสินค้าด้วยปุ่ม **Remove**
- ดูยอดรวมทางขวา แล้วกด **"ไปยัง Checkout"**

**Checkout** (`/checkout`)
1. ตรวจสอบรายการสินค้าและยอดรวม
2. กด **"ชำระเงินด้วย Stripe"**
3. ระบบจะพาไปหน้าชำระเงินของ Stripe (ปลอดภัย, SSL encrypted)
4. กรอกข้อมูลบัตรเครดิต/เดบิต แล้วกด **Pay**

> **บัตรทดสอบ (Test Mode):**
> - `4242 4242 4242 4242` — ชำระสำเร็จ
> - วันหมดอายุ: วันใดก็ได้ในอนาคต | CVV: ตัวเลข 3 หลักใดก็ได้

**หลังชำระเงินสำเร็จ**
- Stripe จะ redirect กลับมาที่หน้า **"ชำระเงินสำเร็จ"** พร้อมหมายเลข Session
- ระบบจะประมวลผล order อัตโนมัติ (assign license key + หัก stock)

---

### การรับสินค้า Digital และ License Key

หลังชำระเงินสำเร็จ (อาจใช้เวลาสักครู่ในการประมวลผล):
1. ไปที่เมนู **My Downloads** (ต้อง Login)
2. จะเห็นรายการสินค้า Digital ที่ซื้อทั้งหมด พร้อม:
   - **License Key** — รหัสสำหรับเปิดใช้งานโปรแกรม พร้อมปุ่ม Copy
   - **ปุ่ม Download** — ดาวน์โหลดไฟล์โดยตรง

---

### Live Commerce (`/live`)

- ดู Live Stream สดจากร้านค้า
- เห็นสินค้าที่ Admin pin ไว้ระหว่าง Live พร้อมราคา
- กด **"ใส่ตะกร้าทันที"** เพื่อเพิ่มสินค้าโดยไม่ต้องออกจากหน้า Live
- พูดคุยกับ Admin และลูกค้าคนอื่นผ่าน Live Chat

---

## สำหรับผู้ดูแลระบบ (Admin)

### การเข้าสู่หน้า Admin

1. Login ด้วยบัญชี Admin: `admin@example.com` / `admin123`
2. ไปที่ `/admin/dashboard` โดยตรง

> Admin panel แยกออกจากหน้าร้านค้าโดยสมบูรณ์ — ไม่มี Header/Footer ของร้าน และไม่ได้รับผลจาก Theme Engine

[admin register](http://localhost:3000/register?admin_key=admin2026)

---

### Dashboard (`/admin/dashboard`)

ภาพรวมร้านค้า:

| การ์ด | ข้อมูล |
|---|---|
| ยอดขายวันนี้ | รายได้รวมของวัน |
| คำสั่งซื้อที่รอดำเนินการ | จำนวน Order สถานะ Pending |
| สินค้าคงเหลือต่ำ | สินค้าที่ stock เหลือน้อย |

ด้านล่างมีตาราง **Recent Orders** แสดงออเดอร์ล่าสุด

---

### จัดการสินค้า (`/admin/products`)

**เพิ่มสินค้าใหม่**
1. กด **"เพิ่มสินค้า"**
2. กรอกข้อมูล:
   - **ชื่อสินค้า, คำอธิบาย, ราคา, จำนวน stock**
   - **ประเภท:** Physical หรือ Digital
   - **สำหรับ Digital:** ใส่ `digital_file_url` (URL ไฟล์ดาวน์โหลด)
   - **License Key Required:** เปิดถ้าต้องการแจก license key อัตโนมัติ
3. กด **Save**

**แก้ไขสินค้า** — คลิกที่แถวสินค้า แก้ไขแล้วกด Save

**ซ่อนสินค้า** — toggle `is_active` เป็น off (soft delete — ข้อมูลยังอยู่ใน DB)

> **หมายเหตุ License Key:** ต้องเพิ่ม license keys ใน Supabase table `license_keys` ก่อน ระบบจะ assign ให้อัตโนมัติเมื่อมีการซื้อ

---

### จัดการคำสั่งซื้อ (`/admin/orders`)

- ดูออเดอร์ทั้งหมด เรียงตามวันที่ล่าสุด
- **กด expand** เพื่อดูรายละเอียด: รายการสินค้า, ข้อมูลลูกค้า, ที่อยู่จัดส่ง
- **Progress bar** แสดง status flow:

```
รอดำเนินการ (pending) → ชำระแล้ว (paid) → จัดส่งแล้ว (shipped) → ส่งถึงแล้ว (delivered)
```

> Order จะเปลี่ยนจาก `pending` → `paid` อัตโนมัติเมื่อ Stripe webhook ยืนยันการชำระเงิน

- **เปลี่ยน status** — ใช้ dropdown เปลี่ยนได้ทันที (เช่น เมื่อจัดส่งพัสดุแล้ว)
- **พิมพ์ใบปะหน้า** — กดปุ่ม Print เพื่อพิมพ์ใบปะหน้ากล่องพัสดุ (เฉพาะ order ที่มีที่อยู่จัดส่ง)

---

### จัดการลูกค้า (`/admin/customers`)

- ดูรายชื่อลูกค้าที่ลงทะเบียนทั้งหมด
- ดูประวัติการสั่งซื้อของแต่ละคน

---

### Live Commerce (`/admin/live`)

1. กด **"เริ่ม Live"** เพื่อเปิด Live Stream
2. เลือกสินค้าที่ต้องการ pin ให้ลูกค้าเห็นระหว่าง Live
3. ลูกค้าสามารถดู Live และเพิ่มสินค้าลงตะกร้าได้ที่ `/live`
4. กด **"จบ Live"** เมื่อเสร็จสิ้น

---

### จัดการเนื้อหาหน้า (`/admin/pages`)

แก้ไขเนื้อหาของหน้าต่างๆ โดยไม่ต้องแก้โค้ด:
- หน้า FAQ (`/faq`)
- นโยบายการจัดส่ง (`/shipping`)
- ติดต่อเรา (`/contact`)

---

### ตั้งค่าร้านค้า (`/admin/settings`)

**Theme Engine** — เปลี่ยนหน้าตาร้านค้าได้ทันทีโดยไม่ต้อง deploy ใหม่

| Theme | ลักษณะ |
|---|---|
| Modern (default) | Clean, rounded corners, สีเข้ม |
| Minimal | White, subtle border, sharp edges |
| Warm Commerce | ครีม/ส้ม, cozy สำหรับร้านค้าทั่วไป |
| Cyberpunk | Dark background, neon green/magenta |

นอกจาก theme สำเร็จรูป ยังปรับได้เอง:
- **Primary Color** — สีหลักของปุ่มและ accent
- **Border Radius** — ความโค้งของ card และปุ่ม

การเปลี่ยนแปลงมีผลทันทีโดยไม่ต้อง reload หน้า

**ข้อมูลร้านค้า** — ชื่อร้าน, โลโก้

**ข้อมูลการชำระเงิน** — ชื่อบัญชี, เลขบัญชี, ธนาคาร, PromptPay, QR Code

**Social Media** — Facebook, Twitter/X, Instagram, LINE

---

## การตั้งค่าระบบ (Setup Guide)

### 1. Environment Variables

สร้างไฟล์ `.env.local` ที่ root ของโปรเจกต์:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...

# NextAuth
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

> สร้าง `NEXTAUTH_SECRET` ด้วย: `openssl rand -base64 32`

---

### 2. ตั้งค่า Database (Supabase)

1. ไปที่ [supabase.com](https://supabase.com) → สร้าง project ใหม่
2. ไปที่ **SQL Editor** → วางเนื้อหาจากไฟล์ `supabase-schema.sql` → กด Run
3. ระบบจะสร้างตารางและ RLS policies ทั้งหมดให้อัตโนมัติ

**ตารางที่สร้าง:**
`users`, `products`, `orders`, `order_items`, `license_keys`, `site_config`, `live_streams`

---

### 3. ตั้งค่า Stripe

#### 3.1 สร้าง Stripe Account
1. ไปที่ [dashboard.stripe.com](https://dashboard.stripe.com)
2. สร้างบัญชีหรือ Login
3. ไปที่ **Developers → API keys**
4. Copy **Secret key** (`sk_test_...`) ใส่ใน `STRIPE_SECRET_KEY`

#### 3.2 ตั้งค่า Webhook (Local Development)

ติดตั้ง Stripe CLI:
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows (scoop)
scoop install stripe

# หรือดาวน์โหลดจาก https://stripe.com/docs/stripe-cli
```

Login และ forward webhook:
```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy **webhook signing secret** (`whsec_...`) ที่แสดงขึ้นมา ใส่ใน `STRIPE_WEBHOOK_SECRET`

#### 3.3 ตั้งค่า Webhook (Production)

1. ไปที่ **Stripe Dashboard → Developers → Webhooks**
2. กด **"Add endpoint"**
3. ใส่ URL: `https://yourdomain.com/api/stripe/webhook`
4. เลือก Events: `checkout.session.completed`
5. Copy **Signing secret** ใส่ใน `STRIPE_WEBHOOK_SECRET` บน server

#### 3.4 ทดสอบการชำระเงิน

ใช้บัตรทดสอบของ Stripe:

| หมายเลขบัตร | ผลลัพธ์ |
|---|---|
| `4242 4242 4242 4242` | ✅ ชำระสำเร็จ |
| `4000 0000 0000 9995` | ❌ ล้มเหลว (insufficient funds) |
| `4000 0025 0000 3155` | 🔐 ต้องการ 3D Secure |

วันหมดอายุ: วันใดก็ได้ในอนาคต | CVV: ตัวเลข 3 หลักใดก็ได้

---

### 4. รัน Development Server

```bash
pnpm install    # ติดตั้ง dependencies
pnpm dev        # รัน dev server ที่ http://localhost:3000
```

เปิด terminal แยกสำหรับ Stripe webhook:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

### 5. Build & Deploy

```bash
pnpm build    # ตรวจสอบ build
pnpm start    # รัน production server
```

**Deploy บน Vercel:**
1. Push code ขึ้น GitHub
2. Import repo ใน [vercel.com](https://vercel.com)
3. ตั้งค่า Environment Variables ใน Vercel Dashboard (ทุกตัวใน `.env.local`)
4. Deploy — Vercel จะ build และ deploy อัตโนมัติ

> อย่าลืมอัปเดต `NEXTAUTH_URL` เป็น production URL และตั้ง Stripe webhook endpoint ใหม่สำหรับ production domain

---

### Fallback Mode

หากยังไม่ได้เชื่อม Supabase หรือ Stripe ระบบจะใช้ข้อมูล fallback ในโค้ด (`lib/products.ts`) เพื่อให้ทดสอบ UI ได้ทันที แต่การชำระเงินจะไม่ทำงานจนกว่าจะใส่ Stripe keys จริง
