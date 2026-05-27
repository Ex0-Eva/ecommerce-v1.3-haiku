# Payment System Audit

## สรุปการตรวจสอบระบบชำระเงิน

- พบ integration ของ Stripe ใน `app/api/checkout/route.ts` และ `app/api/stripe/webhook/route.ts`
- พบ integration ของ OpenNode ใน `app/api/opennode/checkout/route.ts` และ `app/api/opennode/webhook/route.ts`
- พบ fulfillment logic ใน `lib/orders.ts` สำหรับ Stripe, OpenNode, และ LNbits

## ปัญหาที่พบ

1. `STRIPE_SECRET_KEY` ใน `.env.local` ถูกตั้งเป็น publishable key (`pk_test_...`) แทน secret key
2. `STRIPE_WEBHOOK_SECRET` ใน `.env.local` ถูกตั้งเป็น secret API key (`sk_test_...`) แทน webhook secret (`whsec_...`)
3. `app/api/opennode/checkout/route.ts` อัพเดตตาราง `orders` แต่ฐานข้อมูลหลักใช้ `v12_orders` เป็นตารางสำคัญ ทำให้ `opennode_charge_id` อาจไม่ถูกบันทึก
4. หน้า checkout ปัจจุบัน (`app/(shop)/checkout/page.tsx`) เรียกใช้เฉพาะ Stripe เท่านั้น ยังไม่มี UI สำหรับ OpenNode

## แผนการแก้ไข

1. แก้ค่า environment variables:
   - `STRIPE_SECRET_KEY` ให้เป็น `sk_test_...` หรือ `rk_test_...`
   - `STRIPE_WEBHOOK_SECRET` ให้เป็น `whsec_...`
2. แก้ `app/api/opennode/checkout/route.ts` ให้ update ตาราง `v12_orders` แทน `orders`
3. ทบทวนให้ Stripe Checkout ใช้ dynamic payment methods:
   - ลบ `payment_method_types: ["card"]` ออกจาก `stripe.checkout.sessions.create(...)`
4. เพิ่ม route/UI สำหรับ OpenNode checkout หากต้องการรองรับ Bitcoin/Lightning แบบเต็มรูปแบบ
5. ทดสอบ webhook flow ด้วย `stripe listen --forward-to localhost:3000/api/stripe/webhook` และ OpenNode webhook simulator

## ข้อมูลเพิ่มเติม

- `lib/stripe.ts` ใช้ Stripe API version `2025-02-24.acacia`
- ระบบ order จะสร้าง `pending` ก่อน และยืนยัน `paid` ใน webhook
- `lib/orders.ts` ทำ stock decrement และ license key assignment เมื่อ fulfillment สำเร็จ
