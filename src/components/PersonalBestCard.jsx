import React from 'react';
import { Award, Flame, Zap, Target, Sparkles } from 'lucide-react';

export default function PersonalBestCard({ personalBest, longestStreak, exerciseName = 'Bodyweight Squat' }) {
  // Support both per-exercise object and direct metric object
  const pb = personalBest || {
    maxReps: 0,
    maxXp: 0,
    bestAccuracy: 0,
  };

  const streakDisplay = longestStreak || 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111424]/85 p-5 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide">
              Personal Best
            </h4>
            <span className="text-[11px] text-[#ff5a36] font-semibold block -mt-0.5">
              {exerciseName}
            </span>
          </div>
        </div>

        <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Hall of Fame
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {/* Max Reps */}
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Target className="w-3.5 h-3.5 text-blue-400" />
            <span>Max Reps</span>
          </div>
          <div className="text-lg font-black text-white">
            {pb.maxReps || 0}
            <span className="text-xs font-normal text-slate-400 ml-1">reps</span>
          </div>
        </div>

        {/* Max XP */}
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Zap className="w-3.5 h-3.5 text-[#ff5a36]" />
            <span>Max XP</span>
          </div>
          <div className="text-lg font-black text-[#ff5a36]">
            {pb.maxXp || 0}
            <span className="text-xs font-normal text-slate-400 ml-1">pts</span>
          </div>
        </div>

        {/* Best Accuracy */}
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>Best Form</span>
          </div>
          <div className="text-lg font-black text-emerald-400">
            {pb.bestAccuracy || 0}%
          </div>
        </div>

        {/* Longest Streak */}
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Longest Streak</span>
          </div>
          <div className="text-lg font-black text-amber-400">
            {streakDisplay}
            <span className="text-xs font-normal text-slate-400 ml-1">days</span>
          </div>
        </div>
      </div>
    </div>
  );
}
