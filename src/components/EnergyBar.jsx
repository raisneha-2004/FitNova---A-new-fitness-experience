import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Sparkles } from 'lucide-react';

export default function EnergyBar({
  energyPercent = 0,
  combo = 1,
  compact = false,
  className = '',
}) {
  const safePercent = Math.min(100, Math.max(0, energyPercent));
  const isCharging = safePercent >= 50 && safePercent < 100;
  const isMax = safePercent >= 100;

  if (compact) {
    // Slim overlay version for CameraCard bottom
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center justify-between text-[11px] mb-1 px-1">
          <div className="flex items-center gap-1 font-bold text-amber-400">
            <Zap className="w-3 h-3 fill-amber-400" />
            <span>AI Energy</span>
          </div>
          <span className="text-[10px] text-white/70 font-mono">{safePercent}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-black/60 border border-white/10 overflow-hidden">
          <motion.div
            className={`h-full rounded-full transition-all duration-300 ${
              isMax
                ? 'bg-gradient-to-r from-amber-300 via-white to-amber-200 shadow-[0_0_12px_#ffffff]'
                : isCharging
                ? 'bg-gradient-to-r from-[#ff5a36] via-amber-400 to-yellow-300 shadow-[0_0_8px_rgba(255,90,54,0.6)]'
                : 'bg-gradient-to-r from-[#ff5a36] to-amber-500'
            }`}
            style={{ width: `${safePercent}%` }}
          />
        </div>
      </div>
    );
  }

  // Full version for GamePanel
  return (
    <div className={`p-4 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md ${className}`}>
      <div className="flex items-center justify-between text-xs mb-2">
        <div className="flex items-center gap-1.5 font-bold text-white">
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400/30" />
          <span>AI Power Energy</span>
          {combo > 1 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-[#ff5a36] to-red-500 text-white animate-pulse">
              x{combo} COMBO
            </span>
          )}
        </div>

        <span className="text-xs font-mono font-bold text-amber-400">
          {safePercent}%
        </span>
      </div>

      <div className="relative h-3 rounded-full bg-white/5 border border-white/10 overflow-hidden p-0.5">
        <motion.div
          className={`h-full rounded-full transition-all duration-300 ${
            isMax
              ? 'bg-gradient-to-r from-amber-300 via-white to-amber-100 shadow-[0_0_15px_rgba(255,255,255,0.9)] animate-pulse'
              : isCharging
              ? 'bg-gradient-to-r from-[#ff5a36] via-amber-400 to-yellow-300 shadow-[0_0_10px_rgba(255,90,54,0.7)]'
              : 'bg-gradient-to-r from-[#ff5a36] to-amber-500 shadow-[0_0_6px_rgba(255,90,54,0.4)]'
          }`}
          style={{ width: `${safePercent}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-[10px] text-white/50 mt-1.5">
        <span>
          {isMax ? '⚡ POWER READY TO BURST!' : isCharging ? '🔥 Charging Surge...' : 'Hit good reps to charge'}
        </span>
        <span>Target: 100%</span>
      </div>
    </div>
  );
}
