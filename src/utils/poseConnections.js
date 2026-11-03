/**
 * Pose landmark connection indices for body tracking.
 * We focus on body landmarks (torso and limbs) and skip face landmarks for clarity.
 * 
 * MediaPipe Pose Landmark Reference:
 * 11: Left Shoulder,  12: Right Shoulder
 * 13: Left Elbow,     14: Right Elbow
 * 15: Left Wrist,     16: Right Wrist
 * 23: Left Hip,       24: Right Hip
 * 25: Left Knee,      26: Right Knee
 * 27: Left Ankle,     28: Right Ankle
 */

// Selected body landmarks to render as nodes
export const BODY_LANDMARK_INDICES = [
  11, 12, // Shoulders
  13, 14, // Elbows
  15, 16, // Wrists
  23, 24, // Hips
  25, 26, // Knees
  27, 28, // Ankles
];

// Connected pairs defining the fitness skeleton
export const BODY_CONNECTIONS = [
  [11, 12], // Shoulder to Shoulder
  [11, 13], // Left Shoulder to Left Elbow
  [13, 15], // Left Elbow to Left Wrist
  [12, 14], // Right Shoulder to Right Elbow
  [14, 16], // Right Elbow to Right Wrist
  [11, 23], // Left Shoulder to Left Hip
  [12, 24], // Right Shoulder to Right Hip
  [23, 24], // Hip to Hip
  [23, 25], // Left Hip to Left Knee
  [25, 27], // Left Knee to Left Ankle
  [24, 26], // Right Hip to Right Knee
  [26, 28], // Right Knee to Right Ankle
];
