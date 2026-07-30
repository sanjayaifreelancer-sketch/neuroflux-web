'use client';
import { useEffect, useRef, useState } from 'react';
import NeuralCanvas from '../components/NeuralCanvas';

const headlines = [
  "[SYNAPSE_ALERT] NVIDIA NIM achieves 40% latency reduction in LLM inference.",
  "[NEURAL_UPDATE] New Transformer architecture pattern detected in open-source repos.",
  "[DATA_FLOW] Massive influx of training data found in decentralized datasets.",
  "[CORE_LOG] Zero-shot capabilities expanding across multi-modal models.",
  "[EDGE_TECH] 5-hour automated sync completed. System stable.",
  "[SYSTEM_INCIDENT] Latency spike detected in cluster Node-7. Resolving...",
];

export default function Page() {
  const feedRef = useRef<HTMLDivElement>(null);
  const [statusTime, setStatusTime] = useState('');

  useEffect(() => {
    const tick = () => setStatusTime(new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  // Live news feed simulation (matching prototype's setInterval behavior)
  useEffect(() => {
    const container = feedRef.current;
    if (!container) return;

    function addNewsItem() {
      const item = document.createElement('div');
      const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' });
      const text = headlines[Math.floor(Math.random() * headlines.length)];

      item.className = "feed-card p-4 transition-all duration-500";
      item.innerHTML = `
        <div class="text-[10px] text-cyan-500 font-bold mb-1 uppercase tracking-widest">${timestamp}</div>
        <div class="text-sm md:text-base text-white leading-snug">${text}</div>
      `;

      container.prepend(item);
      if (container.children.length > 5) {
        container.removeChild(container.lastChild!);
      }
    }

    addNewsItem();
    const interval = setInterval(addNewsItem, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Scanline Overlay — exact match to prototype */}
      <div className="scanlines" />

      {/* Three.js Canvas — rendered by NeuralCanvas */}
      <NeuralCanvas />

      <div className="ui-layer min-h-screen flex flex-col">
        {/* Navigation — matching prototype exactly */}
        <nav className="w-full p-6 border-b border-cyan-500/30 backdrop-blur-md bg-black/40 flex justify-between items-center">
          <div className="text-2xl font-bold text-cyan-400 orbitron tracking-wider">
            NEURO<span className="text-pink-500">FLUX</span>
          </div>
          <div className="space-x-8 hidden md:flex uppercase text-sm tracking-tighter">
            <a href="#" className="hover:text-cyan-400 transition">Live_Pulse</a>
            <a href="#" className="hover:text-pink-500 transition">Neural_Archive</a>
            <a href="#" className="hover:text-cyan-400 transition">The_Lab</a>
          </div>
          <div className="text-xs text-cyan-600 animate-pulse">{statusTime} STATUS: ONLINE [SYSTEM_ACTIVE]</div>
        </nav>

        {/* Hero Section — matching prototype */}
        <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
          <h1 className="glitch-text text-7xl md:text-9xl font-bold mb-4 tracking-tighter">NEUROFLUX</h1>
          <div className="neon-border px-6 py-2 uppercase tracking-[0.3em] text-cyan-300 text-sm md:text-lg bg-black/50">
            The Pulse of Neural Intelligence
          </div>
          <p className="mt-8 text-gray-400 max-w-xl text-sm md:text-base leading-relaxed">
            Automated intelligence synthesis. Real-time neural updates every 5 hours. 
            Powered by NVIDIA NIM and the future of edge computation.
          </p>
        </main>

        {/* Live Feed Section — matching prototype */}
        <section className="p-10 w-full max-w-md mx-auto">
          <div className="feed-container flex flex-col space-y-4" ref={feedRef} />
        </section>

        {/* Footer — matching prototype */}
        <div className="pb-10 text-center opacity-30 text-[10px] uppercase tracking-widest">
          Protocol: Neural_Sync v4.0 | Connection: SECURE
        </div>
      </div>

      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          background-color: #050505;
          font-family: 'JetBrains Mono', monospace;
          overflow-x: hidden;
          color: white;
        }
        h1, h2, .orbitron { font-family: 'Orbitron', sans-serif; }

        /* Cyberpunk Glitch Effect — exact from prototype */
        .glitch-text {
          position: relative;
          display: inline-block;
          animation: glitch 1s linear infinite;
        }

        @keyframes glitch {
          0% { text-shadow: -2px 0 #ff00ff, 2px 0 #00ffff; transform: translate(0); }
          25% { transform: translate(-2px, 2px); }
          50% { text-shadow: 2px 0 #ff00ff, -2px 0 #00ffff; transform: translate(2px, -2px); }
          75% { transform: translate(-1px, -1px); }
          100% { text-shadow: -2px 0 #ff00ff, 2px 0 #00ffff; transform: translate(0); }
        }

        /* Neon Pulse Border — exact from prototype */
        .neon-border {
          border: 1px solid #00ffff;
          box-shadow: 0 0 10px #00ffff, inset 0 0 5px #00ffff;
          animation: neon-pulse 2s infinite ease-in-out;
        }

        @keyframes neon-pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 10px #00ffff, inset 0 0 5px #00ffff; }
          50% { opacity: 0.7; box-shadow: 0 0 20px #ff00ff, inset 0 0 10px #ff00ff; border-color: #ff00ff; }
        }

        /* Scanline Overlay — exact from prototype */
        .scanlines {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(
              rgba(18, 16, 16, 0) 50%, 
              rgba(0, 0, 0, 0.25) 50%
            ), linear-gradient(
              90deg, 
              rgba(255, 0, 0, 0.06), 
              rgba(0, 255, 0, 0.02), 
              rgba(0, 0, 255, 0.06)
            );
          background-size: 100% 4px, 3px 100%;
          pointer-events: none;
          z-index: 50;
        }

        #hero-canvas {
          position: fixed;
          top: 0; left: 0;
          z-index: 0;
        }

        .ui-layer {
          position: relative;
          z-index: 10;
        }

        .feed-card {
          background: rgba(5, 5, 5, 0.7);
          backdrop-filter: blur(8px);
          border-left: 4px solid #00ffff;
        }
      `}</style>
    </>
  );
}
