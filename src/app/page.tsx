'use client';
import { useEffect, useRef, useState } from 'react';

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [news, setNews] = useState<any[]>([]);
  const [time, setTime] = useState('');

  // Canvas particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 3 + 1,
      });
    }

    const animate = () => {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = '#00ffff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        particles.forEach((p2, j) => {
          if (i >= j) return;
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 255, 255, ${(1 - dist / 180) * 0.3})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Fetch live feed
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/feed.json?_=' + Date.now());
        const data = await res.json();
        setNews(data);
      } catch (e) {
        console.error('Feed error:', e);
      }
    };
    fetchNews();
    const interval = setInterval(fetchNews, 300000);
    return () => clearInterval(interval);
  }, []);

  // Live clock
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <main className="relative min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <canvas ref={canvasRef} className="fixed inset-0 -z-10" />
      
      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
        }}
      />

      {/* Top Navigation Bar */}
      <nav className="relative z-30 border-b border-cyan-900/40 bg-black/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#00ffff]" />
            <h1 className="text-xl font-black tracking-[0.15em] uppercase text-cyan-300">
              NEURO<span className="text-pink-500">FLUX</span>
            </h1>
          </div>
          <div className="flex items-center gap-6 text-xs tracking-[0.2em] uppercase">
            <span className="text-cyan-500 border-b border-cyan-500 pb-1">Live Pulse</span>
            <span className="text-gray-500 hover:text-cyan-400 transition cursor-pointer">Archive</span>
            <span className="text-gray-500 hover:text-pink-400 transition cursor-pointer">The Lab</span>
            <span className="text-green-400/70 font-mono">{time} UTC</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-20 pt-16 pb-8 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block px-4 py-1.5 mb-6 border border-cyan-500/30 rounded-full text-[10px] tracking-[0.3em] uppercase text-cyan-400 bg-black/40">
            Neural Intelligence Network • Live
          </div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-4">
            <span className="text-white">The Pulse of</span>{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
              Artificial Intelligence
            </span>
          </h2>
          <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-mono">
            Real-time intelligence synthesis. Automated updates every 5 hours.
            <br />
            <span className="text-cyan-600">Powered by NVIDIA NIM neural inference.</span>
          </p>
        </div>
      </section>

      {/* Live Feed */}
      <section className="relative z-20 px-6 pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_6px_#00ff00]" />
            <span className="text-[10px] tracking-[0.35em] uppercase text-green-400/80 font-mono">
              Live Neural Feed
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-green-500/30 to-transparent" />
            <span className="text-[10px] text-gray-600 font-mono">{news.length} signals</span>
          </div>

          {news.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-block w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-cyan-700 font-mono text-sm animate-pulse">SCANNING NEURAL STREAMS...</p>
            </div>
          )}

          <div className="space-y-3">
            {news.map((item) => (
              <div
                key={item.id}
                className="group p-4 bg-black/60 border-l-2 border-cyan-500/50 hover:border-cyan-400 transition-all duration-300 backdrop-blur-sm hover:shadow-[0_0_20px_rgba(0,255,255,0.1)] cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-[9px] tracking-[0.25em] uppercase text-pink-500/80 font-mono font-bold">
                    [{item.source}]
                  </span>
                  <span className="text-[10px] text-gray-600 font-mono">
                    {new Date(item.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                  </span>
                </div>
                <p className="text-sm md:text-base text-gray-200 group-hover:text-white transition leading-relaxed">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 border-t border-cyan-900/20 bg-black/40">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between text-[9px] tracking-[0.3em] uppercase text-gray-600">
          <span>NeuroFlux v1.0</span>
          <span>Protocol: Neural_Sync • 5h Cycle Active</span>
          <span className="text-cyan-500/50">Encrypted Stream</span>
        </div>
      </footer>
    </main>
  );
}
