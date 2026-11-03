import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Flame, 
  Trophy, 
  Zap, 
  Play, 
  RotateCcw, 
  Calendar, 
  Dumbbell, 
  Award,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  X,
  Ghost,
} from 'lucide-react';

import { usePlayer } from '../context/PlayerContext';
import { EXERCISES } from '../config/exercises';
import { recomputeProgressFromSessions } from '../utils/progressStorage';
import Container from '../components/Container';

export default function ProgressPage() {
  const navigate = useNavigate();
  const { player, resetPlayer } = usePlayer();
  const [sessions, setSessions] = useState([]);
  const [progress, setProgress] = useState({ totalXp: 0, level: 1, streak: 0, longestStreak: 0 });
  const [personalBest, setPersonalBest] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    loadLocalData();
  }, []);

  const loadLocalData = () => {
    try {
      const validatedProg = recomputeProgressFromSessions();
      if (validatedProg) {
        setProgress(validatedProg);
      }

      const sessRaw = localStorage.getItem('fq_sessions');
      if (sessRaw) {
        setSessions(JSON.parse(sessRaw));
      }

      const pbRaw = localStorage.getItem('fq_personal_best');
      if (pbRaw) {
        setPersonalBest(JSON.parse(pbRaw));
      }
    } catch (e) {
      console.warn('Failed to load progress from localStorage', e);
    }
  };

  const handleResetData = () => {
    try {
      // Clear all fq_* keys
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('fq_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.warn('Failed clearing fq_ keys', e);
    }

    resetPlayer();
    setSessions([]);
    setProgress({ totalXp: 0, level: 1, streak: 0, longestStreak: 0 });
    setPersonalBest(null);
    setShowResetModal(false);
  };

  const totalWorkouts = sessions.length;
  const totalReps = sessions.reduce((acc, s) => acc + (s.totalReps || s.reps || 0), 0);
  const xpNeeded = progress.level * 100;
  const currentXpInLevel = progress.totalXp % 100;
  const xpProgressPercent = Math.min(100, Math.round((currentXpInLevel / 100) * 100));

  // Compute XP over last 7 sessions for SVG Bar Chart
  const last7Sessions = [...sessions].slice(-7);
  const maxSessionXp = Math.max(...last7Sessions.map(s => s.xpEarned || s.xp || 10), 50);

  // Per-exercise personal bests
  const exercisePBs = EXERCISES.map(ex => {
    const exSessions = sessions.filter(s => s.exercise === ex.id);
    if (!exSessions.length) return null;
    const maxReps = Math.max(...exSessions.map(s => s.totalReps || s.reps || 0));
    const bestAcc = Math.max(...exSessions.map(s => s.accuracy || 0));
    return {
      exercise: ex,
      maxReps,
      bestAcc,
      count: exSessions.length
    };
  }).filter(Boolean);

  return (
    <div className="py-10 text-white min-h-[calc(100vh-4rem)]">
      <Container>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff5a36]/15 border border-[#ff5a36]/30 text-xs font-semibold text-[#ff5a36] uppercase tracking-wider mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Combat Telemetry
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              My Progress
            </h1>
            <p className="text-white/60 text-sm sm:text-base mt-1">
              Your verified offline workout history and performance metrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowResetModal(true)}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-white/60 hover:text-red-400 border border-white/10 hover:border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset My Data
            </button>
            <button
              onClick={() => navigate('/challenges')}
              className="px-4 py-2 rounded-xl bg-[#ff5a36] hover:bg-[#ff7455] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-[#ff5a36]/20"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Start Workout
            </button>
          </div>
        </div>

        {/* Empty State */}
        {sessions.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center max-w-xl mx-auto my-12">
            <div className="w-16 h-16 rounded-full bg-[#ff5a36]/15 text-[#ff5a36] flex items-center justify-center mx-auto mb-4 border border-[#ff5a36]/30">
              <Dumbbell className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No Workouts Recorded Yet</h2>
            <p className="text-sm text-white/60 mb-6 leading-relaxed">
              Step in front of the camera and complete your first challenge to activate combat stats, personal bests, and trophy badges.
            </p>
            <button
              onClick={() => navigate('/challenges')}
              className="px-6 py-3 rounded-xl bg-[#ff5a36] hover:bg-[#ff7455] text-white text-sm font-bold flex items-center gap-2 mx-auto shadow-lg shadow-[#ff5a36]/25 hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play Your First Challenge</span>
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stat Tiles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Level & XP */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center justify-between text-xs text-white/50 mb-2">
                  <span className="uppercase font-semibold tracking-wider">Level Status</span>
                  <Award className="w-4 h-4 text-[#ff5a36]" />
                </div>
                <div className="text-3xl font-extrabold text-white mb-1">
                  Lv {progress.level}
                </div>
                <div className="text-xs text-white/60 mb-3">
                  {currentXpInLevel} / 100 XP to Lv {progress.level + 1}
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#ff5a36] to-amber-400 rounded-full"
                    style={{ width: `${xpProgressPercent}%` }}
                  />
                </div>
              </div>

              {/* Total XP */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center justify-between text-xs text-white/50 mb-2">
                  <span className="uppercase font-semibold tracking-wider">Total XP</span>
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-extrabold text-white mb-1">
                  {progress.totalXp}
                </div>
                <div className="text-xs text-emerald-400 font-medium">
                  Verified Arena EXP
                </div>
              </div>

              {/* Streaks */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center justify-between text-xs text-white/50 mb-2">
                  <span className="uppercase font-semibold tracking-wider">Workout Streak</span>
                  <Flame className="w-4 h-4 text-[#ff5a36]" />
                </div>
                <div className="text-3xl font-extrabold text-white mb-1">
                  {progress.streak || 0} <span className="text-sm font-normal text-white/50">days</span>
                </div>
                <div className="text-xs text-white/60">
                  Best: {progress.longestStreak || progress.streak || 0} days
                </div>
              </div>

              {/* Reps & Workouts */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center justify-between text-xs text-white/50 mb-2">
                  <span className="uppercase font-semibold tracking-wider">Activity</span>
                  <Dumbbell className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-3xl font-extrabold text-white mb-1">
                  {totalReps} <span className="text-sm font-normal text-white/50">reps</span>
                </div>
                <div className="text-xs text-white/60">
                  Across {totalWorkouts} sessions
                </div>
              </div>
            </div>

            {/* Ghost Mode & AI Power Mode Feature Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 backdrop-blur-md">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                    <Ghost className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Ghost Mode</h4>
                    <p className="text-xs text-cyan-300 font-medium">Beat your previous self.</p>
                  </div>
                </div>
                <p className="text-xs text-white/60 leading-relaxed mb-2">
                  Race live against your saved reps and cadence from your last workout or all-time personal best.
                </p>
                <div className="text-[10px] text-white/40 italic">Saved in this browser only.</div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/20 backdrop-blur-md">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">AI Power Mode</h4>
                    <p className="text-xs text-amber-300 font-medium">Every rep charges your energy.</p>
                  </div>
                </div>
                <p className="text-xs text-white/60 leading-relaxed mb-2">
                  Maintain good biomechanical form to string together up to x5 combos and unlock 1.5x XP superpowers.
                </p>
                <div className="text-[10px] text-white/40 italic">Saved in this browser only.</div>
              </div>
            </div>

            {/* Performance Visualizer (SVG Bar Chart) & Personal Bests */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Last 7 Sessions XP Chart */}
              <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#ff5a36]" />
                    <span>XP Trend (Last 7 Sessions)</span>
                  </h3>
                  <p className="text-xs text-white/50 mb-6">
                    Consistency and progression intensity over recent workouts.
                  </p>
                </div>

                {/* SVG Bar Chart */}
                <div className="w-full h-44 flex items-end justify-between gap-3 pt-6 border-b border-white/10 pb-3">
                  {last7Sessions.map((s, idx) => {
                    const sessionXp = s.xpEarned || s.xp || 10;
                    const heightPercent = Math.max(12, Math.round((sessionXp / maxSessionXp) * 100));
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                        <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold bg-black/80 px-2 py-0.5 rounded text-[#ff5a36] pointer-events-none whitespace-nowrap border border-white/10">
                          +{sessionXp} XP ({s.exercise})
                        </div>
                        <div 
                          className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-[#ff5a36]/40 to-[#ff5a36] group-hover:brightness-125 transition-all"
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-[10px] text-white/40 truncate w-full text-center">
                          #{idx + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between items-center text-[11px] text-white/40 pt-2">
                  <span>Earliest session</span>
                  <span>Latest session</span>
                </div>
              </div>

              {/* Personal Bests by Exercise */}
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Personal Bests</span>
                </h3>
                <p className="text-xs text-white/50 mb-4">
                  Top verified performances by discipline.
                </p>

                <div className="space-y-3">
                  {exercisePBs.length > 0 ? (
                    exercisePBs.map((pb, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">{pb.exercise.name}</div>
                          <div className="text-[11px] text-white/50">
                            {pb.count} workout{pb.count > 1 ? 's' : ''} completed
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-extrabold text-[#ff5a36]">
                            {pb.maxReps} {pb.exercise.type === 'hold' ? 's' : 'reps'}
                          </div>
                          <div className="text-[10px] text-emerald-400">
                            {pb.bestAcc}% Accuracy
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-white/40 py-6 text-center">
                      Play more exercises to track discipline records.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Workouts List (Last 10) */}
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>Recent Workouts</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Date & Time</th>
                      <th className="pb-3 font-semibold">Exercise</th>
                      <th className="pb-3 font-semibold text-center">Reps / Hold</th>
                      <th className="pb-3 font-semibold text-center">Form Accuracy</th>
                      <th className="pb-3 font-semibold text-right">XP Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[...sessions]
                      .sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0))
                      .slice(0, 10)
                      .map((s, idx) => {
                        const rawDate = s.createdAt || s.date;
                        let dateStr = 'Recent';
                        if (rawDate) {
                          const d = new Date(rawDate);
                          if (!isNaN(d.getTime())) {
                            const day = d.getDate();
                            const month = d.toLocaleDateString('en-US', { month: 'short' });
                            const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                            dateStr = `${day} ${month}, ${time}`;
                          }
                        }
                        const repsVal = s.totalReps || s.reps || 0;
                        const goodVal = s.goodReps || 0;
                        const accVal = s.accuracy || 0;
                        const xpVal = s.xpEarned || s.xp || 0;

                        return (
                          <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 text-white/60">{dateStr}</td>
                            <td className="py-3 font-semibold text-white capitalize">{s.exercise || 'Squat'}</td>
                            <td className="py-3 text-center text-white">
                              <span className="font-bold">{repsVal}</span>
                              {goodVal > 0 && (
                                <span className="text-[10px] text-white/40 ml-1">({goodVal} good)</span>
                              )}
                            </td>
                          <td className="py-3 text-center">
                            <span className={`px-2 py-0.5 rounded font-semibold ${accVal >= 80 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                              {accVal}%
                            </span>
                          </td>
                          <td className="py-3 text-right font-bold text-[#ff5a36]">+{xpVal} XP</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Reset Confirmation Modal */}
        <AnimatePresence>
          {showResetModal && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
              role="dialog"
              aria-modal="true"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md p-6 rounded-2xl bg-[#0e1222] border border-red-500/30 text-white shadow-2xl space-y-4"
              >
                <div className="flex items-center gap-3 text-red-400">
                  <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Reset All Player Data?</h3>
                    <p className="text-xs text-white/60">This action cannot be undone.</p>
                  </div>
                </div>

                <p className="text-sm text-white/70 leading-relaxed">
                  Resetting will clear your local nickname, unlocked badges, lifetime XP, workout history, and personal records stored in this browser.
                </p>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    onClick={() => setShowResetModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResetData}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-lg shadow-red-600/30"
                  >
                    Confirm Reset
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </Container>
    </div>
  );
}
