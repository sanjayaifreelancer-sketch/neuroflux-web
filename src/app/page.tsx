'use client';
import React, { useEffect, useState } from 'react';
import NeuralCanvas from '../components/NeuralCanvas';
import NewsCard from '../components/NewsCard';

export default function Page() {
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    fetch('/feed.json')
      .then(res => res.json())
      .then(data => setNews(data))
      .catch(err => console.error("Pulse error:", err));
  }, []);

  return (
    <main className="relative min-h-screen bg-black text-white">
      <NeuralCanvas />
      <div className="relative z-10 pt-24 px-6 max-w-2xl mx-auto">
        <h1 className="text-5xl font-black italic uppercase text-cyan-400">NeuroFlux</h1>
        <p className="text-pink-500 font-mono animate-pulse text-xs mt-2">STATUS: LIVE_STREAM</p>
        <div className="mt-12 space-y-4">
          {news.length > 0 ? (
            news.map((n, i) => <NewsCard key={i} source={n.source} content={n.content} timestamp={n.timestamp} />)
          ) : (
            <div className="text-cyan-80 0 font-mono text-sm">SCANNING...</div>
          )}
        </div>
      </div>
    </main>
  );
}