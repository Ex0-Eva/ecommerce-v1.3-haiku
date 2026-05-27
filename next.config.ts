import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 
    Proxy Configuration:
    - ใช้ Proxy แทน Middleware ตามกฎของโครงการ เพื่อประสิทธิภาพและความปลอดภัย
    - Routing และ Authentication บางส่วนควรจัดการที่ระดับ Proxy (เช่น Cloudflare, Nginx)
  */
  async rewrites() {
    return [
      // ตัวอย่างการทำ Proxy ไปยัง API Backend ภายนอก (ถ้ามี)
      // {
      //   source: '/api/external/:path*',
      //   destination: 'https://api.external.com/:path*',
      // },
    ];
  },
};

export default nextConfig;
