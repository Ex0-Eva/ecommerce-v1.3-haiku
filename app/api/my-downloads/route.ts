import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const orders = await db.order.findMany({
      where: {
        userId,
        status: "paid",
      },
      select: {
        id: true,
        status: true,
        orderItems: {
          select: {
            productId: true,
            productName: true,
            licenseKey: true,
            product: {
              select: {
                productType: true,
                digitalFileUrl: true,
              },
            },
          },
        },
      },
    });

    const digitalAssets = orders.flatMap((order) =>
      order.orderItems
        .filter((item) => item.product?.productType === "digital")
        .map((item) => ({
          orderId: order.id,
          productId: item.productId,
          name: item.productName,
          licenseKey: item.licenseKey,
          downloadUrl: item.product?.digitalFileUrl,
        }))
    );

    return NextResponse.json(digitalAssets);
  } catch (error) {
    console.error("Fetch digital assets error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
