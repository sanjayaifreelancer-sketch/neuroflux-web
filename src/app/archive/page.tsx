'use client';
import { useEffect, useState } from 'react';
import NeuralCanvas from '../../components/NeuralCanvas';

export default function ArchivePage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusTime, setStatusTime] = useState('');

  useEffect(() => {
    const tick = () => setStatusTime(new Date().toLocaleTimeString([], { hour12: false }));
    tick(); const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    fetch(`/feed.json?_t=${Date.now()}`)
      .then(r => r.json())
      .then(d => { setArticles(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const sources = [...new Set(articles.map(a => a.source))];

  return (
    <>
      <div className="scanlines" />
      <NeuralCanvas />
      <div className="ui-layer min-h-screen flex flex-col">
        <nav className="w-full p-6 border-b border-cyan-500/30 backdrop-blur-md bg-black/40 flex flex-wrap justify-between items-center gap-2">
          <a href="/" className="text-2xl font-bold text-cyan-400 orbitron tracking-wider">NEURO<span className="text-pink-500">FLUX</span></a>
          <div className="flex gap-6 uppercase text-sm tracking-tighter">
            <a href="/" className="hover:text-cyan-400 transition text-gray-400">Live_Pulse</a>
            <a href="/learn" className="hover:text-pink-500 transition text-gray-400">The_Lab</a>
            <a href="/archive" className="text-cyan-400 border-b border-cyan-400 pb-0.5">Archive</a>
          </div>
          <div className="text-xs text-cyan-600 animate-pulse">{statusTime} UTC</div>
        </nav>

        <section className="pt-16 pb-8 px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-black orbitron tracking-tighter mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">Neural Archive</span>
          </h1>
          <p className="text-gray-400 text-sm max-w-lg mx-auto font-mono">
            All signals captured by the NeuroFlux pulse engine.
          </p>
        </section>

        <section className="flex-grow px-6 pb-16 max-w-3xl mx-auto w-full">
          {/* Source filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider mr-2 self-center">Sources:</span>
            {sources.map(s => (
              <span key={s} className="px-2 py-1 text-[10px] bg-black/40 border border-gray-800 text-cyan-400 rounded uppercase tracking-wider">{s}</span>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-cyan-700 font-mono text-xs">LOADING ARCHIVE...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {articles.map((item) => (
                <div key={item.id} className="p-4 bg-black/40 border-l-2 border-cyan-500/30 hover:border-cyan-400 transition-all backdrop-blur-sm group">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] text-pink-400/80 uppercase tracking-wider">[{item.source}]</span>
                    <span className="text-[10px] text-gray-600">{new Date(item.timestamp).toLocaleTimeString([], { hour12: false })}</span>
                    <span className="text-[10px] text-gray-700">{new Date(item.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-300 group-hover:text-white transition">{item.content}</p>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-cyan-600 hover:text-cyan-400 transition mt-1 inline-block">
                      [source] →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="pb-6 text-center opacity-30 text-[10px] uppercase tracking-widest">
          {articles.length} Signals Archived
        </div>
      </div>
      <style jsx global>{`
        body { margin: 0; padding: 0; background-color: #050505; font-family: 'JetBrains Mono', monospace; overflow-x: hidden; color: white; }
        h1, .orbitron { font-family: 'Orbitron', sans-serif; }
        .scanlines { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%), linear-gradient(90deg, rgba(255,0,0,0.06), rgba(0,255,0,0.02), rgba(0,0,255,0.06)); background-size: 100% 4px, 3px 100%; pointer-events: none; z-index: 50; }
        #hero-canvas { position: fixed; top: 0; left: 0; z-index: 0; }
        .ui-layer { position: relative; z-index: 10; }
      `}</style>
    </>
  );
}
