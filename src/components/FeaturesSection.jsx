import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Scan, Hash, Sparkles, Trophy, X, ArrowRight, Ghost, Zap } from 'lucide-react';

import { Link } from 'react-router-dom';
import BackgroundSkeletons from './BackgroundSkeletons';
import Container from './Container';
import FeatureCard from './FeatureCard';
import { MiniSkeleton, ContourPattern, WaveChart, MedalRow } from './VisualElements';

/**
 * Feature items data array
 * Single source of truth for all 4 cards
 */
const FEATURES_DATA = [
  {
    id: 'skeleton-tracking',
    title: 'Live Skeleton Tracking',
    description:
      'High-speed 33-point body tracking runs completely on your device in real-time. No video uploaded, 100% private.',
    icon: Scan,
    chipText: 'Start',
    linkText: 'Try Live Tracking',
    hasPulsingGlow: true,
    hasStackEffect: false,
    iconGradient: null,
    sideVisual: <MiniSkeleton />,
    bottomVisual: null,
  },
  {
    id: 'rep-counter',
    title: 'Smart Rep Counter',
    description:
      'Computer vision analyzes joint angles and depth automatically to accurately log clean reps with zero wearables.',
    icon: Hash,
    chipText: 'Try Demo',
    linkText: 'Explore Features',
    hasPulsingGlow: false,
    hasStackEffect: true,
    iconGradient: null,
    sideVisual: <ContourPattern />,
    bottomVisual: null,
  },
  {
    id: 'movement-feedback',
    title: 'Movement Feedback',
    description:
      'Instant visual alignment guidance and posture alerts help you fix depth and form right in the middle of your set.',
    icon: Sparkles,
    chipText: 'Read feedback Guide ->',
    linkText: 'Explore Features',
    hasPulsingGlow: false,
    hasStackEffect: false,
    iconGradient: 'bg-gradient-to-tr from-[#ff5a36] to-purple-600 text-white border border-[#ff5a36]/50',
    sideVisual: null,
    bottomVisual: <WaveChart />,
  },
  {
    icon: Trophy,
    chipText: 'Learn More ->',
    linkText: 'View Badges',
    hasPulsingGlow: false,
    hasStackEffect: false,
    iconGradient: 'bg-white/5 border border-[#ff5a36]/60 text-[#ff5a36]',
    sideVisual: null,
    bottomVisual: (
      <div className="flex justify-end">
        <MedalRow />
      </div>
    ),
  },
  {
    id: 'ghost-mode',
    title: 'Ghost Mode',
    description:
      'Beat your previous self. Race against your recorded cadence in real time with an animated twin telemetry bar.',
    icon: Ghost,
    chipText: 'Race Ghost ->',
    linkText: 'Try Ghost Mode',
    hasPulsingGlow: true,
    hasStackEffect: false,
    iconGradient: 'bg-cyan-500/20 border border-cyan-400 text-cyan-300',
    sideVisual: null,
    bottomVisual: null,
  },
  {
    id: 'ai-power-mode',
    title: 'AI Power Mode',
    description:
      'Every rep charges your energy. Build streaks with consecutive good form, unlock superpowers, and earn 1.5x XP.',
    icon: Zap,
    chipText: 'Power Up ->',
    linkText: 'Unlock Powers',
    hasPulsingGlow: true,
    hasStackEffect: false,
    iconGradient: 'bg-amber-500/20 border border-amber-400 text-amber-300',
    sideVisual: null,
    bottomVisual: null,
  },
];

/**
 * FeaturesSection Component
 * Re-designed Features area matching the FitNova mockup specification:
 * - Centered header with subtitle & floating "Try Interactive Demo" links (top-right & bottom-right)
 * - Faint dark grid + glowing dotted skeletons with mouse parallax
 * - 4 interactive glassmorphic cards with cursor spotlight, active card lift & border glow
 * - Feature Playground fallback modal with tab switching
 */
export default function FeaturesSection() {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [mouseParallax, setMouseParallax] = useState({ x: 0, y: 0 });
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState(0);

  // Parallax tracking relative to section center
  const handleSectionMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    setMouseParallax({ x, y });
  };

  // Scroll to Playground or open modal if playground anchor doesn't exist
  const handleOpenPlayground = (tabIndex = 0) => {
    const playgroundEl = document.getElementById('feature-playground');
    if (playgroundEl) {
      playgroundEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      setModalTab(tabIndex);
      setDemoModalOpen(true);
    }
  };

  return (
    <section
      id="features"
      onMouseMove={handleSectionMouseMove}
      className="relative z-10 py-24 sm:py-28 overflow-hidden border-t border-white/5 bg-[#0b0d17]"
    >
      {/* 1. Background Grid with Radial Fade Mask */}
      <div className="absolute inset-0 bg-orange-grid opacity-30 pointer-events-none" />

      {/* 2. Background Decorative Dotted Skeletons (Parallax) */}
      <BackgroundSkeletons mouseX={mouseParallax.x} mouseY={mouseParallax.y} />

      <Container className="relative z-10">
        {/* Top-Right Floating "Try Interactive Demo" Action */}
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={() => handleOpenPlayground(0)}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#ff5a36] hover:text-[#ff7a52] transition-colors py-1.5 px-3 rounded-full bg-[#ff5a36]/10 border border-[#ff5a36]/25 hover:border-[#ff5a36]/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ff5a36]"
          >
            <Play className="w-3.5 h-3.5 fill-[#ff5a36]" />
            <span>Try Interactive Demo</span>
          </button>
        </div>

        {/* Section Header (Centered) */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#ff5a36] block mb-3">
            Engineered For Precision
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Everything you need to train smarter
          </h2>
          <p className="text-base sm:text-lg text-slate-400 mt-4 leading-relaxed max-w-xl mx-auto">
            Harness browser-based machine learning to turn any room into an interactive fitness studio.
          </p>
        </div>

        {/* The 4 Cards Grid (grid-cols-4 on desktop, 2 on tablet, 1 on mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {FEATURES_DATA.map((feature, idx) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              index={idx}
              isActive={activeCardIndex === idx}
              onActivate={() => setActiveCardIndex(idx)}
              onSelect={(clickedIndex) => handleOpenPlayground(clickedIndex)}
            />
          ))}
        </div>

        {/* Bottom-Right Floating "Try Interactive Demo" Action */}
        <div className="flex justify-end mt-8">
          <button
            type="button"
            onClick={() => handleOpenPlayground(3)}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#ff5a36] hover:text-[#ff7a52] transition-colors py-1.5 px-3 rounded-full bg-[#ff5a36]/10 border border-[#ff5a36]/25 hover:border-[#ff5a36]/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ff5a36]"
          >
            <Play className="w-3.5 h-3.5 fill-[#ff5a36]" />
            <span>Try Interactive Demo</span>
          </button>
        </div>
      </Container>

      {/* Interactive Feature Demo Modal (if Playground section is not yet mounted) */}
      <AnimatePresence>
        {demoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDemoModalOpen(false)}
              className="absolute inset-0 bg-[#0b0d17]/80 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-[#111424] border border-[#ff5a36]/40 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 overflow-hidden"
            >
              {/* Soft orange top glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-[#ff5a36]/30 blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5a36] animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#ff5a36]">
                    Feature Playground Demo
                  </span>
                </div>
                <button
                  onClick={() => setDemoModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tab Selector */}
              <div className="flex border-b border-white/10 mt-4 overflow-x-auto gap-2 pb-2">
                {FEATURES_DATA.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => setModalTab(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                      modalTab === idx
                        ? 'bg-[#ff5a36] text-white shadow-md'
                        : 'text-slate-400 hover:text-white bg-white/5'
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>

              {/* Tab Content Preview */}
              <div className="py-6">
                <div className="p-5 rounded-2xl bg-[#0b0d17] border border-white/10 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#ff5a36]/20 border border-[#ff5a36]/30 flex items-center justify-center text-[#ff5a36]">
                      {React.createElement(FEATURES_DATA[modalTab].icon, { className: 'w-5 h-5' })}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">
                        {FEATURES_DATA[modalTab].title}
                      </h4>
                      <span className="text-xs text-slate-400">
                        {FEATURES_DATA[modalTab].chipText}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {FEATURES_DATA[modalTab].description}
                  </p>

                  <div className="mt-2 p-3 rounded-xl bg-white/[0.03] border border-dashed border-white/10 text-center">
                    <span className="text-xs text-slate-400">
                      ⚡ Demo simulator ready. You can test live body tracking directly in the Workout Arena!
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDemoModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Close
                </button>
                <Link
                  to="/dashboard"
                  onClick={() => setDemoModalOpen(false)}
                  className="btn-coral px-5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-[#ff5a36]/25"
                >
                  <span>Launch Live Workout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
