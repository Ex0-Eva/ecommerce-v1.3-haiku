-- ============================================================
-- Next E-commerce v1.2 — Full Schema (v12_ prefix)
-- รันไฟล์นี้ใน Supabase SQL Editor
-- ไม่กระทบตารางเดิมใดๆ ทั้งสิ้น
-- ถ้าขึ้น popup "Potential issue" → กด "Run and enable RLS"
-- ============================================================

-- ─── 1. TABLES ───

-- v12_users (extends auth.users)
CREATE TABLE IF NOT EXISTS public.v12_users (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  name       TEXT,
  role       TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- v12_products
CREATE TABLE IF NOT EXISTS public.v12_products (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name                 TEXT NOT NULL,
  description          TEXT,
  price                DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  stock                INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url            TEXT,
  product_type         TEXT DEFAULT 'physical' CHECK (product_type IN ('physical', 'digital')),
  digital_file_url     TEXT,
  affiliate_url        TEXT,
  license_key_required BOOLEAN DEFAULT false,
  is_active            BOOLEAN DEFAULT true,
  created_at           TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at           TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- v12_product_variants
CREATE TABLE IF NOT EXISTS public.v12_product_variants (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.v12_products(id) ON DELETE CASCADE NOT NULL,
  label      TEXT NOT NULL,
  price      DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  stock      INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sku        TEXT,
  is_active  BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- v12_orders (ต้องมาก่อน v12_license_keys และ v12_order_items)
CREATE TABLE IF NOT EXISTS public.v12_orders (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID REFERENCES public.v12_users(id) ON DELETE SET NULL,
  customer_name     TEXT,
  customer_email    TEXT,
  shipping_address  JSONB,
  total             DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  status            TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  stripe_session_id TEXT,
  opennode_charge_id TEXT,
  lnbits_checking_id TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- v12_order_items
CREATE TABLE IF NOT EXISTS public.v12_order_items (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id      UUID REFERENCES public.v12_orders(id) ON DELETE CASCADE NOT NULL,
  product_id    UUID REFERENCES public.v12_products(id) ON DELETE SET NULL,
  product_name  TEXT NOT NULL,
  product_price DECIMAL(10,2) NOT NULL CHECK (product_price >= 0),
  quantity      INTEGER NOT NULL CHECK (quantity > 0),
  license_key   TEXT,
  variant_id    UUID REFERENCES public.v12_product_variants(id) ON DELETE SET NULL,
  variant_label TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- v12_license_keys
CREATE TABLE IF NOT EXISTS public.v12_license_keys (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.v12_products(id) ON DELETE CASCADE,
  key_value  TEXT UNIQUE NOT NULL,
  is_used    BOOLEAN DEFAULT false,
  order_id   UUID REFERENCES public.v12_orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- v12_site_config
CREATE TABLE IF NOT EXISTS public.v12_site_config (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_name       TEXT DEFAULT 'Next E-commerce',
  theme_name       TEXT DEFAULT 'modern',
  primary_color    TEXT DEFAULT '#0f172a',
  secondary_color  TEXT DEFAULT '#64748b',
  font_family      TEXT DEFAULT 'Inter, sans-serif',
  border_radius    TEXT DEFAULT '1.5rem',
  logo_url         TEXT,
  bank_name        TEXT,
  account_name     TEXT,
  account_number   TEXT,
  promptpay_number TEXT,
  qr_code_url      TEXT,
  faq_content      TEXT DEFAULT 'ยังไม่มีข้อมูล FAQ',
  shipping_content TEXT DEFAULT 'ยังไม่มีข้อมูลนโยบายการจัดส่ง',
  contact_content  TEXT DEFAULT 'ยังไม่มีข้อมูลติดต่อเรา',
  facebook_url     TEXT,
  twitter_url      TEXT,
  instagram_url    TEXT,
  line_url         TEXT,
  updated_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- v12_live_streams
CREATE TABLE IF NOT EXISTS public.v12_live_streams (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title               TEXT NOT NULL,
  stream_url          TEXT,
  status              TEXT DEFAULT 'idle' CHECK (status IN ('idle', 'live', 'ended')),
  featured_product_id UUID REFERENCES public.v12_products(id) ON DELETE SET NULL,
  current_viewers     INTEGER DEFAULT 0,
  started_at          TIMESTAMPTZ,
  ended_at            TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── 2. INDEXES ───

CREATE INDEX IF NOT EXISTS idx_v12_users_email              ON public.v12_users(email);
CREATE INDEX IF NOT EXISTS idx_v12_products_is_active       ON public.v12_products(is_active);
CREATE INDEX IF NOT EXISTS idx_v12_product_variants_product ON public.v12_product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_v12_orders_user_id           ON public.v12_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_v12_orders_status            ON public.v12_orders(status);
CREATE INDEX IF NOT EXISTS idx_v12_orders_stripe            ON public.v12_orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_v12_order_items_order_id     ON public.v12_order_items(order_id);

-- ─── 3. ROW LEVEL SECURITY ───

ALTER TABLE public.v12_users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v12_products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v12_product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v12_orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v12_order_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v12_license_keys    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v12_site_config     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v12_live_streams    ENABLE ROW LEVEL SECURITY;

-- v12_users policies
DROP POLICY IF EXISTS "v12 Users can view own profile" ON public.v12_users;
CREATE POLICY "v12 Users can view own profile"   ON public.v12_users FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "v12 Users can update own profile" ON public.v12_users;
CREATE POLICY "v12 Users can update own profile" ON public.v12_users FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "v12 Users can create own profile" ON public.v12_users;
CREATE POLICY "v12 Users can create own profile" ON public.v12_users FOR INSERT WITH CHECK (auth.uid() = id);

-- v12_products policies
DROP POLICY IF EXISTS "v12 Anyone can view active products" ON public.v12_products;
CREATE POLICY "v12 Anyone can view active products" ON public.v12_products
  FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "v12 Admins can view all products" ON public.v12_products;
CREATE POLICY "v12 Admins can view all products" ON public.v12_products
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.v12_users WHERE id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS "v12 Admins can insert products" ON public.v12_products;
CREATE POLICY "v12 Admins can insert products" ON public.v12_products
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.v12_users WHERE id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS "v12 Admins can update products" ON public.v12_products;
CREATE POLICY "v12 Admins can update products" ON public.v12_products
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.v12_users WHERE id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS "v12 Admins can delete products" ON public.v12_products;
CREATE POLICY "v12 Admins can delete products" ON public.v12_products
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.v12_users WHERE id = auth.uid() AND role = 'admin'));

-- v12_product_variants policies
DROP POLICY IF EXISTS "v12 Anyone can view active variants" ON public.v12_product_variants;
CREATE POLICY "v12 Anyone can view active variants" ON public.v12_product_variants
  FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "v12 Admins can view all variants" ON public.v12_product_variants;
CREATE POLICY "v12 Admins can view all variants" ON public.v12_product_variants
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.v12_users WHERE id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS "v12 Admins can insert variants" ON public.v12_product_variants;
CREATE POLICY "v12 Admins can insert variants" ON public.v12_product_variants
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.v12_users WHERE id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS "v12 Admins can update variants" ON public.v12_product_variants;
CREATE POLICY "v12 Admins can update variants" ON public.v12_product_variants
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.v12_users WHERE id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS "v12 Admins can delete variants" ON public.v12_product_variants;
CREATE POLICY "v12 Admins can delete variants" ON public.v12_product_variants
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.v12_users WHERE id = auth.uid() AND role = 'admin'));

-- v12_orders policies
DROP POLICY IF EXISTS "v12 Users can view own orders"  ON public.v12_orders;
CREATE POLICY "v12 Users can view own orders"  ON public.v12_orders FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "v12 Users can create orders"    ON public.v12_orders;
CREATE POLICY "v12 Users can create orders"    ON public.v12_orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "v12 Admins can view all orders" ON public.v12_orders;
CREATE POLICY "v12 Admins can view all orders" ON public.v12_orders
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.v12_users WHERE id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS "v12 Admins can update orders"   ON public.v12_orders;
CREATE POLICY "v12 Admins can update orders"   ON public.v12_orders
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.v12_users WHERE id = auth.uid() AND role = 'admin'));

-- v12_order_items policies
DROP POLICY IF EXISTS "v12 Users can view own order items" ON public.v12_order_items;
CREATE POLICY "v12 Users can view own order items" ON public.v12_order_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.v12_orders WHERE id = v12_order_items.order_id AND user_id = auth.uid()));
DROP POLICY IF EXISTS "v12 Anyone can create order items"  ON public.v12_order_items;
CREATE POLICY "v12 Anyone can create order items"  ON public.v12_order_items FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "v12 Admins can view all order items" ON public.v12_order_items;
CREATE POLICY "v12 Admins can view all order items" ON public.v12_order_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.v12_users WHERE id = auth.uid() AND role = 'admin'));

-- v12_license_keys policies
DROP POLICY IF EXISTS "v12 Admins can manage license keys" ON public.v12_license_keys;
CREATE POLICY "v12 Admins can manage license keys" ON public.v12_license_keys
  FOR ALL USING (EXISTS (SELECT 1 FROM public.v12_users WHERE id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS "v12 Service role can manage license keys" ON public.v12_license_keys;
CREATE POLICY "v12 Service role can manage license keys" ON public.v12_license_keys
  FOR ALL USING (true);

-- v12_site_config policies
DROP POLICY IF EXISTS "v12 Anyone can view site config"  ON public.v12_site_config;
CREATE POLICY "v12 Anyone can view site config"  ON public.v12_site_config FOR SELECT USING (true);
DROP POLICY IF EXISTS "v12 Admins can update site config" ON public.v12_site_config;
CREATE POLICY "v12 Admins can update site config" ON public.v12_site_config
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.v12_users WHERE id = auth.uid() AND role = 'admin'));

-- v12_live_streams policies
DROP POLICY IF EXISTS "v12 Anyone can view live streams"   ON public.v12_live_streams;
CREATE POLICY "v12 Anyone can view live streams"   ON public.v12_live_streams FOR SELECT USING (true);
DROP POLICY IF EXISTS "v12 Admins can manage live streams" ON public.v12_live_streams;
CREATE POLICY "v12 Admins can manage live streams" ON public.v12_live_streams
  FOR ALL USING (EXISTS (SELECT 1 FROM public.v12_users WHERE id = auth.uid() AND role = 'admin'));

-- ─── 4. FUNCTIONS & TRIGGERS ───

-- updated_at trigger function (ใช้ร่วมกันได้ถ้า handle_updated_at มีอยู่แล้ว)
CREATE OR REPLACE FUNCTION public.v12_handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS v12_updated_at_users ON public.v12_users;
CREATE TRIGGER v12_updated_at_users
  BEFORE UPDATE ON public.v12_users
  FOR EACH ROW EXECUTE FUNCTION public.v12_handle_updated_at();

DROP TRIGGER IF EXISTS v12_updated_at_products ON public.v12_products;
CREATE TRIGGER v12_updated_at_products
  BEFORE UPDATE ON public.v12_products
  FOR EACH ROW EXECUTE FUNCTION public.v12_handle_updated_at();

DROP TRIGGER IF EXISTS v12_updated_at_product_variants ON public.v12_product_variants;
CREATE TRIGGER v12_updated_at_product_variants
  BEFORE UPDATE ON public.v12_product_variants
  FOR EACH ROW EXECUTE FUNCTION public.v12_handle_updated_at();

DROP TRIGGER IF EXISTS v12_updated_at_orders ON public.v12_orders;
CREATE TRIGGER v12_updated_at_orders
  BEFORE UPDATE ON public.v12_orders
  FOR EACH ROW EXECUTE FUNCTION public.v12_handle_updated_at();

DROP TRIGGER IF EXISTS v12_updated_at_site_config ON public.v12_site_config;
CREATE TRIGGER v12_updated_at_site_config
  BEFORE UPDATE ON public.v12_site_config
  FOR EACH ROW EXECUTE FUNCTION public.v12_handle_updated_at();

-- auto-create v12_users profile on signup
CREATE OR REPLACE FUNCTION public.v12_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.v12_users (id, email, name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name', 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- หมายเหตุ: trigger on_auth_user_created อาจมีอยู่แล้ว
-- ถ้าต้องการให้ v12 รองรับด้วย ให้รัน:
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.v12_handle_new_user();
-- (ถ้าไม่ต้องการแตะ trigger เดิม ให้ register user ผ่าน API แทน)

-- RPC: decrement stock จาก v12_products
CREATE OR REPLACE FUNCTION public.v12_decrement_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.v12_products
  SET stock = GREATEST(stock - p_quantity, 0)
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.v12_decrement_stock TO service_role;

-- RPC: decrement stock จาก v12_product_variants
CREATE OR REPLACE FUNCTION public.v12_decrement_variant_stock(p_variant_id UUID, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.v12_product_variants
  SET stock = GREATEST(stock - p_quantity, 0)
  WHERE id = p_variant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.v12_decrement_variant_stock TO service_role;

-- ─── 5. SEED DATA ───

INSERT INTO public.v12_products (name, description, price, stock, product_type, digital_file_url, license_key_required) VALUES
  ('สินค้าสำหรับลองระบบ', 'คำอธิบายสินค้าเบื้องต้น', 1290.00, 12, 'physical', NULL, false),
  ('สินค้าเพิ่มยอด', 'สินค้าที่ช่วยเพิ่มยอดขายได้ดี', 1590.00, 8, 'physical', NULL, false),
  ('สินค้าแนะนำ', 'สินค้าที่ลูกค้าชื่นชอบมากที่สุด', 1890.00, 4, 'physical', NULL, false),
  ('E-commerce Template', 'Next.js 16.2.6 Template สำหรับทำเว็บขายของ', 4900.00, 999, 'digital', 'https://example.com/download/template.zip', false),
  ('Software License Key', 'License Key สำหรับโปรแกรมจัดการสต็อก', 990.00, 50, 'digital', NULL, true)
ON CONFLICT DO NOTHING;

INSERT INTO public.v12_license_keys (product_id, key_value)
SELECT id, 'ABCD-1234-EFGH-5678'
FROM public.v12_products WHERE name = 'Software License Key'
ON CONFLICT DO NOTHING;

INSERT INTO public.v12_site_config (store_name, theme_name, primary_color)
VALUES ('Next E-commerce', 'modern', '#0f172a')
ON CONFLICT DO NOTHING;

INSERT INTO public.v12_live_streams (title, status, current_viewers)
VALUES ('Live Commerce — ทดสอบระบบ', 'idle', 0)
ON CONFLICT DO NOTHING;
