# ⚠️ PLANNING DOCUMENT — FUTURE MIGRATION (NOT IN PROGRESS)

> **Status:** This document outlines a **planned** migration from Supabase to Prisma ORM.
>
> **Current State:** The project is still **100% Supabase-based** (see [CONTEXT.md](CONTEXT.md))
>
> **Decision Status:** ⏳ **Pending** — awaiting user decision on proceeding with this migration
>
> **Last Updated:** May 27, 2026

---

# Migration from Supabase to an Independent Architecture

## User Review Required

> [!WARNING]
> **ข้อควรรู้เกี่ยวกับ Firebase**
> หากคุณไม่ชอบการผูกขาด **Firebase ไม่ใช่ทางเลือกที่ดีครับ** เพราะ Firebase ผูกขาดกับ Google (Vendor Lock-in) **หนักกว่า** Supabase เสียอีก
> - **Supabase:** พื้นฐานคือ PostgreSQL มาตรฐาน วันไหนอยากย้ายก็ Export SQL ไปลง Server ตัวเองได้
> - **Firebase:** เป็น NoSQL (Firestore) กฎระเบียบและโค้ดจะเป็นของ Firebase 100% วันไหนอยากย้าย Database คือต้องเขียนระบบหลังบ้านใหม่ทั้งหมดตั้งแต่ศูนย์

## Proposed Alternatives (ทางเลือกที่แนะนำ)

หากคุณต้องการ **"ความเป็นอิสระอย่างแท้จริง" (Framework Agnostic)** ผมขอเสนอ **สถาปัตยกรรม Prisma ORM + NextAuth** ซึ่งเป็นมาตรฐานที่ได้รับความนิยมสูงสุดในยุคนี้ครับ

### 1. ใช้ Prisma เป็น ORM (ตัวกลางจัดการ Database)
- **การทำงาน:** เราจะสั่งงาน Database ผ่าน Prisma (เช่น `prisma.product.create(...)`)
- **ความอิสระ:** คุณสามารถเอาโปรเจกต์นี้ไปต่อกับ Database อะไรก็ได้ (MySQL, PostgreSQL บน AWS, DigitalOcean, Vercel Postgres หรือแม้แต่ SQLite) เพียงแค่เปลี่ยน URL ในไฟล์ `.env` โดย **ไม่ต้องแก้โค้ดสักบรรทัด**

### 2. ใช้ NextAuth.js ตัวเดิม
- โปรเจกต์คุณมี NextAuth อยู่แล้ว แค่ต่อ `PrismaAdapter` เข้าไป ข้อมูล User และ Session จะถูกจัดการใน Database ของคุณเอง 100% ไม่ต้องไปฝากระบบ Auth ไว้กับใครอีก

### 3. ปิด RLS แล้วจัดการสิทธิ์ที่ Server
- เราจะเลิกใช้ RLS และเช็คสิทธิ์ (เช่น ตรวจว่าเป็น Admin หรือไม่) ที่ฝั่ง Server (Next.js API Routes / Server Actions) ก่อนที่จะสั่ง Prisma ให้ดึงหรือแก้ข้อมูล วิธีนี้โปรแกรมเมอร์จะควบคุม Logic ได้เบ็ดเสร็จ

## Proposed Changes (แผนการปรับปรุง หากเลือกใช้ Prisma)

หากคุณเห็นด้วยกับแนวทาง Prisma เราจะดำเนินการตามนี้:

### Setup ORM & Database
- [NEW] ติดตั้ง `prisma` และสร้าง `prisma/schema.prisma` เพื่อกำหนดโครงสร้างตาราง (User, Product, Order) ให้เหมือนกับของเดิม
- สั่งสร้าง Database บนผู้ให้บริการที่คุณเลือก (หรือใช้ Supabase ในฐานะ PostgreSQL เปล่าๆ โดยปิด RLS ทิ้งทั้งหมด)

### Auth Integration
- [MODIFY] `app/api/auth/[...nextauth]/auth.ts` เพื่อเชื่อมต่อ NextAuth เข้ากับ `PrismaAdapter`

### API Migration
- [MODIFY] `app/api/admin/products/[id]/route.ts` และ API อื่นๆ เปลี่ยนจากการใช้ `supabaseClient` เป็นการเรียกใช้ `prisma` แทน
- [DELETE] ไฟล์ที่เกี่ยวกับ Supabase Client (เช่น `lib/supabaseClient.ts`) ทิ้งไป

## Open Questions

> [!IMPORTANT]
> **การตัดสินใจของคุณ**
> 1. คุณยืนยันจะไป **Firebase** (NoSQL - ผูกขาดกับ Google) หรือไม่?
> 2. หรือสนใจเปลี่ยนเป็นโครงสร้าง **Prisma ORM + PostgreSQL** ซึ่งตอบโจทย์เรื่องความไม่ง้อผู้ให้บริการและย้ายบ้านได้ตลอดเวลามากกว่าครับ?
> 
> *(หากคุณเลือก Prisma คุณสามารถหาระบบ PostgreSQL ฟรีมาใช้ได้ เช่น Neon.tech, Vercel Postgres หรือแม้กระทั่งปล่อยให้ Supabase เป็นแค่ที่เก็บข้อมูลเปล่าๆ โดยไม่ต้องใช้ฟีเจอร์ RLS ของเขาเลยก็ได้ครับ)*
