"use client";

import { useState, useEffect } from "react";
import type { Product } from "@/lib/products";

const inputClass =
  "mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100";
const labelClass = "block text-sm font-medium text-slate-700";

type FormData = {
  name: string;
  description: string;
  price: string;
  stock: string;
  image_url: string;
  affiliate_url: string;
  product_type: "physical" | "digital";
  digital_file_url: string;
  license_key_required: boolean;
  is_active: boolean;
};

type VariantRow = {
  id?: string;
  label: string;
  price: string;
  stock: string;
  sku: string;
  _delete?: boolean;
};

const emptyForm: FormData = {
  name: "",
  description: "",
  price: "",
  stock: "",
  image_url: "",
  affiliate_url: "",
  product_type: "physical",
  digital_file_url: "",
  license_key_required: false,
  is_active: true,
};

function productToForm(p: Product): FormData {
  return {
    name: p.name,
    description: p.description ?? "",
    price: String(p.price),
    stock: String(p.stock),
    image_url: p.image_url ?? "",
    affiliate_url: p.affiliate_url ?? "",
    product_type: p.product_type,
    digital_file_url: p.digital_file_url ?? "",
    license_key_required: p.license_key_required,
    is_active: p.is_active,
  };
}

function productHasVariants(p: Product): boolean {
  return Array.isArray(p.variants) && p.variants.length > 0;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/products");
      if (!res.ok) {
        throw new Error("ไม่สามารถโหลดสินค้าได้");
      }
      setProducts(await res.json());
    } catch (err) {
      const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
      setLoadError(message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setHasVariants(false);
    setVariants([]);
    setSaveError(null);
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingId(product.id);
    setForm(productToForm(product));
    setHasVariants(productHasVariants(product));
    setVariants(
      Array.isArray(product.variants)
        ? product.variants.map((v) => ({
            id: v.id,
            label: v.label,
            price: String(v.price),
            stock: String(v.stock),
            sku: v.sku ?? "",
          }))
        : []
    );
    setSaveError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setHasVariants(false);
    setVariants([]);
    setSaveError(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price || !form.stock) {
      setSaveError("กรุณากรอกชื่อสินค้า ราคา และสต็อก");
      return;
    }

    setSaving(true);
    setSaveError(null);

    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price),
      stock: Number(form.stock),
      image_url: form.image_url.trim() || null,
        affiliate_url: form.affiliate_url.trim() || null,
    };

    if (hasVariants) {
      if (editingId) {
        payload.variants = variants.map((v) => ({
          ...(v.id ? { id: v.id } : {}),
          label: v.label,
          price: Number(v.price),
          stock: Number(v.stock),
          ...(v.sku ? { sku: v.sku } : {}),
          ...(v._delete ? { _delete: true } : {}),
        }));
      } else {
        payload.variants = variants
          .filter((v) => !v._delete)
          .map((v) => ({
            label: v.label,
            price: Number(v.price),
            stock: Number(v.stock),
            ...(v.sku ? { sku: v.sku } : {}),
          }));
      }
    }

    const url = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
    const method = editingId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setSaveError(data.error || "เกิดข้อผิดพลาด");
      return;
    }

    closeModal();
    loadProducts();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`⚠️ ลบสินค้า "${name}" ถาวรออกจากระบบ?\n\nการกระทำนี้ไม่สามารถยกเลิกได้!`)) return;
    if (!confirm(`ยืนยันการลบ "${name}" อีกครั้ง?`)) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "ไม่สามารถลบสินค้าได้" }));
        alert(`❌ ลบไม่สำเร็จ: ${data.error}`);
        return;
      }
      loadProducts();
    } catch (err) {
      const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
      alert(`❌ เกิดข้อผิดพลาด: ${message}`);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-8 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">จัดการสินค้า</h1>
            <p className="mt-1 text-sm text-slate-500">เพิ่ม แก้ไข และจัดการสินค้าทั้งหมด</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            เพิ่มสินค้าใหม่
          </button>
        </div>

        {/* Table */}
        {loadError && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-lg font-semibold text-red-700">⚠️ ไม่สามารถโหลดสินค้าได้</p>
            <p className="mt-2 text-sm text-red-600">{loadError}</p>
            <button
              onClick={loadProducts}
              className="mt-4 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              ลองอีกครั้ง
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        )}

        {/* Table */}
        {!loading && !loadError && (
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">สินค้า</th>
                  <th className="px-5 py-3">ประเภท</th>
                  <th className="px-5 py-3">สต็อก</th>
                  <th className="px-5 py-3">ราคา</th>
                  <th className="px-5 py-3">สถานะ</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => {
                  const pHasVariants =
                    Array.isArray(product.variants) && product.variants.length > 0;
                  const effectiveStock = pHasVariants
                    ? product.variants!.reduce((sum, v) => sum + (v.stock ?? 0), 0)
                    : product.stock;
                  const variantCount = pHasVariants ? product.variants!.length : 0;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-slate-900">{product.name}</span>
                          {product.affiliate_url && (
                            <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                              Affiliate
                            </span>
                          )}
                          {pHasVariants && (
                            <span className="inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                              {variantCount} options
                            </span>
                          )}
                        </div>
                        {product.description && (
                          <div className="mt-0.5 max-w-xs truncate text-xs text-slate-400">
                            {product.description}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            product.product_type === "digital"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {product.product_type === "digital" ? "💻 Digital" : "📦 Physical"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={
                            effectiveStock <= 5 ? "font-semibold text-red-600" : "text-slate-700"
                          }
                        >
                          {effectiveStock}
                          {effectiveStock <= 5 && " ⚠️"}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-medium">
                        ฿{product.price.toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            product.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {product.is_active ? "Active" : "Hidden"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => openEdit(product)}
                            className="text-sm font-medium text-blue-600 hover:underline"
                          >
                            แก้ไข
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(product.id, product.name)}
                            className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline"
                          >
                            🗑️ ลบถาวร
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {products.length === 0 && (
              <div className="py-12 text-center text-slate-400">ยังไม่มีสินค้า</div>
            )}
          </div>
        )}
      </section>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl">
            <h3 className="text-xl font-bold">
              {editingId ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
            </h3>

            <div className="mt-6 space-y-4">
              {/* ชื่อสินค้า */}
              <div>
                <label className={labelClass}>ชื่อสินค้า *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="ชื่อสินค้า"
                  className={inputClass}
                />
              </div>

              {/* คำอธิบาย */}
              <div>
                <label className={labelClass}>คำอธิบาย</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="รายละเอียดสินค้า..."
                  rows={3}
                  className={inputClass + " resize-none"}
                />
              </div>

              {/* ราคา + สต็อก */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>ราคา (฿) *</label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>สต็อก *</label>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="0"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* รูปภาพ */}
              <div>
                <label className={labelClass}>URL รูปภาพสินค้า</label>
                <input
                  name="image_url"
                  value={form.image_url}
                  onChange={handleChange}
                  placeholder="https://..."
                  className={inputClass}
                />
                {form.image_url && (
                  <img
                    src={form.image_url}
                    alt="preview"
                    className="mt-2 h-24 w-24 rounded-xl object-cover border border-slate-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
              </div>
              <div>
                <label className={labelClass}>Affiliate URL</label>
                <input
                  name="affiliate_url"
                  value={form.affiliate_url}
                  onChange={handleChange}
                  placeholder="https://lazada.co... หรือ https://shopee.co..."
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-slate-400">
                  ถ้ากรอกค่านี้ ระบบจะแสดงปุ่มลิงก์ไปยัง Marketplace แทนการซื้อผ่านตะกร้า
                </p>
              </div>

              {/* ประเภทสินค้า */}
              <div>
                <label className={labelClass}>ประเภทสินค้า *</label>
                <select
                  name="product_type"
                  value={form.product_type}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="physical">📦 Physical — สินค้าจัดส่ง</option>
                  <option value="digital">💻 Digital — ดาวน์โหลด / License Key</option>
                </select>
              </div>

              {/* Digital fields */}
              {form.product_type === "digital" && (
                <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-purple-600">
                    ตั้งค่าสินค้า Digital
                  </p>
                  <div>
                    <label className={labelClass}>ลิงก์ดาวน์โหลดไฟล์</label>
                    <input
                      name="digital_file_url"
                      value={form.digital_file_url}
                      onChange={handleChange}
                      placeholder="https://drive.google.com/... หรือ S3 URL"
                      className={inputClass}
                    />
                    <p className="mt-1 text-xs text-slate-400">
                      ลิงก์ที่ลูกค้าจะได้รับหลังชำระเงิน
                    </p>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="license_key_required"
                      checked={form.license_key_required}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-slate-300 accent-purple-600"
                    />
                    <div>
                      <span className="text-sm font-medium text-slate-700">
                        ต้องใช้ License Key
                      </span>
                      <p className="text-xs text-slate-400">
                        ระบบจะ assign key จากตาราง license_keys ให้อัตโนมัติ
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {/* is_active */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 accent-slate-900"
                />
                <span className="text-sm font-medium text-slate-700">
                  แสดงสินค้าในร้านค้า (Active)
                </span>
              </label>

              {/* Variants toggle */}
              <div className="border-t border-slate-100 pt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasVariants}
                    onChange={(e) => setHasVariants(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 accent-slate-900"
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-700">
                      สินค้านี้มีหลาย option
                    </span>
                    <p className="text-xs text-slate-400">
                      เช่น ขนาด S/M/L, น้ำหนัก 500g/1kg, หรือ tier ราคาต่างกัน
                    </p>
                  </div>
                </label>

                {hasVariants && (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                      ตัวเลือกสินค้า (Variants)
                    </p>

                    <div className="space-y-2">
                      {variants.map((row, idx) => {
                        if (row._delete) {
                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 opacity-50"
                            >
                              <span className="flex-1 text-xs text-slate-400 line-through">
                                {row.label || "(ไม่มีชื่อ)"}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setVariants((prev) =>
                                    prev.map((r, i) =>
                                      i === idx ? { ...r, _delete: false } : r
                                    )
                                  )
                                }
                                className="text-xs text-blue-500 hover:underline"
                              >
                                ยกเลิกลบ
                              </button>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={idx}
                            className="grid grid-cols-[1fr_80px_80px_90px_32px] gap-2 items-end"
                          >
                            <div>
                              {idx === 0 && (
                                <p className="mb-1 text-xs text-slate-400">ชื่อ option</p>
                              )}
                              <input
                                type="text"
                                value={row.label}
                                onChange={(e) =>
                                  setVariants((prev) =>
                                    prev.map((r, i) =>
                                      i === idx ? { ...r, label: e.target.value } : r
                                    )
                                  )
                                }
                                placeholder="S, 500g, Team…"
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                              />
                            </div>
                            <div>
                              {idx === 0 && (
                                <p className="mb-1 text-xs text-slate-400">ราคา (฿)</p>
                              )}
                              <input
                                type="number"
                                min="0"
                                value={row.price}
                                onChange={(e) =>
                                  setVariants((prev) =>
                                    prev.map((r, i) =>
                                      i === idx ? { ...r, price: e.target.value } : r
                                    )
                                  )
                                }
                                placeholder="0"
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                              />
                            </div>
                            <div>
                              {idx === 0 && (
                                <p className="mb-1 text-xs text-slate-400">สต็อก</p>
                              )}
                              <input
                                type="number"
                                min="0"
                                value={row.stock}
                                onChange={(e) =>
                                  setVariants((prev) =>
                                    prev.map((r, i) =>
                                      i === idx ? { ...r, stock: e.target.value } : r
                                    )
                                  )
                                }
                                placeholder="0"
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                              />
                            </div>
                            <div>
                              {idx === 0 && (
                                <p className="mb-1 text-xs text-slate-400">SKU (ไม่บังคับ)</p>
                              )}
                              <input
                                type="text"
                                value={row.sku}
                                onChange={(e) =>
                                  setVariants((prev) =>
                                    prev.map((r, i) =>
                                      i === idx ? { ...r, sku: e.target.value } : r
                                    )
                                  )
                                }
                                placeholder="SKU-001"
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                              />
                            </div>
                            <div className={idx === 0 ? "mt-5" : ""}>
                              <button
                                type="button"
                                onClick={() => {
                                  if (row.id) {
                                    setVariants((prev) =>
                                      prev.map((r, i) =>
                                        i === idx ? { ...r, _delete: true } : r
                                      )
                                    );
                                  } else {
                                    setVariants((prev) => prev.filter((_, i) => i !== idx));
                                  }
                                }}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-100"
                                title="ลบ option นี้"
                              >
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setVariants((prev) => [
                          ...prev,
                          { label: "", price: "", stock: "", sku: "" },
                        ])
                      }
                      className="mt-3 flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500 transition hover:border-slate-400 hover:text-slate-700"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      เพิ่ม option
                    </button>
                  </div>
                )}
              </div>
            </div>

            {saveError && (
              <p className="mt-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">
                {saveError}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-xl py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "var(--primary)" }}
              >
                {saving ? "กำลังบันทึก..." : editingId ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}
              </button>
              <button
                onClick={closeModal}
                className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
