'use client';
import { useEffect, useState } from 'react';
import NeuralCanvas from '../../components/NeuralCanvas';

const TOPICS = [
  {
    id: 'neural-networks',
    title: 'Neural Networks',
    icon: '🧠',
    desc: 'The foundation of modern AI. How neurons learn patterns from data.',
    gradient: 'from-purple-500 to-cyan-400',
  },
  {
    id: 'transformers',
    title: 'Transformers & LLMs',
    icon: '⚡',
    desc: 'The architecture behind GPT, Claude, and all modern language models.',
    gradient: 'from-pink-500 to-orange-400',
  },
  {
    id: 'computer-vision',
    title: 'Computer Vision',
    icon: '👁️',
    desc: 'How machines see and interpret the visual world.',
    gradient: 'from-green-500 to-teal-400',
  },
  {
    id: 'reinforcement-learning',
    title: 'Reinforcement Learning',
    icon: '🎮',
    desc: 'Training agents through reward and punishment.',
    gradient: 'from-yellow-500 to-red-400',
  },
  {
    id: 'rag-systems',
    title: 'RAG & Knowledge',
    icon: '📚',
    desc: 'Retrieval-Augmented Generation — giving LLMs external knowledge.',
    gradient: 'from-blue-500 to-indigo-400',
  },
  {
    id: 'edge-ai',
    title: 'Edge AI',
    icon: '📡',
    desc: 'Running neural networks on devices, not the cloud.',
    gradient: 'from-cyan-500 to-blue-400',
  },
];

export default function LearnPage() {
  const [statusTime, setStatusTime] = useState('');

  useEffect(() => {
    const tick = () => setStatusTime(new Date().toLocaleTimeString([], { hour12: false }));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <>
      <div className="scanlines" />
      <NeuralCanvas />
      <div className="ui-layer min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="w-full p-6 border-b border-cyan-500/30 backdrop-blur-md bg-black/40 flex flex-wrap justify-between items-center gap-2">
          <a href="/" className="text-2xl font-bold text-cyan-400 orbitron tracking-wider hover:text-cyan-300 transition">
            NEURO<span className="text-pink-500">FLUX</span>
          </a>
          <div className="flex gap-6 uppercase text-sm tracking-tighter">
            <a href="/" className="hover:text-cyan-400 transition text-gray-400">Live_Pulse</a>
            <a href="/learn" className="text-pink-400 border-b border-pink-400 pb-0.5">The_Lab</a>
          </div>
          <div className="text-xs text-cyan-600 animate-pulse">{statusTime} UTC</div>
        </nav>

        {/* Header */}
        <section className="pt-16 pb-8 px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-block px-4 py-1.5 mb-4 border border-pink-500/30 rounded-full text-[10px] tracking-[0.3em] uppercase text-pink-400 bg-black/40">
              Neural Intelligence Lab
            </div>
            <h1 className="text-4xl md:text-6xl font-black orbitron tracking-tighter mb-4">
              <span className="bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
                The Lab
              </span>
            </h1>
            <p className="text-gray-400 text-sm max-w-lg mx-auto font-mono">
              Deep dives into the technologies shaping artificial intelligence.
              Updated with every pulse cycle.
            </p>
          </div>
        </section>

        {/* Topic Grid */}
        <section className="flex-grow px-6 pb-16">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOPICS.map((topic) => (
              <a
                key={topic.id}
                href={`/learn/${topic.id}`}
                className="group p-6 bg-black/60 border border-gray-800 hover:border-cyan-500/50 rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.08)] backdrop-blur-sm"
              >
                <div className="text-3xl mb-3">{topic.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2 orbitron tracking-wider">{topic.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{topic.desc}</p>
                <div className={`mt-4 h-1 w-12 rounded-full bg-gradient-to-r ${topic.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
              </a>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="pb-6 text-center opacity-30 text-[10px] uppercase tracking-widest">
          NeuroFlux v1.0 | Neural Sync Active
        </div>
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
