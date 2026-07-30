'use client';
import { useEffect, useState } from 'react';
import NeuralCanvas from '../../components/NeuralCanvas';

export default function VideosPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/feed.json?_t=${Date.now()}`)
      .then(r => r.json())
      .then(d => {
        // Get videos and also check for YouTube in content
        const vids = d.filter((a: any) => a.youtube_id);
        setVideos(vids);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="scanlines" />
      <NeuralCanvas />
      <div className="ui-layer min-h-screen flex flex-col">
        <nav className="w-full p-4 md:p-6 border-b border-cyan-500/30 backdrop-blur-md bg-black/40 flex flex-wrap justify-between items-center gap-2">
          <a href="/" className="text-xl md:text-2xl font-bold text-cyan-400 orbitron tracking-wider">NEURO<span className="text-pink-500">FLUX</span></a>
          <div className="flex gap-4 md:gap-6 uppercase text-xs md:text-sm tracking-tighter">
            <a href="/" className="hover:text-cyan-400 transition text-gray-400">News</a>
            <a href="/papers" className="hover:text-cyan-400 transition text-gray-400">Papers</a>
            <a href="/videos" className="text-pink-400 border-b border-pink-400 pb-0.5">Videos</a>
            <a href="/learn" className="hover:text-cyan-400 transition text-gray-400">Lab</a>
          </div>
        </nav>

        <section className="pt-10 pb-6 px-4 text-center">
          <div className="inline-block px-3 py-1 mb-3 border border-pink-500/30 rounded-full text-[9px] tracking-[0.3em] uppercase text-pink-400 bg-black/40">Neural Visual Stream</div>
          <h1 className="text-3xl md:text-5xl font-black orbitron tracking-tighter mb-2">
            <span className="bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent">AI Videos</span>
          </h1>
          <p className="text-gray-400 text-xs md:text-sm max-w-lg mx-auto font-mono">Curated AI content from YouTube and video sources.</p>
        </section>

        <section className="flex-grow px-4 md:px-6 pb-16 max-w-6xl mx-auto w-full">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎥</div>
              <p className="text-gray-400 font-mono text-sm mb-2">Video stream initializing</p>
              <p className="text-gray-600 text-[10px]">AI videos will appear here when detected in RSS feeds.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videos.map((vid) => (
                <div key={vid.id} className="bg-black/60 border border-gray-800 rounded-lg overflow-hidden backdrop-blur-sm">
                  <div className="aspect-video bg-gray-900">
                    <iframe
                      src={`https://www.youtube.com/embed/${vid.youtube_id}`}
                      title={vid.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] px-2 py-0.5 rounded bg-black/60 text-pink-400 border border-pink-500/20 uppercase tracking-wider">{vid.source}</span>
                      <span className="text-[10px] text-gray-600">{new Date(vid.timestamp).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white leading-snug">{vid.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="border-t border-cyan-900/20 bg-black/40">
          <div className="max-w-7xl mx-auto px-6 py-4 text-center text-[9px] tracking-[0.3em] uppercase text-gray-600">
            Video Neural Stream • Updated Every 5 Hours
          </div>
        </footer>
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
