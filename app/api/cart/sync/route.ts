import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items } = await req.json();
    
    // Logic สำหรับการบันทึกรายการตะกร้าสินค้าลง Database
    // โดยอ้างอิงจาก User ID ของผู้ที่ Login อยู่
    console.log(`Syncing ${items.length} items for user ${session.user?.email}`);

    return NextResponse.json({ success: true, message: "Cart synced successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
