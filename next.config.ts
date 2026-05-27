import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // ป้องกัน Node.js-only modules ถูก bundle เข้า client-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        dns: false,
        net: false,
        tls: false,
        pg: false,
        "pg-native": false,
        "util/types": false,
      };
    }
    return config;
  },
};

export default nextConfig;
