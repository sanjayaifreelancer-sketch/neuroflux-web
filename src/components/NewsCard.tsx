'use client';
import { motion } from 'framer-motion';

interface NewsProps {
  source: string;
  content: string;
  timestamp: string;
}

export default function NewsCard({ source, content, timestamp }: NewsProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 mb-4 bg-black/60 border-l-4 border-cyan-500 backdrop-blur-md"
    >
      <div className="text-[10px] uppercase text-pink-500 font-mono mb-1">[{timestamp}] {source}</div>
      <p className="text-white text-sm md:text-base">{content}</p>
    </motion.div>
  );
}