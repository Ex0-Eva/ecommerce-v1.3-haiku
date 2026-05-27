import { NextResponse } from "next/server";
import { getSiteConfig } from "@/lib/siteConfig";

// GET /api/site-config — ดึง config จาก DB (ใช้ใน settings page)
export async function GET() {
  const config = await getSiteConfig();
  return NextResponse.json(config);
}
