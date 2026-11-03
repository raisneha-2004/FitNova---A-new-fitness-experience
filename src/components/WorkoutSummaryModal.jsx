import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Flame,
  Zap,
  Target,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Award,
  Globe,
} from 'lucide-react';
import { getLeaderboardOptIn, setLeaderboardOptIn } from '../services/api';

/**
 * Formats seconds into mm:ss format
 */
import GhostResultCard from './GhostResultCard';

function formatTime(seconds = 0) {
  const safeSec = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safeSec / 60);
  const s = safeSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}


export default function WorkoutSummaryModal({
  isOpen,
  onClose,
  onPlayAgain,
  summaryData, // { exerciseName, totalReps, goodReps, shallowReps, accuracy, durationSeconds, xpEarned, avgAngle, bestAngle, levelBefore, levelAfter, newRecords, hasNewRecord }
}) {
  const navigate = useNavigate();

  if (!isOpen || !summaryData) return null;

  const {
    exerciseId = 'squat',
    exerciseName = 'Bodyweight Squat',
    totalReps = 0,
    goodReps = 0,
    shallowReps = 0,
    accuracy = 0,
    durationSeconds = 0,
    xpEarned = 0,
    avgAngle = 0,
    bestAngle = 0,
    avgRepTime = 0,
    bestStreak = 0,
    holdSeconds = 0,
    bestHold = 0,
    levelBefore = 1,
    levelAfter = 1,
    newRecords = {},
    hasNewRecord = false,
    isFirstRecord = false,
  } = summaryData;

  const isSquat = exerciseId === 'squat';
  const isBicepCurl = exerciseId === 'bicep-curl';
  const isJumpingJacksOrHighKnees = exerciseId === 'jumping-jacks' || exerciseId === 'high-knees';
  const isPlankOrWallSit = exerciseId === 'plank' || exerciseId === 'core-plank' || exerciseId === 'wall-sit';
  const isButtKicks = exerciseId === 'butt-kicks';
  const isLunge = exerciseId === 'lunge';

  const [optIn, setOptIn] = React.useState(getLeaderboardOptIn);
  React.useEffect(() => {
    if (isOpen) {
      setOptIn(getLeaderboardOptIn());
    }
  }, [isOpen]);

  const handleToggleOptIn = (e) => {
    const val = e.target.checked;
    setOptIn(val);
    setLeaderboardOptIn(val);
  };

  const isEmptyWorkout = totalReps === 0 && (!isPlankOrWallSit || durationSeconds === 0);

  // Determine which exercise-specific telemetry cards have valid data (never show "--", hide if empty)
  const metricCards = [];
  if (isSquat) {
    if (avgAngle > 0) {
      metricCards.push({
        label: 'Average Depth (Avg Min Knee Angle)',
        value: `${avgAngle}°`,
        annotation: avgAngle <= 100 ? '(Optimal parallel)' : '(Approaching depth)',
        color: 'text-slate-200',
      });
    }
    if (bestAngle > 0) {
      metricCards.push({
        label: 'Deepest Rep',
        value: `${bestAngle}°`,
        annotation: bestAngle <= 100 ? '(Deep squat)' : '',
        color: 'text-[#ff5a36]',
      });
    }
  } else if (isBicepCurl) {
    if (avgAngle > 0) {
      metricCards.push({
        label: 'Average Curl Angle',
        value: `${avgAngle}°`,
        annotation: avgAngle <= 65 ? '(Full contraction)' : '(Standard curl)',
        color: 'text-slate-200',
      });
    }
    if (bestAngle > 0) {
      metricCards.push({
        label: 'Best Curl',
        value: `${bestAngle}°`,
        annotation: '(Peak flexion)',
        color: 'text-[#ff5a36]',
      });
    }
  } else if (isLunge) {
    if (avgAngle > 0) {
      metricCards.push({
        label: 'Average Lunge Depth',
        value: `${avgAngle}°`,
        annotation: avgAngle <= 100 ? '(Parallel depth)' : '(Good stability)',
        color: 'text-slate-200',
      });
    }
    if (bestAngle > 0) {
      metricCards.push({
        label: 'Deepest Lunge',
        value: `${bestAngle}°`,
        annotation: bestAngle <= 100 ? '(Deep lunge)' : '',
        color: 'text-[#ff5a36]',
      });
    }
  } else if (isJumpingJacksOrHighKnees || isButtKicks) {
    if (avgRepTime > 0) {
      metricCards.push({
        label: 'Average Rep Cadence',
        value: `${avgRepTime}s`,
        annotation: '(Cadence pace)',
        color: 'text-slate-200',
      });
    }
    if (bestStreak > 0) {
      metricCards.push({
        label: 'Best Streak',
        value: `${bestStreak} reps`,
        annotation: '(Unbroken good rhythm)',
        color: 'text-emerald-400',
      });
    }
  } else if (isPlankOrWallSit) {
    const timeInForm = holdSeconds || durationSeconds;
    if (timeInForm > 0) {
      metricCards.push({
        label: 'Time in Form',
        value: formatTime(timeInForm),
        annotation: '(Verified posture)',
        color: 'text-slate-200',
      });
    }
    const peakHold = bestHold || timeInForm;
    if (peakHold > 0) {
      metricCards.push({
        label: 'Best Hold',
        value: formatTime(peakHold),
        annotation: '(Peak continuous duration)',
        color: 'text-[#ff5a36]',
      });
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isEmptyWorkout ? onClose : undefined}
          className="fixed inset-0 bg-[#070913]/85 backdrop-blur-md"
        />

        {/* Modal Dialog Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 25 }}
          transition={{ type: 'spring', damping: 24, stiffness: 260 }}
          className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#111424]/95 p-6 sm:p-7 shadow-2xl backdrop-blur-xl z-10 overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="workout-summary-title"
        >
          {/* Decorative neon back-glow */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#ff5a36]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* EMPTY WORKOUT STATE: 0 reps */}
          {isEmptyWorkout ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3
                id="workout-summary-title"
                className="text-xl sm:text-2xl font-black text-white tracking-tight"
              >
                No Reps Recorded Yet
              </h3>
              <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                You ended the session before logging any completed {exerciseName.toLowerCase()}. Ready to jump back in and earn your first XP?
              </p>

              <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={onPlayAgain}
                  className="w-full sm:w-auto btn-coral px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-[#ff5a36]/25 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </button>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/exercises');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  Back to Exercises
                </button>
              </div>
            </div>
          ) : (
            /* COMPLETED WORKOUT SUMMARY STATE */
            <div>
              {/* Header with Title and Level Progression */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-5">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#ff5a36]">
                      {exerciseName} • Session Complete
                    </span>

                    {/* Rule 3: On first workout show "First record set!", else show "New Personal Best!" when record beaten */}
                    {isFirstRecord ? (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-blue-500/20 to-teal-500/20 border border-blue-400/40 text-blue-300 overflow-hidden"
                      >
                        <Sparkles className="w-3 h-3 text-cyan-300" />
                        First record set!
                      </motion.span>
                    ) : hasNewRecord ? (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-amber-400/20 to-[#ff5a36]/20 border border-amber-400/40 text-amber-300 overflow-hidden"
                      >
                        {/* Shine animation bar */}
                        <motion.span
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                          className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                        />
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        New Personal Best!
                      </motion.span>
                    ) : null}
                  </div>
                  <h3
                    id="workout-summary-title"
                    className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1"
                  >
                    Workout Summary
                  </h3>
                </div>

                {/* Level Before -> After badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 self-start sm:self-auto">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <div className="text-xs">
                    <span className="text-slate-400">Level: </span>
                    <span className="text-slate-200 font-bold">{levelBefore}</span>
                    <span className="text-[#ff5a36] font-bold mx-1.5">→</span>
                    <span className="text-emerald-400 font-extrabold">{levelAfter}</span>
                  </div>
                </div>
              </div>

              {/* Stat Highlights Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
                {/* Total Reps */}
                <div
                  className={`p-3.5 rounded-xl border backdrop-blur-sm transition-all ${
                    !isFirstRecord && newRecords.maxReps
                      ? 'bg-amber-400/10 border-amber-400/40 shadow-sm shadow-amber-400/15'
                      : 'bg-white/[0.03] border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
                    <span>Total Reps</span>
                    <Target className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{totalReps}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {goodReps} good • {shallowReps} {isSquat ? 'shallow' : 'partial'}
                  </div>
                  {!isFirstRecord && newRecords.maxReps && (
                    <span className="inline-block mt-1 text-[10px] font-bold text-amber-300">
                      ★ Record Reps!
                    </span>
                  )}
                </div>

                {/* Form Accuracy */}
                <div
                  className={`p-3.5 rounded-xl border backdrop-blur-sm transition-all ${
                    !isFirstRecord && newRecords.bestAccuracy
                      ? 'bg-emerald-400/10 border-emerald-400/40 shadow-sm shadow-emerald-400/15'
                      : 'bg-white/[0.03] border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
                    <span>Accuracy</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-emerald-400">{accuracy}%</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    good / total reps
                  </div>
                  {!isFirstRecord && newRecords.bestAccuracy && (
                    <span className="inline-block mt-1 text-[10px] font-bold text-emerald-300">
                      ★ Record Accuracy!
                    </span>
                  )}
                </div>

                {/* XP Earned */}
                <div
                  className={`p-3.5 rounded-xl border backdrop-blur-sm transition-all ${
                    !isFirstRecord && newRecords.maxXp
                      ? 'bg-[#ff5a36]/15 border-[#ff5a36]/40 shadow-sm shadow-[#ff5a36]/20'
                      : 'bg-white/[0.03] border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
                    <span>XP Earned</span>
                    <Zap className="w-3.5 h-3.5 text-[#ff5a36]" />
                  </div>
                  <div className="text-2xl font-black text-[#ff5a36]">+{xpEarned}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    gamified points
                  </div>
                  {!isFirstRecord && newRecords.maxXp && (
                    <span className="inline-block mt-1 text-[10px] font-bold text-amber-300">
                      ★ Record XP!
                    </span>
                  )}
                </div>

                {/* Duration */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
                    <span>Duration</span>
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{formatTime(durationSeconds)}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    active workout time
                  </div>
                </div>
              </div>

              {/* Exercise-Specific Telemetry Cards: Never show "--", hide if empty */}
              {metricCards.length > 0 && (
                <div className={`grid ${metricCards.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 mb-4`}>
                  {metricCards.map((card, idx) => (
                    <div key={idx}>
                      <span className="text-[11px] text-slate-400 font-medium block">
                        {card.label}
                      </span>
                      <div className={`text-base sm:text-lg font-bold ${card.color} mt-0.5 flex items-baseline gap-1`}>
                        <span>{card.value}</span>
                        {card.annotation && (
                          <span className="text-[11px] text-slate-500 font-normal">
                            {card.annotation}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Ghost Mode Result Showdown Card */}
              {summaryData.ghostMatch && summaryData.ghostRun && (
                <GhostResultCard
                  ghostMatch={summaryData.ghostMatch}
                  currentRun={summaryData.currentRun}
                  ghostRun={summaryData.ghostRun}
                  bonusXp={summaryData.ghostBonusXp || 0}
                />
              )}

              {/* Challenge Ladder Next Tier Unlock Banner */}
              {summaryData.nextTierUnlocked && (
                <div className="mb-4 p-3.5 rounded-xl bg-gradient-to-r from-purple-500/15 via-indigo-500/15 to-transparent border border-purple-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-purple-400" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block">
                        Ladder Tier Unlocked!
                      </span>
                      <span className="text-xs font-extrabold text-white">
                        Next Challenge Unlocked: {summaryData.nextTierUnlocked}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30">
                    Tier Progress
                  </span>
                </div>
              )}

              {/* Superpower Armed for Next Workout Card */}
              {summaryData.powerUnlocked && (
                <div className="mb-4 p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-[#ff5a36]/15 to-transparent border border-amber-400/40 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
                      <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                        Superpower Armed!
                      </span>
                      <span className="text-xs font-extrabold text-white">
                        {summaryData.powerUnlocked.name} ({summaryData.powerUnlocked.tagline || '1.5x XP Boost'})
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-gradient-to-r from-[#ff5a36] to-amber-400 text-white shadow-sm">
                    1.5x XP NEXT WORKOUT
                  </span>
                </div>
              )}

              {/* Newly Unlocked Badges Compact Strip */}
              {summaryData.newBadges && summaryData.newBadges.length > 0 && (
                <div className="mb-5 p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-[#ff5a36]/15 to-transparent border border-amber-500/30">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>New Badges Unlocked!</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {summaryData.newBadges.map((badge) => (
                      <div
                        key={badge.id}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-amber-400/30 text-white text-xs font-semibold"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>{badge.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Leaderboard Opt-In Toggle */}
              <div className="mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3">
                <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={optIn}
                    onChange={handleToggleOptIn}
                    className="w-4 h-4 rounded text-[#ff5a36] focus:ring-[#ff5a36] bg-black/40 border-white/20 cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#ff5a36]" />
                      <span>Show me on the public leaderboard</span>
                    </span>
                    <span className="text-slate-400 text-[11px] block">
                      Displays nickname, avatar, XP & streak.
                    </span>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    navigate('/exercises');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center gap-1.5"
                >
                  Back to Exercises
                </button>
                <button
                  onClick={onPlayAgain}
                  className="w-full sm:w-auto btn-coral px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-[#ff5a36]/25 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Play Again
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
