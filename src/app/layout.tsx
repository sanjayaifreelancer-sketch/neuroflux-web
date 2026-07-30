import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeuroFlux | The Pulse of Neural Intelligence",
  description: "Automated intelligence synthesis. Real-time neural updates every 5 hours. Powered by NVIDIA NIM.",
  openGraph: {
    title: "NeuroFlux | The Pulse of Neural Intelligence",
    description: "Automated intelligence synthesis. Real-time neural updates every 5 hours.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=JetBrains+Mono:wght@300;500&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
