import React from 'react';
import { Eye, Check, X, AlertTriangle } from 'lucide-react';

export default function VisibilityPanel({
  visibility = {
    shoulders: false,
    hips: false,
    knees: false,
    ankles: false,
    elbows: false,
    wrists: false,
    allVisible: false,
    missingGroups: ['Shoulders', 'Hips', 'Knees', 'Ankles'],
  },
  isCameraActive = false,
  requiredBody = 'full',
}) {
  const groups =
    requiredBody === 'upper'
      ? [
          { id: 'shoulders', label: 'Shoulders', visible: visibility.shoulders },
          { id: 'elbows', label: 'Elbows', visible: visibility.elbows },
          { id: 'wrists', label: 'Wrists', visible: visibility.wrists },
        ]
      : [
          { id: 'shoulders', label: 'Shoulders', visible: visibility.shoulders },
          { id: 'hips', label: 'Hips', visible: visibility.hips },
          { id: 'knees', label: 'Knees', visible: visibility.knees },
          { id: 'ankles', label: 'Ankles', visible: visibility.ankles },
        ];

  let overallMessage = 'Start camera to verify body alignment.';
  let overallStyle = 'text-slate-400 bg-white/[0.02] border-white/5';

  if (isCameraActive) {
    if (visibility.allVisible) {
      overallMessage = 'Perfect framing! Full body in frame. Ready to train.';
      overallStyle = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25';
    } else if (visibility.missingGroups.length > 0) {
      overallMessage = `Step back: missing ${visibility.missingGroups.join(', ')}.`;
      overallStyle = 'text-amber-300 bg-amber-500/10 border-amber-500/25';
    } else {
      overallMessage = 'Looking for person in frame... Step into view.';
      overallStyle = 'text-red-300 bg-red-500/10 border-red-500/25';
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111424]/85 backdrop-blur-md p-5 shadow-lg transition-all hover:border-[#ff5a36]/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#ff5a36]/15 border border-[#ff5a36]/30 flex items-center justify-center text-[#ff5a36]">
            <Eye className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Body Visibility
          </span>
        </div>
        <span
          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
            visibility.allVisible && isCameraActive
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              : 'bg-white/5 text-slate-400 border-white/10'
          }`}
        >
          {isCameraActive && visibility.allVisible ? '100% In Frame' : 'Alignment Needed'}
        </span>
      </div>

      {/* Checklist grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {groups.map((group) => {
          const isItemActive = isCameraActive && group.visible;
          return (
            <div
              key={group.id}
              className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                isItemActive
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-black/40 border-white/5 text-slate-400'
              }`}
            >
              <span className="text-xs font-semibold">{group.label}</span>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  isItemActive
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/15 text-red-400'
                }`}
              >
                {isItemActive ? (
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall Guidance Message Banner */}
      <div className={`p-3 rounded-xl border text-xs leading-relaxed flex items-center gap-2.5 ${overallStyle}`}>
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>{overallMessage}</span>
      </div>
    </div>
  );
}
