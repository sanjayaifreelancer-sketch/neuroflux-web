import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeuroFlux | The Pulse of Neural Intelligence",
  description:
    "Real-time AI news aggregation and education hub. Automated intelligence synthesis from ArXiv, TechCrunch, VentureBeat, Reddit, and more. Updated every 5 hours.",
  keywords: [
    "AI news", "artificial intelligence", "machine learning", "LLM",
    "neural networks", "deep learning", "NVIDIA NIM", "AI education",
    "AI research", "machine learning papers",
  ],
  openGraph: {
    title: "NeuroFlux | The Pulse of Neural Intelligence",
    description: "Real-time AI news aggregation and education hub. Updated every 5 hours.",
    siteName: "NeuroFlux",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NeuroFlux | The Pulse of Neural Intelligence",
    description: "Real-time AI news aggregation and education hub. Updated every 5 hours.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
        {/* Google AdSense — uncomment and add your client ID */}
        {/*
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossOrigin="anonymous" />
        */}
      </head>
      <body>{children}</body>
    </html>
  );
}
