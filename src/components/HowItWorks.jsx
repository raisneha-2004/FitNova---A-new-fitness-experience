import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Activity, Trophy } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: Camera,
    title: 'Start your camera',
    description:
      'Allow browser webcam access. FitNova loads a local, privacy-first computer vision model with zero video sent to any server.',
  },
  {
    step: '02',
    icon: Activity,
    title: 'Do your squats',
    description:
      'Step back until your body turns green on the frame checklist. Perform full depth repetitions with instant posture angles shown live.',
  },
  {
    step: '03',
    icon: Trophy,
    title: 'Get feedback & earn XP',
    description:
      'Lock in good reps to rack up bonus XP points, maintain your workout streak, and climb the FitNova leaderboards.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#ff5a36] block mb-2">
            Simple 3-Step Setup
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How FitNova Works
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-3">
            Zero setup, zero special gear. Just you, your webcam, and your discipline.
          </p>
        </div>

        {/* Steps Grid with Thin Dotted Orange Line on Desktop */}
        <div className="relative">
          {/* Connecting line (Desktop) */}
          <div
            className="hidden lg:block absolute top-1/2 left-[12%] right-[12%] -translate-y-8 h-[2px] border-t-2 border-dashed border-[#ff5a36]/30 z-0"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  className="fq-card p-8 rounded-2xl relative overflow-hidden flex flex-col items-center text-center group hover:border-[#ff5a36]/40 transition-colors"
                >
                  {/* Big Faint Number in Orange Outline */}
                  <div
                    className="text-6xl font-black text-transparent select-none mb-4 tracking-tighter"
                    style={{
                      WebkitTextStroke: '1.5px rgba(255, 90, 54, 0.45)',
                    }}
                  >
                    {item.step}
                  </div>

                  {/* Icon Circle */}
                  <div className="w-12 h-12 rounded-full bg-[#ff5a36]/15 border border-[#ff5a36]/30 flex items-center justify-center text-[#ff5a36] mb-4 shadow-lg shadow-[#ff5a36]/20">
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Title & Desc */}
                  <h3 className="text-lg font-bold text-white tracking-tight mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
