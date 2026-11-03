import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Flame, Trophy, Star } from 'lucide-react';

export default function HeroMockCard() {
  const [reps, setReps] = useState(0);

  // Animated count-up for reps
  useEffect(() => {
    let start = 0;
    const end = 11;
    const duration = 1200; // ms
    const increment = duration / end;

    const timer = setInterval(() => {
      start += 1;
      setReps(start);
      if (start >= end) clearInterval(timer);
    }, increment);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Soft orange glow behind hero mock card */}
      <div
        className="absolute -inset-4 rounded-3xl bg-[#ff5a36]/20 blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* Floating +5 XP Badge (top-right corner) */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-3 -right-3 z-30 px-3 py-1 rounded-full bg-[#ff5a36] text-white text-xs font-extrabold shadow-lg shadow-[#ff5a36]/40 flex items-center gap-1 border border-white/20"
      >
        <span>+5 XP</span>
      </motion.div>

      {/* Floating Achievement Chip (outer bottom-left corner on desktop, below card on mobile) */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        className="mt-3 lg:mt-0 lg:absolute -bottom-6 -left-8 z-30 px-3.5 py-2 rounded-xl bg-[#111424]/95 border border-[#ff5a36]/40 backdrop-blur-md shadow-xl flex items-center gap-2.5 w-fit"
      >
        <div className="w-8 h-8 rounded-lg bg-[#ff5a36]/15 border border-[#ff5a36]/30 flex items-center justify-center text-[#ff5a36] shrink-0">
          <Trophy className="w-4 h-4" />
        </div>
        <div>
          <span className="block text-[9px] font-bold uppercase tracking-wider text-[#ff5a36]">
            ACHIEVEMENT
          </span>
          <span className="block text-xs font-bold text-white whitespace-nowrap">Iron Will</span>
        </div>
      </motion.div>

      {/* Main Mock Card */}
      <div className="fq-hero-card overflow-hidden">
        {/* Window-style Top Bar */}
        <div className="px-4 py-3 border-b border-white/10 bg-white/[0.03] flex items-center justify-between">
          <div className="flex items-center gap-2" aria-hidden="true">
            <span className="w-3 h-3 rounded-full bg-[#ff5a36]/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block" />
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-slate-300">
            <Activity className="w-3.5 h-3.5 text-[#ff5a36] animate-pulse" />
            <span>FITNOVA · LIVE</span>
          </div>
        </div>

        {/* Live Simulation Arena Area */}
        <div className="relative h-64 sm:h-72 bg-gradient-to-b from-[#111424] to-[#0c142b] p-4 flex flex-col justify-between overflow-hidden">
          {/* Top row chips */}
          <div className="flex items-start justify-between z-10">
            {/* Top-left chip: Big number + REPS + SQUATS */}
            <div className="px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 backdrop-blur-md shadow-md">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                SQUATS
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  {reps}
                </span>
                <span className="text-xs font-semibold text-[#ff5a36]">REPS</span>
              </div>
            </div>

            {/* Top-right chip: Angle badge */}
            <div className="px-3 py-1.5 rounded-full bg-[#ff5a36]/15 border border-[#ff5a36]/30 text-[#ff5a36] text-xs font-bold backdrop-blur-md flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ff5a36] animate-ping" />
              <span>105°</span>
            </div>
          </div>

          {/* SVG Stick-Figure Skeleton + Smooth Wave Chart */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Background Looping Wave / Area Chart */}
            <svg
              className="absolute inset-0 w-full h-full opacity-60"
              preserveAspectRatio="none"
              viewBox="0 0 500 200"
            >
              <defs>
                <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff5a36" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {/* Wave area fill */}
              <motion.path
                d="M0,130 C120,60 180,180 300,100 C390,40 440,140 500,90 L500,200 L0,200 Z"
                fill="url(#waveGrad)"
                animate={{
                  d: [
                    'M0,130 C120,60 180,180 300,100 C390,40 440,140 500,90 L500,200 L0,200 Z',
                    'M0,110 C130,160 210,50 320,120 C400,170 450,70 500,110 L500,200 L0,200 Z',
                    'M0,130 C120,60 180,180 300,100 C390,40 440,140 500,90 L500,200 L0,200 Z',
                  ],
                }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Wave line stroke */}
              <motion.path
                d="M0,130 C120,60 180,180 300,100 C390,40 440,140 500,90"
                fill="none"
                stroke="#ff5a36"
                strokeWidth="2.5"
                animate={{
                  d: [
                    'M0,130 C120,60 180,180 300,100 C390,40 440,140 500,90',
                    'M0,110 C130,160 210,50 320,120 C400,170 450,70 500,110',
                    'M0,130 C120,60 180,180 300,100 C390,40 440,140 500,90',
                  ],
                }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              />
            </svg>

            {/* SVG Stick-Figure Squatting Pose (Orange Joints, Blue Bones) */}
            <svg
              className="w-44 h-48 relative z-10 drop-shadow-[0_0_12px_rgba(255,90,54,0.3)]"
              viewBox="0 0 160 180"
              fill="none"
            >
              {/* Bones (Cool Blue #3b82f6) */}
              {/* Spine */}
              <line x1="80" y1="42" x2="80" y2="92" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" />
              {/* Shoulders */}
              <line x1="56" y1="52" x2="104" y2="52" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" />
              {/* Left Arm */}
              <line x1="56" y1="52" x2="42" y2="72" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
              <line x1="42" y1="72" x2="38" y2="92" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
              {/* Right Arm */}
              <line x1="104" y1="52" x2="118" y2="72" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
              <line x1="118" y1="72" x2="122" y2="92" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
              {/* Hips */}
              <line x1="62" y1="92" x2="98" y2="92" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" />
              {/* Left Leg (Squat depth) */}
              <line x1="62" y1="92" x2="44" y2="122" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="44" y1="122" x2="52" y2="158" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="52" y1="158" x2="40" y2="160" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
              {/* Right Leg */}
              <line x1="98" y1="92" x2="116" y2="122" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="116" y1="122" x2="108" y2="158" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="108" y1="158" x2="120" y2="160" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />

              {/* Head */}
              <circle cx="80" cy="26" r="12" stroke="#3b82f6" strokeWidth="3" fill="#111424" />

              {/* Joint Dots (Coral Orange #ff5a36) */}
              <circle cx="80" cy="42" r="4.5" fill="#ff5a36" />
              <circle cx="56" cy="52" r="4" fill="#ff5a36" />
              <circle cx="104" cy="52" r="4" fill="#ff5a36" />
              <circle cx="42" cy="72" r="3.5" fill="#ff5a36" />
              <circle cx="118" cy="72" r="3.5" fill="#ff5a36" />
              <circle cx="62" cy="92" r="4.5" fill="#ff5a36" />
              <circle cx="98" cy="92" r="4.5" fill="#ff5a36" />
              <circle cx="44" cy="122" r="5" fill="#ff5a36" />
              <circle cx="116" cy="122" r="5" fill="#ff5a36" />
              <circle cx="52" cy="158" r="4" fill="#ff5a36" />
              <circle cx="108" cy="158" r="4" fill="#ff5a36" />
            </svg>
          </div>

          {/* Bottom-center small pill: "Good depth" */}
          <div className="z-10 flex justify-center pb-1">
            <span className="px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold backdrop-blur-md shadow-md">
              ✓ Good depth
            </span>
          </div>
        </div>

        {/* Below the area: 3 stat tiles in a row (STREAK, XP, LEVEL) with generous padding */}
        <div className="grid grid-cols-3 divide-x divide-white/10 bg-[#0d101d] border-t border-white/10 py-4 pb-5 px-3">
          {/* Streak */}
          <div className="flex flex-col items-center justify-center text-center px-2">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
              <Flame className="w-3.5 h-3.5 text-[#ff5a36]" />
              <span>STREAK</span>
            </div>
            <span className="text-lg font-extrabold text-white">12 d</span>
          </div>

          {/* XP */}
          <div className="flex flex-col items-center justify-center text-center px-2">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
              <span className="text-[#ff5a36] font-bold">⚡</span>
              <span>XP</span>
            </div>
            <span className="text-lg font-extrabold text-[#ff5a36]">1,295</span>
          </div>

          {/* Level */}
          <div className="flex flex-col items-center justify-center text-center px-2">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
              <span>LEVEL</span>
            </div>
            <span className="text-lg font-extrabold text-white"># 7</span>
          </div>
        </div>
      </div>
    </div>
  );
}
