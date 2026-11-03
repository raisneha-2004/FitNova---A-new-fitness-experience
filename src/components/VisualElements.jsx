import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * 1. MiniSkeleton
 * Small dotted skeleton graphic on the right side of Card 1 (Live Skeleton Tracking)
 * Gently pulses with orange dots and connecting lines + scattered particles near the bottom.
 */
export function MiniSkeleton() {
  const shouldReduceMotion = useReducedMotion();

  // 15 simplified keypoints
  const points = [
    { id: 'head', cx: 35, cy: 12, r: 2.5 },
    { id: 'neck', cx: 35, cy: 22, r: 2 },
    { id: 'ls', cx: 20, cy: 26, r: 2 },
    { id: 'rs', cx: 50, cy: 26, r: 2 },
    { id: 'le', cx: 12, cy: 40, r: 1.8 },
    { id: 're', cx: 58, cy: 40, r: 1.8 },
    { id: 'lw', cx: 8, cy: 54, r: 2 },
    { id: 'rw', cx: 62, cy: 54, r: 2 },
    { id: 'lh', cx: 25, cy: 56, r: 2 },
    { id: 'rh', cx: 45, cy: 56, r: 2 },
    { id: 'lk', cx: 22, cy: 76, r: 2 },
    { id: 'rk', cx: 48, cy: 76, r: 2 },
    { id: 'la', cx: 20, cy: 96, r: 2 },
    { id: 'ra', cx: 50, cy: 96, r: 2 },
  ];

  const lines = [
    [35, 14, 35, 22],
    [20, 26, 50, 26],
    [20, 26, 12, 40],
    [12, 40, 8, 54],
    [50, 26, 58, 40],
    [58, 40, 62, 54],
    [35, 22, 35, 56],
    [25, 56, 45, 56],
    [25, 56, 22, 76],
    [22, 76, 20, 96],
    [45, 56, 48, 76],
    [48, 76, 50, 96],
  ];

  return (
    <div className="relative w-20 h-28 flex items-center justify-center shrink-0">
      {/* Soft orange ambient backing */}
      <div className="absolute inset-0 bg-coral/15 rounded-full blur-md" />

      <motion.svg
        viewBox="0 0 70 105"
        className="w-full h-full relative z-10 overflow-visible"
        animate={
          shouldReduceMotion
            ? { opacity: 0.9 }
            : {
              opacity: [0.75, 1, 0.75],
              scale: [0.98, 1.02, 0.98],
            }
        }
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Bones */}
        {lines.map(([x1, y1, x2, y2], i) => (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#ff5a36"
            strokeWidth="1.2"
            strokeOpacity="0.45"
            strokeDasharray="2 2"
          />
        ))}

        {/* Landmarks */}
        {points.map((p) => (
          <circle
            key={p.id}
            cx={p.cx}
            cy={p.cy}
            r={p.r}
            fill="#ff5a36"
            className="filter drop-shadow-[0_0_3px_#ff5a36]"
          />
        ))}

        {/* Scattered tiny particles near the bottom */}
        <circle cx="15" cy="102" r="1" fill="#ff5a36" opacity="0.4" />
        <circle cx="32" cy="104" r="1.3" fill="#ff5a36" opacity="0.7" />
        <circle cx="56" cy="101" r="0.9" fill="#ff5a36" opacity="0.5" />
      </motion.svg>
    </div>
  );
}

/**
 * 2. ContourPattern
 * Decorative orange topographic contour line pattern on the right side of Card 2
 */
export function ContourPattern() {
  return (
    <div className="relative w-24 h-24 shrink-0 overflow-hidden opacity-60 pointer-events-none select-none">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full stroke-coral"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 20 Q 35 5, 60 25 T 100 20"
          strokeWidth="1"
          strokeOpacity="0.25"
        />
        <path
          d="M5 38 Q 40 18, 65 42 T 105 32"
          strokeWidth="1"
          strokeOpacity="0.45"
        />
        <path
          d="M0 56 Q 30 35, 70 60 T 110 50"
          strokeWidth="1.2"
          strokeOpacity="0.7"
        />
        <path
          d="M5 74 Q 45 52, 75 78 T 105 68"
          strokeWidth="1"
          strokeOpacity="0.45"
        />
        <path
          d="M10 92 Q 35 70, 70 95 T 100 85"
          strokeWidth="1"
          strokeOpacity="0.25"
        />
      </svg>
    </div>
  );
}

/**
 * 3. WaveChart
 * Smooth animated wave line chart (orange line, soft gradient fill)
 * with a glowing orange dot travelling along the line for Card 3
 */
export function WaveChart() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative w-full h-16 mt-2 overflow-hidden rounded-xl bg-white/2 border border-white/5 p-1 flex items-center justify-center">
      <svg
        viewBox="0 0 240 60"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="wave-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff5a36" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ff5a36" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Gradient under wave */}
        <path
          d="M0 45 C 40 20, 80 50, 120 28 C 160 10, 200 40, 240 22 L 240 60 L 0 60 Z"
          fill="url(#wave-fill)"
        />

        {/* The Wave Stroke */}
        <path
          id="wavePath"
          d="M0 45 C 40 20, 80 50, 120 28 C 160 10, 200 40, 240 22"
          stroke="#ff5a36"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Glowing dot moving along wave path */}
        {!shouldReduceMotion ? (
          <circle r="4" fill="#ff5a36" className="filter drop-shadow-[0_0_6px_#ff5a36]">
            <animateMotion
              path="M0 45 C 40 20, 80 50, 120 28 C 160 10, 200 40, 240 22"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
        ) : (
          <circle cx="120" cy="28" r="4" fill="#ff5a36" />
        )}
      </svg>
    </div>
  );
}

/**
 * 4. MedalRow
 * 3 small medal badges (Gold, Silver, Bronze) that shine one after another in a loop for Card 4
 */
export function MedalRow() {
  const shouldReduceMotion = useReducedMotion();

  const medals = [
    {
      label: 'Gold',
      bg: 'from-amber-400 to-yellow-600',
      border: 'border-yellow-400/40',
      glow: 'rgba(251, 191, 36, 0.4)',
      text: 'G',
      delay: 0,
    },
    {
      label: 'Silver',
      bg: 'from-slate-200 to-slate-400',
      border: 'border-slate-300/40',
      glow: 'rgba(203, 213, 225, 0.4)',
      text: 'S',
      delay: 0.8,
    },
    {
      label: 'Bronze',
      bg: 'from-amber-700 to-yellow-900',
      border: 'border-amber-600/40',
      glow: 'rgba(217, 119, 6, 0.4)',
      text: 'B',
      delay: 1.6,
    },
  ];

  return (
    <div className="flex items-center gap-2 mt-2">
      {medals.map((medal, idx) => (
        <motion.div
          key={idx}
          className={`w-7 h-7 rounded-full bg-linear-to-br ${medal.bg} ${medal.border} border flex items-center justify-center font-black text-[10px] text-navy-950 shadow-md relative overflow-hidden`}
          animate={
            shouldReduceMotion
              ? {}
              : {
                scale: [1, 1.15, 1],
                boxShadow: [
                  '0 0 0px transparent',
                  `0 0 10px ${medal.glow}`,
                  '0 0 0px transparent',
                ],
              }
          }
          transition={
            shouldReduceMotion
              ? {}
              : {
                duration: 2.4,
                repeat: Infinity,
                delay: medal.delay,
                ease: 'easeInOut',
              }
          }
          title={`${medal.label} Medal`}
        >
          {/* Shimmer light bar across medal */}
          {!shouldReduceMotion && (
            <motion.div
              className="absolute inset-0 w-full h-full bg-white/40 transform -skew-x-12"
              animate={{
                x: ['-120%', '150%'],
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                delay: medal.delay,
                ease: 'easeInOut',
              }}
            />
          )}
          <span className="relative z-10">{medal.text}</span>
        </motion.div>
      ))}
    </div>
  );
}
