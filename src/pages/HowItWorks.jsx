import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Container from '../components/Container';
import PageHeader from '../components/PageHeader';
import { Camera, Activity, Trophy, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

/**
 * 3 Step Cards Data
 */
const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    icon: Camera,
    title: 'Start your camera',
    tagline: '100% Client-Side Privacy',
    description:
      'Allow browser webcam access. FitNova loads a local, privacy-first computer vision model with zero video frames ever sent to any remote server or cloud.',
    highlights: ['Zero video upload', 'Runs on WebAssembly & WebGL', 'Works with any standard webcam'],
  },
  {
    step: '02',
    icon: Activity,
    title: 'Do your squats',
    tagline: 'Precision Biomechanics',
    description:
      'Step back until your body turns green on the frame checklist. Perform full depth repetitions with instant posture angles and form guidance shown live.',
    highlights: ['33-point skeletal landmarking', 'Hip & knee depth calculation', 'Instant audible and visual cues'],
  },
  {
    step: '03',
    icon: Trophy,
    title: 'Get feedback & earn XP',
    tagline: 'RPG Level Progression',
    description:
      'Lock in good reps to rack up bonus XP points, maintain your daily streak, unlock achievements, and climb the FitNova leaderboards.',
    highlights: ['Real-time XP multipliers', 'Streak preservation tracking', 'Global and regional rankings'],
  },
];

export default function HowItWorks() {
  return (
    <div className="pt-8 md:pt-12 pb-10 md:pb-14">
      <Container>
        <PageHeader
          title="How FitNova Works"
          subtitle="Zero setup, zero special sensors. Just you, your browser, and computer vision built for real fitness athletes."
          breadcrumb={[{ label: 'How it works' }]}
        />

        {/* 3 Large Step Cards: gap-6 md:gap-8, p-6 md:p-8 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-14">
          {HOW_IT_WORKS_STEPS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="fq-card p-6 md:p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between group hover:border-[#ff5a36]/50 transition-all shadow-xl h-full"
              >
                <div>
                  {/* Step Number & Icon (48px) */}
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className="text-5xl sm:text-6xl font-black text-transparent select-none tracking-tighter"
                      style={{
                        WebkitTextStroke: '2px rgba(255, 90, 54, 0.55)',
                      }}
                    >
                      {item.step}
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-[#ff5a36]/15 border border-[#ff5a36]/30 flex items-center justify-center text-[#ff5a36] shadow-lg shadow-[#ff5a36]/20 group-hover:scale-105 transition-transform shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <span className="text-xs font-bold uppercase tracking-wider text-[#ff5a36] block mb-2 px-3 py-1 rounded-full bg-[#ff5a36]/10 border border-[#ff5a36]/20 w-fit">
                    {item.tagline}
                  </span>

                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-3">
                    {item.title}
                  </h3>

                  <p className="text-sm md:text-base text-slate-400 leading-relaxed mb-6">
                    {item.description}
                  </p>

                  {/* Highlights List */}
                  <ul className="space-y-2.5 mb-6">
                    {item.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-[#ff5a36] shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs sm:text-sm text-slate-500 font-mono mt-auto">
                  <span>Phase {item.step} of 03</span>
                  <span>Active Vision</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Start Training Button CTA Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#111424] via-[#161a30] to-[#111424] border border-[#ff5a36]/30 text-center flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-[#ff5a36]/20 blur-3xl pointer-events-none" />

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ff5a36]/15 text-[#ff5a36] border border-[#ff5a36]/30 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Ready in 5 seconds
          </span>

          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mb-3">
            Step in front of the lens and set your first record
          </h3>

          <p className="text-sm md:text-base text-slate-400 max-w-lg mb-8 leading-relaxed">
            No sign up required to test your camera and perform your first repetition.
          </p>

          <Link
            to="/live-arena"
            className="btn-coral px-8 py-3.5 rounded-full font-bold text-base inline-flex items-center gap-2 shadow-xl shadow-[#ff5a36]/30 focus:outline-none focus:ring-2 focus:ring-[#ff5a36]"
          >
            <span>Start Training Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Container>
    </div>
  );
}
