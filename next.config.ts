import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: true,
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "192.168.0.0/16",
        "10.0.0.0/8",
        "172.16.0.0/12",
        "*"
      ]
    }
  }
};

export default withPWA(nextConfig);
