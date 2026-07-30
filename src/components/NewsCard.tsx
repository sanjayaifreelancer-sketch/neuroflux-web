'use client';
import { motion } from 'framer-motion';

export default function NewsCard({ source, content, timestamp }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 bg-black/60 border-l-4 border-cyan-500 backdrop-blur-md"
    >
      <div className="text-[10px] uppercase text-pink-500 font-mono mb-1">[{timestamp}] {source}</div>
      <p className="text-white">{content}</p>
    </motion.div>
  );
}