const storageService = require('../services/storageService');
const { xpPerLevel } = require('../data/exercises');

/**
 * Calculate the difference in calendar days between two dates
 */
function getDayDifference(dateStringA, dateStringB) {
  const dateA = new Date(dateStringA);
  const dateB = new Date(dateStringB);
  
  // Normalize both to UTC midnight to avoid timezone day shifts
  const utcA = Date.UTC(dateA.getFullYear(), dateA.getMonth(), dateA.getDate());
  const utcB = Date.UTC(dateB.getFullYear(), dateB.getMonth(), dateB.getDate());

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((utcB - utcA) / msPerDay);
}

/**
 * GET /api/progress
 * Returns current XP, level, streak, total reps for default demo user
 */
async function getProgress(req, res, next) {
  try {
    const progress = await storageService.getProgress();
    return res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/progress
 * Updates user progress after completing workout activity
 * Body: { xpEarned, repsDone, accuracy, maxRepsInSession, durationSeconds }
 * Returns { progress, newRecords }
 */
async function updateProgress(req, res, next) {
  try {
    const {
      xpEarned = 0,
      repsDone = 0,
      accuracy = 0,
      exercise = 'squat',
      maxRepsInSession,
    } = req.body;

    // Validation: xpEarned and repsDone must be non-negative numbers
    if (
      typeof xpEarned !== 'number' ||
      typeof repsDone !== 'number' ||
      xpEarned < 0 ||
      repsDone < 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input: xpEarned and repsDone must be non-negative numbers.',
      });
    }

    const currentProgress = await storageService.getProgress();
    const newXp = currentProgress.xp + xpEarned;
    const newTotalReps = currentProgress.totalReps + repsDone;
    const newLevel = Math.floor(newXp / xpPerLevel) + 1;

    // Calculate streak logic based on workout dates (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    let newStreak = currentProgress.streak;

    if (!currentProgress.lastWorkoutDate) {
      // First workout ever
      newStreak = 1;
    } else {
      const dayDiff = getDayDifference(currentProgress.lastWorkoutDate, today);
      if (dayDiff === 0) {
        // Same day workout - streak stays unchanged
        newStreak = Math.max(1, currentProgress.streak);
      } else if (dayDiff === 1) {
        // Consecutive day workout - streak increases by 1
        newStreak = currentProgress.streak + 1;
      } else if (dayDiff > 1) {
        // Gap of more than 1 day - streak resets to 1
        newStreak = 1;
      }
    }

    // Support both per-exercise PB map and legacy fallback
    const currentPbMap = currentProgress.personalBest || {};
    const exKey = exercise || 'squat';
    const exercisePb = currentPbMap[exKey] || {
      maxReps: currentPbMap.maxReps || 0,
      maxXp: currentPbMap.maxXp || 0,
      bestAccuracy: currentPbMap.bestAccuracy || 0,
    };

    const sessionReps = maxRepsInSession !== undefined ? maxRepsInSession : repsDone;
    const newRecords = {
      maxReps: sessionReps > (exercisePb.maxReps || 0) && sessionReps > 0,
      maxXp: xpEarned > (exercisePb.maxXp || 0) && xpEarned > 0,
      bestAccuracy: accuracy > (exercisePb.bestAccuracy || 0) && repsDone > 0 && accuracy > 0,
      longestStreak: newStreak > (currentProgress.longestStreak || currentProgress.streak || 0) && newStreak > 0,
    };

    const hasAnyNewRecord = Object.values(newRecords).some(Boolean);

    const updatedExercisePb = {
      maxReps: Math.max(exercisePb.maxReps || 0, sessionReps),
      maxXp: Math.max(exercisePb.maxXp || 0, xpEarned),
      bestAccuracy: repsDone > 0 ? Math.max(exercisePb.bestAccuracy || 0, Math.round(accuracy)) : (exercisePb.bestAccuracy || 0),
    };

    const updatedPbMap = {
      ...currentPbMap,
      [exKey]: updatedExercisePb,
      longestStreak: Math.max(currentProgress.longestStreak || 0, newStreak),
    };

    const updated = await storageService.saveProgress({
      xp: newXp,
      level: newLevel,
      streak: newStreak,
      longestStreak: updatedPbMap.longestStreak,
      lastWorkoutDate: today,
      totalReps: newTotalReps,
      personalBest: updatedPbMap,
    });

    return res.status(200).json({
      success: true,
      progress: updated,
      newRecords,
      hasNewRecord: hasAnyNewRecord,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProgress,
  updateProgress,
};
