import { GAME_CONFIG } from '../config/gameConfig.js';

const PROGRESS_KEY = 'fq_progress';
const SESSIONS_KEY = 'fq_sessions';

/**
 * Computes level from total XP:
 * level = floor(totalXp / 100) + 1
 */
export function calculateLevel(totalXp) {
  const safeXp = Math.max(0, Number(totalXp) || 0);
  return Math.floor(safeXp / GAME_CONFIG.xpPerLevel) + 1;
}

/**
 * Formats a Date object to YYYY-MM-DD in local time
 */
export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates updated streak according to calendar days:
 * - Same day workout: streak unchanged
 * - Next consecutive calendar day: streak + 1
 * - Gap > 1 day or first time: streak resets to 1
 *
 * @param {number} currentStreak
 * @param {string|null} lastWorkoutDate - YYYY-MM-DD
 * @returns {{ streak: number, lastDate: string }}
 */
export function calculateStreak(currentStreak = 0, lastWorkoutDate = null) {
  const todayStr = getLocalDateString();
  if (!lastWorkoutDate) {
    return { streak: 1, lastDate: todayStr };
  }

  if (lastWorkoutDate === todayStr) {
    return { streak: Math.max(1, currentStreak), lastDate: todayStr };
  }

  // Parse calendar day difference
  const [todayY, todayM, todayD] = todayStr.split('-').map(Number);
  const [lastY, lastM, lastD] = lastWorkoutDate.split('-').map(Number);

  const todayUtc = Date.UTC(todayY, todayM - 1, todayD);
  const lastUtc = Date.UTC(lastY, lastM - 1, lastD);

  const diffDays = Math.round((todayUtc - lastUtc) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return { streak: currentStreak + 1, lastDate: todayStr };
  } else if (diffDays > 1) {
    return { streak: 1, lastDate: todayStr };
  }

  return { streak: Math.max(1, currentStreak), lastDate: todayStr };
}

/**
 * Default Personal Best structure per exercise
 */
export const DEFAULT_EXERCISE_PB = {
  maxReps: 0,
  maxXp: 0,
  bestAccuracy: 0,
};

/**
 * Loads user progress (totalXp, level, streak, lastWorkoutDate, personalBest, longestStreak)
 * from localStorage (fq_progress).
 * Personal Best is stored per-exercise: { [exerciseId]: { maxReps, maxXp, bestAccuracy } }
 * plus top-level longestStreak.
 */
export function loadUserProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) {
      return {
        totalXp: 0,
        level: 1,
        streak: 0,
        longestStreak: 0,
        lastWorkoutDate: null,
        personalBest: {},
      };
    }
    const parsed = JSON.parse(raw);
    const totalXp = Math.max(0, Number(parsed.totalXp) || 0);
    const level = calculateLevel(totalXp);
    const streak = Math.max(0, Number(parsed.streak) || 0);
    const longestStreak = Math.max(streak, Number(parsed.longestStreak) || 0);
    const lastWorkoutDate = typeof parsed.lastWorkoutDate === 'string' ? parsed.lastWorkoutDate : null;

    // Support both new per-exercise schema and legacy flat schema
    const rawPb = parsed.personalBest || {};
    let personalBest = {};

    if (rawPb.maxReps !== undefined || rawPb.maxXp !== undefined) {
      // Legacy flat schema: map it to 'squat'
      personalBest = {
        squat: {
          maxReps: Math.max(0, Number(rawPb.maxReps) || 0),
          maxXp: Math.max(0, Number(rawPb.maxXp) || 0),
          bestAccuracy: Math.min(100, Math.max(0, Number(rawPb.bestAccuracy) || 0)),
        },
      };
    } else {
      personalBest = { ...rawPb };
    }

    return { totalXp, level, streak, longestStreak, lastWorkoutDate, personalBest };
  } catch (err) {
    console.warn('Failed to load fq_progress from localStorage:', err);
    return {
      totalXp: 0,
      level: 1,
      streak: 0,
      longestStreak: 0,
      lastWorkoutDate: null,
      personalBest: {},
    };
  }
}

/**
 * Saves user progress to localStorage (fq_progress).
 */
export function saveUserProgress(progress) {
  try {
    const prev = loadUserProgress();
    const streak = Math.max(0, Number(progress.streak !== undefined ? progress.streak : prev.streak) || 0);
    const longestStreak = Math.max(
      prev.longestStreak,
      streak,
      Number(progress.longestStreak) || 0
    );

    const toSave = {
      totalXp: Math.max(0, Number(progress.totalXp !== undefined ? progress.totalXp : prev.totalXp) || 0),
      level: calculateLevel(progress.totalXp !== undefined ? progress.totalXp : prev.totalXp),
      streak,
      longestStreak,
      lastWorkoutDate: progress.lastWorkoutDate || prev.lastWorkoutDate || getLocalDateString(),
      personalBest: {
        ...(prev.personalBest || {}),
        ...(progress.personalBest || {}),
      },
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(toSave));
    return toSave;
  } catch (err) {
    console.warn('Failed to save fq_progress to localStorage:', err);
    return progress;
  }
}

/**
 * Compares session stats with stored Personal Best for the specific exercise.
 * Returns { newRecords, hasNewRecord, isFirstRecord, updatedPb, updatedExercisePb }
 * - On the very first workout of an exercise: isFirstRecord is true, newRecords are false.
 * - On subsequent workouts: record flags are true ONLY when the new value strictly beats the previously saved value.
 */
export function checkPersonalBestRecords(
  sessionStats,
  currentPbMap = {},
  currentStreak = 0,
  exerciseId = 'squat'
) {
  const { totalReps = 0, xpEarned = 0, accuracy = 0, holdSeconds = 0, durationSeconds = 0 } = sessionStats;
  const exKey = exerciseId || 'squat';
  const existingPb = currentPbMap[exKey];

  const isHold = exKey === 'plank' || exKey === 'core-plank' || exKey === 'wall-sit';
  const effectiveScore = isHold ? (holdSeconds || durationSeconds || totalReps) : totalReps;

  // If no previous record exists or all recorded stats are 0, this is the first workout for this exercise
  const hasPreviousRecord =
    existingPb &&
    ((existingPb.maxReps || 0) > 0 || (existingPb.maxXp || 0) > 0 || (existingPb.bestAccuracy || 0) > 0);

  const isFirstRecord = !hasPreviousRecord && effectiveScore > 0;

  const exercisePb = existingPb || { maxReps: 0, maxXp: 0, bestAccuracy: 0 };

  const newRecords = {
    maxReps: hasPreviousRecord && effectiveScore > (exercisePb.maxReps || 0) && effectiveScore > 0,
    maxXp: hasPreviousRecord && xpEarned > (exercisePb.maxXp || 0) && xpEarned > 0,
    bestAccuracy: hasPreviousRecord && accuracy > (exercisePb.bestAccuracy || 0) && effectiveScore > 0 && accuracy > 0,
    longestStreak: currentStreak > (currentPbMap.longestStreak || 0) && currentStreak > 0,
  };

  const hasNewRecord = Object.values(newRecords).some(Boolean);

  const updatedExercisePb = {
    maxReps: Math.max(exercisePb.maxReps || 0, effectiveScore),
    maxXp: Math.max(exercisePb.maxXp || 0, xpEarned),
    bestAccuracy: effectiveScore > 0 ? Math.max(exercisePb.bestAccuracy || 0, Math.round(accuracy)) : (exercisePb.bestAccuracy || 0),
  };

  const updatedPbMap = {
    ...currentPbMap,
    [exKey]: updatedExercisePb,
    longestStreak: Math.max(currentPbMap.longestStreak || 0, currentStreak),
  };

  return { newRecords, hasNewRecord, isFirstRecord, updatedPb: updatedPbMap, updatedExercisePb };
}

/**
 * Loads recent workout sessions from localStorage (fq_sessions).
 */
export function loadRecentSessions(limit = 10) {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, limit);
  } catch (err) {
    console.warn('Failed to load fq_sessions from localStorage:', err);
    return [];
  }
}

/**
 * Saves a completed workout session to localStorage (fq_sessions), keeping newest first up to limit.
 */
export function saveRecentSession(sessionData, limit = 20) {
  try {
    const current = loadRecentSessions(limit);
    const dateStr = sessionData.createdAt || sessionData.date || new Date().toISOString();
    const newSession = {
      id: sessionData.id || `session_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: dateStr,
      date: dateStr,
      ...sessionData,
    };
    const updated = [newSession, ...current].slice(0, limit);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to save fq_sessions to localStorage:', err);
    return [];
  }
}

/**
 * Recomputes total XP, level, and personal bests from valid saved sessions.
 * Returns the recalculated progress object and persists it to fq_progress.
 */
export function recomputeProgressFromSessions() {
  try {
    const sessions = loadRecentSessions(100);
    const validSessions = sessions.filter(
      (s) => (s.totalReps || s.reps || 0) > 0 || (s.durationSeconds || 0) > 0
    );

    const calculatedTotalXp = validSessions.reduce(
      (sum, s) => sum + (Number(s.xpEarned || s.xp) || 0),
      0
    );

    const level = calculateLevel(calculatedTotalXp);

    // Rebuild per-exercise personal bests
    const personalBest = {};
    for (const s of validSessions) {
      const ex = s.exercise || 'squat';
      if (!personalBest[ex]) {
        personalBest[ex] = { maxReps: 0, maxXp: 0, bestAccuracy: 0 };
      }
      const reps = Number(s.totalReps || s.reps) || 0;
      const xp = Number(s.xpEarned || s.xp) || 0;
      const acc = Number(s.accuracy) || 0;

      personalBest[ex].maxReps = Math.max(personalBest[ex].maxReps, reps);
      personalBest[ex].maxXp = Math.max(personalBest[ex].maxXp, xp);
      personalBest[ex].bestAccuracy = Math.max(personalBest[ex].bestAccuracy, acc);
    }

    const currentProg = loadUserProgress();
    const updatedProg = {
      ...currentProg,
      totalXp: calculatedTotalXp,
      level,
      personalBest,
    };

    saveUserProgress(updatedProg);
    return updatedProg;
  } catch (err) {
    console.warn('Failed to recompute progress from sessions:', err);
    return loadUserProgress();
  }
}
