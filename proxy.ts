import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 16 Proxy — แทนที่ middleware.ts เดิม
 * รันบน Node.js runtime ก่อน request ถึง route handler
 */
export function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    // exclude /api/* ทั้งหมด, static assets, และ favicon
    // ต้องไม่ดักจับ /api/auth/* เด็ดขาด — NextAuth จะทำงานผิดพลาด
    '/((?!api/|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt).*)',
  ],
};
