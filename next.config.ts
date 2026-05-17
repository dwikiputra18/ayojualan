import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  // PWA dinonaktifkan saat development, aktif saat production build
  disable: process.env.NODE_ENV === "development",
  // Opsi registrasi otomatis ditaruh di sini (jika versi lama memicu error, baris bawah ini bisa dihapus aman karena default-nya sudah true)
  register: true,
});

const nextConfig: NextConfig = {
  // Properti turbopack dihapus karena kita menggunakan compiler Webpack murni via terminal flag
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "192.168.18.75:3000",
        "127.0.0.1:3000",
        "ayojualan.vercel.app"
      ]
    }
  }
};

export default withPWA(nextConfig);