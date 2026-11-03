import React from 'react';
import { EXERCISES } from '../config/exercises';

export default function ExerciseSelector({
  selectedExerciseId = 'squat',
  onSelectExercise,
  disabled = false,
}) {
  return (
    <div className="w-full mb-5">
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Select Discipline
        </span>
        {disabled && (
          <span className="text-[11px] text-amber-400/90 font-medium">
            Locked during active workout
          </span>
        )}
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {EXERCISES.map((ex) => {
          const Icon = ex.icon;
          const isSelected = ex.id === selectedExerciseId;

          return (
            <button
              key={ex.id}
              type="button"
              disabled={disabled}
              onClick={() => {
                if (!disabled && onSelectExercise) {
                  onSelectExercise(ex.id);
                }
              }}
              className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#ff5a36] ${
                isSelected
                  ? 'bg-gradient-to-r from-[#ff5a36] to-[#ff7a52] text-white shadow-lg shadow-[#ff5a36]/30 border border-white/20 scale-[1.02]'
                  : 'bg-[#111424]/85 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#ff5a36]'}`} />
              <span>{ex.name}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                  isSelected
                    ? 'bg-black/25 text-white'
                    : 'bg-white/5 text-slate-400'
                }`}
              >
                {ex.cameraView}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
