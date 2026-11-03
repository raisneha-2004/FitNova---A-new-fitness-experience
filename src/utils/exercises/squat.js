import { getKneeAngleFromLandmarks, smoothAngle } from '../angles';

export const SQUAT_PHASES = {
  STANDING: 'STANDING',
  GOING_DOWN: 'GOING_DOWN',
  BOTTOM: 'BOTTOM',
  COMING_UP: 'COMING_UP',
};

/**
 * Creates initial state for squat detector
 */
export function createSquatState() {
  return {
    phase: SQUAT_PHASES.STANDING,
    candidatePhase: SQUAT_PHASES.STANDING,
    consecutivePhaseFrames: 0,
    angleHistory: [],
    repStartTime: null,
    minAngleAchieved: 180,
    lastFeedbackTime: 0,
    lastFeedbackText: '',
  };
}

/**
 * Pure state machine step for Squat.
 * Takes current state, landmarks, visibility check, config, and current timestamp.
 * Returns { nextState, repCompleted: null | { minAngle, duration, quality }, feedback, liveMetric }
 */
export function stepSquatDetector(state, landmarks, isBodyDetected, config = {}, now = performance.now()) {
  const {
    standingAngle = 160,
    goodDepthAngle = 100,
    shallowAngle = 125,
    minRepSeconds = 0.8,
    minFramesPerPhase = 6,
    smoothingFrames = 5,
  } = config;

  let nextState = { ...state };
  let feedback = null;
  let repCompleted = null;

  // Helper for rate-limited feedback
  const emitFeedback = (text, type = 'info') => {
    if (text === nextState.lastFeedbackText && now - nextState.lastFeedbackTime < 2000) {
      return;
    }
    nextState.lastFeedbackTime = now;
    nextState.lastFeedbackText = text;
    feedback = { text, type };
  };

  // Rule: If user leaves the frame mid-rep, discard and alert
  if (!landmarks || !isBodyDetected) {
    if (nextState.phase !== SQUAT_PHASES.STANDING) {
      emitFeedback('Move back, full body not visible', 'warning');
      nextState.phase = SQUAT_PHASES.STANDING;
      nextState.candidatePhase = SQUAT_PHASES.STANDING;
      nextState.consecutivePhaseFrames = 0;
      nextState.repStartTime = null;
      nextState.minAngleAchieved = 180;
    }
    return {
      nextState,
      repCompleted: null,
      feedback,
      liveMetric: null,
    };
  }

  // 1. Calculate raw and smoothed knee angle
  const rawAngle = getKneeAngleFromLandmarks(landmarks);
  if (rawAngle === null) {
    return { nextState, repCompleted: null, feedback, liveMetric: null };
  }

  const smoothed = Math.round(smoothAngle(nextState.angleHistory, rawAngle, smoothingFrames));

  const currentPhase = nextState.phase;
  let candidate = currentPhase;

  // 2. State machine transitions based on knee angle hysteresis
  switch (currentPhase) {
    case SQUAT_PHASES.STANDING:
      if (smoothed < shallowAngle) {
        candidate = SQUAT_PHASES.GOING_DOWN;
      }
      break;

    case SQUAT_PHASES.GOING_DOWN:
      if (smoothed <= goodDepthAngle) {
        candidate = SQUAT_PHASES.BOTTOM;
      } else if (smoothed > shallowAngle + 5) {
        candidate = SQUAT_PHASES.COMING_UP;
      }
      break;

    case SQUAT_PHASES.BOTTOM:
      if (smoothed > goodDepthAngle + 8) {
        candidate = SQUAT_PHASES.COMING_UP;
      }
      break;

    case SQUAT_PHASES.COMING_UP:
      if (smoothed >= standingAngle) {
        candidate = SQUAT_PHASES.STANDING;
      } else if (smoothed < goodDepthAngle) {
        emitFeedback('Stand fully tall between reps', 'warning');
      }
      break;

    default:
      candidate = SQUAT_PHASES.STANDING;
  }

  // 3. Track rep minimum angle
  if (currentPhase !== SQUAT_PHASES.STANDING) {
    if (smoothed < nextState.minAngleAchieved) {
      nextState.minAngleAchieved = smoothed;
    }
  }

  // 4. Consecutive frame hysteresis verification
  if (candidate !== currentPhase) {
    if (nextState.candidatePhase === candidate) {
      nextState.consecutivePhaseFrames += 1;
    } else {
      nextState.candidatePhase = candidate;
      nextState.consecutivePhaseFrames = 1;
    }

    if (nextState.consecutivePhaseFrames >= minFramesPerPhase) {
      const prevPhase = currentPhase;
      nextState.phase = candidate;
      nextState.consecutivePhaseFrames = 0;

      // Phase Transition: STANDING -> GOING_DOWN (Start of rep)
      if (prevPhase === SQUAT_PHASES.STANDING && candidate === SQUAT_PHASES.GOING_DOWN) {
        nextState.repStartTime = now;
        nextState.minAngleAchieved = smoothed;
      }

      // Phase Transition: COMING_UP -> STANDING (Completion of rep)
      if (prevPhase === SQUAT_PHASES.COMING_UP && candidate === SQUAT_PHASES.STANDING) {
        if (nextState.repStartTime !== null) {
          const repDuration = (now - nextState.repStartTime) / 1000;
          const minAngle = nextState.minAngleAchieved;

          if (repDuration < minRepSeconds) {
            emitFeedback('Slow down, keep it controlled', 'warning');
          } else {
            const isGood = minAngle <= goodDepthAngle;
            if (isGood) {
              emitFeedback('Nice depth, keep it up', 'good');
            } else {
              emitFeedback('Try going a little lower', 'shallow');
            }

            repCompleted = {
              minAngle,
              duration: Number(repDuration.toFixed(2)),
              quality: isGood ? 'good' : 'partial',
            };
          }

          nextState.repStartTime = null;
          nextState.minAngleAchieved = 180;
        }
      }
    }
  } else {
    nextState.consecutivePhaseFrames = 0;
  }

  return {
    nextState,
    repCompleted,
    feedback,
    liveMetric: smoothed,
  };
}
