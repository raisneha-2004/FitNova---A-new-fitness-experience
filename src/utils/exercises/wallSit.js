import { calculateAngle, smoothAngle } from '../angles.js';

/**
 * Wall Sit State Machine Detector
 *
 * Rules:
 * - Type: "hold" (Side view, full body)
 * - In form when:
 *   1. Knee angle (hip 23/24, knee 25/26, ankle 27/28) is between 80 and 105 degrees.
 *   2. Hip height is close to knee height: absolute y difference < 0.10 (10% of frame height).
 *   3. Torso roughly vertical: |shoulder.x - hip.x| < 0.08 (8% of frame width).
 *   - Use the side with higher visibility (left: 11, 23, 25, 27; right: 12, 24, 26, 28).
 * - Timer runs only while in form, pauses when form breaks with a 0.5s grace period.
 * - Feedback:
 *   - "Slide down a little more" (knee angle > 105 or hip too high)
 *   - "Thighs parallel to the floor" (optimal target posture)
 *   - "Hold steady" (when in form)
 * - Targets: 15, 30, 45, 60 seconds.
 * - XP: +10 per 5s in form.
 * - Emits repCompleted event on each 5s interval or target completion so engine single-source-of-truth receives RepEvents!
 */

export const WALL_SIT_PHASES = {
  SEARCHING: 'SEARCHING',
  IN_FORM: 'IN_FORM',
  BREAK: 'BREAK',
};

export function createWallSitState() {
  return {
    phase: WALL_SIT_PHASES.SEARCHING,
    inFormStartTime: null,
    totalHoldSeconds: 0,
    currentHoldStreak: 0,
    bestHoldSeconds: 0,
    lastFrameTime: null,
    lastInFormTime: null,
    lastAwardedXpSeconds: 0,
    consecutiveInFormFrames: 0,
    angleHistory: [],
    lastFeedbackTime: 0,
    lastFeedbackText: '',
  };
}

/**
 * Checks whether the given pose landmarks represent a valid Wall Sit posture.
 * Returns { isInForm, reason, angle, hipKneeYDiff, torsoXDiff }
 */
export function checkWallSitForm(landmarks, config = {}) {
  const {
    minKneeAngle = 80,
    maxKneeAngle = 105,
    maxHipKneeYDiff = 0.10,
    maxTorsoXDiff = 0.08,
  } = config;

  if (!landmarks || landmarks.length < 29) {
    return { isInForm: false, reason: 'Body not detected', angle: null };
  }

  // Left side landmarks: shoulder 11, hip 23, knee 25, ankle 27
  const leftShoulder = landmarks[11];
  const leftHip = landmarks[23];
  const leftKnee = landmarks[25];
  const leftAnkle = landmarks[27];

  // Right side landmarks: shoulder 12, hip 24, knee 26, ankle 28
  const rightShoulder = landmarks[12];
  const rightHip = landmarks[24];
  const rightKnee = landmarks[26];
  const rightAnkle = landmarks[28];

  if (!leftHip || !leftKnee || !leftAnkle || !rightHip || !rightKnee || !rightAnkle) {
    return { isInForm: false, reason: 'Knees/Hips not detected', angle: null };
  }

  const leftVis = Math.min(
    leftShoulder?.visibility ?? 0.5,
    leftHip?.visibility ?? 0.5,
    leftKnee?.visibility ?? 0.5,
    leftAnkle?.visibility ?? 0.5
  );

  const rightVis = Math.min(
    rightShoulder?.visibility ?? 0.5,
    rightHip?.visibility ?? 0.5,
    rightKnee?.visibility ?? 0.5,
    rightAnkle?.visibility ?? 0.5
  );

  // Pick side with superior visibility
  const useLeft = leftVis >= rightVis;
  const shoulder = useLeft ? leftShoulder : rightShoulder;
  const hip = useLeft ? leftHip : rightHip;
  const knee = useLeft ? leftKnee : rightKnee;
  const ankle = useLeft ? leftAnkle : rightAnkle;

  const rawKneeAngle = calculateAngle(hip, knee, ankle);
  const hipKneeYDiff = Math.abs(hip.y - knee.y);
  const torsoXDiff = shoulder && hip ? Math.abs(shoulder.x - hip.x) : 0;

  // Criteria validation
  const isAngleValid = rawKneeAngle >= minKneeAngle && rawKneeAngle <= maxKneeAngle;
  const isHipHeightValid = hipKneeYDiff <= maxHipKneeYDiff;
  const isTorsoVertical = torsoXDiff <= maxTorsoXDiff;

  const isInForm = isAngleValid && isHipHeightValid && isTorsoVertical;

  let reason = '';
  if (!isInForm) {
    if (rawKneeAngle > maxKneeAngle || (hip.y < knee.y - maxHipKneeYDiff)) {
      reason = 'Slide down a little more';
    } else if (rawKneeAngle < minKneeAngle) {
      reason = 'Thighs parallel to the floor';
    } else if (!isTorsoVertical) {
      reason = 'Keep your back flat and torso vertical';
    } else {
      reason = 'Thighs parallel to the floor';
    }
  }

  return {
    isInForm,
    inForm: isInForm,
    reason,
    angle: Math.round(rawKneeAngle),
    hipKneeYDiff,
    torsoXDiff,
  };
}

/**
 * Step Wall Sit Detector
 */
export function stepWallSitDetector(
  state,
  landmarks,
  isBodyDetected,
  config = {},
  now = performance.now()
) {
  const {
    minKneeAngle = 80,
    maxKneeAngle = 105,
    maxHipKneeYDiff = 0.10,
    maxTorsoXDiff = 0.08,
    gracePeriodSeconds = 0.5,
    smoothingFrames = 5,
  } = config;

  let nextState = { ...state };
  let repCompleted = null;
  let feedback = null;

  const emitFeedback = (text, type = 'info') => {
    if (text === nextState.lastFeedbackText && now - nextState.lastFeedbackTime < 1500) {
      return;
    }
    nextState.lastFeedbackTime = now;
    nextState.lastFeedbackText = text;
    feedback = { text, type };
  };

  if (!isBodyDetected || !landmarks) {
    if (nextState.phase === WALL_SIT_PHASES.IN_FORM) {
      emitFeedback('Move back, step in full frame', 'warning');
    }
    nextState.phase = WALL_SIT_PHASES.SEARCHING;
    nextState.lastFrameTime = now;
    return {
      nextState,
      repCompleted: null,
      feedback,
      liveMetric: null,
    };
  }

  const formCheck = checkWallSitForm(landmarks, {
    minKneeAngle,
    maxKneeAngle,
    maxHipKneeYDiff,
    maxTorsoXDiff,
  });

  const smoothedAngle = formCheck.angle !== null
    ? Math.round(smoothAngle(nextState.angleHistory, formCheck.angle, smoothingFrames))
    : null;

  // Time delta calculation
  const dt = nextState.lastFrameTime !== null
    ? Math.min(0.2, Math.max(0, (now - nextState.lastFrameTime) / 1000))
    : 0;
  nextState.lastFrameTime = now;

  const isActuallyInForm = formCheck.isInForm;

  if (isActuallyInForm) {
    nextState.lastInFormTime = now;
    nextState.totalHoldSeconds += dt;
    nextState.currentHoldStreak += dt;
    if (nextState.currentHoldStreak > nextState.bestHoldSeconds) {
      nextState.bestHoldSeconds = nextState.currentHoldStreak;
    }

    nextState.phase = WALL_SIT_PHASES.IN_FORM;
    emitFeedback('Hold steady, thighs parallel', 'good');
  } else {
    // Check 0.5s grace period before pausing/dropping out of form
    const timeSinceInForm = nextState.lastInFormTime !== null ? (now - nextState.lastInFormTime) / 1000 : 999;
    if (timeSinceInForm <= gracePeriodSeconds && nextState.phase === WALL_SIT_PHASES.IN_FORM) {
      // Within grace period: count time but alert
      nextState.totalHoldSeconds += dt;
      nextState.currentHoldStreak += dt;
      if (nextState.currentHoldStreak > nextState.bestHoldSeconds) {
        nextState.bestHoldSeconds = nextState.currentHoldStreak;
      }
    } else {
      nextState.phase = WALL_SIT_PHASES.BREAK;
      nextState.currentHoldStreak = 0;
      if (formCheck.reason) {
        emitFeedback(formCheck.reason, 'shallow');
      }
    }
  }

  // XP is +10 per 5s in form. Every 5s accumulated in form emits a step event
  const current5sBlock = Math.floor(nextState.totalHoldSeconds / 5);
  if (current5sBlock > nextState.lastAwardedXpSeconds) {
    nextState.lastAwardedXpSeconds = current5sBlock;
    repCompleted = {
      duration: 5,
      quality: 'good',
      xpEarned: 10,
      holdSeconds: Math.round(nextState.totalHoldSeconds),
      bestHold: Math.round(nextState.bestHoldSeconds),
      minAngle: smoothedAngle,
    };
  }

  return {
    nextState,
    repCompleted,
    feedback,
    liveMetric: smoothedAngle !== null ? smoothedAngle : 90,
    holdSeconds: Number(nextState.totalHoldSeconds.toFixed(1)),
  };
}
