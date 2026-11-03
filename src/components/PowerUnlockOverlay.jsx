import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Flame, Shield, Activity, Wind, X } from 'lucide-react';
import { POWERS } from '../config/powers';

export default function PowerUnlockOverlay({
  exerciseId = 'squat',
  isOpen = false,
  onClose = null,
}) {
  const power = POWERS[exerciseId] || POWERS.squat;
  const PowerIcon = power.icon || Zap;
  const timerRef = useRef(null);

  // Auto-dismiss after 2.5 seconds with single timeout cleared on unmount/exerciseId change/closure
  useEffect(() => {
    if (!isOpen) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setTimeout(() => {
      if (onClose) onClose();
      timerRef.current = null;
    }, 2500);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isOpen, exerciseId, onClose]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (onClose) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-x-0 top-20 z-50 flex items-start justify-center px-4 pointer-events-none"
          aria-live="polite"
        >
          {/* Compact Non-blocking Banner near the top of the camera card */}
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            onClick={(e) => {
              // Click anywhere on banner to close immediately
              e.stopPropagation();
              if (onClose) onClose();
            }}
            className="relative max-w-md w-full p-4 rounded-2xl bg-[#0e1222]/95 border border-[#ff5a36]/60 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl text-white pointer-events-auto cursor-pointer overflow-hidden group select-none"
          >
            {/* Subtle glow accent */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ff5a36]/25 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

            {/* Small Close Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onClose) onClose();
              }}
              className="absolute top-2.5 right-2.5 p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors z-10 focus:outline-none focus:ring-1 focus:ring-[#ff5a36]"
              aria-label="Close Power Unlocked Banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-3.5 pr-6">
              {/* Power Icon */}
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${power.color} flex items-center justify-center text-white shadow-lg shadow-[#ff5a36]/30 border border-white/20 shrink-0`}
              >
                <PowerIcon className="w-6 h-6" />
              </div>

              {/* Title & Tagline */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-[#ff5a36]/20 text-[#ff5a36] border border-[#ff5a36]/40">
                    <Sparkles className="w-3 h-3" />
                    POWER UNLOCKED!
                  </span>
                  <span className="text-[10px] text-amber-300 font-bold flex items-center gap-0.5">
                    <Zap className="w-3 h-3 fill-amber-400 text-amber-400" />
                    1.5x XP
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
                  {power.name}
                </h3>
                <p className="text-xs text-slate-300 truncate mt-0.5">
                  {power.tagline || 'Superpower ready for next workout!'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
