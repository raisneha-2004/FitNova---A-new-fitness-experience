/**
 * Configuration and coordinates for the clean abstract neon hero background
 * Contains only:
 * - 40 ambient drifting particles (orange & blue)
 * - 3 glowing sweeping orange energy ribbons
 * - Vertical rising light streaks with glowing white tip dots (free zone 48%-92%)
 * - Small floating up-arrows (free zone)
 * - Floating +5 XP glass pills
 * (Zero drawn humans, zero gym equipment)
 */
export const HERO_NEON_CONFIG = {
  LOOP_DURATION: 10, // Total cycle in seconds

  COLORS: {
    navyBg: '#0b0d17',
    orange: '#ff5a36',
    orangeGlow: 'rgba(255, 90, 54, 0.45)',
    blue: '#3b82f6',
    cyan: '#38bdf8'
  },

  // 40 particles drifting across background
  PARTICLES: [
    { id: 1, x: 5, y: 18, size: 2.5, color: '#ff5a36', duration: 7, delay: 0 },
    { id: 2, x: 12, y: 35, size: 3, color: '#38bdf8', duration: 9, delay: 1.2 },
    { id: 3, x: 22, y: 12, size: 2, color: '#ff5a36', duration: 8, delay: 0.5 },
    { id: 4, x: 28, y: 65, size: 2.5, color: '#3b82f6', duration: 10, delay: 2.1 },
    { id: 5, x: 38, y: 22, size: 3, color: '#ff5a36', duration: 7.5, delay: 1.8 },
    { id: 6, x: 45, y: 80, size: 2, color: '#38bdf8', duration: 9.5, delay: 0.9 },
    { id: 7, x: 52, y: 15, size: 2.5, color: '#ff5a36', duration: 8.5, delay: 2.5 },
    { id: 8, x: 62, y: 40, size: 3, color: '#3b82f6', duration: 9, delay: 1.1 },
    { id: 9, x: 70, y: 18, size: 2, color: '#ff5a36', duration: 7, delay: 0.3 },
    { id: 10, x: 78, y: 55, size: 2.5, color: '#38bdf8', duration: 8, delay: 2.0 },
    { id: 11, x: 88, y: 25, size: 3, color: '#ff5a36', duration: 9.5, delay: 1.4 },
    { id: 12, x: 94, y: 72, size: 2, color: '#3b82f6', duration: 8.5, delay: 0.7 },
    { id: 13, x: 8, y: 78, size: 2.5, color: '#38bdf8', duration: 9, delay: 1.7 },
    { id: 14, x: 16, y: 48, size: 2, color: '#ff5a36', duration: 8.2, delay: 2.2 },
    { id: 15, x: 25, y: 85, size: 3, color: '#38bdf8', duration: 7.8, delay: 0.4 },
    { id: 16, x: 33, y: 42, size: 2.5, color: '#ff5a36', duration: 9.2, delay: 1.9 },
    { id: 17, x: 42, y: 62, size: 2, color: '#3b82f6', duration: 8.7, delay: 0.6 },
    { id: 18, x: 49, y: 38, size: 3, color: '#ff5a36', duration: 7.6, delay: 2.3 },
    { id: 19, x: 58, y: 75, size: 2.5, color: '#38bdf8', duration: 9.8, delay: 1.3 },
    { id: 20, x: 67, y: 30, size: 2, color: '#ff5a36', duration: 8.4, delay: 0.8 },
    { id: 21, x: 74, y: 82, size: 3, color: '#3b82f6', duration: 9.1, delay: 2.4 },
    { id: 22, x: 82, y: 45, size: 2.5, color: '#ff5a36', duration: 7.4, delay: 1.5 },
    { id: 23, x: 91, y: 60, size: 2, color: '#38bdf8', duration: 8.9, delay: 0.2 },
    { id: 24, x: 97, y: 15, size: 2.5, color: '#ff5a36', duration: 9.3, delay: 2.7 },
    { id: 25, x: 3, y: 55, size: 2, color: '#3b82f6', duration: 8.1, delay: 1.0 },
    { id: 26, x: 14, y: 92, size: 3, color: '#ff5a36', duration: 9.6, delay: 2.8 },
    { id: 27, x: 20, y: 28, size: 2.5, color: '#38bdf8', duration: 7.9, delay: 0.5 },
    { id: 28, x: 31, y: 72, size: 2, color: '#ff5a36', duration: 8.8, delay: 1.6 },
    { id: 29, x: 39, y: 8, size: 3, color: '#3b82f6', duration: 9.4, delay: 2.6 },
    { id: 30, x: 47, y: 50, size: 2.5, color: '#ff5a36', duration: 7.7, delay: 0.9 },
    { id: 31, x: 55, y: 92, size: 2, color: '#38bdf8', duration: 8.6, delay: 2.1 },
    { id: 32, x: 65, y: 62, size: 3, color: '#ff5a36', duration: 9.0, delay: 1.2 },
    { id: 33, x: 72, y: 5, size: 2.5, color: '#3b82f6', duration: 8.3, delay: 0.4 },
    { id: 34, x: 80, y: 88, size: 2, color: '#ff5a36', duration: 9.7, delay: 2.9 },
    { id: 35, x: 86, y: 35, size: 3, color: '#38bdf8', duration: 7.5, delay: 1.7 },
    { id: 36, x: 93, y: 90, size: 2.5, color: '#ff5a36', duration: 8.7, delay: 0.8 },
    { id: 37, x: 10, y: 8, size: 2, color: '#3b82f6', duration: 9.2, delay: 2.2 },
    { id: 38, x: 53, y: 68, size: 3, color: '#ff5a36', duration: 8.0, delay: 1.4 },
    { id: 39, x: 60, y: 22, size: 2.5, color: '#38bdf8', duration: 9.5, delay: 0.6 },
    { id: 40, x: 85, y: 10, size: 2, color: '#ff5a36', duration: 8.4, delay: 1.9 }
  ],

  // 3 flowing glowing orange curves for Phase 1-3s
  RIBBONS: [
    {
      id: 'ribbon-1',
      path: 'M 400 120 C 650 60, 880 280, 1120 160 C 1280 80, 1420 220, 1540 160',
      strokeWidth: 3.5,
      delay: 0
    },
    {
      id: 'ribbon-2',
      path: 'M 480 30 C 680 180, 920 120, 1180 340 C 1320 460, 1440 380, 1560 420',
      strokeWidth: 3,
      delay: 0.3
    },
    {
      id: 'ribbon-3',
      path: 'M 440 380 C 700 280, 940 440, 1200 320 C 1360 260, 1460 400, 1580 350',
      strokeWidth: 3.5,
      delay: 0.6
    }
  ],

  // Light streak paths rising during Phase 5-8s:
  // Starts ONLY in free zones between 48% and 92% (ZERO overlap with left text area or mock card)
  STREAKS: [
    { id: 's1', left: '48%', height: 110, delay: 0 },
    { id: 's2', left: '56%', height: 140, delay: 0.5 },
    { id: 's3', left: '66%', height: 90, delay: 1.2 },
    { id: 's4', left: '74%', height: 160, delay: 0.3 },
    { id: 's5', left: '84%', height: 120, delay: 0.9 },
    { id: 's6', left: '92%', height: 100, delay: 1.6 }
  ],

  // Floating Up-Arrows (free zone only)
  ARROWS: [
    { id: 'a1', left: '52%', bottom: '26%', delay: 0 },
    { id: 'a2', left: '70%', bottom: '32%', delay: 0.4 },
    { id: 'a3', left: '88%', bottom: '24%', delay: 0.8 }
  ],

  // +5 XP Pills floating up during Phase 5-8s in free zone
  XP_PILLS: [
    { id: 'xp1', left: '78%', bottom: '38%', delay: 0, text: '+5 XP' },
    { id: 'xp2', left: '86%', bottom: '46%', delay: 0.45, text: '+5 XP' },
    { id: 'xp3', left: '74%', bottom: '54%', delay: 0.9, text: '+10 XP' },
    { id: 'xp4', left: '82%', bottom: '62%', delay: 1.35, text: 'LEVEL UP' }
  ]
};
