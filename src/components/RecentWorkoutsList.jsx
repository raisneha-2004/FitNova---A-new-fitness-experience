import React from 'react';
import { History, Calendar, CheckCircle2, Zap } from 'lucide-react';

/**
 * Formats ISO date string to readable date and time (e.g. "2 Nov, 12:05 PM")
 */
function formatShortDate(dateStr) {
  if (!dateStr) return 'Recent';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recent';

    const day = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    return `${day} ${month}, ${time}`;
  } catch {
    return 'Recent';
  }
}

export default function RecentWorkoutsList({ sessions = [] }) {
  const displaySessions = (sessions || []).slice(0, 5);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111424]/85 p-5 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide">
              Recent Workouts
            </h4>
            <span className="text-[11px] text-slate-400 block -mt-0.5">
              Last 5 completed sessions
            </span>
          </div>
        </div>

        <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-white/5 border border-white/5">
          {displaySessions.length} logged
        </span>
      </div>

      {displaySessions.length === 0 ? (
        <div className="text-center py-5 px-3 rounded-xl bg-white/[0.02] border border-white/5">
          <p className="text-xs text-slate-400">
            No completed workouts yet.
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Finish a squat session to see your history here!
          </span>
        </div>
      ) : (
        <div className="space-y-2">
          {displaySessions.map((session, idx) => (
            <div
              key={session.id || idx}
              className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 transition-all flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <span>{session.totalReps} Reps</span>
                  <span className="text-slate-500 text-[10px] font-normal">•</span>
                  <span className="text-emerald-400 font-semibold">{session.accuracy}% form</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>{formatShortDate(session.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#ff5a36]/10 border border-[#ff5a36]/20 text-[#ff5a36] font-bold">
                <Zap className="w-3 h-3" />
                <span>+{session.xpEarned} XP</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
