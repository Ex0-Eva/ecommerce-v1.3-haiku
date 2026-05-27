import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const result = await db.$queryRaw<[{ version: string }]>`SELECT version()`;
    const version = Array.isArray(result) ? (result[0] as any)?.version : String(result);

    return NextResponse.json({
      success: true,
      message: "Prisma DB connected",
      version,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Prisma DB health check failed",
        error: error?.message ?? "unknown error",
      },
      { status: 500 }
    );
  }
}
