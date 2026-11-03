const storageService = require('../services/storageService');
const { exercises } = require('../data/exercises');

/**
 * Checks if a value is a valid non-negative number
 */
function isNonNegativeNumber(val) {
  return typeof val === 'number' && !isNaN(val) && val >= 0;
}

/**
 * POST /api/sessions
 * Saves a workout session summary
 * Body: { exercise, totalReps, goodReps, shallowReps, accuracy, avgAngle, bestAngle, xpEarned, durationSeconds, targetReps }
 */
async function createSession(req, res, next) {
  try {
    const {
      exercise = 'squat',
      totalReps,
      goodReps,
      shallowReps = 0,
      accuracy,
      avgAngle = 0,
      bestAngle = 0,
      xpEarned,
      durationSeconds,
      targetReps = 10,
    } = req.body;

    // Validate exercise ID against known exercise catalog
    const validExercise = exercises.find((ex) => ex.id === exercise);
    if (!validExercise) {
      const allowed = exercises.map((e) => e.id).join(', ');
      return res.status(400).json({
        success: false,
        message: `Invalid exercise '${exercise}'. Allowed exercises: ${allowed}.`,
      });
    }

    const isHold = validExercise.type === 'hold';
    const finalTotalReps = isHold ? (totalReps || 0) : totalReps;
    const finalGoodReps = isHold ? (goodReps || 0) : goodReps;
    const finalShallowReps = isHold ? (shallowReps || 0) : shallowReps;
    const finalAccuracy = isHold ? (accuracy !== undefined ? accuracy : 100) : accuracy;

    // Validate all numeric metric inputs: must be non-negative numbers
    const numericFields = {
      totalReps: finalTotalReps,
      goodReps: finalGoodReps,
      shallowReps: finalShallowReps,
      accuracy: finalAccuracy,
      avgAngle,
      bestAngle,
      xpEarned,
      durationSeconds,
      targetReps,
    };

    for (const [key, value] of Object.entries(numericFields)) {
      if (!isNonNegativeNumber(value)) {
        return res.status(400).json({
          success: false,
          message: `Invalid input: '${key}' must be a non-negative number.`,
        });
      }
    }

    // Logical check 1: accuracy must be between 0 and 100
    if (accuracy < 0 || accuracy > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input: accuracy must be between 0 and 100.',
      });
    }

    // Logical check 2: goodReps + shallowReps cannot exceed totalReps
    if (finalGoodReps + finalShallowReps > finalTotalReps) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input: goodReps + shallowReps cannot exceed totalReps.',
      });
    }

    const session = await storageService.addSession({
      exercise,
      totalReps: finalTotalReps,
      goodReps: finalGoodReps,
      shallowReps: finalShallowReps,
      badReps: Math.max(0, finalTotalReps - finalGoodReps - finalShallowReps),
      accuracy: finalAccuracy,
      avgAngle,
      bestAngle,
      xpEarned,
      durationSeconds,
      targetReps,
    });

    return res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/sessions
 * Returns the last 10 sessions, newest first
 */
async function getSessions(req, res, next) {
  try {
    const limit = 10;
    const sessions = await storageService.getRecentSessions(limit);
    return res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createSession,
  getSessions,
};
