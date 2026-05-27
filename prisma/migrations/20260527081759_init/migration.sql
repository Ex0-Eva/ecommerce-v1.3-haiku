-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "email_verified" TIMESTAMP(3),
    "image" TEXT,
    "password_hash" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "image_url" TEXT,
    "product_type" TEXT NOT NULL DEFAULT 'physical',
    "digital_file_url" TEXT,
    "affiliate_url" TEXT,
    "license_key_required" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "sku" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "customer_name" TEXT,
    "customer_email" TEXT,
    "shipping_address" JSONB,
    "total" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "stripe_session_id" TEXT,
    "opennode_charge_id" TEXT,
    "lnbits_checking_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT,
    "product_name" TEXT NOT NULL,
    "product_price" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "license_key" TEXT,
    "variant_id" TEXT,
    "variant_label" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "license_keys" (
    "id" TEXT NOT NULL,
    "product_id" TEXT,
    "key_value" TEXT NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "order_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "license_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_config" (
    "id" TEXT NOT NULL,
    "store_name" TEXT NOT NULL DEFAULT 'Next E-commerce',
    "theme_name" TEXT NOT NULL DEFAULT 'modern',
    "primary_color" TEXT NOT NULL DEFAULT '#0f172a',
    "secondary_color" TEXT NOT NULL DEFAULT '#64748b',
    "font_family" TEXT NOT NULL DEFAULT 'Inter, sans-serif',
    "border_radius" TEXT NOT NULL DEFAULT '1.5rem',
    "logo_url" TEXT,
    "bank_name" TEXT,
    "account_name" TEXT,
    "account_number" TEXT,
    "promptpay_number" TEXT,
    "qr_code_url" TEXT,
    "faq_content" TEXT NOT NULL DEFAULT 'ยังไม่มีข้อมูล FAQ',
    "shipping_content" TEXT NOT NULL DEFAULT 'ยังไม่มีข้อมูลนโยบายการจัดส่ง',
    "contact_content" TEXT NOT NULL DEFAULT 'ยังไม่มีข้อมูลติดต่อเรา',
    "facebook_url" TEXT,
    "twitter_url" TEXT,
    "instagram_url" TEXT,
    "line_url" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_streams" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "stream_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'idle',
    "featured_product_id" TEXT,
    "current_viewers" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "live_streams_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "license_keys_key_value_key" ON "license_keys"("key_value");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "license_keys" ADD CONSTRAINT "license_keys_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "license_keys" ADD CONSTRAINT "license_keys_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_streams" ADD CONSTRAINT "live_streams_featured_product_id_fkey" FOREIGN KEY ("featured_product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
