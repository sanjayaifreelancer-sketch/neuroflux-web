'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import NeuralCanvas from '../../../components/NeuralCanvas';
import ArticleCard from '../../../components/ArticleCard';

export default function ArticlePage() {
  const params = useParams();
  const [article, setArticle] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/feed.json?_t=${Date.now()}`)
      .then(r => r.json())
      .then(data => {
        const found = data.find((a: any) => a.id === params.id);
        setArticle(found);
        if (found) {
          setRelated(data.filter((a: any) => a.category === found.category && a.id !== found.id).slice(0, 4));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-cyan-700 font-mono text-sm">LOADING...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold orbitron mb-4">SIGNAL LOST</h1>
          <p className="text-gray-500 mb-6">This article could not be found.</p>
          <a href="/" className="text-cyan-400 hover:text-cyan-300 underline text-sm">← Back to Pulse</a>
        </div>
      </div>
    );
  }

  const date = new Date(article.timestamp);

  return (
    <>
      <div className="scanlines" />
      <NeuralCanvas />
      <div className="ui-layer min-h-screen flex flex-col">
        <nav className="w-full p-4 md:p-6 border-b border-cyan-500/30 backdrop-blur-md bg-black/40 flex flex-wrap justify-between items-center gap-2">
          <a href="/" className="text-xl md:text-2xl font-bold text-cyan-400 orbitron tracking-wider">NEURO<span className="text-pink-500">FLUX</span></a>
          <div className="flex gap-4 md:gap-6 uppercase text-xs md:text-sm tracking-tighter">
            <a href="/" className="text-cyan-400 border-b border-cyan-400 pb-0.5">News</a>
            <a href="/papers" className="hover:text-cyan-400 transition text-gray-400">Papers</a>
            <a href="/videos" className="hover:text-pink-500 transition text-gray-400">Videos</a>
            <a href="/learn" className="hover:text-cyan-400 transition text-gray-400">Lab</a>
          </div>
        </nav>

        <article className="flex-grow max-w-3xl mx-auto w-full px-4 md:px-6 pt-10 pb-16">
          <a href="/" className="text-[10px] text-gray-600 hover:text-cyan-400 transition mb-6 inline-block tracking-wider">← BACK TO PULSE</a>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider rounded bg-black/60 text-cyan-400 border border-cyan-500/30">{article.category}</span>
            <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider rounded bg-black/60 text-pink-400 border border-pink-500/20">{article.source}</span>
            <span className="text-[10px] text-gray-500 font-mono">{date.toLocaleDateString()} • {date.toLocaleTimeString([], { hour12: false })}</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-bold orbitron tracking-tighter mb-6 text-white leading-tight">
            {article.title}
          </h1>

          {/* Image */}
          {article.image && (
            <div className="mb-8 rounded-lg overflow-hidden border border-gray-800">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-auto max-h-96 object-cover"
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  if (article.youtube_id && el.src.includes('maxresdefault')) {
                    el.src = `https://img.youtube.com/vi/${article.youtube_id}/hqdefault.jpg`;
                    return;
                  }
                  el.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Content */}
          <div className="text-sm md:text-base text-gray-300 leading-relaxed space-y-4 mb-8">
            <p>{article.content}</p>
          </div>

          {/* Source Link */}
          {article.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 text-[10px] uppercase tracking-wider border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 rounded transition"
            >
              Read Original Source →
            </a>
          )}

          {/* Related Articles */}
          {related.length > 0 && (
            <div className="mt-16 pt-8 border-t border-gray-800">
              <h2 className="text-sm uppercase tracking-[0.3em] text-cyan-500 mb-4 orbitron">Related Signals</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {related.map((item) => (
                  <ArticleCard key={item.id} article={item} />
                ))}
              </div>
            </div>
          )}
        </article>

        <footer className="border-t border-cyan-900/20 bg-black/40">
          <div className="max-w-7xl mx-auto px-6 py-4 text-center text-[9px] tracking-[0.3em] uppercase text-gray-600">
            NeuroFlux v2.0 • Neural Sync Active
          </div>
        </footer>
      </div>

      <style jsx global>{`
        body { margin: 0; padding: 0; background-color: #050505; font-family: 'JetBrains Mono', monospace; overflow-x: hidden; color: white; }
        h1, h2, .orbitron { font-family: 'Orbitron', sans-serif; }
        .scanlines { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%), linear-gradient(90deg, rgba(255,0,0,0.06), rgba(0,255,0,0.02), rgba(0,0,255,0.06)); background-size: 100% 4px, 3px 100%; pointer-events: none; z-index: 50; }
        #hero-canvas { position: fixed; top: 0; left: 0; z-index: 0; }
        .ui-layer { position: relative; z-index: 10; }
      `}</style>
    </>
  );
}
