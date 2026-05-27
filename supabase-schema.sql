-- ============================================================
-- Next E-commerce v1.1 — Full Schema (รวม migration v2)
-- รันไฟล์นี้ไฟล์เดียวใน Supabase SQL Editor
-- ถ้าขึ้น popup "Potential issue" → กด "Run and enable RLS"
-- ============================================================

-- ─── 1. TABLES (ลำดับสำคัญ: ต้องสร้าง parent ก่อน child) ───

-- users (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url TEXT,
  product_type TEXT DEFAULT 'physical' CHECK (product_type IN ('physical', 'digital')),
  digital_file_url TEXT,
  license_key_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- orders (ต้องมาก่อน license_keys และ order_items)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_email TEXT,
  shipping_address JSONB,
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- order_items
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_price DECIMAL(10,2) NOT NULL CHECK (product_price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  license_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- license_keys (อยู่หลัง orders เพราะมี FK ไปหา orders)
CREATE TABLE IF NOT EXISTS public.license_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  key_value TEXT UNIQUE NOT NULL,
  is_used BOOLEAN DEFAULT false,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- site_config
CREATE TABLE IF NOT EXISTS public.site_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_name TEXT DEFAULT 'Next E-commerce',
  theme_name TEXT DEFAULT 'modern',
  primary_color TEXT DEFAULT '#0f172a',
  secondary_color TEXT DEFAULT '#64748b',
  font_family TEXT DEFAULT 'Inter, sans-serif',
  border_radius TEXT DEFAULT '1.5rem',
  logo_url TEXT,
  bank_name TEXT,
  account_name TEXT,
  account_number TEXT,
  promptpay_number TEXT,
  qr_code_url TEXT,
  faq_content TEXT DEFAULT 'ยังไม่มีข้อมูล FAQ',
  shipping_content TEXT DEFAULT 'ยังไม่มีข้อมูลนโยบายการจัดส่ง',
  contact_content TEXT DEFAULT 'ยังไม่มีข้อมูลติดต่อเรา',
  facebook_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  line_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- live_streams
CREATE TABLE IF NOT EXISTS public.live_streams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  stream_url TEXT,
  status TEXT DEFAULT 'idle' CHECK (status IN ('idle', 'live', 'ended')),
  featured_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  current_viewers INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── 2. INDEXES ───

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- ─── 3. ROW LEVEL SECURITY ───

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;

-- users policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- products policies
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all products" ON public.products
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can insert products" ON public.products
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- orders policies
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- order_items policies
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND user_id = auth.uid())
  );
CREATE POLICY "Anyone can create order items" ON public.order_items
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- license_keys policies
CREATE POLICY "Admins can manage license keys" ON public.license_keys
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Service role can manage license keys" ON public.license_keys
  FOR ALL USING (true);

-- site_config policies
CREATE POLICY "Anyone can view site config" ON public.site_config
  FOR SELECT USING (true);
CREATE POLICY "Admins can update site config" ON public.site_config
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- live_streams policies
CREATE POLICY "Anyone can view live streams" ON public.live_streams
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage live streams" ON public.live_streams
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── 4. FUNCTIONS & TRIGGERS ───

-- updated_at auto-update
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_updated_at_users
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_products
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_orders
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_site_config
  BEFORE UPDATE ON public.site_config
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name', 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- decrement stock (atomic, ป้องกัน race condition)
CREATE OR REPLACE FUNCTION public.decrement_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.products
  SET stock = GREATEST(stock - p_quantity, 0)
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.decrement_stock TO service_role;

-- ─── 5. SEED DATA ───

INSERT INTO public.products (name, description, price, stock, product_type, digital_file_url, license_key_required) VALUES
  ('สินค้าสำหรับลองระบบ', 'คำอธิบายสินค้าเบื้องต้น', 1290.00, 12, 'physical', NULL, false),
  ('สินค้าเพิ่มยอด', 'สินค้าที่ช่วยเพิ่มยอดขายได้ดี', 1590.00, 8, 'physical', NULL, false),
  ('สินค้าแนะนำ', 'สินค้าที่ลูกค้าชื่นชอบมากที่สุด', 1890.00, 4, 'physical', NULL, false),
  ('E-commerce Template', 'Next.js 16.2.6 Template สำหรับทำเว็บขายของ', 4900.00, 999, 'digital', 'https://example.com/download/template.zip', false),
  ('Software License Key', 'License Key สำหรับโปรแกรมจัดการสต็อก', 990.00, 50, 'digital', NULL, true)
ON CONFLICT DO NOTHING;

INSERT INTO public.license_keys (product_id, key_value)
SELECT id, 'ABCD-1234-EFGH-5678'
FROM public.products WHERE name = 'Software License Key'
ON CONFLICT DO NOTHING;

INSERT INTO public.site_config (store_name, theme_name, primary_color)
VALUES ('Next E-commerce', 'modern', '#0f172a')
ON CONFLICT DO NOTHING;

-- ─── 6. PRODUCT VARIANTS (migration — product-variants feature) ───

-- product_variants
CREATE TABLE IF NOT EXISTS public.product_variants (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id  UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  label       TEXT NOT NULL,
  price       DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sku         TEXT,
  is_active   BOOLEAN DEFAULT true,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);

-- RPC: decrement_variant_stock
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

GRANT EXECUTE ON FUNCTION public.decrement_variant_stock TO service_role;

-- trigger: auto-update updated_at for product_variants
CREATE TRIGGER handle_updated_at_product_variants
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─── RLS for product_variants ───

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Anyone can view active variants (public read)
CREATE POLICY "Anyone can view active variants" ON public.product_variants
  FOR SELECT USING (is_active = true);

-- Admins can view all variants (including inactive)
CREATE POLICY "Admins can view all variants" ON public.product_variants
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can insert variants
CREATE POLICY "Admins can insert variants" ON public.product_variants
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can update variants
CREATE POLICY "Admins can update variants" ON public.product_variants
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can delete variants
CREATE POLICY "Admins can delete variants" ON public.product_variants
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── order_items: เพิ่ม variant columns (ต้องอยู่หลัง product_variants) ───

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL;

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS variant_label TEXT;
