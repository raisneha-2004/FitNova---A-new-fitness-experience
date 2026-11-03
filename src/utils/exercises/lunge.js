import { calculateAngle, smoothAngle } from '../angles.js';

/**
 * Lunge State Machine Detector
 *
 * Rules:
 * - Type: "reps" (Side view, full body)
 * - Staggered stance requirement:
 *   Horizontal ankle separation |leftAnkle.x - rightAnkle.x| > 0.8 * torsoLength.
 *   (Torso length is the distance from shoulder to hip).
 *   This ensures a squat is NEVER counted as a lunge!
 * - Phases:
 *   1. STANDING: both knee angles above 160.
 *   2. GOING_DOWN: descending with staggered stance.
 *   3. BOTTOM: front knee angle < 110 AND rear knee angle < 130 while staggered.
 *      The front leg has ankle further forward in the walking direction.
 *   4. COMING_UP: ascending from bottom.
 *   5. STANDING: back to both knees > 160.
 * - Rep count: 1 rep per full cycle, either leg.
 * - Timing: Minimum 1.0s per rep, 6 consecutive frames per phase change.
 * - Quality:
 *   - "good": front knee angle < 100 degrees
 *   - "partial": 100 to 120 degrees
 * - Feedback:
 *   - "Go a little lower"
 *   - "Keep your chest up" (when shoulder.x moves > 12% of frame width ahead of hip.x)
 *   - "Stand fully tall between reps"
 * - Targets: 6, 10, 14, 20 reps.
 */

export const LUNGE_PHASES = {
  STANDING: 'STANDING',
  GOING_DOWN: 'GOING_DOWN',
  BOTTOM: 'BOTTOM',
  COMING_UP: 'COMING_UP',
};

export function createLungeState() {
  return {
    phase: LUNGE_PHASES.STANDING,
    candidatePhase: LUNGE_PHASES.STANDING,
    consecutivePhaseFrames: 0,
    frontKneeAngleHistory: [],
    rearKneeAngleHistory: [],
    repStartTime: null,
    minFrontKneeAngle: 180,
    frontLeg: null, // 'left' | 'right'
    torsoForwardLean: 0,
    lastFeedbackTime: 0,
    lastFeedbackText: '',
  };
}

/**
 * Step Lunge Detector
 */
export function stepLungeDetector(
  state,
  landmarks,
  isBodyDetected,
  config = {},
  now = performance.now()
) {
  const {
    standingKneeAngle = 160,
    bottomFrontKneeAngle = 110,
    bottomRearKneeAngle = 130,
    goodFrontKneeAngle = 100,
    partialFrontKneeAngle = 120,
    staggerRatioThreshold = 0.80, // ankle separation >= 0.8 * torso length
    maxTorsoLean = 0.12, // 12% frame width forward lean
    minRepSeconds = 1.0,
    minFramesPerPhase = 6,
    smoothingFrames = 5,
  } = config;

  let nextState = { ...state };
  let repCompleted = null;
  let feedback = null;

  const emitFeedback = (text, type = 'info') => {
    if (text === nextState.lastFeedbackText && now - nextState.lastFeedbackTime < 1800) {
      return;
    }
    nextState.lastFeedbackTime = now;
    nextState.lastFeedbackText = text;
    feedback = { text, type };
  };

  if (!isBodyDetected || !landmarks || landmarks.length < 29) {
    if (nextState.phase !== LUNGE_PHASES.STANDING) {
      emitFeedback('Move back, step in full view', 'warning');
      nextState.phase = LUNGE_PHASES.STANDING;
      nextState.candidatePhase = LUNGE_PHASES.STANDING;
      nextState.repStartTime = null;
      nextState.minFrontKneeAngle = 180;
    }
    return {
      nextState,
      repCompleted: null,
      feedback,
      liveMetric: null,
    };
  }

  // Key landmarks
  // Shoulders: 11, 12. Hips: 23, 24. Knees: 25, 26. Ankles: 27, 28
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];

  if (
    !leftShoulder || !rightShoulder ||
    !leftHip || !rightHip ||
    !leftKnee || !rightKnee ||
    !leftAnkle || !rightAnkle
  ) {
    return {
      nextState,
      repCompleted: null,
      feedback,
      liveMetric: null,
    };
  }

  // 1. Calculate Torso length: distance from shoulder center to hip center
  const avgShoulderX = (leftShoulder.x + rightShoulder.x) / 2;
  const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
  const avgHipX = (leftHip.x + rightHip.x) / 2;
  const avgHipY = (leftHip.y + rightHip.y) / 2;

  const torsoLength = Math.max(
    0.15,
    Math.sqrt(Math.pow(avgShoulderX - avgHipX, 2) + Math.pow(avgShoulderY - avgHipY, 2))
  );

  // 2. Ankle horizontal stagger
  const ankleSeparationX = Math.abs(leftAnkle.x - rightAnkle.x);
  const isStaggered = ankleSeparationX >= (staggerRatioThreshold * torsoLength);

  // 3. Compute left and right knee angles
  const rawLeftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  const rawRightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

  // Identify front leg: the ankle with smaller x (facing right) or larger separation
  // In side view, front ankle is further separated horizontally from the torso midline
  const leftDistFromTorso = Math.abs(leftAnkle.x - avgHipX);
  const rightDistFromTorso = Math.abs(rightAnkle.x - avgHipX);
  const isLeftFront = leftDistFromTorso >= rightDistFromTorso;

  const rawFrontKneeAngle = isLeftFront ? rawLeftKneeAngle : rawRightKneeAngle;
  const rawRearKneeAngle = isLeftFront ? rawRightKneeAngle : rawLeftKneeAngle;

  const smoothedFrontKnee = Math.round(smoothAngle(nextState.frontKneeAngleHistory, rawFrontKneeAngle, smoothingFrames));
  const smoothedRearKnee = Math.round(smoothAngle(nextState.rearKneeAngleHistory, rawRearKneeAngle, smoothingFrames));

  // 4. Check chest uprightness: horizontal shift between shoulder and hip
  const torsoForwardLean = Math.abs(avgShoulderX - avgHipX);
  if (torsoForwardLean > maxTorsoLean) {
    emitFeedback('Keep your chest up', 'warning');
  }

  const bothStanding = smoothedFrontKnee >= standingKneeAngle && smoothedRearKnee >= standingKneeAngle;
  const currentPhase = nextState.phase;
  let candidate = currentPhase;

  // State machine transitions
  switch (currentPhase) {
    case LUNGE_PHASES.STANDING:
      // If user bends knees while staggered, enter GOING_DOWN
      if (isStaggered && smoothedFrontKnee < standingKneeAngle - 10) {
        candidate = LUNGE_PHASES.GOING_DOWN;
      }
      break;

    case LUNGE_PHASES.GOING_DOWN:
      if (!isStaggered) {
        // Lost staggered stance -> reset to STANDING (squat rejection)
        candidate = LUNGE_PHASES.STANDING;
      } else if (smoothedFrontKnee <= bottomFrontKneeAngle && smoothedRearKnee <= bottomRearKneeAngle) {
        candidate = LUNGE_PHASES.BOTTOM;
      } else if (bothStanding) {
        candidate = LUNGE_PHASES.STANDING;
      }
      break;

    case LUNGE_PHASES.BOTTOM:
      if (!isStaggered) {
        candidate = LUNGE_PHASES.STANDING;
      } else if (smoothedFrontKnee > bottomFrontKneeAngle + 12) {
        candidate = LUNGE_PHASES.COMING_UP;
      }
      break;

    case LUNGE_PHASES.COMING_UP:
      if (bothStanding) {
        candidate = LUNGE_PHASES.STANDING;
      } else if (smoothedFrontKnee <= bottomFrontKneeAngle) {
        candidate = LUNGE_PHASES.BOTTOM;
      }
      break;

    default:
      candidate = LUNGE_PHASES.STANDING;
  }

  // Track minimum front knee angle reached
  if (currentPhase !== LUNGE_PHASES.STANDING) {
    if (smoothedFrontKnee < nextState.minFrontKneeAngle) {
      nextState.minFrontKneeAngle = smoothedFrontKnee;
      nextState.frontLeg = isLeftFront ? 'left' : 'right';
    }
  }

  // Consecutive frames hysteresis
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

      // Start of rep
      if (prevPhase === LUNGE_PHASES.STANDING && candidate === LUNGE_PHASES.GOING_DOWN) {
        nextState.repStartTime = now;
        nextState.minFrontKneeAngle = smoothedFrontKnee;
        nextState.frontLeg = isLeftFront ? 'left' : 'right';
      }

      // Completion of rep: COMING_UP -> STANDING
      if (candidate === LUNGE_PHASES.STANDING && nextState.repStartTime !== null) {
        const repDuration = (now - nextState.repStartTime) / 1000;
        const peakKneeAngle = nextState.minFrontKneeAngle;

        if (repDuration < minRepSeconds) {
          emitFeedback('Slow down, control the lunge', 'warning');
        } else {
          const isGood = peakKneeAngle <= goodFrontKneeAngle;
          const isPartial = peakKneeAngle <= partialFrontKneeAngle;

          if (isGood) {
            emitFeedback('Great depth and knee stability!', 'good');
          } else if (isPartial) {
            emitFeedback('Go a little lower', 'shallow');
          } else {
            emitFeedback('Stand fully tall between reps', 'info');
          }

          repCompleted = {
            duration: Number(repDuration.toFixed(2)),
            quality: isGood ? 'good' : 'partial',
            minAngle: peakKneeAngle,
            frontLeg: nextState.frontLeg,
          };
        }

        nextState.repStartTime = null;
        nextState.minFrontKneeAngle = 180;
        nextState.frontLeg = null;
      }
    }
  } else {
    nextState.consecutivePhaseFrames = 0;
  }

  return {
    nextState,
    repCompleted,
    feedback,
    liveMetric: smoothedFrontKnee,
  };
}
