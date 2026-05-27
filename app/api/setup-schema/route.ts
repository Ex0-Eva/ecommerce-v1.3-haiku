import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    success: true,
    message: "Schema managed by Prisma migrations",
    instructions: {
      migrate: "pnpm prisma migrate dev",
      deploy: "pnpm prisma migrate deploy",
      studio: "pnpm prisma studio",
    },
  });
}
