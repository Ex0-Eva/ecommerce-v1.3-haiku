import { getAllProducts, type Product } from "@/lib/products";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage() {
  let products: Product[] = [];
  try {
    products = await getAllProducts();
  } catch (err) {
    console.error("Failed to fetch products:", err);
  }

  return <ProductsClient initialProducts={products} />;
}
