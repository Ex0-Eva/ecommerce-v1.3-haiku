import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return null;
  }
  return session;
}

// POST /api/admin/upload
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "ไม่มีไฟล์" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "ไฟล์ต้องเป็นรูปภาพ" }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "ไฟล์ใหญ่เกินไป (สูงสุด 5MB)" }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `product-${timestamp}.${ext}`;
    const filepath = path.join(process.cwd(), "public", "images", "products", filename);

    // Ensure directory exists
    await mkdir(path.dirname(filepath), { recursive: true });

    // Write file
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));

    // Return relative URL
    const url = `/images/products/${filename}`;
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัพโหลด" }, { status: 500 });
  }
}
