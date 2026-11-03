/**
 * Tunable game, exercise and squat detection parameters
 */
export const GAME_CONFIG = {
  standingAngle: 160,     // Angle above which the user is considered standing fully tall
  goodDepthAngle: 100,    // Angle at or below which squat is classified as 'good depth'
  shallowAngle: 125,      // Angle below which squat descent begins (shallow rep range is 100 - 125)
  minFramesPerPhase: 6,   // Hysteresis requirement: consecutive frames needed to advance state
  minRepSeconds: 0.8,     // Rep duration guard: reps completed faster than 0.8s are flagged as too fast / ignored
  smoothingFrames: 5,     // Number of consecutive frames for moving average filter on knee angle

  // XP Rewards
  xpPerGoodRep: 10,       // XP for a verified good-depth squat (min angle <= 100)
  xpPerShallowRep: 2,     // XP for a shallow squat (min angle between 100 and 125)
  completionBonusXp: 20,  // Bonus XP awarded when target is reached with at least 80% good reps
  goodRepBonusThreshold: 0.8, // 80% good rep requirement for completion bonus

  // Level progression
  xpPerLevel: 100,        // Every 100 total XP grants a level (level = floor(totalXp / 100) + 1)

  // Auto-Start Ready Detection
  autoStartHoldSeconds: 2, // User must hold ready position continuously for 2 seconds
  steadyTolerance: 0.02,   // Maximum normalized movement (2% of frame size) allowed between frames

  // Ghost Mode Parameters
  ghostTargetBonusReps: 2,         // Extra reps added to ghost record for target
  ghostTargetBonusSeconds: 5,      // Extra seconds added to hold ghost record for target
  ghostBeatBonusXp: 25,            // Bonus XP awarded when beating the ghost (once per session)

  // AI Power Mode Parameters
  comboMax: 5,                     // Max combo multiplier
  comboResetPauseSeconds: 4.0,     // Consecutive pause in seconds before combo resets
  comboEnergyBonusPercent: 2,      // Small energy percentage added per combo tier
  powerXpMultiplier: 1.5,          // Real game effect on next workout of that exercise
};
