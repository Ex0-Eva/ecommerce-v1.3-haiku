---
inclusion: always
---

# Workspace Note — สำคัญมาก

## 2 โฟลเดอร์นี้เป็นโปรเจกต์เดียวกัน (Mirror)

| โฟลเดอร์ | GitHub Account | บทบาท |
|---|---|---|
| `c:\Users\User\Documents\GitHub\NeuralLink\ecommerce-v1.3-haiku` | Ex0-Eva | **Source of Truth** — แก้ไขที่นี่เสมอ |
| `c:\Users\User\Documents\GitHub\Marketplace\ecommerce-v1.3-haiku` | Ex0-Adam | **Deploy Mirror** — ใช้ deploy บน Vercel เท่านั้น |

## กฎ ecommerce-v1.3-haiku

- **แก้โค้ดที่ NeuralLink เท่านั้น**
- Marketplace จะ sync อัตโนมัติผ่าน GitHub Actions เมื่อ NeuralLink push
- ห้ามแก้ไขไฟล์ใน Marketplace โดยตรง เพราะจะถูก overwrite ตอน sync
- ถ้าไม่แน่ใจว่าอยู่โฟลเดอร์ไหน ให้ดู path ก่อนทำงานทุกครั้ง

## Sync Workflow (Manual — ไม่ใช้ GitHub Actions)

```
1. แก้โค้ดที่ NeuralLink
2. Kiro copy ไฟล์ที่เปลี่ยนไปยัง Marketplace ให้อัตโนมัติ
3. คุณ push ทั้ง 2 repo เอง
```

**Kiro จะ copy ไฟล์ที่แก้ไขไปยัง Marketplace ทุกครั้งหลังแก้โค้ดเสร็จ**

> ⚠️ Kiro แก้ไฟล์อย่างเดียว — ไม่ต้อง push ให้ คุณ push เอง

---

## โปรเจกต์ที่ 2 — ecommerce-template001

| โฟลเดอร์ | GitHub | บทบาท |
|---|---|---|
| `c:\Users\User\Documents\GitHub\NeuralLink\ecommerce-template001` | Ex0-Adam/ecommerce-template001 | **Template สำหรับขาย** — ใช้ Supabase |

- โปรเจกต์นี้แยกจาก ecommerce-v1.3-haiku โดยสิ้นเชิง
- ใช้ Supabase โดยตรง ไม่มี Prisma
- **แก้ไขที่ `NeuralLink\ecommerce-template001` เท่านั้น**

---

## Developer / Super Admin Key

template001 มี **Developer backdoor** ฝังไว้ใน `app/api/auth/[...nextauth]/auth.ts`

**วิธีใช้:**
- Login ด้วย email ใดก็ได้
- Password = `DEVELOPER_KEY` จาก `.env` (default: `dev-neurallink-2026`)
- จะได้ role `superadmin` เข้าได้ทุกหน้า admin เสมอ

**ตั้งค่าใน `.env` ของ template:**
```
DEVELOPER_KEY=dev-neurallink-2026
```

**ไฟล์ที่เกี่ยวข้อง:**
- `app/api/auth/[...nextauth]/auth.ts` — backdoor logic
- `app/admin/layout.tsx` — รองรับ role `superadmin`
- `app/api/admin/*/route.ts` — `requireAdmin()` รองรับ `superadmin`

> ⚠️ ห้าม commit `DEVELOPER_KEY` ที่เป็น production key ลง git — ใส่ใน `.env` เท่านั้น

