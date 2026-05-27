export type UserRole = "user" | "admin";

export type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};

export type ProductType = "physical" | "digital";

/**
 * ProductVariant — shape ที่ cart/store ใช้
 * field ตรงกับ Product จาก lib/products.ts เพื่อไม่ต้อง cast (as any)
 */
export type ProductVariant = {
  id: string;
  name: string;
  price: number;
  stock: number;
  /** product_type จาก DB — ใช้ชื่อเดียวกับ Product เพื่อความสม่ำเสมอ */
  product_type: ProductType;
  digital_file_url?: string;
  license_key_required?: boolean;
};

/** ProductVariantDB — shape ที่ตรงกับ `product_variants` table ใน DB */
export type ProductVariantDB = {
  id: string;
  product_id: string;
  label: string;
  price: number;
  stock: number;
  sku?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type CartItem = ProductVariant & {
  quantity: number;
};

export type CartPayload = {
  cartId: string;
  items: Array<{ variantId: string; quantity: number }>;
};
