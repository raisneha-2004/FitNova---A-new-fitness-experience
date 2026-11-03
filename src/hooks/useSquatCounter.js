import { useRef, useState, useCallback } from 'react';
import { GAME_CONFIG } from '../config/gameConfig';
import { getKneeAngleFromLandmarks, smoothAngle } from '../utils/angles';

/**
 * State machine phases for Bodyweight Squat:
 * STANDING -> GOING_DOWN -> BOTTOM -> COMING_UP -> STANDING
 */
export const SQUAT_PHASES = {
  STANDING: 'STANDING',
  GOING_DOWN: 'GOING_DOWN',
  BOTTOM: 'BOTTOM',
  COMING_UP: 'COMING_UP',
};

/**
 * Custom Hook: useSquatCounter
 *
 * Implements a robust state-machine squat rep counter with:
 * - Hysteresis & consecutive frame threshold (default 6 frames)
 * - Angle smoothing window (5 frames moving average)
 * - Minimum rep duration guard (0.8s) to prevent gaming and fast bounces
 * - Rep classification: 'good' (< 100°) or 'shallow' (100° - 125°)
 * - Feedback throttling (no repeat message within 2 seconds)
 * - Safe reset on workout start or camera disconnection
 * - Internal angle/phase stored in refs for smooth animation; React state updated
 *   only when rep count, phase label, or feedback message changes.
 */
export function useSquatCounter({
  isWorkoutActive = false,
  bodyStatus = null,
  onRepCounted = null,
}) {
  // UI-facing React states
  const [reps, setReps] = useState(0);
  const [phase, setPhase] = useState(SQUAT_PHASES.STANDING);
  const [currentAngle, setCurrentAngle] = useState(180);
  const [feedback, setFeedback] = useState(null); // { text, type: 'good'|'shallow'|'warning'|'info' }
  const [repHistory, setRepHistory] = useState([]); // [{ id, minAngle, duration, quality }]

  // Performance Refs (avoids rerendering entire tree 60fps unless state changes)
  const angleHistoryRef = useRef([]);
  const currentPhaseRef = useRef(SQUAT_PHASES.STANDING);
  const consecutivePhaseFramesRef = useRef(0);
  const candidatePhaseRef = useRef(SQUAT_PHASES.STANDING);

  // Rep tracking metrics
  const repStartTimeRef = useRef(null);
  const repMinAngleRef = useRef(180);

  // Feedback throttling refs
  const lastFeedbackTimeRef = useRef(0);
  const lastFeedbackTextRef = useRef('');

  // Helper to trigger rate-limited feedback
  const emitFeedback = useCallback((text, type = 'info') => {
    const now = performance.now();
    // Do not repeat the same message more than once every 2 seconds
    if (text === lastFeedbackTextRef.current && now - lastFeedbackTimeRef.current < 2000) {
      return;
    }

    lastFeedbackTimeRef.current = now;
    lastFeedbackTextRef.current = text;
    setFeedback({ text, type });
  }, []);

  // Reset all state machine metrics
  const resetCounter = useCallback(() => {
    angleHistoryRef.current = [];
    currentPhaseRef.current = SQUAT_PHASES.STANDING;
    consecutivePhaseFramesRef.current = 0;
    candidatePhaseRef.current = SQUAT_PHASES.STANDING;
    repStartTimeRef.current = null;
    repMinAngleRef.current = 180;
    lastFeedbackTimeRef.current = 0;
    lastFeedbackTextRef.current = '';

    setReps(0);
    setPhase(SQUAT_PHASES.STANDING);
    setCurrentAngle(180);
    setFeedback(null);
    setRepHistory([]);
  }, []);

  /**
   * Process a new video frame's pose landmarks
   */
  const processFrame = useCallback(
    (landmarks) => {
      // Rule: Count only when workout is started
      if (!isWorkoutActive) {
        return;
      }

      // Check body visibility status
      const isBodyDetected =
        bodyStatus && (bodyStatus.statusCode === 'READY' || bodyStatus.statusText === 'Body Detected');

      // Rule: If user leaves the frame mid-rep, discard it and alert user
      if (!landmarks || !isBodyDetected) {
        if (currentPhaseRef.current !== SQUAT_PHASES.STANDING) {
          emitFeedback('Move back, full body not visible', 'warning');
          currentPhaseRef.current = SQUAT_PHASES.STANDING;
          candidatePhaseRef.current = SQUAT_PHASES.STANDING;
          consecutivePhaseFramesRef.current = 0;
          repStartTimeRef.current = null;
          repMinAngleRef.current = 180;
          setPhase(SQUAT_PHASES.STANDING);
        }
        return;
      }

      // 1. Calculate raw and smoothed knee angle
      const rawKneeAngle = getKneeAngleFromLandmarks(landmarks);
      if (rawKneeAngle === null) {
        return;
      }

      const smoothed = Math.round(
        smoothAngle(angleHistoryRef.current, rawKneeAngle, GAME_CONFIG.smoothingFrames)
      );

      // Keep currentAngle state updated for live camera badge
      setCurrentAngle((prev) => (Math.abs(prev - smoothed) >= 1 ? smoothed : prev));

      const { standingAngle, goodDepthAngle, shallowAngle, minFramesPerPhase, minRepSeconds } =
        GAME_CONFIG;

      const currentPhase = currentPhaseRef.current;
      let nextCandidatePhase = currentPhase;

      // 2. Determine target phase based on angle hysteresis
      switch (currentPhase) {
        case SQUAT_PHASES.STANDING:
          // User begins lowering hips below the shallow angle
          if (smoothed < shallowAngle) {
            nextCandidatePhase = SQUAT_PHASES.GOING_DOWN;
          }
          break;

        case SQUAT_PHASES.GOING_DOWN:
          // User reaches bottom inflection (< 100 for good depth or lowest point)
          if (smoothed <= goodDepthAngle) {
            nextCandidatePhase = SQUAT_PHASES.BOTTOM;
          } else if (smoothed > shallowAngle + 5) {
            // Aborted descent or pushing back up before reaching bottom
            nextCandidatePhase = SQUAT_PHASES.COMING_UP;
          }
          break;

        case SQUAT_PHASES.BOTTOM:
          // User starts pushing upward
          if (smoothed > goodDepthAngle + 8) {
            nextCandidatePhase = SQUAT_PHASES.COMING_UP;
          }
          break;

        case SQUAT_PHASES.COMING_UP:
          // User ascends back to tall standing posture
          if (smoothed >= standingAngle) {
            nextCandidatePhase = SQUAT_PHASES.STANDING;
          } else if (smoothed < goodDepthAngle) {
            // User went back down before completing the standing phase
            emitFeedback('Stand fully tall between reps', 'warning');
          }
          break;

        default:
          nextCandidatePhase = SQUAT_PHASES.STANDING;
      }

      // 3. Track rep minimum angle
      if (currentPhase !== SQUAT_PHASES.STANDING) {
        if (smoothed < repMinAngleRef.current) {
          repMinAngleRef.current = smoothed;
        }
      }

      // 4. Hysteresis frame verification
      if (nextCandidatePhase !== currentPhase) {
        if (candidatePhaseRef.current === nextCandidatePhase) {
          consecutivePhaseFramesRef.current += 1;
        } else {
          candidatePhaseRef.current = nextCandidatePhase;
          consecutivePhaseFramesRef.current = 1;
        }

        // Must sustain the candidate phase for required consecutive frames
        if (consecutivePhaseFramesRef.current >= minFramesPerPhase) {
          const prevPhase = currentPhase;
          currentPhaseRef.current = nextCandidatePhase;
          consecutivePhaseFramesRef.current = 0;
          setPhase(nextCandidatePhase);

          const now = performance.now();

          // Phase Transition: STANDING -> GOING_DOWN (Start of rep)
          if (prevPhase === SQUAT_PHASES.STANDING && nextCandidatePhase === SQUAT_PHASES.GOING_DOWN) {
            repStartTimeRef.current = now;
            repMinAngleRef.current = smoothed;
          }

          // Phase Transition: COMING_UP -> STANDING (Completion of rep)
          if (prevPhase === SQUAT_PHASES.COMING_UP && nextCandidatePhase === SQUAT_PHASES.STANDING) {
            if (repStartTimeRef.current !== null) {
              const repDuration = (now - repStartTimeRef.current) / 1000;
              const minAngleAchieved = repMinAngleRef.current;

              // Check if completed too fast (bounce/gaming)
              if (repDuration < minRepSeconds) {
                emitFeedback('Slow down, keep it controlled', 'warning');
              } else {
                // Classify rep quality based on minAngle achieved
                const isGood = minAngleAchieved <= goodDepthAngle;
                const isShallow = minAngleAchieved > goodDepthAngle && minAngleAchieved <= shallowAngle;

                if (isGood) {
                  emitFeedback('Nice depth, keep it up', 'good');
                } else if (isShallow) {
                  emitFeedback('Try going a little lower', 'shallow');
                }

                // Increment rep counter only on valid full cycles
                const newRepCount = reps + 1;
                setReps((prev) => prev + 1);

                const repData = {
                  id: Date.now(),
                  repNumber: newRepCount,
                  minAngle: minAngleAchieved,
                  duration: Number(repDuration.toFixed(2)),
                  quality: isGood ? 'good' : 'shallow',
                };

                setRepHistory((prev) => [...prev, repData]);

                if (typeof onRepCounted === 'function') {
                  onRepCounted(repData);
                }
              }

              // Reset rep tracking registers
              repStartTimeRef.current = null;
              repMinAngleRef.current = 180;
            }
          }
        }
      } else {
        consecutivePhaseFramesRef.current = 0;
      }
    },
    [isWorkoutActive, bodyStatus, emitFeedback]
  );

  return {
    reps,
    phase,
    currentAngle,
    feedback,
    repHistory,
    processFrame,
    resetCounter,
  };
}
