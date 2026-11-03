/**
 * Angle calculation and landmark smoothing utilities for pose tracking
 */

/**
 * Calculates the interior angle at point b formed by line segments ab and bc.
 *
 * @param {{ x: number, y: number, z?: number }} a - First landmark (e.g., Hip)
 * @param {{ x: number, y: number, z?: number }} b - Vertex landmark (e.g., Knee)
 * @param {{ x: number, y: number, z?: number }} c - Third landmark (e.g., Ankle)
 * @returns {number} Angle at point b in degrees (0 to 180)
 */
export function calculateAngle(a, b, c) {
  if (!a || !b || !c) return 0;

  // Vector BA: a - b
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);

  let angle = Math.abs((radians * 180.0) / Math.PI);

  if (angle > 180.0) {
    angle = 360.0 - angle;
  }

  return angle;
}

/**
 * Computes knee angle from full body landmarks:
 * Left knee: hip(23), knee(25), ankle(27)
 * Right knee: hip(24), knee(26), ankle(28)
 *
 * Chooses the side with higher visibility, or averages both when both are > 0.5.
 *
 * @param {Array<{ x: number, y: number, visibility?: number }>} landmarks
 * @returns {number|null} Instantaneous knee angle in degrees or null if not sufficiently visible
 */
export function getKneeAngleFromLandmarks(landmarks) {
  if (!landmarks || landmarks.length < 29) return null;

  // Left side landmarks (MediaPipe indices)
  const leftHip = landmarks[23];
  const leftKnee = landmarks[25];
  const leftAnkle = landmarks[27];

  // Right side landmarks
  const rightHip = landmarks[24];
  const rightKnee = landmarks[26];
  const rightAnkle = landmarks[28];

  const leftVis = Math.min(
    leftHip?.visibility ?? 0,
    leftKnee?.visibility ?? 0,
    leftAnkle?.visibility ?? 0
  );

  const rightVis = Math.min(
    rightHip?.visibility ?? 0,
    rightKnee?.visibility ?? 0,
    rightAnkle?.visibility ?? 0
  );

  const leftAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  const rightAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

  // If both sides are clearly visible (> 0.5), average both for stable symmetrical measurement
  if (leftVis > 0.5 && rightVis > 0.5) {
    return (leftAngle + rightAngle) / 2;
  }

  // Otherwise, use whichever side has superior visibility if it exceeds threshold
  if (leftVis > rightVis && leftVis > 0.4) {
    return leftAngle;
  }

  if (rightVis > leftVis && rightVis > 0.4) {
    return rightAngle;
  }

  // Fallback: If visibility values are omitted by model task or partially detected,
  // average both valid computed angles
  if (leftAngle > 0 && rightAngle > 0) {
    return (leftAngle + rightAngle) / 2;
  }

  return leftAngle || rightAngle || null;
}

/**
 * Calculates a moving average of recent angle values over N frames.
 *
 * @param {number[]} historyBuffer - Recent angle values array
 * @param {number} newAngle - Newly computed frame angle
 * @param {number} maxFrames - Smoothing window size (e.g. 5)
 * @returns {number} Smoothed moving average angle
 */
export function smoothAngle(historyBuffer, newAngle, maxFrames = 5) {
  if (typeof newAngle !== 'number' || isNaN(newAngle)) {
    if (historyBuffer.length === 0) return 0;
    return historyBuffer.reduce((a, b) => a + b, 0) / historyBuffer.length;
  }

  historyBuffer.push(newAngle);
  if (historyBuffer.length > maxFrames) {
    historyBuffer.shift();
  }

  const sum = historyBuffer.reduce((acc, val) => acc + val, 0);
  return sum / historyBuffer.length;
}
