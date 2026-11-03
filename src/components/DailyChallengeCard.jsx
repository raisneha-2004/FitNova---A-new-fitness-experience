import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Clock, Flame, Award, ArrowRight, CheckCircle2, Check, Sparkles, Trophy } from 'lucide-react';
import {
  getDailyChallenge,
  getTimeUntilMidnight,
  getDailyChallengeProgress,
  loadDailyState,
  claimDailyReward,
} from '../utils/daily';

/**
 * DailyChallengeCard Component
 *
 * Displays today's rotating workout challenge deterministically selected by local date.
 * Computes live verified progress from saved sessions in fq_sessions.
 * Shows true completion rewards (+100 XP, streak kept, Daily Champion badge).
 * Grants rewards once per day and prevents repeat claims.
 */
export default function DailyChallengeCard() {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  // 1. Rotating challenge based on current local date
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const challenge = getDailyChallenge(currentDate);

  // 2. Midnight countdown
  const [countdown, setCountdown] = useState(() => getTimeUntilMidnight(currentDate));

  // 3. Stored daily state (claim status) & real session progress
  const [dailyState, setDailyState] = useState(() => loadDailyState(currentDate));
  const [progress, setProgress] = useState(() => getDailyChallengeProgress(challenge, null, currentDate));
  const [showCelebration, setShowCelebration] = useState(false);

  // Recompute progress from fq_sessions
  const refreshProgress = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    const activeChallenge = getDailyChallenge(today);
    const updatedState = loadDailyState(today);
    const updatedProgress = getDailyChallengeProgress(activeChallenge, null, today);

    setDailyState(updatedState);
    setProgress(updatedProgress);

    // Auto-claim reward if completed and not yet claimed
    if (updatedProgress.isCompleted && !updatedState.claimed) {
      const claimResult = claimDailyReward(activeChallenge, today);
      if (claimResult.success) {
        setDailyState(loadDailyState(today));
        setShowCelebration(true);
      }
    }
  }, []);

  // Countdown timer ticking every second
  useEffect(() => {
    function tick() {
      const now = new Date();
      const nextCount = getTimeUntilMidnight(now);
      setCountdown(nextCount);

      // If midnight crossed, refresh challenge
      if (nextCount.diffMs <= 1000) {
        refreshProgress();
      }
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [refreshProgress]);

  // Initial progress sync & event listeners for real-time workout updates
  useEffect(() => {
    refreshProgress();

    function handleUpdate() {
      refreshProgress();
    }

    window.addEventListener('fq_daily_updated', handleUpdate);
    window.addEventListener('fq_sessions_updated', handleUpdate);
    window.addEventListener('fq_progress_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('fq_daily_updated', handleUpdate);
      window.removeEventListener('fq_sessions_updated', handleUpdate);
      window.removeEventListener('fq_progress_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refreshProgress]);

  // Handle manual claim button click if completed but unheralded
  const handleClaim = () => {
    if (progress.isCompleted && !dailyState.claimed) {
      const res = claimDailyReward(challenge, currentDate);
      if (res.success) {
        setDailyState(loadDailyState(currentDate));
        setShowCelebration(true);
      }
    }
  };

  // Navigate to Live Arena with preselected challenge exercise and target
  const handleAcceptChallenge = () => {
    navigate(`/live-arena?exercise=${challenge.exerciseId}&target=${challenge.target}`);
  };

  // Circular SVG ring math
  const circleRadius = 40;
  const circumference = 2 * Math.PI * circleRadius; // ~251.3
  const targetUnits = challenge.target;
  const currentUnits = Math.min(targetUnits, progress.current);
  const strokeOffset = circumference - (currentUnits / targetUnits) * circumference;
  const isClaimed = Boolean(dailyState.claimed);
  const isCompleted = progress.isCompleted;

  return (
    <motion.div
      whileHover={shouldReduceMotion ? {} : { y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="rounded-3xl p-6 sm:p-8 bg-[#111424]/90 border border-[#ff5a36]/50 shadow-[0_16px_40px_-12px_rgba(255,90,54,0.35)] backdrop-blur-xl flex flex-col justify-between h-full relative overflow-hidden"
    >
      {/* Background Soft Glow */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-[#ff5a36]/15 blur-3xl pointer-events-none" />

      <div>
        {/* Top Header Row: Daily Challenge Badge + Live Reset Countdown */}
        <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ff5a36]/20 text-[#ff5a36] border border-[#ff5a36]/40">
            <Flame className="w-3.5 h-3.5 fill-[#ff5a36]" />
            Daily Challenge
          </span>

          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 text-[#ff5a36]" />
            <span>Resets in {countdown.formatted}</span>
          </div>
        </div>

        {/* Challenge Title & Description */}
        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          {challenge.name}
        </h3>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-6">
          {challenge.description}
        </p>

        {/* Circular SVG Progress Ring */}
        <div className="flex items-center gap-6 p-4 rounded-2xl bg-white/[0.03] border border-white/5 mb-6">
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              {/* Background Track Circle */}
              <circle
                cx="50"
                cy="50"
                r={circleRadius}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="8"
                fill="none"
              />
              {/* Animated Progress Stroke */}
              <motion.circle
                cx="50"
                cy="50"
                r={circleRadius}
                stroke={isCompleted ? '#10b981' : '#ff5a36'}
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black text-white leading-none">
                {progress.current}/{challenge.target}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">
                {challenge.type === 'hold' ? 'Sec' : 'Reps'}
              </span>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#ff5a36] block">
                {isCompleted ? 'Goal Achieved' : 'Active Quest'}
              </span>
              {isCompleted && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div className="text-sm font-semibold text-white mb-1">
              {challenge.metricCue}
            </div>
            <p className="text-xs text-slate-400 leading-normal">
              {progress.current} {challenge.type === 'hold' ? 'seconds' : 'reps'} recorded today.{' '}
              {isCompleted
                ? 'All requirements completed!'
                : `Complete ${challenge.target - progress.current} more to claim today's bonus.`}
            </p>
          </div>
        </div>

        {/* Rewards Row: +100 XP, Streak Kept, Daily Champion Badge */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Completion Rewards
            </span>
            {isClaimed && (
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" />
                Claimed
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-center">
            {/* Reward 1: XP */}
            <div className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-colors relative ${
              isClaimed
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-white/[0.03] border-white/10'
            }`}>
              {isClaimed ? (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5" />
                </div>
              ) : null}
              <Award className={`w-4 h-4 mb-1 ${isClaimed ? 'text-emerald-400' : 'text-[#ff5a36]'}`} />
              <span className="text-xs sm:text-sm font-extrabold text-white">+{challenge.rewardXp} XP</span>
              <span className="text-[10px] text-slate-400">Level Boost</span>
            </div>

            {/* Reward 2: Streak */}
            <div className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-colors relative ${
              isClaimed
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-white/[0.03] border-white/10'
            }`}>
              {isClaimed ? (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5" />
                </div>
              ) : null}
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400 mb-1" />
              <span className="text-xs sm:text-sm font-extrabold text-white">Streak kept</span>
              <span className="text-[10px] text-slate-400">Daily Habit</span>
            </div>

            {/* Reward 3: Daily Champion Badge */}
            <div className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-colors relative ${
              isClaimed
                ? 'bg-purple-500/10 border-purple-500/30'
                : 'bg-white/[0.03] border-white/10'
            }`}>
              {isClaimed ? (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5" />
                </div>
              ) : null}
              <Trophy className={`w-4 h-4 mb-1 ${isClaimed ? 'text-purple-400' : 'text-slate-400'}`} />
              <span className="text-xs sm:text-sm font-extrabold text-slate-200">Daily Champion</span>
              <span className="text-[10px] text-slate-400">Badge</span>
            </div>
          </div>
        </div>

        {/* Celebration Banner when completed today */}
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center gap-2.5 text-xs text-emerald-300 font-semibold"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Challenge complete! +100 XP and Daily Champion badge unlocked.</span>
          </motion.div>
        )}
      </div>

      {/* Action Button */}
      <div className="pt-4 border-t border-white/10 mt-auto">
        {isCompleted ? (
          isClaimed ? (
            <button
              type="button"
              disabled
              className="w-full py-3.5 rounded-full text-sm font-bold bg-white/5 border border-white/10 text-slate-400 cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Completed today. Come back tomorrow ({countdown.formatted})</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClaim}
              className="w-full py-3.5 rounded-full text-base font-bold bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all active:scale-98"
            >
              <Sparkles className="w-4 h-4" />
              <span>Claim +100 XP Reward</span>
            </button>
          )
        ) : (
          <button
            type="button"
            onClick={handleAcceptChallenge}
            className="btn-coral w-full py-3.5 rounded-full text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#ff5a36]/30 focus:outline-none focus:ring-2 focus:ring-[#ff5a36] active:scale-98"
          >
            <span>Accept Challenge</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
