-- ============================================================
-- สร้าง Admin User ใหม่ใน v12_users
-- รันคำสั่งนี้ใน Supabase SQL Editor
-- ============================================================

-- ตัวอย่าง: สร้าง admin user ใหม่
-- ให้แทนค่า:
-- - 'admin-id-uuid-here' ด้วย UUID ที่สุ่มหรือปล่อยให้ Supabase สร้าง
-- - 'admin@example.com' ด้วยอีเมลที่ต้องการ
-- - 'Admin Name' ด้วยชื่อที่ต้องการ

-- ถ้ามี auth.users ให้สร้างไป (ถ้าใช้ Supabase Auth)
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES (gen_random_uuid(), 'admin@example.com', crypt('admin123', gen_salt('bf')), NOW(), NOW(), NOW());

-- สร้าง v12_users entry
INSERT INTO public.v12_users (id, email, name, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),  -- สร้าง UUID ใหม่
  'admin@example.com',
  'Admin User',
  'admin',
  NOW(),
  NOW()
);

-- ตรวจสอบผลลัพธ์
SELECT * FROM public.v12_users WHERE role = 'admin';
