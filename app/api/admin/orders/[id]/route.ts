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

const VALID_STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

// PATCH /api/admin/orders/[id] — เปลี่ยน status
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await req.json();

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: `status ต้องเป็นหนึ่งใน: ${VALID_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const data = await db.order.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin/dashboard");

    return NextResponse.json(data);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "ไม่พบ order" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
