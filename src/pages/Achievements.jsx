import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, 
  Lock, 
  CheckCircle, 
  Sparkles, 
  Zap, 
  Flame, 
  Dumbbell, 
  ShieldCheck, 
  Star,
  Activity,
  Layers,
  HeartHandshake
} from 'lucide-react';
import { BADGES, loadUnlockedBadges, recomputeUnlockedBadgesFromHistory } from '../config/badges';
import Container from '../components/Container';

const ICON_MAP = {
  dumbbell: Dumbbell,
  sparkles: Sparkles,
  zap: Zap,
  flame: Flame,
  star: Star,
  activity: Activity,
  shield: ShieldCheck,
  layers: Layers,
  award: Award
};

export default function Achievements() {
  const [unlockedBadges, setUnlockedBadges] = useState({});

  useEffect(() => {
    const recomputed = recomputeUnlockedBadgesFromHistory();
    setUnlockedBadges(recomputed || loadUnlockedBadges());
  }, []);

  const unlockedCount = Object.keys(unlockedBadges).length;
  const totalBadges = BADGES.length;
  const progressPercent = Math.round((unlockedCount / totalBadges) * 100);

  return (
    <div className="py-10 text-white min-h-[calc(100vh-4rem)]">
      <Container>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff5a36]/15 border border-[#ff5a36]/30 text-xs font-semibold text-[#ff5a36] uppercase tracking-wider mb-2">
              <Award className="w-3.5 h-3.5" />
              Trophy Hall
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Arena Achievements
            </h1>
            <p className="text-white/60 text-sm sm:text-base mt-1">
              Conquer fitness milestones and collect exclusive honor crests.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4 self-start sm:self-auto">
            <div>
              <div className="text-xs text-white/50 uppercase tracking-wider font-semibold">Unlocked Badges</div>
              <div className="text-xl font-extrabold text-white flex items-baseline gap-1">
                <span className="text-[#ff5a36]">{unlockedCount}</span>
                <span className="text-white/40 text-sm">/ {totalBadges}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-[#ff5a36] flex items-center justify-center font-bold text-xs text-white">
              {progressPercent}%
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {BADGES.map((badge) => {
            const isUnlocked = !!unlockedBadges[badge.id];
            const unlockedDate = isUnlocked ? unlockedBadges[badge.id] : null;
            const IconComp = ICON_MAP[badge.icon] || Award;

            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={isUnlocked ? { y: -4 } : {}}
                className={`relative rounded-2xl p-6 border transition-all overflow-hidden flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-gradient-to-b from-[#ff5a36]/15 via-white/[0.04] to-transparent border-[#ff5a36]/50 shadow-xl shadow-[#ff5a36]/10'
                    : 'bg-white/[0.02] border-white/5 opacity-60 hover:opacity-75'
                }`}
              >
                {/* Subtle sheen highlight for unlocked badges */}
                {isUnlocked && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff5a36]/20 rounded-full blur-2xl pointer-events-none" />
                )}

                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                      isUnlocked
                        ? 'bg-gradient-to-br from-[#ff5a36] to-amber-500 text-white shadow-lg shadow-[#ff5a36]/30'
                        : 'bg-white/5 text-white/30 border border-white/10'
                    }`}>
                      <IconComp className="w-7 h-7" />
                    </div>

                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                        <CheckCircle className="w-3 h-3" />
                        Unlocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-white/40 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                        <Lock className="w-3 h-3" />
                        Locked
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1.5 flex items-center gap-1.5">
                    {badge.title}
                  </h3>
                  <p className="text-xs text-white/60 leading-relaxed mb-4">
                    {badge.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5">
                  {isUnlocked ? (
                    <div className="text-[11px] text-white/40 font-mono">
                      Awarded {new Date(unlockedDate).toLocaleDateString()}
                    </div>
                  ) : (
                    <div className="text-[11px] text-white/40 italic flex items-center gap-1">
                      <span>Hint:</span>
                      <span className="truncate">{badge.hint}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
