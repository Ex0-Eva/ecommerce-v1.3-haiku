import type { ProductVariant } from "@/types";

export async function fetchProducts(): Promise<ProductVariant[]> {
  return [
    { id: "v-1", name: "สินค้า 1", price: 1290, stock: 12, product_type: "physical" },
    { id: "v-2", name: "สินค้า 2", price: 1590, stock: 8, product_type: "physical" },
  ];
}
