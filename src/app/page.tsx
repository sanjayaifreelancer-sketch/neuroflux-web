'use client';
import { useEffect, useRef, useState } from 'react';
import NeuralCanvas from '../components/NeuralCanvas';
import AdBanner from '../components/AdBanner';

export default function Page() {
  const feedRef = useRef<HTMLDivElement>(null);
  const [statusTime, setStatusTime] = useState('');
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedVisible, setFeedVisible] = useState(false);

  // Clock
  useEffect(() => {
    const tick = () => setStatusTime(new Date().toLocaleTimeString([], { hour12: false }));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  // Fetch live feed
  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await fetch(`/feed.json?_t=${Date.now()}`);
        const data = await res.json();
        setArticles(data);
        setLoading(false);
      } catch (e) {
        console.error('Feed fetch error:', e);
        setLoading(false);
      }
    };
    fetchFeed();
    const iv = setInterval(fetchFeed, 300000); // Refresh every 5 min
    return () => clearInterval(iv);
  }, []);

  // Live news ticker (prototype-style)
  useEffect(() => {
    if (articles.length === 0) return;
    const container = feedRef.current;
    if (!container || feedVisible) return;

    setFeedVisible(true);
    // Show existing articles
    articles.slice(0, 8).forEach((item, i) => {
      setTimeout(() => {
        const el = document.createElement('div');
        el.className = "feed-card p-4 transition-all duration-500 animate-fadeIn";
        el.innerHTML = `
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[10px] text-cyan-500 font-bold uppercase tracking-widest">${new Date(item.timestamp).toLocaleTimeString([], { hour12: false })}</span>
            <span class="text-[9px] text-pink-400/70 uppercase">${item.source}</span>
          </div>
          <div class="text-sm md:text-base text-white/90 leading-snug">${item.content}</div>
        `;
        if (container.firstChild) {
          container.insertBefore(el, container.firstChild);
        } else {
          container.appendChild(el);
        }
        // Keep max 8
        while (container.children.length > 8) {
          container.removeChild(container.lastChild!);
        }
      }, i * 300);
    });
  }, [articles, feedVisible]);

  return (
    <>
      <div className="scanlines" />
      <NeuralCanvas />

      <div className="ui-layer min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="w-full p-6 border-b border-cyan-500/30 backdrop-blur-md bg-black/40 flex flex-wrap justify-between items-center gap-2">
          <div className="text-2xl font-bold text-cyan-400 orbitron tracking-wider">
            NEURO<span className="text-pink-500">FLUX</span>
          </div>
          <div className="flex gap-6 uppercase text-sm tracking-tighter">
            <a href="/" className="text-cyan-400 border-b border-cyan-400 pb-0.5">Live_Pulse</a>
            <a href="/learn" className="hover:text-pink-500 transition text-gray-400">The_Lab</a>
            <a href="/archive" className="hover:text-cyan-400 transition text-gray-400">Archive</a>
          </div>
          <div className="text-xs text-cyan-600 animate-pulse">
            {statusTime} | {articles.length} signals
          </div>
        </nav>

        {/* Hero */}
        <main className="flex-grow flex flex-col items-center justify-center text-center px-4 pt-12 pb-4">
          <h1 className="glitch-text text-6xl md:text-8xl font-bold mb-4 tracking-tighter">NEUROFLUX</h1>
          <div className="neon-border px-6 py-2 uppercase tracking-[0.3em] text-cyan-300 text-sm md:text-base bg-black/50">
            The Pulse of Neural Intelligence
          </div>
          <p className="mt-6 text-gray-400 max-w-xl text-sm md:text-sm leading-relaxed">
            Automated intelligence synthesis. Real-time neural updates every 5 hours.
            Powered by NVIDIA NIM and the future of edge computation.
          </p>

          {/* Status bar */}
          <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-600 font-mono">
            <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-400'}`} />
            {loading ? 'SYNCING...' : `${articles.length} STREAMS ACTIVE`}
            <span className="text-gray-700">|</span>
            <span>NEXT PULSE: {new Date(Date.now() + 5*60*60*1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</span>
          </div>

          <AdBanner format="banner" />
        </main>

        {/* Live Feed */}
        <section className="px-6 pb-16 w-full max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_6px_#00ff00]" />
            <span className="text-[10px] tracking-[0.35em] uppercase text-green-400/80 font-mono">Neural Feed</span>
            <div className="h-px flex-1 bg-gradient-to-r from-green-500/30 to-transparent" />
            <span className="text-[10px] text-gray-600 font-mono">live</span>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-cyan-700 font-mono text-xs animate-pulse">SCANNING NEURAL STREAMS...</p>
            </div>
          )}

          <div className="feed-container flex flex-col space-y-3" ref={feedRef}>
            {!loading && articles.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600 font-mono text-xs">No signals detected. Pulse engine initializing...</p>
              </div>
            )}
          </div>

          {/* Static fallback if JS injection doesn't work */}
          {!loading && articles.length > 0 && (
            <div className="hidden-fallback hidden">
              {articles.slice(0, 8).map((item) => (
                <div key={item.id} className="feed-card p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour12: false })}
                    </span>
                    <span className="text-[9px] text-pink-400/70 uppercase">{item.source}</span>
                  </div>
                  <div className="text-sm md:text-base text-white/90 leading-snug">{item.content}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <div className="pb-6 text-center opacity-30 text-[10px] uppercase tracking-widest">
          Protocol: Neural_Sync v4.0 | Connection: SECURE
        </div>
      </div>

      <style jsx global>{`
        body {
          margin: 0; padding: 0;
          background-color: #050505;
          font-family: 'JetBrains Mono', monospace;
          overflow-x: hidden;
          color: white;
        }
        h1, h2, .orbitron { font-family: 'Orbitron', sans-serif; }

        .glitch-text {
          position: relative; display: inline-block;
          animation: glitch 1s linear infinite;
        }
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
        .feed-card {
          background: rgba(5,5,5,0.7);
          backdrop-filter: blur(8px);
          border-left: 4px solid #00ffff;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>
    </>
  );
}
