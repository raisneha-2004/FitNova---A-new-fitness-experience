import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, Video } from 'lucide-react';
import Container from './Container';
import HeroMockCard from './HeroMockCard';
import HeroNeonScene from './HeroNeonScene';
import { usePlayer } from '../context/PlayerContext';

export default function Hero() {
  const { hasProfile } = usePlayer();

  return (
    <section className="relative pt-8 pb-14 lg:pt-14 lg:pb-20 overflow-hidden">
      {/* Cinematic Neon Gym Scene Background Animation */}
      <HeroNeonScene />

      {/* Soft orange glow in top-left */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#ff5a36]/15 blur-[120px] pointer-events-none z-0"
        aria-hidden="true"
      />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* LEFT COLUMN: Hero Copy & CTA (7 cols on desktop) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            {/* Small outlined pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-md text-xs font-medium text-slate-300 shadow-sm mb-5">
              <span className="w-2 h-2 rounded-full bg-[#ff5a36] animate-pulse" />
              <span>AI pose detection · Free · No equipment</span>
            </div>

            {/* Huge Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
              Your camera <br />
              is now your <br />
              <span className="text-[#ff5a36] inline-block drop-shadow-[0_4px_24px_rgba(255,90,54,0.35)]">
                gym coach
              </span>
            </h1>

            {/* Subtitle */}
            <div>
              <p className="text-base sm:text-lg text-slate-400 max-w-md font-normal leading-relaxed">
                Real-time rep counting, movement feedback and game-style progress. Every workout becomes a level up.
              </p>
              <p className="text-xs text-[#ff5a36] font-semibold mt-1 tracking-wide">
                Your workout is the game. Your body is the controller.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to={hasProfile ? '/challenges' : '/play'}
                className="btn-coral px-7 py-3.5 rounded-full text-base font-bold flex items-center gap-2 group shadow-lg shadow-[#ff5a36]/30 focus:outline-none focus:ring-2 focus:ring-[#ff5a36]"
              >
                <span>Play as Guest</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <a
                href="#how-it-works"
                className="px-6 py-3.5 rounded-full text-base font-semibold text-slate-300 hover:text-white border border-white/20 hover:border-[#ff5a36]/50 transition-all bg-white/[0.03] backdrop-blur-md focus:outline-none"
              >
                See how it works
              </a>
            </div>

            {/* Bottom Row of 3 Feature Items with Icons */}
            <div className="pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2.5 text-xs text-slate-300 font-medium">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#ff5a36] shrink-0">
                  <Video className="w-4 h-4" />
                </div>
                <span>Webcam-only · no wearables</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-slate-300 font-medium">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#ff5a36] shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span>Smart movement feedback</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-slate-300 font-medium">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#ff5a36] shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>Free forever</span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Floating Live App Mock Card (5 cols on desktop) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="lg:col-span-5"
          >
            <HeroMockCard />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
