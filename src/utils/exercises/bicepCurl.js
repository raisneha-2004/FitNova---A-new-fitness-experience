import { getElbowAnglesFromLandmarks, isElbowFlaring } from '../bicepAngles';
import { smoothAngle } from '../angles';

/**
 * Bicep Curl State Machine Detector
 *
 * Rules:
 * - Elbow angle from shoulder (11, 12), elbow (13, 14), wrist (15, 16)
 * - Track the arm with higher visibility, or both arms (count a rep when either arm completes it)
 * - Extended: angle above 150°
 * - Curled: angle below 55° (good) or 55° to 80° (partial)
 * - One rep = extended -> curled -> extended
 * - Minimum time per rep: 0.8s
 * - Feedback:
 *   - "Curl a little higher" (when curling stops in partial range > 55°)
 *   - "Lower slowly, control the movement" (fast drop)
 *   - "Keep your elbow close to your body" (elbow x moves > 8% frame width from shoulder)
 * - Visibility check uses only shoulders, elbows and wrists (requiredBody: "upper")
 */

export const CURL_PHASES = {
  EXTENDED: 'EXTENDED',
  CURLING_UP: 'CURLING_UP',
  PEAK: 'PEAK',
  LOWERING: 'LOWERING',
};

export function createBicepCurlState() {
  return {
    phase: CURL_PHASES.EXTENDED,
    candidatePhase: CURL_PHASES.EXTENDED,
    consecutivePhaseFrames: 0,
    angleHistory: [],
    repStartTime: null,
    minAngleAchieved: 180,
    flaredDuringRep: false,
    lastFeedbackTime: 0,
    lastFeedbackText: '',
  };
}

/**
 * Step Bicep Curl Detector
 */
export function stepBicepCurlDetector(
  state,
  landmarks,
  isBodyDetected,
  config = {},
  now = performance.now()
) {
  const {
    extendedAngle = 150,
    curledGoodAngle = 55,
    curledPartialAngle = 80,
    minRepSeconds = 0.8,
    minFramesPerPhase = 6,
    smoothingFrames = 5,
    elbowFlareTolerance = 0.08,
  } = config;

  // Defensive state initialization
  const currentState = state || createBicepCurlState();
  let nextState = {
    ...currentState,
    angleHistory: Array.isArray(currentState.angleHistory) ? currentState.angleHistory : [],
  };
  let feedback = null;
  let repCompleted = null;

  const emitFeedback = (text, type = 'info') => {
    if (text === nextState.lastFeedbackText && now - nextState.lastFeedbackTime < 2000) {
      return;
    }
    nextState.lastFeedbackTime = now;
    nextState.lastFeedbackText = text;
    feedback = { text, type };
  };

  // Guard: User upper body in frame
  if (!landmarks || !isBodyDetected || landmarks.length < 17) {
    if (nextState.phase !== CURL_PHASES.EXTENDED) {
      emitFeedback('Adjust position, keep arms visible', 'warning');
      nextState.phase = CURL_PHASES.EXTENDED;
      nextState.candidatePhase = CURL_PHASES.EXTENDED;
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

  // 1. Get raw elbow angles and flare check
  const { bestAngle } = getElbowAnglesFromLandmarks(landmarks);
  if (bestAngle === null) {
    return { nextState, repCompleted: null, feedback, liveMetric: null };
  }

  const smoothed = Math.round(smoothAngle(nextState.angleHistory, bestAngle, smoothingFrames));

  // Check elbow flare
  const isFlaring = isElbowFlaring(landmarks, elbowFlareTolerance);
  if (isFlaring) {
    nextState.flaredDuringRep = true;
    emitFeedback('Keep your elbow close to your body', 'warning');
  }

  const currentPhase = nextState.phase;
  let candidate = currentPhase;

  // 2. State machine transitions based on elbow angle
  switch (currentPhase) {
    case CURL_PHASES.EXTENDED:
      if (smoothed <= curledPartialAngle + 15) {
        // Starts lifting forearm
        candidate = CURL_PHASES.CURLING_UP;
      }
      break;

    case CURL_PHASES.CURLING_UP:
      if (smoothed <= curledGoodAngle) {
        candidate = CURL_PHASES.PEAK;
      } else if (smoothed > curledPartialAngle + 20) {
        candidate = CURL_PHASES.LOWERING;
      }
      break;

    case CURL_PHASES.PEAK:
      if (smoothed > curledGoodAngle + 15) {
        candidate = CURL_PHASES.LOWERING;
      }
      break;

    case CURL_PHASES.LOWERING:
      if (smoothed >= extendedAngle) {
        candidate = CURL_PHASES.EXTENDED;
      } else if (smoothed < curledGoodAngle) {
        // User reversed direction without extending
        candidate = CURL_PHASES.CURLING_UP;
      }
      break;

    default:
      candidate = CURL_PHASES.EXTENDED;
  }

  // 3. Track rep minimum angle (lowest angle = highest curl point)
  if (currentPhase !== CURL_PHASES.EXTENDED) {
    if (smoothed < nextState.minAngleAchieved) {
      nextState.minAngleAchieved = smoothed;
    }
  }

  // 4. Consecutive frames verification
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

      // Start of rep: EXTENDED -> CURLING_UP
      if (prevPhase === CURL_PHASES.EXTENDED && candidate === CURL_PHASES.CURLING_UP) {
        nextState.repStartTime = now;
        nextState.minAngleAchieved = smoothed;
        nextState.flaredDuringRep = false;
      }

      // Completion of rep: LOWERING -> EXTENDED
      if (candidate === CURL_PHASES.EXTENDED && nextState.repStartTime !== null) {
        const repDuration = (now - nextState.repStartTime) / 1000;
        const peakAngle = nextState.minAngleAchieved;

        if (repDuration < minRepSeconds) {
          emitFeedback('Lower slowly, control the movement', 'warning');
        } else {
          const isGood = peakAngle <= curledGoodAngle;

          if (isGood) {
            emitFeedback('Great curl contraction!', 'good');
          } else if (peakAngle <= curledPartialAngle) {
            emitFeedback('Curl a little higher', 'shallow');
          } else {
            emitFeedback('Full range curl recommended', 'shallow');
          }

          repCompleted = {
            minAngle: peakAngle,
            duration: Number(repDuration.toFixed(2)),
            quality: isGood ? 'good' : 'partial',
          };
        }

        // Reset rep tracking
        nextState.repStartTime = null;
        nextState.minAngleAchieved = 180;
        nextState.flaredDuringRep = false;
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
