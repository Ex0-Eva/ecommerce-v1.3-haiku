import { NextResponse } from "next/server";
import { registerUser, findUserByEmail } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, password, role = "user" } = body as {
    name?: string;
    email?: string;
    password?: string;
    role?: "user" | "admin";
  };

  if (!name || !email || !password) {
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
  }

  // Validate role
  if (role && !["user", "admin"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "อีเมลนี้มีบัญชีอยู่แล้ว" }, { status: 409 });
    }

    await registerUser({
      id: crypto.randomUUID(),
      name,
      email,
      password,
      role: role || "user",
    });

    return NextResponse.json({ success: true, message: "ลงทะเบียนสำเร็จ" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "ไม่สามารถลงทะเบียนได้" },
      { status: 500 }
    );
  }
}
