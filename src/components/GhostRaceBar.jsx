import React from 'react';
import { motion } from 'framer-motion';
import { Ghost, User, Zap } from 'lucide-react';

export default function GhostRaceBar({
  currentReps = 0,
  ghostReps = 0,
  targetReps = 10,
  ghostPulsing = false,
  className = '',
}) {
  const safeTarget = Math.max(1, targetReps, currentReps, ghostReps);
  const youPercent = Math.min(100, Math.round((currentReps / safeTarget) * 100));
  const ghostPercent = Math.min(100, Math.round((ghostReps / safeTarget) * 100));

  let guidanceText = 'Neck and neck';
  let guidanceColor = 'text-white/70';

  if (currentReps > ghostReps) {
    guidanceText = 'You are ahead!';
    guidanceColor = 'text-emerald-400 font-bold';
  } else if (ghostReps > currentReps) {
    guidanceText = 'Ghost is ahead, pick up the pace!';
    guidanceColor = 'text-amber-400 font-semibold';
  }

  return (
    <div className={`p-3 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md ${className}`}>
      {/* Header labels */}
      <div className="flex items-center justify-between text-xs mb-2">
        <div className="flex items-center gap-1.5 font-bold text-[#ff5a36]">
          <User className="w-3.5 h-3.5" />
          <span>You: {currentReps}</span>
        </div>

        <div className="text-[11px] font-medium tracking-wide">
          <span className={guidanceColor}>{guidanceText}</span>
        </div>

        <div className="flex items-center gap-1.5 font-bold text-cyan-300">
          <Ghost className={`w-3.5 h-3.5 transition-transform ${ghostPulsing ? 'scale-125' : ''}`} />
          <span>Ghost: {ghostReps}</span>
        </div>
      </div>

      {/* Dual Race Tracks */}
      <div className="space-y-1.5">
        {/* Your Track */}
        <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#ff5a36] to-amber-400 shadow-[0_0_8px_rgba(255,90,54,0.6)]"
            initial={{ width: 0 }}
            animate={{ width: `${youPercent}%` }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          />
        </div>

        {/* Ghost Track */}
        <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r from-cyan-500/80 to-blue-400/90 shadow-[0_0_8px_rgba(56,189,248,0.5)] ${
              ghostPulsing ? 'brightness-150' : ''
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${ghostPercent}%` }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
}
