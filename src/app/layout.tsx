import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NeuroFlux — The Pulse of Neural Intelligence",
  description: "Real-time AI news and education hub. Automated intelligence synthesis, powered by NVIDIA NIM.",
  openGraph: {
    title: "NeuroFlux — The Pulse of Neural Intelligence",
    description: "Real-time AI news and education hub. Updated every 5 hours.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-[#0a0a0a] text-white antialiased">{children}</body>
    </html>
  );
}
