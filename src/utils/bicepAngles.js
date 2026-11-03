import { calculateAngle } from './angles';

/**
 * Computes left and right elbow angles from pose landmarks:
 * Left elbow: shoulder(11), elbow(13), wrist(15)
 * Right elbow: shoulder(12), elbow(14), wrist(16)
 *
 * @param {Array} landmarks
 * @returns {{ leftAngle: number|null, rightAngle: number|null, bestAngle: number|null, activeSide: 'left'|'right'|'both'|null }}
 */
export function getElbowAnglesFromLandmarks(landmarks) {
  if (!landmarks || landmarks.length < 17) {
    return { leftAngle: null, rightAngle: null, bestAngle: null, activeSide: null };
  }

  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftElbow = landmarks[13];
  const rightElbow = landmarks[14];
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];

  const leftVis = Math.min(
    leftShoulder?.visibility ?? 0,
    leftElbow?.visibility ?? 0,
    leftWrist?.visibility ?? 0
  );

  const rightVis = Math.min(
    rightShoulder?.visibility ?? 0,
    rightElbow?.visibility ?? 0,
    rightWrist?.visibility ?? 0
  );

  const leftAngle =
    leftVis > 0.4 && leftShoulder?.x !== undefined && leftElbow?.x !== undefined && leftWrist?.x !== undefined
      ? Math.round(calculateAngle(leftShoulder, leftElbow, leftWrist))
      : null;
  const rightAngle =
    rightVis > 0.4 && rightShoulder?.x !== undefined && rightElbow?.x !== undefined && rightWrist?.x !== undefined
      ? Math.round(calculateAngle(rightShoulder, rightElbow, rightWrist))
      : null;

  let bestAngle = null;
  let activeSide = null;

  if (leftAngle !== null && rightAngle !== null) {
    // Both visible: track the arm that is currently more bent/curled or average
    bestAngle = Math.min(leftAngle, rightAngle);
    activeSide = 'both';
  } else if (leftAngle !== null) {
    bestAngle = leftAngle;
    activeSide = 'left';
  } else if (rightAngle !== null) {
    bestAngle = rightAngle;
    activeSide = 'right';
  }

  return { leftAngle, rightAngle, bestAngle, activeSide };
}

/**
 * Checks if either elbow is flaring outward away from the shoulder by more than tolerance (% of width)
 * @param {Array} landmarks
 * @param {number} tolerance (e.g. 0.08 = 8% frame width)
 * @returns {boolean} True if elbow flared excessively
 */
export function isElbowFlaring(landmarks, tolerance = 0.08) {
  if (!landmarks || landmarks.length < 17) return false;

  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftElbow = landmarks[13];
  const rightElbow = landmarks[14];

  if (
    leftShoulder &&
    leftElbow &&
    leftShoulder.x !== undefined &&
    leftElbow.x !== undefined &&
    (leftElbow.visibility ?? 1) > 0.5
  ) {
    if (Math.abs(leftElbow.x - leftShoulder.x) > tolerance) {
      return true;
    }
  }

  if (
    rightShoulder &&
    rightElbow &&
    rightShoulder.x !== undefined &&
    rightElbow.x !== undefined &&
    (rightElbow.visibility ?? 1) > 0.5
  ) {
    if (Math.abs(rightElbow.x - rightShoulder.x) > tolerance) {
      return true;
    }
  }

  return false;
}
