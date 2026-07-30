'use client';
import NeuralCanvas from '../components/NeuralCanvas';
import NewsCard from '../components/NewsCard';
import { useEffect, useState } from 'react';

export default function NeuroFlux() {
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    fetch('/feed.json').then(res => res.json()).then(setNews).catch(console.error);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <NeuralCanvas />
      <div className="relative z-10 pt-24 px-6 max-w-xl mx-auto pointer-events-none">
        <h1 className="text-5xl font-bold italic text-cyan-400 uppercase">NeuroFlux</h1>
        <div className="space-y-4 mt-12 pointer-events-auto">
          {news.map((n, i) => <NewsCard key={i} {...n} />)}
        </div>
      </div>
    </main>
  );
}