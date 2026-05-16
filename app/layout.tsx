import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kalkulator HPP Kuliner",
  description: "Aplikasi hitung HPP produk makanan per bahan baku secara real-time.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HPP Food",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <meta name="theme-color" content="#059669" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div className="mobile-app-container">
          <main className="app-content">
            {children}
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
