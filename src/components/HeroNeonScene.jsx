import React, { useEffect, useState, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { HERO_NEON_CONFIG } from '../constants/heroNeonConfig';

/**
 * HeroNeonScene Component
 * Clean, cinematic neon animation for the Hero section.
 *
 * Contains ONLY:
 * - Faint perspective orange grid
 * - 40 drifting particles (blue & orange)
 * - 3 glowing orange energy ribbons (sweeping in free zones)
 * - Rising vertical light streaks with glowing tip dots (in free zones 48%-92%)
 * - Small floating up-arrows (in free zones)
 * - Floating +5 XP glass pills (in free zones)
 *
 * (Zero drawn humans, zero drawn athletes, zero barbells/equipment)
 *
 * Guarantees:
 * - None start inside the left text column.
 * - None are cropped or hidden behind the mock card.
 * - Pauses cleanly when tab is hidden.
 * - Respects prefers-reduced-motion.
 */
export default function HeroNeonScene() {
  const shouldReduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(true);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Monitor tab visibility to pause animation loops when inactive
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Subtle Parallax: max 12px shift opposite to mouse cursor on desktop
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (window.innerWidth < 1024) return;
      const xPct = (e.clientX / window.innerWidth) - 0.5;
      const yPct = (e.clientY / window.innerHeight) - 0.5;
      setMouseOffset({
        x: -xPct * 12,
        y: -yPct * 12
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Common loop transition timing: 10s repeating infinitely
  const loopTransition = {
    duration: HERO_NEON_CONFIG.LOOP_DURATION,
    repeat: Infinity,
    ease: 'linear'
  };

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
      style={{
        transform: `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0)`,
        transition: 'transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)'
      }}
    >
      {/* ============================================================ */}
      {/* LAYER 1: PERSPECTIVE NEON GRID & AMBIENT RADIAL LIGHT       */}
      {/* ============================================================ */}
      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_85%)] opacity-100">
        <svg
          className="w-full h-full stroke-[#ff5a36]/[0.15]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="hero-perspective-grid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path d="M 50 0 L 0 0 0 50" fill="none" strokeWidth="1.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-perspective-grid)" />
        </svg>
      </div>

      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 w-[520px] h-[520px] rounded-full bg-[#ff5a36]/[0.08] blur-[140px]" />
      <div className="absolute bottom-8 right-12 w-[480px] h-[480px] rounded-full bg-[#38bdf8]/[0.07] blur-[140px]" />

      {/* ============================================================ */}
      {/* LAYER 2: 40 DRIFTING PARTICLES / STARS (ORANGE & BLUE)       */}
      {/* ============================================================ */}
      <div className="absolute inset-0">
        {HERO_NEON_CONFIG.PARTICLES.map((p) => {
          if (shouldReduceMotion) {
            return (
              <span
                key={p.id}
                className="absolute rounded-full"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  backgroundColor: p.color,
                  opacity: 0.5
                }}
              />
            );
          }

          return (
            <motion.span
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                boxShadow: `0 0 8px ${p.color}`
              }}
              animate={
                isVisible
                  ? {
                      y: [-12, 14, -12],
                      x: [-6, 6, -6],
                      opacity: [0.35, 0.65, 0.35]
                    }
                  : {}
              }
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          );
        })}
      </div>

      {/* Dynamic Animated Scene (Ribbons, Light Streaks, Floating XP) */}
      {!shouldReduceMotion && (
        <div className="absolute inset-0">
          {/* ============================================================ */}
          {/* LAYER 3: 1-3s ENERGY RIBBONS (3 GLOWING ORANGE CURVES)        */}
          {/* ============================================================ */}
          <div className="hidden lg:block absolute inset-0">
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 1440 800"
              fill="none"
              preserveAspectRatio="none"
            >
              <defs>
                <filter id="ribbon-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#ff5a36" floodOpacity="0.8" />
                </filter>
              </defs>

              {HERO_NEON_CONFIG.RIBBONS.map((ribbon) => (
                <motion.path
                  key={ribbon.id}
                  d={ribbon.path}
                  stroke="#ff5a36"
                  strokeWidth={ribbon.strokeWidth}
                  strokeLinecap="round"
                  fill="none"
                  filter="url(#ribbon-glow)"
                  strokeDasharray="1600"
                  animate={
                    isVisible
                      ? {
                          strokeDashoffset: [1600, 1600, 0, -1600, -1600, 1600],
                          opacity: [0, 0, 0.42, 0.35, 0, 0]
                        }
                      : {}
                  }
                  transition={{
                    ...loopTransition,
                    times: [0, 0.1 + ribbon.delay * 0.05, 0.22 + ribbon.delay * 0.05, 0.32, 0.38, 1]
                  }}
                />
              ))}
            </svg>
          </div>

          {/* ============================================================ */}
          {/* LAYER 4: 5-8s REP ENERGY: RISING LIGHT STREAKS & ARROWS      */}
          {/* Starts ONLY in free zones between 48% and 92% (No text overlap) */}
          {/* ============================================================ */}
          <div className="hidden lg:block absolute inset-0">
            {HERO_NEON_CONFIG.STREAKS.map((streak) => (
              <motion.div
                key={streak.id}
                className="absolute bottom-4 flex flex-col items-center"
                style={{ left: streak.left }}
                animate={
                  isVisible
                    ? {
                        y: [0, -280],
                        opacity: [0, 0, 0.55, 0.55, 0, 0]
                      }
                    : {}
                }
                transition={{
                  ...loopTransition,
                  times: [0, 0.48 + streak.delay * 0.05, 0.58 + streak.delay * 0.05, 0.72, 0.82, 1]
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ff5a36]" />
                <div
                  className="w-[2px] bg-gradient-to-t from-transparent via-[#ff5a36]/60 to-[#ff5a36]"
                  style={{ height: `${streak.height}px` }}
                />
              </motion.div>
            ))}

            {/* Floating Up-Arrow Icons in Free Zone */}
            {HERO_NEON_CONFIG.ARROWS.map((arr) => (
              <motion.div
                key={arr.id}
                className="absolute text-[#ff5a36] drop-shadow-[0_0_6px_#ff5a36]"
                style={{ left: arr.left, bottom: arr.bottom }}
                animate={
                  isVisible
                    ? {
                        y: [0, -60],
                        opacity: [0, 0, 0.65, 0.5, 0, 0]
                      }
                    : {}
                }
                transition={{
                  ...loopTransition,
                  times: [0, 0.52 + arr.delay * 0.06, 0.62 + arr.delay * 0.06, 0.72, 0.8, 1]
                }}
              >
                <ArrowUp className="w-5 h-5 stroke-[2.5]" />
              </motion.div>
            ))}

            {/* Floating +5 XP Glass Pills near Mock Card in Free Zone */}
            {HERO_NEON_CONFIG.XP_PILLS.map((pill) => (
              <motion.div
                key={pill.id}
                className="absolute px-3 py-1 rounded-full text-xs font-black tracking-wider text-white bg-gradient-to-r from-[#ff5a36]/30 to-[#8b5cf6]/30 border border-[#ff5a36]/50 shadow-[0_0_12px_rgba(255,90,54,0.4)] backdrop-blur-md"
                style={{ left: pill.left, bottom: pill.bottom }}
                animate={
                  isVisible
                    ? {
                        y: [0, -50],
                        scale: [0.85, 1.05, 1, 0.9],
                        opacity: [0, 0, 0.85, 0.7, 0, 0]
                      }
                    : {}
                }
                transition={{
                  ...loopTransition,
                  times: [0, 0.52 + pill.delay * 0.05, 0.62 + pill.delay * 0.05, 0.74, 0.82, 1]
                }}
              >
                {pill.text}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Dark gradient overlay on left side so heading and text stay 100% readable */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, rgba(11, 13, 23, 0.85) 0%, rgba(11, 13, 23, 0.85) 25%, rgba(11, 13, 23, 0.5) 42%, rgba(11, 13, 23, 0) 55%)'
        }}
      />
    </div>
  );
}
