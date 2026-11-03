/**
 * Jumping Jacks State Machine Detector
 *
 * Rules:
 * - Open: both wrists above the head (wrist y < nose y) AND ankle distance > 1.5 * shoulder width
 * - Closed: both wrists below shoulder level (wrist y > shoulder y) AND ankle distance < 1.0 * shoulder width
 * - One rep = closed -> open -> closed
 * - Minimum time per rep: 0.5s
 * - Quality: "good" if both arms fully overhead and feet wide, otherwise "partial"
 * - Feedback: "Raise your arms higher", "Jump your feet wider", "Nice rhythm"
 */

export const JACKS_PHASES = {
  CLOSED: 'CLOSED',
  OPENING: 'OPENING',
  OPEN: 'OPEN',
  CLOSING: 'CLOSING',
};

export function createJumpingJacksState() {
  return {
    phase: JACKS_PHASES.CLOSED,
    candidatePhase: JACKS_PHASES.CLOSED,
    consecutivePhaseFrames: 0,
    hasReachedOpen: false,
    repStartTime: null,
    maxAnkleSpreadRatio: 0,
    minWristYAboveNose: 999, // lowest y = highest in frame
    lastFeedbackTime: 0,
    lastFeedbackText: '',
  };
}

/**
 * Step Jumping Jacks Detector
 */
export function stepJumpingJacksDetector(
  state,
  landmarks,
  isBodyDetected,
  config = {},
  now = performance.now()
) {
  const {
    minRepSeconds = 0.5,
    minFramesPerPhase = 6,
    ankleSpreadMultiplierOpen = 1.5,
    ankleSpreadMultiplierClosed = 1.0,
  } = config;

  let nextState = { ...state };
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

  // Guard: User in frame
  if (!landmarks || !isBodyDetected || landmarks.length < 29) {
    if (nextState.phase !== JACKS_PHASES.CLOSED) {
      emitFeedback('Step back, full body in frame', 'warning');
      nextState.phase = JACKS_PHASES.CLOSED;
      nextState.candidatePhase = JACKS_PHASES.CLOSED;
      nextState.consecutivePhaseFrames = 0;
      nextState.repStartTime = null;
    }
    return {
      nextState,
      repCompleted: null,
      feedback,
      liveMetric: 'Closed',
    };
  }

  // Key landmarks
  const nose = landmarks[0];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];

  // Distances in normalized coordinates
  const shoulderWidth = Math.max(0.08, Math.abs(leftShoulder.x - rightShoulder.x));
  const ankleDistance = Math.abs(leftAnkle.x - rightAnkle.x);
  const ankleRatio = ankleDistance / shoulderWidth;

  const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
  const noseY = nose.y;

  // Arms overhead check: both wrist y smaller than nose y (y=0 is top)
  const armsOverhead = leftWrist.y < noseY && rightWrist.y < noseY;
  // Arms at sides / below shoulders: both wrist y > shoulder y
  const armsDown = leftWrist.y > avgShoulderY && rightWrist.y > avgShoulderY;

  // Open position condition:
  // Both wrists above the head AND ankle distance > 1.5 * shoulder width
  const isOpen = armsOverhead && ankleRatio >= ankleSpreadMultiplierOpen;

  // Closed position condition:
  // Both wrists below shoulder level AND ankle distance < 1.0 * shoulder width
  const isClosed = armsDown && ankleRatio <= ankleSpreadMultiplierClosed;

  // Determine current candidate phase
  let candidate = nextState.phase;
  switch (nextState.phase) {
    case JACKS_PHASES.CLOSED:
      if (isOpen) {
        candidate = JACKS_PHASES.OPEN;
      } else if (ankleRatio > 1.1 || leftWrist.y < avgShoulderY) {
        candidate = JACKS_PHASES.OPENING;
      }
      break;

    case JACKS_PHASES.OPENING:
      if (isOpen) {
        candidate = JACKS_PHASES.OPEN;
      } else if (isClosed) {
        candidate = JACKS_PHASES.CLOSED;
      }
      break;

    case JACKS_PHASES.OPEN:
      if (isClosed) {
        candidate = JACKS_PHASES.CLOSED;
      } else if (ankleRatio < 1.3 || !armsOverhead) {
        candidate = JACKS_PHASES.CLOSING;
      }
      break;

    case JACKS_PHASES.CLOSING:
      if (isClosed) {
        candidate = JACKS_PHASES.CLOSED;
      } else if (isOpen) {
        candidate = JACKS_PHASES.OPEN;
      }
      break;

    default:
      candidate = JACKS_PHASES.CLOSED;
  }

  // Track rep maximum stretch / spread
  if (nextState.phase !== JACKS_PHASES.CLOSED) {
    if (ankleRatio > nextState.maxAnkleSpreadRatio) {
      nextState.maxAnkleSpreadRatio = ankleRatio;
    }
    const highestWristY = Math.min(leftWrist.y, rightWrist.y);
    if (highestWristY < nextState.minWristYAboveNose) {
      nextState.minWristYAboveNose = highestWristY;
    }
  }

  // Consecutive frames verification
  if (candidate !== nextState.phase) {
    if (nextState.candidatePhase === candidate) {
      nextState.consecutivePhaseFrames += 1;
    } else {
      nextState.candidatePhase = candidate;
      nextState.consecutivePhaseFrames = 1;
    }

    if (nextState.consecutivePhaseFrames >= minFramesPerPhase) {
      const prevPhase = nextState.phase;
      nextState.phase = candidate;
      nextState.consecutivePhaseFrames = 0;

      // Start of jumping jack: from CLOSED to OPENING / OPEN
      if (prevPhase === JACKS_PHASES.CLOSED && (candidate === JACKS_PHASES.OPENING || candidate === JACKS_PHASES.OPEN)) {
        nextState.repStartTime = now;
        nextState.hasReachedOpen = (candidate === JACKS_PHASES.OPEN);
        nextState.maxAnkleSpreadRatio = ankleRatio;
        nextState.minWristYAboveNose = Math.min(leftWrist.y, rightWrist.y);
      } else if (candidate === JACKS_PHASES.OPEN) {
        nextState.hasReachedOpen = true;
      }

      // Completion of jumping jack: reaching CLOSED after having been in OPEN
      if (candidate === JACKS_PHASES.CLOSED) {
        if (nextState.repStartTime !== null && nextState.hasReachedOpen) {
          const repDuration = (now - nextState.repStartTime) / 1000;

          if (repDuration < minRepSeconds) {
            emitFeedback('Slow down, control the bounce', 'warning');
          } else {
            // Check quality: wide feet + high arms
            const hasGoodSpread = nextState.maxAnkleSpreadRatio >= 1.5;
            const hasGoodArms = nextState.minWristYAboveNose <= noseY;

            const isGood = hasGoodSpread && hasGoodArms;

            if (isGood) {
              emitFeedback('Nice rhythm, great form!', 'good');
            } else if (!hasGoodArms) {
              emitFeedback('Raise your arms higher', 'shallow');
            } else if (!hasGoodSpread) {
              emitFeedback('Jump your feet wider', 'shallow');
            } else {
              emitFeedback('Nice rhythm', 'good');
            }

            repCompleted = {
              duration: Number(repDuration.toFixed(2)),
              quality: isGood ? 'good' : 'partial',
              maxSpreadRatio: Number(nextState.maxAnkleSpreadRatio.toFixed(2)),
            };
          }
        }

        // Reset rep tracking on reaching CLOSED
        nextState.repStartTime = null;
        nextState.hasReachedOpen = false;
        nextState.maxAnkleSpreadRatio = 0;
        nextState.minWristYAboveNose = 999;
      }
    }
  } else {
    if (nextState.phase === JACKS_PHASES.OPEN) {
      nextState.hasReachedOpen = true;
    }
    nextState.consecutivePhaseFrames = 0;
  }

  const liveStateText =
    nextState.phase === JACKS_PHASES.OPEN
      ? 'Open'
      : nextState.phase === JACKS_PHASES.CLOSED
      ? 'Closed'
      : 'In Motion';

  return {
    nextState,
    repCompleted,
    feedback,
    liveMetric: liveStateText,
  };
}
