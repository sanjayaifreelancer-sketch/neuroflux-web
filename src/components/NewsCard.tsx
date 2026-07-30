'use client';
import { motion } from 'framer-motion';

export default function NewsCard({ source, content, timestamp }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 bg-black/60 border-l-4 border-cyan-500 backdrop-blur-md shadow-[0_0_15px_rgba(0,255,255,0.2)]"
    >
      <div className="text-[10px] uppercase tracking-widest text-pink-500 mb-1 font-mono">[{new Date(timestamp).toLocaleTimeString()}] {source}</div>
      <p className="text-sm md:text-base text-white leading-tight font-medium">{content}</p>
    </motion.div>
  );
}