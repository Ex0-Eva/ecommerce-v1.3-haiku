import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") return null;
  return session;
}

type VariantInput = {
  id?: string;
  label?: string;
  price?: number;
  stock?: number;
  sku?: string;
  _delete?: boolean;
};

// PATCH /api/admin/products/[id]
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const updateData: Record<string, unknown> = {};
  const fieldMap: Record<string, string> = {
    name: "name",
    description: "description",
    price: "price",
    stock: "stock",
    image_url: "imageUrl",
    affiliate_url: "affiliateUrl",
    product_type: "productType",
    digital_file_url: "digitalFileUrl",
    license_key_required: "licenseKeyRequired",
    is_active: "isActive",
  };

  for (const [bodyKey, prismaKey] of Object.entries(fieldMap)) {
    if (bodyKey in body) updateData[prismaKey] = body[bodyKey];
  }

  if (body.product_type === "physical") {
    updateData.digitalFileUrl = null;
    updateData.licenseKeyRequired = false;
  }

  if (Object.keys(updateData).length > 0) {
    try {
      await db.product.update({
        where: { id },
        data: updateData,
      });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  const variants: VariantInput[] | undefined = body.variants;

  if (Array.isArray(variants) && variants.length > 0) {
    for (const v of variants) {
      if (v._delete) continue;
      if (!v.label || typeof v.label !== "string" || v.label.trim() === "") {
        return NextResponse.json({ error: "Variant label must be a non-empty string" }, { status: 400 });
      }
      if (typeof v.price !== "number" || v.price <= 0) {
        return NextResponse.json({ error: `Variant "${v.label}" must have a price greater than 0` }, { status: 400 });
      }
    }

    for (const v of variants) {
      try {
        if (v._delete) {
          if (!v.id) continue;
          await db.productVariant.update({
            where: { id: v.id, productId: id },
            data: { isActive: false },
          });
        } else if (v.id) {
          const variantUpdate: Record<string, unknown> = {
            label: v.label!.trim(),
            price: v.price,
            stock: v.stock ?? 0,
          };
          if (v.sku !== undefined) variantUpdate.sku = v.sku;
          await db.productVariant.update({
            where: { id: v.id, productId: id },
            data: variantUpdate,
          });
        } else {
          await db.productVariant.create({
            data: {
              productId: id,
              label: v.label!.trim(),
              price: v.price!,
              stock: v.stock ?? 0,
              sku: v.sku || null,
            },
          });
        }
      } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  }

  const updatedProduct = await db.product.findUnique({
    where: { id },
    include: { variants: { orderBy: { sortOrder: "asc" } } },
  });

  if (!updatedProduct) {
    return NextResponse.json({ error: "ไม่พบสินค้า" }, { status: 404 });
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");

  return NextResponse.json(updatedProduct);
}

// DELETE /api/admin/products/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  console.log(`🗑️ DELETE product ${id}...`);

  // Delete variants first (cascade is set in schema, but explicit for logging)
  const variantDeleteResult = await db.productVariant.deleteMany({
    where: { productId: id },
  });
  console.log(`📝 Variant delete count:`, variantDeleteResult.count);

  // Then delete the product
  try {
    const deleted = await db.product.delete({
      where: { id },
    });
    console.log(`📝 Product deleted:`, deleted.id);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "ไม่พบสินค้าที่จะลบ" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");

  return NextResponse.json({ success: true, deleted: 1 });
}
