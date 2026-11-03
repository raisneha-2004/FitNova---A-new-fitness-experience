import React, { useState } from 'react';
import { Dumbbell, Target, Check, Ghost } from 'lucide-react';
import GhostRaceBar from './GhostRaceBar';

const PRESET_CHIPS = [5, 10, 15, 20];

export default function WorkoutPanel({
  exerciseName = 'Bodyweight Squat',
  exerciseDescription = 'Full squat depth with hip crease below knees. Keep chest tall.',
  exerciseType = 'reps',
  targetOptions = [5, 10, 15, 20],
  currentReps = 0,
  targetReps = 10,
  onTargetRepsChange = null,
  isWorkoutActive = false,
  isPaused = false,
  // Ghost Mode props
  ghostModeEnabled = true,
  onToggleGhostMode = null,
  ghostSource = 'last',
  onToggleGhostSource = null,
  activeGhostRun = null,
  ghostCurrentReps = 0,
  ghostPulsing = false,
  ghostSuggestedTarget = null,
  combo = 1,
}) {
  const isHold = exerciseType === 'hold';
  const unitLabel = isHold ? 's' : 'reps';
  const fullUnitLabel = isHold ? 'Seconds' : 'Repetitions';
  const percentage = Math.min(100, Math.round((currentReps / (targetReps || 1)) * 100));
  const presetChips = targetOptions && targetOptions.length > 0 ? targetOptions : [5, 10, 15, 20];
  const [isCustomMode, setIsCustomMode] = useState(!presetChips.includes(targetReps));
  const [customVal, setCustomVal] = useState(String(targetReps));

  const handleChipSelect = (val) => {
    if (isWorkoutActive) return;
    setIsCustomMode(false);
    setCustomVal(String(val));
    if (onTargetRepsChange) onTargetRepsChange(val);
  };

  const handleCustomChange = (e) => {
    if (isWorkoutActive) return;
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setCustomVal(raw);
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num >= 1 && num <= 100) {
      if (onTargetRepsChange) onTargetRepsChange(num);
    }
  };

  const handleCustomBlur = () => {
    let num = parseInt(customVal, 10);
    if (isNaN(num) || num < 1) num = 1;
    if (num > 100) num = 100;
    setCustomVal(String(num));
    if (onTargetRepsChange) onTargetRepsChange(num);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111424]/85 backdrop-blur-md p-5 shadow-lg transition-all hover:border-[#ff5a36]/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#ff5a36]/15 border border-[#ff5a36]/30 flex items-center justify-center text-[#ff5a36]">
            <Dumbbell className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Current Workout
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Ghost Mode Toggle */}
          <button
            type="button"
            onClick={onToggleGhostMode}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border ${
              ghostModeEnabled
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
            }`}
            title="Ghost Mode: Race against your previous workout or PB"
          >
            <Ghost className="w-3.5 h-3.5" />
            <span>Ghost {ghostModeEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {isWorkoutActive && (
            isPaused ? (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                Paused
              </span>
            ) : (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#ff5a36]/15 text-[#ff5a36] border border-[#ff5a36]/30 animate-pulse">
                Active
              </span>
            )
          )}
        </div>
      </div>

      {/* Exercise Title */}
      <div className="mb-4">
        <h3 className="text-lg font-extrabold text-white tracking-tight">
          {exerciseName}
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          {exerciseDescription}
        </p>

        {/* Ghost Context Hint */}
        {ghostModeEnabled && (
          <div className="mt-2.5 flex items-center justify-between text-[11px] bg-cyan-950/40 border border-cyan-500/20 rounded-lg p-2 text-cyan-200">
            <span>
              {activeGhostRun
                ? `Ghost: ${activeGhostRun.reps} reps. Beat it with ${ghostSuggestedTarget || activeGhostRun.reps + 2}!`
                : 'No ghost yet. Set your first record!'}
            </span>

            {activeGhostRun && (
              <div className="flex items-center gap-1 text-[10px]">
                <button
                  type="button"
                  disabled={isWorkoutActive}
                  onClick={() => onToggleGhostSource && onToggleGhostSource('last')}
                  className={`px-1.5 py-0.5 rounded font-semibold ${
                    ghostSource === 'last' ? 'bg-cyan-500 text-black font-bold' : 'text-cyan-300 hover:text-white'
                  }`}
                >
                  Last
                </button>
                <button
                  type="button"
                  disabled={isWorkoutActive}
                  onClick={() => onToggleGhostSource && onToggleGhostSource('best')}
                  className={`px-1.5 py-0.5 rounded font-semibold ${
                    ghostSource === 'best' ? 'bg-cyan-500 text-black font-bold' : 'text-cyan-300 hover:text-white'
                  }`}
                >
                  PB
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Live Ghost Race Bar (Visible when Ghost Mode ON and Workout Active) */}
      {isWorkoutActive && ghostModeEnabled && activeGhostRun && (
        <div className="mb-4">
          <GhostRaceBar
            currentReps={currentReps}
            ghostReps={ghostCurrentReps}
            targetReps={targetReps}
            ghostPulsing={ghostPulsing}
          />
        </div>
      )}

      {/* Target Reps Selector */}
      <div className="mb-4 p-3.5 rounded-xl bg-black/30 border border-white/5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-[#ff5a36]" />
            {isHold ? 'Target Hold' : 'Target Reps'}
          </label>
          <span className="text-[11px] text-slate-400">
            {isWorkoutActive ? 'Locked during workout' : `Choose or type (1-120${unitLabel})`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {presetChips.map((chipVal) => {
            const isSelected = !isCustomMode && targetReps === chipVal;
            return (
              <button
                key={chipVal}
                type="button"
                disabled={isWorkoutActive}
                onClick={() => handleChipSelect(chipVal)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-[#ff5a36] text-white shadow-md shadow-[#ff5a36]/30 scale-105'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10'
                } ${isWorkoutActive ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              >
                {chipVal} {unitLabel}
              </button>
            );
          })}

          {/* Custom Target Input */}
          <div className="flex items-center gap-1.5 ml-auto">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={customVal}
              disabled={isWorkoutActive}
              onFocus={() => setIsCustomMode(true)}
              onChange={handleCustomChange}
              onBlur={handleCustomBlur}
              placeholder="Custom"
              maxLength={3}
              className={`w-16 px-2.5 py-1 rounded-lg text-xs font-bold text-center bg-black/50 border transition-all focus:outline-none focus:ring-1 focus:ring-[#ff5a36] ${
                isCustomMode
                  ? 'border-[#ff5a36] text-[#ff5a36] bg-[#ff5a36]/10'
                  : 'border-white/15 text-slate-200'
              } ${isWorkoutActive ? 'cursor-not-allowed opacity-60' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* Reps Counter & Target Status */}
      <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] uppercase text-slate-400 font-bold tracking-wider">
            {fullUnitLabel}
          </span>
          <div className="text-3xl font-extrabold text-white tracking-tight mt-0.5">
            <span className="text-[#ff5a36]">{currentReps}</span>
            <span className="text-slate-500 text-xl font-medium"> / {targetReps}{isHold ? 's' : ''}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="inline-flex items-center gap-1 text-xs text-slate-300 font-medium">
            <Target className="w-3.5 h-3.5 text-[#ff5a36]" />
            Goal: {targetReps} {unitLabel}
          </span>
          <span className="text-xs font-bold text-slate-400 mt-1">{percentage}% completed</span>
        </div>
      </div>

      {/* Animated Orange Progress Bar */}
      <div>
        <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
          <div
            className="h-full rounded-full bg-[#ff5a36] transition-all duration-500 shadow-sm shadow-[#ff5a36]/40"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

