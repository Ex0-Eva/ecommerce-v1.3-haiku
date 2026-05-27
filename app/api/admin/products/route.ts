import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return null;
  }
  return session;
}

// GET /api/admin/products
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      variants: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  const result = products.map((product) => {
    const variants = product.variants.map(({ id, label, price, stock, sku, sortOrder }) => ({
      id,
      label,
      price,
      stock,
      sku: sku ?? null,
      sort_order: sortOrder,
    }));
    const { variants: _omit, ...rest } = product;
    return { ...rest, variants };
  });

  return NextResponse.json(result);
}

// POST /api/admin/products
export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    name, description, price, stock,
    image_url, affiliate_url, product_type,
    digital_file_url, license_key_required,
    is_active, variants,
  } = body;

  if (!name || price === undefined || stock === undefined) {
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ (ชื่อ, ราคา, สต็อก)" }, { status: 400 });
  }

  if (variants !== undefined && variants !== null) {
    if (!Array.isArray(variants)) {
      return NextResponse.json({ error: "variants ต้องเป็น array" }, { status: 400 });
    }
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.label || typeof v.label !== "string" || v.label.trim() === "") {
        return NextResponse.json({ error: `variant ที่ ${i + 1}: label ต้องไม่ว่างเปล่า` }, { status: 400 });
      }
      if (v.price === undefined || Number(v.price) <= 0) {
        return NextResponse.json({ error: `variant ที่ ${i + 1} (${v.label}): price ต้องมากกว่า 0` }, { status: 400 });
      }
    }
  }

  const product = await db.product.create({
    data: {
      name,
      description: description || null,
      price: Number(price),
      stock: Number(stock),
      imageUrl: image_url || null,
      affiliateUrl: affiliate_url?.trim() || null,
      productType: product_type || "physical",
      digitalFileUrl: product_type === "digital" ? (digital_file_url || null) : null,
      licenseKeyRequired: product_type === "digital" ? Boolean(license_key_required) : false,
      isActive: is_active !== false,
    },
  });

  let insertedVariants: Array<{
    id: string; label: string; price: unknown; stock: number; sku: string | null; sort_order: number;
  }> = [];

  if (Array.isArray(variants) && variants.length > 0) {
    try {
      const createdVariants = await db.$transaction(
        variants.map((v, index) =>
          db.productVariant.create({
            data: {
              productId: product.id,
              label: v.label.trim(),
              price: Number(v.price),
              stock: v.stock !== undefined ? Number(v.stock) : 0,
              sku: v.sku ? String(v.sku) : null,
              sortOrder: index,
            },
            select: { id: true, label: true, price: true, stock: true, sku: true, sortOrder: true },
          })
        )
      );

      insertedVariants = createdVariants
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(({ id, label, price, stock, sku, sortOrder }) => ({
          id, label, price, stock, sku: sku ?? null, sort_order: sortOrder,
        }));
    } catch (variantError: any) {
      return NextResponse.json(
        { ...product, variants: [], variantError: `สร้างสินค้าสำเร็จ แต่เพิ่ม variants ไม่สำเร็จ: ${variantError.message}` },
        { status: 201 }
      );
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");

  return NextResponse.json({ ...product, variants: insertedVariants }, { status: 201 });
}
