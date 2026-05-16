import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  // PWA dinonaktifkan HANYA saat development, aktif saat production build
  disable: process.env.NODE_ENV === "development",
  register: true,
});

const nextConfig: NextConfig = {
  // 1. Solusi Utama: Menambahkan konfigurasi turbopack kosong untuk membungkam error Webpack
  turbopack: {},

  experimental: {
    serverActions: {
      // 2. Koreksi Hostname: Next.js membutuhkan raw hostname/domain tanpa subnet mask CIDR
      allowedOrigins: [
        "localhost:3000",
        "192.168.18.75:3000", // Sesuaikan dengan IP Network laptop Anda yang terdeteksi kemarin
        "127.0.0.1:3000"
      ]
    }
  }
};

export default withPWA(nextConfig);