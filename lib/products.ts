import { db } from "./db";
import type { ProductVariantDB } from "@/types/index";

export type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
  affiliate_url?: string;
  product_type: "physical" | "digital";
  digital_file_url?: string;
  license_key_required: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  variants?: ProductVariantDB[];
};

function mapProduct(p: any): Product {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? undefined,
    price: Number(p.price),
    stock: p.stock,
    image_url: p.imageUrl ?? undefined,
    affiliate_url: p.affiliateUrl ?? undefined,
    product_type: p.productType as "physical" | "digital",
    digital_file_url: p.digitalFileUrl ?? undefined,
    license_key_required: p.licenseKeyRequired,
    is_active: p.isActive,
    created_at: p.createdAt.toISOString(),
    updated_at: p.updatedAt.toISOString(),
    variants: (p.variants ?? []).map((v: any) => ({
      id: v.id,
      product_id: v.productId,
      label: v.label,
      price: Number(v.price),
      stock: v.stock,
      sku: v.sku ?? undefined,
      is_active: v.isActive,
      sort_order: v.sortOrder,
      created_at: v.createdAt.toISOString(),
      updated_at: v.updatedAt.toISOString(),
    })),
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const products = await db.product.findMany({
    where: { isActive: true },
    include: { variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return products.map(mapProduct);
}

export async function getProductById(id: string): Promise<Product> {
  const product = await db.product.findFirstOrThrow({
    where: { id, isActive: true },
    include: { variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } },
  });
  return mapProduct(product);
}
