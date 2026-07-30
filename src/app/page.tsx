'use client';
import { useEffect, useState } from 'react';
import NeuralCanvas from '../components/NeuralCanvas';
import ArticleCard from '../components/ArticleCard';

export default function HomePage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusTime, setStatusTime] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

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

  const categories = ['all', ...new Set(articles.map(a => a.category))];
  const filtered = activeCategory === 'all' ? articles : articles.filter(a => a.category === activeCategory);

  return (
    <>
      <div className="scanlines" />
      <NeuralCanvas />
      <div className="ui-layer min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="w-full p-4 md:p-6 border-b border-cyan-500/30 backdrop-blur-md bg-black/40 flex flex-wrap justify-between items-center gap-2 sticky top-0 z-40">
          <a href="/" className="text-xl md:text-2xl font-bold text-cyan-400 orbitron tracking-wider">
            NEURO<span className="text-pink-500">FLUX</span>
          </a>
          <div className="flex gap-4 md:gap-6 uppercase text-xs md:text-sm tracking-tighter">
            <a href="/" className="text-cyan-400 border-b border-cyan-400 pb-0.5">News</a>
            <a href="/papers" className="hover:text-cyan-400 transition text-gray-400">Papers</a>
            <a href="/videos" className="hover:text-pink-500 transition text-gray-400">Videos</a>
            <a href="/learn" className="hover:text-cyan-400 transition text-gray-400">Lab</a>
          </div>
          <div className="text-[10px] md:text-xs text-cyan-600 animate-pulse">
            {statusTime} | {articles.length}
          </div>
        </nav>

        {/* Hero */}
        <section className="pt-10 pb-6 px-4 text-center">
          <h1 className="glitch-text text-5xl md:text-7xl font-bold mb-3 tracking-tighter">NEUROFLUX</h1>
          <div className="neon-border px-4 py-1.5 uppercase tracking-[0.3em] text-cyan-300 text-xs md:text-sm bg-black/50 inline-block">
            The Pulse of Neural Intelligence
          </div>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto text-xs md:text-sm leading-relaxed px-4">
            Real-time AI intelligence. Automated news synthesis from ArXiv, TechCrunch, VentureBeat, Reddit, and more. Updated every 5 hours.
          </p>

          {/* Status */}
          <div className="mt-3 flex items-center justify-center gap-2 text-[9px] text-gray-600 font-mono">
            <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-400'}`} />
            {loading ? 'SCANNING...' : `${articles.length} SIGNALS`}
          </div>
        </section>

        {/* Category Filter */}
        <section className="px-4 md:px-6 max-w-7xl mx-auto w-full mb-4">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 text-[10px] uppercase tracking-wider rounded-full border transition-all ${
                  activeCategory === cat
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-black/40 border-gray-800 text-gray-500 hover:border-gray-600'
                }`}
              >
                {cat} {cat === 'all' ? `(${articles.length})` : `(${articles.filter(a => a.category === cat).length})`}
              </button>
            ))}
          </div>
        </section>

        {/* Article Grid */}
        <section className="flex-grow px-4 md:px-6 pb-16 max-w-7xl mx-auto w-full">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-cyan-700 font-mono text-sm animate-pulse">SCANNING NEURAL STREAMS...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="border-t border-cyan-900/20 bg-black/40">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between text-[9px] tracking-[0.3em] uppercase text-gray-600">
            <span>NeuroFlux v2.0</span>
            <span>Protocol: Neural_Sync • 5h Cycle</span>
            <span className="text-cyan-500/50">Encrypted Stream</span>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        body { margin: 0; padding: 0; background-color: #050505; font-family: 'JetBrains Mono', monospace; overflow-x: hidden; color: white; }
        h1, h2, h3, .orbitron { font-family: 'Orbitron', sans-serif; }
        .glitch-text { position: relative; display: inline-block; animation: glitch 1s linear infinite; }
        @keyframes glitch {
          0% { text-shadow: -2px 0 #ff00ff, 2px 0 #00ffff; transform: translate(0); }
          25% { transform: translate(-2px, 2px); }
          50% { text-shadow: 2px 0 #ff00ff, -2px 0 #00ffff; transform: translate(2px, -2px); }
          75% { transform: translate(-1px, -1px); }
          100% { text-shadow: -2px 0 #ff00ff, 2px 0 #00ffff; transform: translate(0); }
        }
        .neon-border {
          border: 1px solid #00ffff;
          box-shadow: 0 0 10px #00ffff, inset 0 0 5px #00ffff;
          animation: neon-pulse 2s infinite ease-in-out;
        }
        @keyframes neon-pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 10px #00ffff, inset 0 0 5px #00ffff; }
          50% { opacity: 0.7; box-shadow: 0 0 20px #ff00ff, inset 0 0 10px #ff00ff; border-color: #ff00ff; }
        }
        .scanlines {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%),
                      linear-gradient(90deg, rgba(255,0,0,0.06), rgba(0,255,0,0.02), rgba(0,0,255,0.06));
          background-size: 100% 4px, 3px 100%;
          pointer-events: none; z-index: 50;
        }
        #hero-canvas { position: fixed; top: 0; left: 0; z-index: 0; }
        .ui-layer { position: relative; z-index: 10; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </>
  );
}
