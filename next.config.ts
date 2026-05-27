import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "drive.google.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "i.pinimg.com" },
      { protocol: "https", hostname: "pinimg.com" },
      { protocol: "https", hostname: "i.imgur.com" },
      { protocol: "https", hostname: "imgur.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
      // Allow localhost and relative paths for uploaded images
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
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
