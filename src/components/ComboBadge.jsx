import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap, Sparkles } from 'lucide-react';

export default function ComboBadge({ combo = 1 }) {
  if (combo <= 1) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={combo}
        initial={{ scale: 0.7, opacity: 0, y: -5 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#ff5a36] via-rose-500 to-amber-500 text-white font-black text-xs shadow-lg shadow-[#ff5a36]/30 border border-white/20 select-none"
      >
        <Flame className="w-3.5 h-3.5 fill-white animate-bounce" />
        <span>x{combo} COMBO</span>
        <Sparkles className="w-3 h-3 text-amber-200" />
      </motion.div>
    </AnimatePresence>
  );
}
