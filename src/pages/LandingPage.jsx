import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import { ArrowRight, Trophy } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-12">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Features Section */}
      <Features />

      {/* 3. How It Works Section */}
      <HowItWorks />

      {/* 4. Leaderboard Preview Banner */}
      <section id="leaderboard" className="py-16 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="fq-card p-8 sm:p-12 rounded-3xl relative overflow-hidden border-[#ff5a36]/30 bg-gradient-to-r from-[#111424] via-[#161a30] to-[#111424]">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
              <div className="space-y-3 max-w-xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ff5a36]/15 text-[#ff5a36] border border-[#ff5a36]/30">
                  <Trophy className="w-3.5 h-3.5" />
                  Global Arena Leaderboard
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Ready to test your form against athletes worldwide?
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Join hundreds of daily players training with browser-based AI. Zero downloads needed.
                </p>
              </div>

              <Link
                to="/dashboard"
                className="btn-coral px-8 py-3.5 rounded-full font-bold text-sm sm:text-base flex items-center gap-2 shrink-0 shadow-lg shadow-[#ff5a36]/30 focus:outline-none"
              >
                <span>Enter The Arena</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
