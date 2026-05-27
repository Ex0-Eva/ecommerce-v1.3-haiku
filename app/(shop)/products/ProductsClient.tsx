"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import type { Product } from "@/lib/products";
import type { ProductVariantDB } from "@/types/index";

function ProductSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="aspect-square bg-slate-100" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-slate-100 rounded-lg w-3/4" />
        <div className="h-4 bg-slate-100 rounded-lg w-full" />
        <div className="h-4 bg-slate-100 rounded-lg w-2/3" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 bg-slate-100 rounded-lg w-20" />
          <div className="h-9 bg-slate-100 rounded-xl w-28" />
        </div>
      </div>
    </div>
  );
}

function getActiveVariants(product: Product): ProductVariantDB[] {
  if (!product.variants || product.variants.length === 0) return [];
  return [...product.variants]
    .filter((v) => v.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);
}

function getMinVariantPrice(variants: ProductVariantDB[]): number {
  return Math.min(...variants.map((v) => v.price));
}

export default function ProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [selectedVariants, setSelectedVariants] = useState<Record<string, ProductVariantDB>>({});

  const products = initialProducts;

  const handleSelectVariant = (productId: string, variant: ProductVariantDB) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variant }));
  };

  const handleAddToCart = (product: Product) => {
    const variants = getActiveVariants(product);
    const hasVariants = variants.length > 0;
    const selectedVariant = selectedVariants[product.id];
    if (hasVariants && !selectedVariant) return;

    const cartKey = hasVariants ? `${product.id}:${selectedVariant!.id}` : product.id;

    addItem({
      id: product.id,
      variantId: hasVariants ? selectedVariant!.id : undefined,
      name: product.name,
      variantLabel: hasVariants ? selectedVariant!.label : undefined,
      price: hasVariants ? selectedVariant!.price : product.price,
      stock: hasVariants ? selectedVariant!.stock : product.stock,
      type: product.product_type,
      quantity: 1,
    });

    setAddedIds((prev) => new Set(prev).add(cartKey));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(cartKey);
        return next;
      });
    }, 1500);
  };

  const getCartQty = (id: string, variantId?: string) =>
    items.find((i) => i.id === id && i.variantId === variantId)?.quantity ?? 0;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Shop</p>
            <h1 className="mt-1 text-4xl font-bold tracking-tight">สินค้าทั้งหมด</h1>
            <p className="mt-1 text-sm text-slate-500">{products.length} รายการ</p>
          </div>
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            ดูตะกร้า
          </Link>
        </div>

        {/* Grid */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const variants = getActiveVariants(product);
            const hasVariants = variants.length > 0;
            const selectedVariant = selectedVariants[product.id];
            const cartKey = hasVariants && selectedVariant
              ? `${product.id}:${selectedVariant.id}`
              : product.id;
            const isAffiliateProduct = Boolean(product.affiliate_url?.trim());
            const justAdded = addedIds.has(cartKey);

            const displayPrice = hasVariants
              ? (selectedVariant?.price ?? getMinVariantPrice(variants))
              : product.price;

            const inCart = hasVariants && selectedVariant
              ? getCartQty(product.id, selectedVariant.id) > 0
              : !hasVariants && getCartQty(product.id) > 0;

            const isOutOfStock = isAffiliateProduct
              ? false
              : hasVariants
              ? (selectedVariant ? selectedVariant.stock === 0 : false)
              : product.stock === 0;

            const addToCartDisabled = hasVariants && !selectedVariant;

            return (
              <article
                key={product.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                {product.product_type === "digital" && (
                  <span className="absolute right-3 top-3 z-10 rounded-full bg-purple-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                    Digital
                  </span>
                )}
                {isAffiliateProduct && (
                  <span className="absolute left-3 top-3 z-10 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                    Affiliate
                  </span>
                )}
                {isOutOfStock && !isAffiliateProduct && (
                  <span className="absolute left-3 top-3 z-10 rounded-full bg-slate-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                    สินค้าหมด
                  </span>
                )}

                <div className="aspect-square overflow-hidden bg-slate-100">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-5xl">
                      {product.product_type === "digital" ? "💻" : "📦"}
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h2 className="text-lg font-semibold leading-snug text-slate-900">{product.name}</h2>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-500">
                    {product.description || "ไม่มีคำอธิบาย"}
                  </p>

                  {hasVariants && (
                    <div className="mt-3">
                      <p className="mb-1.5 text-xs font-medium text-slate-500">เลือกตัวเลือก</p>
                      <div className="flex flex-wrap gap-1.5">
                        {variants.map((variant) => {
                          const isSelected = selectedVariant?.id === variant.id;
                          const isVariantOutOfStock = variant.stock === 0;
                          return (
                            <button
                              key={variant.id}
                              type="button"
                              disabled={isVariantOutOfStock}
                              onClick={() => handleSelectVariant(product.id, variant)}
                              className={`rounded-lg border px-3 py-1 text-xs font-semibold transition ${
                                isVariantOutOfStock
                                  ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300 line-through"
                                  : isSelected
                                  ? "border-transparent text-white"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                              }`}
                              style={
                                isSelected && !isVariantOutOfStock
                                  ? { backgroundColor: "var(--primary)", borderColor: "var(--primary)" }
                                  : {}
                              }
                            >
                              {variant.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xl font-bold text-slate-900">
                        {hasVariants && !selectedVariant && (
                          <span className="text-sm font-normal text-slate-500 mr-1">เริ่มต้น</span>
                        )}
                        ฿{displayPrice.toLocaleString()}
                      </span>
                      {inCart && !isOutOfStock && (
                        <span className="ml-2 text-xs text-slate-400">
                          ในตะกร้า{" "}
                          {hasVariants && selectedVariant
                            ? getCartQty(product.id, selectedVariant.id)
                            : getCartQty(product.id)}{" "}
                          ชิ้น
                        </span>
                      )}
                      {(() => {
                        const stockToShow = hasVariants ? selectedVariant?.stock : product.stock;
                        if (stockToShow === undefined) return null;
                        if (stockToShow > 0 && stockToShow <= 5)
                          return <p className="mt-0.5 text-xs font-medium text-amber-600">เหลือ {stockToShow} ชิ้น</p>;
                        if (stockToShow > 5 && product.product_type === "physical")
                          return <p className="mt-0.5 text-xs text-slate-400">คงเหลือ {stockToShow} ชิ้น</p>;
                        return null;
                      })()}
                    </div>

                    {isAffiliateProduct ? (
                      <a
                        href={product.affiliate_url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                      >
                        ซื้อจาก Marketplace
                      </a>
                    ) : isOutOfStock ? (
                      <span className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-400 cursor-not-allowed">
                        สินค้าหมด
                      </span>
                    ) : addToCartDisabled ? (
                      <button type="button" disabled className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-400 cursor-not-allowed">
                        เลือกตัวเลือก
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition active:scale-95 ${justAdded ? "bg-green-500" : "hover:opacity-90"}`}
                        style={justAdded ? {} : { backgroundColor: "var(--primary)" }}
                      >
                        {justAdded ? (
                          <><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>เพิ่มแล้ว</>
                        ) : (
                          <><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>เพิ่มลงตะกร้า</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Empty state */}
        {products.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
            <span className="text-5xl">📦</span>
            <p className="mt-4 text-lg font-semibold text-slate-700">ยังไม่มีสินค้า</p>
            <p className="mt-1 text-sm text-slate-400">ลองเพิ่มสินค้าผ่าน Admin Dashboard</p>
            <Link
              href="/admin/products"
              className="mt-6 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: "var(--primary)" }}
            >
              ไปที่ Admin
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
