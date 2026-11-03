import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Flame, 
  Dumbbell, 
  Sparkles, 
  Camera, 
  Play, 
  CheckCircle2, 
  ArrowRight, 
  Activity, 
  ShieldCheck,
  Target,
  Lock,
  Ghost,
  Zap,
} from 'lucide-react';
import { EXERCISES } from '../config/exercises';
import { usePlayer } from '../context/PlayerContext';
import { loadPowerState, CHALLENGE_TIERS, POWERS } from '../config/powers';
import { getExerciseGhost } from '../utils/ghost';
import Container from '../components/Container';
import { getDailyChallenge, getDailyChallengeProgress } from '../utils/daily';


export default function Challenges() {
  const navigate = useNavigate();
  const { player } = usePlayer();

  // Selected exercise state (defaults to squat)
  const [selectedExerciseId, setSelectedExerciseId] = useState(EXERCISES[0]?.id || 'squat');
  // Selected mode: 'quick' | 'standard' | 'custom'
  const [selectedMode, setSelectedMode] = useState('quick');
  const [customReps, setCustomReps] = useState(15);
  const [customError, setCustomError] = useState('');

  const currentExercise = EXERCISES.find(ex => ex.id === selectedExerciseId) || EXERCISES[0];
  const isHold = currentExercise?.type === 'hold';

  // Read real rotating daily challenge and verified progress from fq_sessions
  const todayChallenge = getDailyChallenge();
  const dailyProg = getDailyChallengeProgress(todayChallenge);
  const dailyProgress = dailyProg.percentage;

  const handleCustomChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) {
      setCustomReps('');
      setCustomError('Enter a valid number');
      return;
    }
    setCustomReps(val);
    if (val < 1) {
      setCustomError('Minimum 1 rep');
    } else if (val > 100) {
      setCustomError('Maximum 100 reps');
    } else {
      setCustomError('');
    }
  };

  const calculateTarget = () => {
    if (isHold) {
      if (selectedMode === 'quick') return 30; // 30s
      if (selectedMode === 'standard') return 45; // 45s
      return Math.min(180, Math.max(5, Number(customReps) || 30));
    } else {
      if (selectedMode === 'quick') return 10;
      if (selectedMode === 'standard') return 20;
      return Math.min(100, Math.max(1, Number(customReps) || 10));
    }
  };

  const handleLaunchChallenge = () => {
    const target = calculateTarget();
    navigate(`/live-arena?exercise=${currentExercise.id}&target=${target}`);
  };

  const handleDailyLaunch = () => {
    navigate(`/live-arena?exercise=${todayChallenge.exerciseId}&target=${todayChallenge.target}`);
  };

  return (
    <div className="py-10 text-white min-h-[calc(100vh-4rem)]">
      <Container>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff5a36]/15 border border-[#ff5a36]/30 text-xs font-semibold text-[#ff5a36] uppercase tracking-wider mb-2">
              <Target className="w-3.5 h-3.5" />
              Arena Challenges
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Choose Your Challenge
            </h1>
            <p className="text-white/60 text-sm sm:text-base mt-1">
              Select an exercise, configure your target goal, and test your form against AI.
            </p>
          </div>

          {player && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 self-start md:self-auto">
              <div className="text-xs text-white/50">Playing as</div>
              <div className="text-sm font-bold text-[#ff5a36] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {player.nickname}
              </div>
            </div>
          )}
        </div>

        {/* Daily Challenge Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#ff5a36]/20 via-[#ff5a36]/10 to-transparent border border-[#ff5a36]/40 p-5 sm:p-6 mb-10 shadow-xl"
        >
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 bg-[#ff5a36]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ff5a36] text-white text-xs font-bold uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5" />
                Daily Arena Bounty
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {todayChallenge.name}
              </h2>
              <p className="text-sm text-white/70">
                {todayChallenge.description} Complete today for an instant <span className="text-[#ff5a36] font-semibold">+{todayChallenge.rewardXp} XP</span> bonus.
              </p>

              {/* Progress Bar */}
              <div className="pt-2 max-w-md w-full">
                <div className="flex justify-between text-xs text-white/60 mb-1">
                  <span>Today's Progress</span>
                  <span className="font-semibold text-white">{dailyProgress}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#ff5a36] to-amber-400 transition-all duration-500 rounded-full"
                    style={{ width: `${dailyProgress}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleDailyLaunch}
              className="px-5 py-3 rounded-xl bg-[#ff5a36] hover:bg-[#ff7455] text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#ff5a36]/30 transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <span>{dailyProgress >= 100 ? 'Replay Bounty' : 'Start Daily Quest'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Section 1: Choose Exercise */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-white/90 mb-4 flex items-center gap-2">
            <span>1. Pick Your Discipline</span>
            <span className="text-xs font-normal text-white/40">({EXERCISES.length} active engines)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {EXERCISES.map((ex) => {
              const isSelected = ex.id === selectedExerciseId;
              return (
                <motion.div
                  key={ex.id}
                  whileHover={{ y: -3 }}
                  onClick={() => setSelectedExerciseId(ex.id)}
                  className={`cursor-pointer rounded-2xl p-5 border transition-all relative overflow-hidden backdrop-blur-md ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#ff5a36]/15 to-white/5 border-[#ff5a36] shadow-xl shadow-[#ff5a36]/10'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-3 rounded-xl ${isSelected ? 'bg-[#ff5a36] text-white shadow-md shadow-[#ff5a36]/30' : 'bg-white/10 text-white/70'}`}>
                      <Dumbbell className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white/10 text-white/80 border border-white/10 flex items-center gap-1">
                        <Camera className="w-3 h-3 text-white/60" />
                        {ex.cameraView}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#ff5a36] flex items-center justify-center text-white">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">
                    {ex.name}
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed line-clamp-2 mb-4">
                    {ex.cameraTip}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-white/60">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {ex.requiredBody === 'full' ? 'Full Body' : 'Upper Body'}
                    </span>
                    <span className="font-semibold text-white/80">
                      +{ex.xp?.good || 10} XP / rep
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Challenge Ladder & Difficulty Tiers */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-lg font-bold text-white/90">
                2. Challenge Ladder & Target Intensity
              </h2>
              <p className="text-xs text-white/50">
                Complete each tier's goal to unlock the next level and charge your Superpower.
              </p>
            </div>

            {/* Ghost Record Chip */}
            {(() => {
              const ghost = getExerciseGhost(selectedExerciseId);
              const bestRun = ghost?.best || ghost?.last;
              if (!bestRun) return null;
              return (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold self-start sm:self-auto">
                  <Ghost className="w-3.5 h-3.5" />
                  <span>Your Record: {bestRun.reps} {isHold ? 'sec' : 'reps'}</span>
                </div>
              );
            })()}
          </div>

          {/* 3 Tiers: Rookie, Pro, Elite */}
          {(() => {
            const powerState = loadPowerState();
            const unlockedTier = powerState.unlockedTiers[selectedExerciseId] || 1;
            const tiers = CHALLENGE_TIERS[selectedExerciseId] || [
              { tier: 1, name: 'Rookie', target: 10, label: '10 Reps' },
              { tier: 2, name: 'Pro', target: 15, label: '15 Reps' },
              { tier: 3, name: 'Elite', target: 20, label: '20 Reps' },
            ];

            return (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                {tiers.map((t) => {
                  const isUnlocked = unlockedTier >= t.tier;
                  const isSelected = selectedMode === `tier_${t.tier}`;

                  return (
                    <button
                      key={t.tier}
                      type="button"
                      disabled={!isUnlocked}
                      onClick={() => {
                        if (isUnlocked) {
                          setSelectedMode(`tier_${t.tier}`);
                          setCustomReps(t.target);
                        }
                      }}
                      className={`p-4 rounded-xl text-left border transition-all relative overflow-hidden ${
                        isSelected
                          ? 'bg-[#ff5a36]/20 border-[#ff5a36] text-white ring-2 ring-[#ff5a36]'
                          : isUnlocked
                          ? 'bg-white/[0.03] border-white/10 text-white/80 hover:bg-white/[0.06]'
                          : 'bg-white/[0.01] border-white/5 text-white/30 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${
                          t.tier === 3 ? 'text-purple-400' : t.tier === 2 ? 'text-amber-400' : 'text-[#ff5a36]'
                        }`}>
                          Tier {t.tier}
                        </span>
                        {!isUnlocked && <Lock className="w-3.5 h-3.5 text-white/40" />}
                      </div>

                      <div className="text-base font-bold text-white">
                        {t.name} ({t.label})
                      </div>

                      <div className="text-[11px] text-white/40 mt-1">
                        {isUnlocked
                          ? isSelected ? 'Selected Goal' : 'Ready to challenge'
                          : `Complete ${tiers[t.tier - 2]?.name} to unlock`}
                      </div>
                    </button>
                  );
                })}

                {/* Custom target option */}
                <div
                  onClick={() => setSelectedMode('custom')}
                  className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                    selectedMode === 'custom'
                      ? 'bg-[#ff5a36]/20 border-[#ff5a36] text-white ring-2 ring-[#ff5a36]'
                      : 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="text-[10px] font-black uppercase tracking-wider text-blue-400 mb-1">Custom</div>
                  <div className="text-sm font-bold text-white mb-1">Freeform Goal</div>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      min={1}
                      max={isHold ? 180 : 100}
                      value={customReps}
                      onChange={handleCustomChange}
                      onFocus={() => setSelectedMode('custom')}
                      className="w-16 px-2 py-0.5 rounded bg-black/40 border border-white/20 text-white text-xs font-bold text-center focus:outline-none focus:ring-1 focus:ring-[#ff5a36]"
                    />
                    <span className="text-[11px] text-white/50">{isHold ? 's' : 'reps'}</span>
                  </div>
                  {customError && <div className="text-[10px] text-red-400 mt-1">{customError}</div>}
                </div>
              </div>
            );
          })()}
        </div>


        {/* Enter Arena CTA Strip */}
        <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#ff5a36]/20 border border-[#ff5a36]/30 flex items-center justify-center text-[#ff5a36]">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-white/50 uppercase tracking-wider font-semibold">Configured Session</div>
              <div className="text-lg font-bold text-white">
                {currentExercise.name} &bull; <span className="text-[#ff5a36]">{calculateTarget()} {isHold ? 'Seconds' : 'Reps'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLaunchChallenge}
            disabled={selectedMode === 'custom' && !!customError}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl ${
              selectedMode === 'custom' && !!customError
                ? 'bg-white/10 text-white/40 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#ff5a36] to-[#ff7455] text-white hover:brightness-110 shadow-[#ff5a36]/25 hover:scale-105 active:scale-95'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Enter Live Arena</span>
          </button>
        </div>
      </Container>
    </div>
  );
}
