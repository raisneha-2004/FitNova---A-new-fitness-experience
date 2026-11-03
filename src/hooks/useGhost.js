import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  getExerciseGhost, 
  loadGhostModeSetting, 
  saveGhostModeSetting, 
  calculateGhostTarget 
} from '../utils/ghost';

/**
 * useGhost Hook
 * Manages Ghost Mode activation, source selection (last vs best),
 * target suggestions, and real-time playback during active workouts.
 */
export function useGhost(exerciseId, isWorkoutActive, isHold = false) {
  const [ghostModeEnabled, setGhostModeEnabled] = useState(loadGhostModeSetting);
  const [ghostSource, setGhostSource] = useState('last'); // 'last' | 'best'
  const [exerciseGhosts, setExerciseGhosts] = useState(() => getExerciseGhost(exerciseId));

  // Reload ghost when exerciseId changes
  useEffect(() => {
    setExerciseGhosts(getExerciseGhost(exerciseId));
  }, [exerciseId]);

  const toggleGhostMode = useCallback(() => {
    setGhostModeEnabled((prev) => {
      const next = !prev;
      saveGhostModeSetting(next);
      return next;
    });
  }, []);

  // Pick active ghost run
  const activeGhostRun = exerciseGhosts ? (ghostSource === 'best' ? (exerciseGhosts.best || exerciseGhosts.last) : (exerciseGhosts.last || exerciseGhosts.best)) : null;

  // Real-time playback during workout
  const [ghostCurrentReps, setGhostCurrentReps] = useState(0);
  const [ghostPulsing, setGhostPulsing] = useState(false);
  const workoutStartTimeRef = useRef(null);
  const nextRepIndexRef = useRef(0);
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (!isWorkoutActive || !ghostModeEnabled || !activeGhostRun) {
      setGhostCurrentReps(0);
      setGhostPulsing(false);
      nextRepIndexRef.current = 0;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    // Workout active: track ghost progress in real time
    workoutStartTimeRef.current = performance.now();
    nextRepIndexRef.current = 0;
    setGhostCurrentReps(0);

    const repTimes = activeGhostRun.repTimes || [];
    const totalGhostReps = activeGhostRun.reps || 0;
    const ghostDuration = activeGhostRun.durationSeconds || (totalGhostReps * 2.5);

    function tick() {
      const elapsedSeconds = (performance.now() - workoutStartTimeRef.current) / 1000;

      if (isHold) {
        // For hold exercises: progress is elapsed hold time capped at previous hold
        const currentHeld = Math.min(totalGhostReps, Math.floor(elapsedSeconds));
        setGhostCurrentReps(currentHeld);
      } else {
        // For reps: advance when elapsed time crosses repTimes[i]
        let i = nextRepIndexRef.current;
        let advanced = false;

        while (i < repTimes.length && elapsedSeconds >= repTimes[i]) {
          i++;
          advanced = true;
        }

        // Fallback if repTimes array is empty but reps > 0: simulate even cadence
        if (repTimes.length === 0 && totalGhostReps > 0) {
          const repInterval = Math.max(0.8, ghostDuration / totalGhostReps);
          i = Math.min(totalGhostReps, Math.floor(elapsedSeconds / repInterval));
          if (i > nextRepIndexRef.current) advanced = true;
        }

        if (advanced) {
          nextRepIndexRef.current = i;
          setGhostCurrentReps(i);
          setGhostPulsing(true);
          setTimeout(() => setGhostPulsing(false), 300);
        }
      }

      animFrameRef.current = requestAnimationFrame(tick);
    }

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isWorkoutActive, ghostModeEnabled, activeGhostRun, isHold]);

  const suggestedTarget = activeGhostRun ? calculateGhostTarget(activeGhostRun, isHold) : null;

  return {
    ghostModeEnabled,
    toggleGhostMode,
    ghostSource,
    setGhostSource,
    activeGhostRun,
    suggestedTarget,
    ghostCurrentReps,
    ghostPulsing,
    refreshGhosts: () => setExerciseGhosts(getExerciseGhost(exerciseId)),
  };
}
