import { calculateAngle, smoothAngle } from '../angles.js';

/**
 * Butt Kicks State Machine Detector
 *
 * Rules:
 * - Type: "reps" (Side or Front view, full body)
 * - A kick counts when:
 *   1. Knee flexion angle of a leg goes below 60 degrees (heel close to glute)
 *      OR the ankle y rises above the knee y of the same leg (ankle.y < knee.y).
 *   2. The leg returns to extended (angle above 120).
 * - Track left and right legs separately.
 * - Minimum 0.25s between counts (hysteresis, 4 consecutive frames).
 * - Quality:
 *   - "good" when the angle goes below 45 degrees
 *   - "partial" for 45 to 60 degrees
 * - Feedback:
 *   - "Kick your heels higher" (when partial or shallow)
 *   - "Keep a steady rhythm" (rhythm guidance)
 *   - "Switch legs" (when one leg was repeated)
 * - Targets: 20, 30, 40, 50 reps.
 */

export const BUTT_KICK_LEG_PHASES = {
  EXTENDED: 'EXTENDED',
  KICKING_UP: 'KICKING_UP',
  PEAK: 'PEAK',
  LOWERING: 'LOWERING',
};

export function createButtKicksState() {
  return {
    phase: 'READY',
    left: {
      phase: BUTT_KICK_LEG_PHASES.EXTENDED,
      candidatePhase: BUTT_KICK_LEG_PHASES.EXTENDED,
      consecutiveFrames: 0,
      minAngleAchieved: 180,
      repStartTime: null,
    },
    right: {
      phase: BUTT_KICK_LEG_PHASES.EXTENDED,
      candidatePhase: BUTT_KICK_LEG_PHASES.EXTENDED,
      consecutiveFrames: 0,
      minAngleAchieved: 180,
      repStartTime: null,
    },
    leftAngleHistory: [],
    rightAngleHistory: [],
    lastRepTime: 0,
    lastKickingLeg: null,
    repCount: 0,
    lastFeedbackTime: 0,
    lastFeedbackText: '',
  };
}

/**
 * Step Butt Kicks Detector
 */
export function stepButtKicksDetector(
  state,
  landmarks,
  isBodyDetected,
  config = {},
  now = performance.now()
) {
  const {
    kickThresholdAngle = 60,
    kickGoodAngle = 45,
    extendedAngle = 120,
    minRepSeconds = 0.25,
    minFramesPerPhase = 4,
    smoothingFrames = 3,
  } = config;

  let nextState = {
    ...state,
    left: { ...state.left },
    right: { ...state.right },
  };

  let repCompleted = null;
  let feedback = null;

  const emitFeedback = (text, type = 'info') => {
    if (text === nextState.lastFeedbackText && now - nextState.lastFeedbackTime < 1200) {
      return;
    }
    nextState.lastFeedbackTime = now;
    nextState.lastFeedbackText = text;
    feedback = { text, type };
  };

  if (!isBodyDetected || !landmarks || landmarks.length < 29) {
    return {
      nextState,
      repCompleted: null,
      feedback: null,
      liveMetric: null,
    };
  }

  // MediaPipe landmarks:
  // Left: hip 23, knee 25, ankle 27
  // Right: hip 24, knee 26, ankle 28
  const leftHip = landmarks[23];
  const leftKnee = landmarks[25];
  const leftAnkle = landmarks[27];

  const rightHip = landmarks[24];
  const rightKnee = landmarks[26];
  const rightAnkle = landmarks[28];

  if (!leftHip || !leftKnee || !leftAnkle || !rightHip || !rightKnee || !rightAnkle) {
    return {
      nextState,
      repCompleted: null,
      feedback: null,
      liveMetric: null,
    };
  }

  const rawLeftAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  const rawRightAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

  const leftAngle = Math.round(smoothAngle(nextState.leftAngleHistory, rawLeftAngle, smoothingFrames));
  const rightAngle = Math.round(smoothAngle(nextState.rightAngleHistory, rawRightAngle, smoothingFrames));

  // Leg evaluator helper
  const evaluateLeg = (legKey, angle, knee, ankle, otherLegKey) => {
    const legState = nextState[legKey];
    const isAnkleHigherThanKnee = ankle.y < knee.y;
    const isKicking = angle <= kickThresholdAngle || isAnkleHigherThanKnee;
    const isExtended = angle >= extendedAngle;

    let candidate = legState.phase;

    switch (legState.phase) {
      case BUTT_KICK_LEG_PHASES.EXTENDED:
        if (isKicking) {
          candidate = BUTT_KICK_LEG_PHASES.PEAK;
        } else if (angle < extendedAngle - 15) {
          candidate = BUTT_KICK_LEG_PHASES.KICKING_UP;
        }
        break;

      case BUTT_KICK_LEG_PHASES.KICKING_UP:
        if (isKicking) {
          candidate = BUTT_KICK_LEG_PHASES.PEAK;
        } else if (isExtended) {
          candidate = BUTT_KICK_LEG_PHASES.EXTENDED;
        }
        break;

      case BUTT_KICK_LEG_PHASES.PEAK:
        if (isExtended) {
          candidate = BUTT_KICK_LEG_PHASES.EXTENDED;
        } else if (angle > kickThresholdAngle + 15) {
          candidate = BUTT_KICK_LEG_PHASES.LOWERING;
        }
        break;

      case BUTT_KICK_LEG_PHASES.LOWERING:
        if (isExtended) {
          candidate = BUTT_KICK_LEG_PHASES.EXTENDED;
        } else if (isKicking) {
          candidate = BUTT_KICK_LEG_PHASES.PEAK;
        }
        break;

      default:
        candidate = BUTT_KICK_LEG_PHASES.EXTENDED;
    }

    // Track minimum angle reached during kick
    if (legState.phase !== BUTT_KICK_LEG_PHASES.EXTENDED) {
      if (angle < legState.minAngleAchieved) {
        legState.minAngleAchieved = angle;
      }
    }

    // Consecutive frames hysteresis
    if (candidate !== legState.phase) {
      if (legState.candidatePhase === candidate) {
        legState.consecutiveFrames += 1;
      } else {
        legState.candidatePhase = candidate;
        legState.consecutiveFrames = 1;
      }

      if (legState.consecutiveFrames >= minFramesPerPhase) {
        const prevPhase = legState.phase;
        legState.phase = candidate;
        legState.consecutiveFrames = 0;

        // Start kick
        if (prevPhase === BUTT_KICK_LEG_PHASES.EXTENDED && (candidate === BUTT_KICK_LEG_PHASES.KICKING_UP || candidate === BUTT_KICK_LEG_PHASES.PEAK)) {
          legState.repStartTime = now;
          legState.minAngleAchieved = angle;
        }

        // Completion: Return to EXTENDED after being in PEAK
        if (candidate === BUTT_KICK_LEG_PHASES.EXTENDED && (prevPhase === BUTT_KICK_LEG_PHASES.PEAK || prevPhase === BUTT_KICK_LEG_PHASES.LOWERING)) {
          const duration = legState.repStartTime ? (now - legState.repStartTime) / 1000 : 0.3;
          const timeSinceLastRep = (now - nextState.lastRepTime) / 1000;

          if (timeSinceLastRep >= minRepSeconds) {
            const minAngle = legState.minAngleAchieved;
            const isGood = minAngle <= kickGoodAngle;

            if (isGood) {
              emitFeedback('Keep a steady rhythm!', 'good');
            } else {
              emitFeedback('Kick your heels higher', 'shallow');
            }

            if (nextState.lastKickingLeg === legKey) {
              emitFeedback('Switch legs for balance', 'info');
            }

            nextState.lastRepTime = now;
            nextState.lastKickingLeg = legKey;
            nextState.repCount += 1;

            repCompleted = {
              duration: Number(duration.toFixed(2)),
              quality: isGood ? 'good' : 'partial',
              minAngle,
              kickingLeg: legKey,
            };
          }

          legState.repStartTime = null;
          legState.minAngleAchieved = 180;
        }
      }
    } else {
      legState.consecutiveFrames = 0;
    }
  };

  evaluateLeg('left', leftAngle, leftKnee, leftAnkle, 'right');
  if (!repCompleted) {
    evaluateLeg('right', rightAngle, rightKnee, rightAnkle, 'left');
  }

  // Format live metric label ("Left 45°", "Right Kick", etc.)
  const activeSide = nextState.left.phase !== BUTT_KICK_LEG_PHASES.EXTENDED
    ? `Left ${leftAngle}°`
    : nextState.right.phase !== BUTT_KICK_LEG_PHASES.EXTENDED
    ? `Right ${rightAngle}°`
    : 'Ready';

  return {
    nextState,
    repCompleted,
    feedback,
    liveMetric: activeSide,
  };
}
