import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Shield,
  ShieldCheck,
  Sparkles,
  Bug,
  Camera,
  Zap
} from 'lucide-react';
import Container from './Container';
import Logo from './Logo';

/**
 * Brand Column Texts & Badges
 */
const BRAND_TEXT = {
  taglineLead: 'Your camera.',
  taglineCoach: 'Your gym coach.',
  subline: 'Real-time squat tracking, rep counting and XP, right in your browser.',
  engineStatus: 'Pose engine ready'
};

const BRAND_TRUST_BADGES = [
  { label: 'Webcam only', icon: Camera },
  { label: '100% on-device', icon: ShieldCheck },
  { label: 'Free', icon: Zap }
];

/**
 * Social SVG Icons (GitHub & LinkedIn)
 */
function GithubIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function LinkedinIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.76v8.37H6.46V10.9M7.84 6.7a1.6 1.6 0 0 0-1.6 1.6 1.6 1.6 0 0 0 1.6 1.6 1.6 1.6 0 0 0 1.6-1.6 1.6 1.6 0 0 0-1.6-1.6z" />
    </svg>
  );
}

/**
 * FOOTER LINKS CONFIGURATION
 * Grouped into distinct categories: Play, Learn, Trust
 * Completely distinct from repeating navbar links.
 */
const PLAY_LINKS = [
  { name: 'Live Arena', path: '/live-arena' },
  { name: 'Daily Challenge', path: '/live-arena' },
  { name: 'Leaderboard', path: '/leaderboard' },
];

const LEARN_LINKS = [
  { name: 'How it works', path: '/how-it-works' },
  { name: 'Exercises', path: '/exercises' },
  { name: 'Camera tips', path: '/how-it-works' },
];

const TRUST_LINKS = [
  { name: 'Privacy', path: '/privacy' },
  { name: 'Disclaimer', path: '/disclaimer' },
  { name: 'Contact', path: '/contact' },
  { name: 'Report a bug', path: '/contact?topic=bug', icon: true },
];

export default function Footer({ className = '' }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <footer className={`mt-12 border-t border-white/10 bg-[#0b0d17]/95 pt-12 pb-8 relative z-10 ${className}`}>
      <Container>
        {/* ============================================================ */}
        {/* 1. CTA STRIP (Glass card, orange gradient border & glow)    */}
        {/* ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="rounded-3xl p-6 sm:p-10 bg-gradient-to-r from-[#111424] via-[#161a32] to-[#111424] border border-[#ff5a36]/40 shadow-[0_16px_40px_-12px_rgba(255,90,54,0.3)] relative overflow-hidden mb-12 sm:mb-16"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-80 h-32 bg-[#ff5a36]/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ff5a36]/15 text-[#ff5a36] border border-[#ff5a36]/30 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                No Equipment Needed
              </span>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Ready to <span className="text-[#ff5a36]">level up</span> your squat?
              </h3>
              <p className="text-sm sm:text-base text-slate-400 mt-2">
                Your camera is the only equipment you need.
              </p>
            </div>

            <Link
              to="/live-arena"
              className="group btn-coral px-8 py-3.5 rounded-full text-base font-bold flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-[#ff5a36]/30 focus:outline-none focus:ring-2 focus:ring-[#ff5a36] focus:ring-offset-2 focus:ring-offset-[#0b0d17] w-full sm:w-auto"
            >
              <span>Enter the Arena</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>

        {/* ============================================================ */}
        {/* 2. MAIN GRID (4 cols desktop, 2 cols tablet, 1 col mobile)   */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Column 1: Brand */}
          <div className="flex flex-col gap-4">
            <Logo size={36} />
            <p className="text-sm text-slate-400 -mt-2">
              A new fitness experience
            </p>

            {/* Tagline & Subline with text-balance to avoid orphaned words */}
            <div>
              <p className="text-base font-semibold text-slate-200 max-w-xs text-balance">
                {BRAND_TEXT.taglineLead}{' '}
                <span className="text-[#ff5a36]">{BRAND_TEXT.taglineCoach}</span>
              </p>
              <p className="mt-1 text-sm text-slate-400 max-w-xs leading-relaxed">
                {BRAND_TEXT.subline}
              </p>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {BRAND_TRUST_BADGES.map((badge) => {
                const BadgeIcon = badge.icon;
                return (
                  <div
                    key={badge.label}
                    className="group/badge inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors duration-200 hover:border-[#ff5a36]/50 hover:bg-[#ff5a36]/10 cursor-default"
                  >
                    <BadgeIcon className="w-3.5 h-3.5 text-[#ff5a36] shrink-0 transition-transform duration-200 group-hover/badge:scale-110" />
                    <span>{badge.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Live Engine Status Line */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="relative flex h-2 w-2 shrink-0">
                {!shouldReduceMotion && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>{BRAND_TEXT.engineStatus}</span>
            </div>
          </div>

          {/* Column 2: Play */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-widest text-slate-500 mb-4">
              Play
            </h4>
            <ul className="space-y-2.5">
              {PLAY_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="group inline-flex items-center text-sm text-slate-300 hover:text-[#ff5a36] transition-all duration-200 focus:outline-none focus:text-[#ff5a36]"
                  >
                    <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Learn */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-widest text-slate-500 mb-4">
              Learn
            </h4>
            <ul className="space-y-2.5">
              {LEARN_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="group inline-flex items-center text-sm text-slate-300 hover:text-[#ff5a36] transition-all duration-200 focus:outline-none focus:text-[#ff5a36]"
                  >
                    <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Trust */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-widest text-slate-500 mb-4">
              Trust
            </h4>
            <ul className="space-y-2.5">
              {TRUST_LINKS.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`group inline-flex items-center text-sm transition-all duration-200 focus:outline-none ${
                      item.icon
                        ? 'text-[#ff5a36] hover:text-[#ff7a52] font-semibold gap-1.5'
                        : 'text-slate-300 hover:text-[#ff5a36] focus:text-[#ff5a36]'
                    }`}
                  >
                    {item.icon && <Bug className="w-3.5 h-3.5 shrink-0" />}
                    <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                      {item.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. COACH'S NOTE (Disclaimer card, full width)                */}
        {/* ============================================================ */}
        <div
          id="coach-note-card"
          className="rounded-2xl p-5 sm:p-6 bg-white/[0.03] border border-white/10 shadow-inner flex items-start gap-4 mb-10 transition-colors hover:border-white/20"
        >
          <div className="w-10 h-10 rounded-xl bg-[#ff5a36]/15 border border-[#ff5a36]/30 flex items-center justify-center text-[#ff5a36] shrink-0 mt-0.5 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h5 className="text-sm font-extrabold text-white tracking-tight">
                Coach's Note
              </h5>
              <Link to="/disclaimer" className="text-[11px] text-[#ff5a36] hover:underline font-semibold ml-2">
                Read full disclaimer →
              </Link>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              FitNova provides general movement guidance only. It is not medical advice or a replacement for a professional trainer. Accuracy depends on camera angle, lighting and landmark visibility.
            </p>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 4. BOTTOM BAR                                                */}
        {/* ============================================================ */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 text-center md:text-left">
          {/* Left: Copyright */}
          <div>
            © 2026 FitNova. All rights reserved.
          </div>

          {/* Center (hidden on mobile) */}
          <div className="hidden md:block text-slate-500 font-medium">
            Made with React and MediaPipe
          </div>

          {/* Right: Author + Social Links */}
          <div className="flex items-center gap-3">
            <span>Built by <strong className="text-slate-200 font-semibold">Sneha Rai</strong></span>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/raisneha-2004"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Sneha Rai GitHub Profile"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#ff5a36]/50 flex items-center justify-center text-slate-300 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#ff5a36]"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/sneha-rai-a7157231a"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Sneha Rai LinkedIn Profile"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#ff5a36]/50 flex items-center justify-center text-slate-300 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#ff5a36]"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
