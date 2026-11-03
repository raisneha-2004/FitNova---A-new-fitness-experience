import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * GYM BACKGROUND CONFIGURATION
 * Edit silhouette and floating icon properties easily from this single config array.
 */

// 1. Edge Equipment Silhouettes (stroke orange #ff5a36, 1.5px, opacity 5-8%, drifting 10-20px over 6-10s)
const EDGE_SILHOUETTES = [
  // Left Edge
  {
    id: 'dumbell-left-top',
    type: 'dumbbell',
    style: { top: '15%', left: '2.5%' },
    width: 64,
    height: 64,
    driftY: 15,
    duration: 7.5,
    delay: 0,
    rotate: 5,
  },
  {
    id: 'kettlebell-left-mid',
    type: 'kettlebell',
    style: { top: '48%', left: '1.5%' },
    width: 68,
    height: 68,
    driftY: -18,
    duration: 8.5,
    delay: 1.2,
    rotate: -6,
  },
  {
    id: 'plate-left-bot',
    type: 'plate',
    style: { top: '80%', left: '3%' },
    width: 72,
    height: 72,
    driftY: 14,
    duration: 9.5,
    delay: 2.4,
    rotate: 4,
  },
  // Right Edge
  {
    id: 'barbell-right-top',
    type: 'barbell',
    style: { top: '12%', right: '2.5%' },
    width: 90,
    height: 48,
    driftY: -16,
    duration: 8,
    delay: 0.5,
    rotate: -5,
  },
  {
    id: 'jumprope-right-mid',
    type: 'jumprope',
    style: { top: '42%', right: '2%' },
    width: 64,
    height: 76,
    driftY: 20,
    duration: 9,
    delay: 1.8,
    rotate: 6,
  },
  {
    id: 'dumbbell-right-bot',
    type: 'dumbbell',
    style: { top: '75%', right: '3%' },
    width: 64,
    height: 64,
    driftY: -15,
    duration: 7,
    delay: 2.8,
    rotate: -4,
  },
];

// 2. Floating Mini Icons (8 items, float upward, opacity 8-12%, loop 14-22s staggered)
const FLOATING_MINI_ICONS = [
  { id: 'f-1', type: 'dumbbell', left: '8%', duration: 18, delay: 0 },
  { id: 'f-2', type: 'plate', left: '18%', duration: 21, delay: 3 },
  { id: 'f-3', type: 'kettlebell', left: '26%', duration: 16, delay: 7 },
  { id: 'f-4', type: 'dumbbell', left: '34%', duration: 22, delay: 11 },
  { id: 'f-5', type: 'plate', left: '68%', duration: 19, delay: 2 },
  { id: 'f-6', type: 'kettlebell', left: '76%', duration: 15, delay: 6 },
  { id: 'f-7', type: 'dumbbell', left: '85%', duration: 20, delay: 9 },
  { id: 'f-8', type: 'plate', left: '92%', duration: 17, delay: 4 },
];

/**
 * Equipment SVG Path Renderers
 */
function renderEquipmentSvg(type) {
  switch (type) {
    case 'dumbbell':
      return (
        <svg viewBox="0 0 48 48" fill="none" stroke="#ff5a36" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          {/* Central handle */}
          <line x1="16" y1="24" x2="32" y2="24" />
          {/* Inner collar bars */}
          <line x1="16" y1="18" x2="16" y2="30" />
          <line x1="32" y1="18" x2="32" y2="30" />
          {/* Left inner & outer plates */}
          <rect x="10" y="14" width="4" height="20" rx="1.5" />
          <rect x="5" y="17" width="3" height="14" rx="1" />
          {/* Right inner & outer plates */}
          <rect x="34" y="14" width="4" height="20" rx="1.5" />
          <rect x="40" y="17" width="3" height="14" rx="1" />
        </svg>
      );
    case 'kettlebell':
      return (
        <svg viewBox="0 0 48 48" fill="none" stroke="#ff5a36" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          {/* Handle loop */}
          <path d="M17 17 V 10 C 17 7, 31 7, 31 10 V 17" />
          {/* Kettlebell main bell */}
          <circle cx="24" cy="28" r="14" />
          {/* Inner weight marker */}
          <circle cx="24" cy="28" r="6" strokeDasharray="3 3" />
        </svg>
      );
    case 'barbell':
      return (
        <svg viewBox="0 0 64 36" fill="none" stroke="#ff5a36" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          {/* Long shaft */}
          <line x1="2" y1="18" x2="62" y2="18" />
          {/* Left weights */}
          <rect x="10" y="6" width="3.5" height="24" rx="1" />
          <rect x="15" y="9" width="3" height="18" rx="1" />
          <line x1="19.5" y1="14" x2="19.5" y2="22" />
          {/* Right weights */}
          <line x1="44.5" y1="14" x2="44.5" y2="22" />
          <rect x="46" y="9" width="3" height="18" rx="1" />
          <rect x="50.5" y="6" width="3.5" height="24" rx="1" />
        </svg>
      );
    case 'plate':
      return (
        <svg viewBox="0 0 48 48" fill="none" stroke="#ff5a36" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          {/* Outer circumference */}
          <circle cx="24" cy="24" r="20" />
          {/* Inner ring */}
          <circle cx="24" cy="24" r="14" strokeDasharray="2 3" />
          {/* Center hole */}
          <circle cx="24" cy="24" r="5" />
          {/* Grip cutouts */}
          <path d="M24 6 V 9 M24 39 V 42 M6 24 H 9 M39 24 H 42" />
        </svg>
      );
    case 'jumprope':
      return (
        <svg viewBox="0 0 48 54" fill="none" stroke="#ff5a36" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          {/* Left Handle */}
          <rect x="8" y="6" width="4" height="14" rx="1.5" />
          {/* Right Handle */}
          <rect x="36" y="6" width="4" height="14" rx="1.5" />
          {/* Hanging rope curve */}
          <path d="M10 20 C 10 46, 38 46, 38 20" />
        </svg>
      );
    default:
      return null;
  }
}

/**
 * GymBackground Component
 * Animated gym-themed background with:
 * 1. Edge equipment silhouettes (drifting & rotating)
 * 2. Floating mini icons (staggered upward loop)
 * 3. Squatting stick-figure on right side (animated joints, hidden < 1024px)
 * 4. Pulse ECG line with dashoffset animation
 * 5. Subtle mouse parallax
 *
 * Safety & Performance:
 * - Reduced motion friendly
 * - Live arena safe (/live-arena reduces opacity and hides squat figure & parallax)
 * - Auto-pauses on document visibility change (hidden tab)
 */
export default function GymBackground() {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const isLiveArena = location.pathname === '/live-arena';

  // Mouse Parallax State (shifts max 10px opposite to mouse)
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [isTouchDevice] = useState(() => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  });

  // Listen for mousemove + tab visibility
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMouseMove = (e) => {
      if (shouldReduceMotion || isLiveArena) return;
      const xNorm = (e.clientX / window.innerWidth - 0.5) * -20; // -10px to +10px
      const yNorm = (e.clientY / window.innerHeight - 0.5) * -20;
      setMouseOffset({ x: xNorm, y: yNorm });
    };

    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === 'visible');
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [shouldReduceMotion, isLiveArena]);

  // Overall opacity factor (/live-arena cuts opacity in half)
  const baseOpacityMultiplier = isLiveArena ? 0.5 : 1;

  // Squat loop animation parameters (4s: stand -> down -> hold -> up)
  // Stand: Hip (40, 200), Knee (45, 270), Ankle (50, 340)
  // Squat Down: Hip moves down & back, Knee bends forward
  const squatTorso = {
    d: [
      'M 65 100 L 50 190', // standing
      'M 75 140 L 40 230', // squatting down (torso angled forward)
      'M 75 140 L 40 230', // bottom hold
      'M 65 100 L 50 190', // standing up
    ],
  };

  const squatHead = {
    cx: [68, 80, 80, 68],
    cy: [80, 120, 120, 80],
  };

  const squatLegs = {
    // Hip -> Knee -> Ankle -> Foot
    d: [
      'M 50 190 L 55 265 L 52 345 L 80 345', // Standing
      'M 40 230 L 95 240 L 60 345 L 90 345', // Squat bottom (hips break parallel)
      'M 40 230 L 95 240 L 60 345 L 90 345', // Hold
      'M 50 190 L 55 265 L 52 345 L 80 345', // Stand
    ],
  };

  const squatArms = {
    // Shoulder -> Elbow -> Hands (reaching forward for balance)
    d: [
      'M 63 115 L 75 160 L 85 195', // standing: arms down
      'M 70 150 L 110 145 L 145 140', // squatting: arms out forward
      'M 70 150 L 110 145 L 145 140', // hold
      'M 63 115 L 75 160 L 85 195', // stand
    ],
  };

  const parallaxStyle =
    !shouldReduceMotion && !isTouchDevice && !isLiveArena
      ? {
          x: mouseOffset.x,
          y: mouseOffset.y,
          transition: { type: 'spring', damping: 25, stiffness: 60 },
        }
      : {};

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden select-none"
    >
      {/* Parallax Container */}
      <motion.div
        animate={parallaxStyle}
        className="w-full h-full relative"
        style={{ willChange: 'transform' }}
      >
        {/* ============================================================ */}
        {/* LAYER 1: Edge Equipment Silhouettes (opacity 5-8%)           */}
        {/* ============================================================ */}
        {EDGE_SILHOUETTES.map((item) => (
          <motion.div
            key={item.id}
            style={{
              position: 'absolute',
              ...item.style,
              width: item.width,
              height: item.height,
              opacity: 0.07 * baseOpacityMultiplier,
              willChange: 'transform',
            }}
            animate={
              shouldReduceMotion || !isTabVisible
                ? {}
                : {
                    y: [0, item.driftY, 0],
                    rotate: [0, item.rotate, 0],
                  }
            }
            transition={{
              duration: item.duration,
              delay: item.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {renderEquipmentSvg(item.type)}
          </motion.div>
        ))}

        {/* ============================================================ */}
        {/* LAYER 2: Floating Mini Icons (8 items, bottom-to-top loop)   */}
        {/* ============================================================ */}
        {FLOATING_MINI_ICONS.map((icon) => (
          <motion.div
            key={icon.id}
            style={{
              position: 'absolute',
              left: icon.left,
              bottom: '-80px',
              width: 32,
              height: 32,
              willChange: 'transform, opacity',
            }}
            animate={
              shouldReduceMotion || !isTabVisible
                ? { opacity: 0.08 * baseOpacityMultiplier, y: -400 }
                : {
                    y: ['0vh', '-110vh'],
                    opacity: [
                      0,
                      0.1 * baseOpacityMultiplier,
                      0.1 * baseOpacityMultiplier,
                      0,
                    ],
                  }
            }
            transition={{
              duration: icon.duration,
              delay: icon.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {renderEquipmentSvg(icon.type)}
          </motion.div>
        ))}

        {/* ============================================================ */}
        {/* LAYER 3: Squat Stick-Figure (Right Side, ~55vh, hidden < 1024px & live arena) */}
        {/* ============================================================ */}
        {!isLiveArena && (
          <div
            className="hidden lg:block absolute right-4 xl:right-12 bottom-12 h-[55vh] aspect-[1/2] pointer-events-none"
            style={{
              opacity: 0.08 * baseOpacityMultiplier,
              willChange: 'transform',
            }}
          >
            <svg
              viewBox="0 0 200 400"
              fill="none"
              stroke="#ff5a36"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-full h-full"
            >
              {/* Floor balance marker */}
              <line x1="30" y1="346" x2="160" y2="346" strokeWidth="1.5" strokeDasharray="4 4" />

              {/* Head */}
              <motion.circle
                cx={68}
                cy={80}
                r={16}
                fill="#ff5a36"
                fillOpacity="0.25"
                animate={
                  shouldReduceMotion || !isTabVisible
                    ? {}
                    : squatHead
                }
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  times: [0, 0.45, 0.65, 1],
                }}
              />

              {/* Torso */}
              <motion.path
                d="M 65 100 L 50 190"
                animate={
                  shouldReduceMotion || !isTabVisible
                    ? {}
                    : squatTorso
                }
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  times: [0, 0.45, 0.65, 1],
                }}
              />

              {/* Arms */}
              <motion.path
                d="M 63 115 L 75 160 L 85 195"
                animate={
                  shouldReduceMotion || !isTabVisible
                    ? {}
                    : squatArms
                }
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  times: [0, 0.45, 0.65, 1],
                }}
              />

              {/* Legs (Hips -> Knees -> Ankles -> Foot) */}
              <motion.path
                d="M 50 190 L 55 265 L 52 345 L 80 345"
                animate={
                  shouldReduceMotion || !isTabVisible
                    ? {}
                    : squatLegs
                }
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  times: [0, 0.45, 0.65, 1],
                }}
              />
            </svg>
          </div>
        )}

        {/* ============================================================ */}
        {/* LAYER 4: Pulse ECG Line (near bottom, stroke-dashoffset loop)*/}
        {/* ============================================================ */}
        <div
          className="absolute bottom-4 inset-x-0 h-10 w-full overflow-hidden"
          style={{ opacity: 0.15 * baseOpacityMultiplier }}
        >
          <svg
            viewBox="0 0 1200 40"
            preserveAspectRatio="none"
            className="w-full h-full stroke-[#ff5a36] fill-none"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <motion.path
              d="M 0 20 L 180 20 L 200 5 L 215 35 L 230 10 L 245 28 L 260 20 L 480 20 L 500 5 L 515 35 L 530 10 L 545 28 L 560 20 L 780 20 L 800 5 L 815 35 L 830 10 L 845 28 L 860 20 L 1080 20 L 1100 5 L 1115 35 L 1130 10 L 1145 28 L 1160 20 L 1200 20"
              strokeDasharray="400"
              animate={
                shouldReduceMotion || !isTabVisible
                  ? {}
                  : { strokeDashoffset: [800, 0] }
              }
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </svg>
        </div>
      </motion.div>
    </div>
  );
}
