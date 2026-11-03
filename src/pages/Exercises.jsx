import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '../components/Container';
import PageHeader from '../components/PageHeader';
import { EXERCISES, COMING_SOON_EXERCISES } from '../config/exercises';
import {
  Play,
  Lock,
  Dumbbell,
  Target,
  Sparkles,
  Bell,
  CheckCircle2,
  Award,
  Zap,
  TrendingUp,
  Camera,
} from 'lucide-react';

const FILTER_CHIPS = ['All', 'Beginner', 'Intermediate', 'Available'];

const SCORING_RULES = [
  {
    title: 'Good Rep',
    xp: '+10 XP',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    icon: Award,
    description: 'Full biomechanical range of motion (deep squat, full arm spread/curl).',
  },
  {
    title: 'Partial Rep',
    xp: '+2 XP',
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    icon: Zap,
    description: 'Partial range or early turnaround. Counted with reduced XP score guidance.',
  },
  {
    title: 'Daily Streak Bonus',
    xp: '1.5x Multiplier',
    badgeColor: 'bg-[#ff5a36]/20 text-[#ff5a36] border-[#ff5a36]/40',
    icon: TrendingUp,
    description: 'Stack consecutive training days to multiply all earned session XP across leaderboards.',
  },
];

export default function Exercises() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [showNotifyToast, setShowNotifyToast] = useState(false);

  // Build full exercises list from single source of truth
  const allCards = [
    // Available exercises from EXERCISES registry
    ...EXERCISES.map((ex) => ({
      id: ex.id,
      name: ex.name,
      status: 'Available',
      difficulty: ex.difficulty,
      difficultyColor: ex.difficultyColor,
      targetMuscles: ex.targetMuscles,
      description: ex.description,
      type: ex.type,
      cameraView: ex.cameraView,
      isAvailable: true,
      actionText: `Start ${ex.name.replace('Bodyweight ', '')}`,
      route: `/live-arena?exercise=${ex.id}`,
      icon: ex.icon,
    })),
    // Coming soon exercises
    ...COMING_SOON_EXERCISES.map((cs) => ({
      id: cs.id,
      name: cs.name,
      status: 'Coming soon',
      difficulty: cs.difficulty,
      difficultyColor: cs.difficultyColor,
      targetMuscles: cs.targetMuscles,
      description: cs.description,
      cameraView: cs.cameraView,
      isAvailable: false,
      actionText: 'Coming Soon',
      route: null,
      icon: cs.icon,
    })),
  ];

  // Filter cards based on selected chip
  const filteredExercises = allCards.filter((exercise) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Beginner') return exercise.difficulty === 'Beginner';
    if (activeFilter === 'Intermediate') return exercise.difficulty === 'Intermediate';
    if (activeFilter === 'Available') return exercise.isAvailable;
    return true;
  });

  // Handle toast notification
  const handleNotifyClick = () => {
    setShowNotifyToast(true);
    setTimeout(() => {
      setShowNotifyToast(false);
    }, 3500);
  };

  return (
    <div className="pt-8 md:pt-12 pb-10 md:pb-14">
      <Container>
        {/* Page Header */}
        <PageHeader
          title="Training Disciplines"
          subtitle="Select an exercise to enter the AI vision arena. More biomechanically verified movements are unlocking regularly."
          breadcrumb={[{ label: 'Exercises' }]}
        />

        {/* Filter Chip Row */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap mb-8">
          {FILTER_CHIPS.map((chip) => {
            const isActive = activeFilter === chip;
            return (
              <button
                key={chip}
                type="button"
                onClick={() => setActiveFilter(chip)}
                className={`text-xs sm:text-sm font-bold px-4 py-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#ff5a36] ${
                  isActive
                    ? 'bg-[#ff5a36] text-white shadow-lg shadow-[#ff5a36]/30'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/10'
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>

        {/* Exercises Grid: 3 cols on desktop (lg:grid-cols-3), 2 on tablet, 1 on mobile */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <AnimatePresence>
            {filteredExercises.map((item) => {
              const Icon = item.icon || Dumbbell;
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.3 }}
                  className={`rounded-3xl p-6 md:p-8 border transition-all flex flex-col justify-between h-full ${
                    item.isAvailable
                      ? 'bg-white/[0.05] border-[#ff5a36]/50 shadow-[0_16px_40px_-12px_rgba(255,90,54,0.35)] hover:border-[#ff5a36] hover:bg-white/[0.07]'
                      : 'bg-white/[0.02] border-white/10 opacity-70 hover:opacity-85'
                  }`}
                >
                  <div className="flex flex-col flex-1">
                    {/* Header Chips & Status */}
                    <div className="flex items-center justify-between gap-3 mb-6">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full border ${item.difficultyColor}`}
                        >
                          {item.difficulty}
                        </span>
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full border ${
                            item.isAvailable
                              ? 'bg-[#ff5a36]/20 text-[#ff5a36] border-[#ff5a36]/40'
                              : 'bg-slate-800/80 text-slate-400 border-slate-700'
                          }`}
                        >
                          {item.status}
                        </span>
                        {item.type === 'hold' && (
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
                            Hold
                          </span>
                        )}
                        {item.cameraView && (
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                            {item.cameraView}
                          </span>
                        )}
                      </div>

                      {/* Icon: 44-48px */}
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 shrink-0 shadow-inner">
                        <Icon className="w-6 h-6 text-[#ff5a36]" />
                      </div>
                    </div>

                    {/* Title: text-xl or text-2xl */}
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2.5">
                      {item.name}
                    </h3>

                    {/* Target Muscles */}
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 mb-4">
                      <Target className="w-4 h-4 text-[#ff5a36] shrink-0" />
                      <span>
                        <strong className="text-slate-200">Focus:</strong> {item.targetMuscles}
                      </span>
                    </div>

                    {/* Description: text-base */}
                    <p className="text-sm md:text-base text-slate-400 leading-relaxed mb-6 flex-1">
                      {item.description}
                    </p>
                  </div>

                  {/* Action Button: py-3 text-base at bottom */}
                  <div className="pt-5 border-t border-white/10 mt-auto">
                    {item.isAvailable ? (
                      <Link
                        to={item.route}
                        className="btn-coral w-full py-3 rounded-full text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#ff5a36]/30 focus:outline-none focus:ring-2 focus:ring-[#ff5a36]"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>{item.actionText}</span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="w-full py-3 rounded-full text-base font-semibold bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        <span>{item.actionText}</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Section below grid: Banner card "More exercises unlocking soon" with "Notify me" button */}
        <div className="mt-10 sm:mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#111424] via-[#171c36] to-[#111424] border border-[#ff5a36]/30 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-40 bg-[#ff5a36]/15 blur-3xl pointer-events-none" />

          <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
            <div className="w-14 h-14 rounded-2xl bg-[#ff5a36]/15 border border-[#ff5a36]/30 flex items-center justify-center text-[#ff5a36] shrink-0 shadow-lg shadow-[#ff5a36]/20">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1">
                More exercises unlocking soon
              </h4>
              <p className="text-sm md:text-base text-slate-400">
                Deadlifts, burpees, and kettlebell swings are currently in biomechanical validation.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleNotifyClick}
            className="btn-coral px-7 py-3 rounded-full text-base font-bold inline-flex items-center gap-2 shrink-0 shadow-lg shadow-[#ff5a36]/30 focus:outline-none focus:ring-2 focus:ring-[#ff5a36]"
          >
            <Bell className="w-4 h-4" />
            <span>Notify me</span>
          </button>
        </div>

        {/* Section below banner: "How scoring works" with 3 small cards */}
        <div className="mt-10 sm:mt-12">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ff5a36] block mb-1">
              Arena Biomechanics
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              How scoring works
            </h3>
            <p className="text-sm md:text-base text-slate-400 mt-1 max-w-xl">
              Every rep is scored based on joint depth, symmetry, and tempo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SCORING_RULES.map((rule, idx) => {
              const RuleIcon = rule.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl p-6 bg-white/[0.03] border border-white/10 flex flex-col justify-between hover:border-[#ff5a36]/30 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#ff5a36]/15 border border-[#ff5a36]/30 flex items-center justify-center text-[#ff5a36]">
                        <RuleIcon className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${rule.badgeColor}`}>
                        {rule.xp}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">{rule.title}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">{rule.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Toast Notification */}
        <AnimatePresence>
          {showNotifyToast && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="fixed bottom-8 right-8 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-[#111424] border border-[#ff5a36]/60 shadow-2xl shadow-[#ff5a36]/20 text-white"
            >
              <CheckCircle2 className="w-5 h-5 text-[#ff5a36] shrink-0" />
              <div className="text-sm font-semibold">
                We will let you know as soon as new exercises drop!
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </div>
  );
}
