# Requirements — Product Variants System

## Introduction

ปัจจุบัน `products` table มี `price` และ `stock` เดียว รองรับได้แค่ "ขายชิ้น ราคาเดียว"
เป้าหมายคือขยาย engine ให้รองรับสินค้าที่มีหลาย option โดยไม่ต้องแก้ template หน้าบ้าน

เนื่องจากโปรเจกต์นี้คือ **E-commerce Engine** ที่ลูกค้าหลายรายจะใช้ร่วมกัน
หลังบ้านต้องรองรับ business model ที่หลากหลาย:

| ลูกค้า | ตัวอย่างสินค้า | Variant |
|---|---|---|
| ร้านเสื้อผ้า | เสื้อยืด | S / M / L / XL |
| ร้านของสด | เนื้อวัว | 500g / 1kg / 2kg |
| ร้านซอฟต์แวร์ | License | Personal / Team / Enterprise |
| ร้านทั่วไป | กระเป๋า | ไม่มี variant (ราคาเดียว) |

### Glossary

- **Variant** — ตัวเลือกย่อยของสินค้า เช่น ขนาด, น้ำหนัก, หรือ tier ที่มีราคาและ stock แยกกัน
- **SKU** — Stock Keeping Unit, รหัสสินค้าสำหรับระบบ inventory
- **Backward Compatible** — สินค้าเดิมที่ไม่มี variant ยังทำงานได้ปกติโดยไม่ต้อง migrate ข้อมูล
- **Digital Product** — สินค้าที่ไม่มีการจัดส่งทางกายภาพ เช่น license key หรือ software

---

## Requirements

### Requirement 1: Product Variant Data Model

**User Story:** As a store owner, I want to define multiple variants for a single product, so that I can sell items with different options (size, weight, tier) each with their own price and stock.

#### Acceptance Criteria

1. A product SHALL support zero or more variants stored in a `product_variants` table linked by `product_id`.
2. Each variant SHALL have a `label` field (e.g., "S", "500g", "Team") that is a non-empty string.
3. Each variant SHALL have a `price` field (decimal, greater than zero) that overrides the parent product's price.
4. Each variant SHALL have a `stock` field (integer, zero or greater) tracked independently from other variants.
5. Each variant SHALL support an optional `sku` field (string) for inventory management purposes.
6. A digital product SHALL be allowed to have variants (e.g., license tiers with different prices).
7. WHERE a product has no variants, the system SHALL use the `price` and `stock` fields from the `products` table unchanged.

---

### Requirement 2: Pricing Display

**User Story:** As a customer, I want to see accurate pricing for products with variants, so that I know the starting price before selecting an option.

#### Acceptance Criteria

1. WHEN a product has one or more variants, the displayed price SHALL be the lowest variant price, formatted as "เริ่มต้น ฿XXX".
2. WHEN a product has no variants, the displayed price SHALL be the single price from `products.price` with no prefix label.
3. The `products.price` field SHALL remain as a fallback value and SHALL be used for products without variants.
4. IF a product has variants but all variants have the same price, the system SHALL still display the "เริ่มต้น ฿XXX" format.

---

### Requirement 3: Cart and Checkout with Variants

**User Story:** As a customer, I want to select a variant before adding a product to my cart, so that the correct price and stock are applied to my order.

#### Acceptance Criteria

1. WHEN a product has variants, the product page SHALL require the customer to select a variant before the "Add to Cart" button becomes active.
2. WHEN a variant is selected and added to cart, the cart item SHALL store the `variantId` alongside the product `id`, `price`, and `quantity`.
3. WHEN a product has no variants, the add-to-cart flow SHALL work exactly as before without requiring any variant selection.
4. WHEN checkout processes a cart item with a `variantId`, the system SHALL deduct stock from the corresponding variant record, not from `products.stock`.
5. WHEN checkout processes a cart item without a `variantId`, the system SHALL deduct stock from `products.stock` as before.
6. IF the selected variant is out of stock at checkout time, the system SHALL reject the order for that item and notify the customer.

---

### Requirement 4: Admin Variant Management

**User Story:** As an admin, I want to manage variants for each product in the admin panel, so that I can configure pricing and stock for each option without touching the database directly.

#### Acceptance Criteria

1. The admin product form SHALL include a section to add, edit, and delete variants for a product.
2. Each variant entry in the admin form SHALL allow editing of `label`, `price`, `stock`, and optional `sku`.
3. The admin SHALL be able to toggle a product between "has variants" and "no variants" mode.
4. WHEN a product is in "has variants" mode, the admin dashboard stock display SHALL show the sum of stock across all variants.
5. WHEN a product is in "no variants" mode, the admin dashboard stock display SHALL show `products.stock` as before.
6. IF an admin deletes a variant that is referenced by existing cart items, the system SHALL handle the orphaned reference gracefully (e.g., display a warning or retain the variant label for historical orders).

---

### Requirement 5: Backward Compatibility

**User Story:** As a developer, I want existing products without variants to continue working without any data migration, so that the system upgrade does not break live store operations.

#### Acceptance Criteria

1. All existing products without variant records SHALL display and function correctly after the schema migration without requiring any data changes.
2. The `/api/checkout` endpoint SHALL accept both `{ id, price, quantity }` (legacy format) and `{ id, variantId, price, quantity }` (new format) in the same request payload.
3. The cart Zustand store SHALL support cart items both with and without a `variantId` field simultaneously.
4. IF a request to `/api/checkout` includes a `variantId` that does not exist, the system SHALL return a 400 error with a descriptive message.
5. The product listing and product card components SHALL render correctly for both variant and non-variant products without conditional layout changes.

---

## Out of Scope

- Multi-dimensional variants (e.g., color + size simultaneously)
- Variant-specific images
- Bulk pricing / tiered pricing
- Variant sorting / ordering
