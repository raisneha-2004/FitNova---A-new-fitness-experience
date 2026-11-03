import React from 'react';
import { Ghost, Trophy, ArrowRight, Award, Zap } from 'lucide-react';

export default function GhostResultCard({
  ghostMatch = null, // { outcome, diff, text }
  currentRun = null,  // { reps, durationSeconds, accuracy }
  ghostRun = null,    // { reps, durationSeconds, accuracy }
  bonusXp = 0,
}) {
  if (!ghostMatch || !ghostRun) return null;

  const isWin = ghostMatch.outcome === 'win';
  const isTied = ghostMatch.outcome === 'tied';

  return (
    <div
      className={`p-4 rounded-2xl border transition-all my-4 ${
        isWin
          ? 'bg-gradient-to-r from-emerald-500/15 via-[#ff5a36]/10 to-transparent border-emerald-500/40 shadow-lg shadow-emerald-500/10'
          : isTied
          ? 'bg-amber-500/10 border-amber-500/30'
          : 'bg-white/[0.03] border-white/10'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isWin
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                : 'bg-white/10 text-cyan-300'
            }`}
          >
            <Ghost className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Ghost Mode Showdown
            </span>
            <h4
              className={`text-base font-extrabold ${
                isWin ? 'text-emerald-400' : isTied ? 'text-amber-300' : 'text-slate-200'
              }`}
            >
              {ghostMatch.text}
            </h4>
          </div>
        </div>

        {isWin && bonusXp > 0 && (
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-[#ff5a36] text-white shadow-md shadow-[#ff5a36]/30 flex items-center gap-1">
            <Zap className="w-3 h-3 fill-current" />
            +{bonusXp} XP Bonus
          </span>
        )}
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-white/5 text-center text-xs">
        <div className="p-2 rounded-lg bg-black/30">
          <span className="text-[10px] text-slate-400 block mb-0.5">Reps</span>
          <div className="font-bold text-white flex items-center justify-center gap-1">
            <span className={isWin ? 'text-emerald-400 font-extrabold' : ''}>{currentRun?.totalReps || 0}</span>
            <span className="text-slate-500">vs</span>
            <span className="text-cyan-300">{ghostRun?.reps || 0}</span>
          </div>
        </div>

        <div className="p-2 rounded-lg bg-black/30">
          <span className="text-[10px] text-slate-400 block mb-0.5">Accuracy</span>
          <div className="font-bold text-white flex items-center justify-center gap-1">
            <span>{currentRun?.accuracy || 0}%</span>
            <span className="text-slate-500">vs</span>
            <span className="text-cyan-300">{ghostRun?.accuracy || 0}%</span>
          </div>
        </div>

        <div className="p-2 rounded-lg bg-black/30">
          <span className="text-[10px] text-slate-400 block mb-0.5">Time</span>
          <div className="font-bold text-white flex items-center justify-center gap-1">
            <span>{currentRun?.durationSeconds || 0}s</span>
            <span className="text-slate-500">vs</span>
            <span className="text-cyan-300">{ghostRun?.durationSeconds || 0}s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
