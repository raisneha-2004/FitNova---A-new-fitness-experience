/**
 * Visibility verification logic for body landmarks.
 * Validates whether shoulders, hips, knees, and ankles are sufficiently
 * visible (> 0.5 visibility) and well-framed within normalized coordinates [0, 1].
 */

/**
 * Checks if a specific landmark is present, visible, and within the camera frame bounds.
 */
function isLandmarkVisibleAndFramed(landmark, minVisibility = 0.5) {
  if (!landmark) return false;
  const visibility = landmark.visibility !== undefined ? landmark.visibility : 1.0;
  const inBounds = landmark.x >= 0 && landmark.x <= 1 && landmark.y >= 0 && landmark.y <= 1;
  return visibility >= minVisibility && inBounds;
}

/**
 * Checks visibility for the required key muscle/joint groups.
 * @param {Array} landmarks - Raw landmarks array from MediaPipe
 * @param {'full'|'upper'} requiredBody - Group requirement mode
 * @returns {Object} Group visibility boolean map
 */
export function checkBodyVisibility(landmarks, requiredBody = 'full') {
  if (!landmarks || landmarks.length === 0) {
    return {
      shoulders: false,
      hips: false,
      knees: false,
      ankles: false,
      elbows: false,
      wrists: false,
      allVisible: false,
      missingGroups: requiredBody === 'upper' ? ['Shoulders', 'Elbows', 'Wrists'] : ['Shoulders', 'Hips', 'Knees', 'Ankles'],
      statusText: 'Person Not Detected',
      statusCode: 'NOT_DETECTED', // 'NOT_DETECTED' | 'PARTIAL' | 'READY'
    };
  }

  // Left & Right checks
  const shouldersVisible =
    isLandmarkVisibleAndFramed(landmarks[11]) &&
    isLandmarkVisibleAndFramed(landmarks[12]);

  const hipsVisible =
    isLandmarkVisibleAndFramed(landmarks[23]) &&
    isLandmarkVisibleAndFramed(landmarks[24]);

  const kneesVisible =
    isLandmarkVisibleAndFramed(landmarks[25]) &&
    isLandmarkVisibleAndFramed(landmarks[26]);

  const anklesVisible =
    isLandmarkVisibleAndFramed(landmarks[27]) &&
    isLandmarkVisibleAndFramed(landmarks[28]);

  const elbowsVisible =
    isLandmarkVisibleAndFramed(landmarks[13]) &&
    isLandmarkVisibleAndFramed(landmarks[14]);

  const wristsVisible =
    isLandmarkVisibleAndFramed(landmarks[15]) &&
    isLandmarkVisibleAndFramed(landmarks[16]);

  const missingGroups = [];

  if (requiredBody === 'upper') {
    if (!shouldersVisible) missingGroups.push('Shoulders');
    if (!elbowsVisible) missingGroups.push('Elbows');
    if (!wristsVisible) missingGroups.push('Wrists');

    const allVisible = shouldersVisible && elbowsVisible && wristsVisible;
    let statusCode = 'NOT_DETECTED';
    let statusText = 'Person Not Detected';

    if (allVisible) {
      statusCode = 'READY';
      statusText = 'Body Detected';
    } else if (shouldersVisible || elbowsVisible || wristsVisible) {
      statusCode = 'PARTIAL';
      statusText = `Adjust framing: missing ${missingGroups.join(', ')}`;
    }

    return {
      shoulders: shouldersVisible,
      hips: hipsVisible,
      knees: kneesVisible,
      ankles: anklesVisible,
      elbows: elbowsVisible,
      wrists: wristsVisible,
      allVisible,
      missingGroups,
      statusText,
      statusCode,
    };
  }

  // Default: 'full' body requirement
  if (!shouldersVisible) missingGroups.push('Shoulders');
  if (!hipsVisible) missingGroups.push('Hips');
  if (!kneesVisible) missingGroups.push('Knees');
  if (!anklesVisible) missingGroups.push('Ankles');

  const allVisible = shouldersVisible && hipsVisible && kneesVisible && anklesVisible;

  let statusCode = 'NOT_DETECTED';
  let statusText = 'Person Not Detected';

  if (allVisible) {
    statusCode = 'READY';
    statusText = 'Body Detected';
  } else if (shouldersVisible || hipsVisible || kneesVisible || anklesVisible) {
    statusCode = 'PARTIAL';
    statusText = `Move back, full body not visible (${missingGroups.join(', ')})`;
  }

  return {
    shoulders: shouldersVisible,
    hips: hipsVisible,
    knees: kneesVisible,
    ankles: anklesVisible,
    elbows: elbowsVisible,
    wrists: wristsVisible,
    allVisible,
    missingGroups,
    statusText,
    statusCode,
  };
}
