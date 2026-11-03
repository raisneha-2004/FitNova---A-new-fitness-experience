import { GAME_CONFIG } from '../config/gameConfig';

const GHOSTS_STORAGE_KEY = 'fq_ghosts';
const GHOST_MODE_STORAGE_KEY = 'fq_ghost_mode';

/**
 * Loads all ghosts from localStorage
 * Format: { [exerciseId]: { last: Run, best: Run } }
 */
export function loadAllGhosts() {
  try {
    const raw = localStorage.getItem(GHOSTS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch (err) {
    console.warn('Failed to load fq_ghosts from localStorage:', err);
    return {};
  }
}

/**
 * Gets the ghost for a given exercise
 */
export function getExerciseGhost(exerciseId) {
  const ghosts = loadAllGhosts();
  return ghosts[exerciseId] || null;
}

/**
 * Saves a completed workout run as a ghost record
 * run = { date, reps, goodReps, accuracy, durationSeconds, repTimes }
 */
export function saveGhostRun(exerciseId, run) {
  try {
    const all = loadAllGhosts();
    const existing = all[exerciseId] || {};

    const safeRun = {
      date: run.date || new Date().toISOString(),
      reps: run.reps || 0,
      goodReps: run.goodReps || 0,
      accuracy: run.accuracy || 0,
      durationSeconds: run.durationSeconds || 0,
      repTimes: (run.repTimes || []).slice(0, 100), // Max 100 entries
    };

    const isNewBest = !existing.best || safeRun.reps > existing.best.reps || 
      (safeRun.reps === existing.best.reps && safeRun.durationSeconds < existing.best.durationSeconds);

    const updated = {
      ...all,
      [exerciseId]: {
        last: safeRun,
        best: isNewBest ? safeRun : existing.best,
      },
    };

    localStorage.setItem(GHOSTS_STORAGE_KEY, JSON.stringify(updated));
    return { updatedGhost: updated[exerciseId], isNewBest };
  } catch (err) {
    console.warn('Failed to save ghost run to localStorage:', err);
    return { updatedGhost: null, isNewBest: false };
  }
}

/**
 * Ghost Mode toggle state persistence
 */
export function loadGhostModeSetting() {
  try {
    const val = localStorage.getItem(GHOST_MODE_STORAGE_KEY);
    return val === null ? true : val === 'true'; // Default ON
  } catch (err) {
    return true;
  }
}

export function saveGhostModeSetting(enabled) {
  try {
    localStorage.setItem(GHOST_MODE_STORAGE_KEY, String(enabled));
  } catch (err) {
    console.warn('Failed to save fq_ghost_mode:', err);
  }
}

/**
 * Computes suggested target when Ghost Mode is active
 */
export function calculateGhostTarget(ghostRun, isHold = false) {
  if (!ghostRun) return null;
  const base = ghostRun.reps || 0;
  if (base <= 0) return null;
  const bonus = isHold
    ? (GAME_CONFIG.ghostTargetBonusSeconds || 5)
    : (GAME_CONFIG.ghostTargetBonusReps || 2);
  return base + bonus;
}

/**
 * Evaluates match result between current workout and ghost
 */
export function evaluateGhostMatch(currentReps, ghostReps) {
  if (!ghostReps || ghostReps <= 0) {
    return { outcome: 'first_run', diff: 0, text: 'First Ghost Recorded!' };
  }
  const diff = currentReps - ghostReps;
  if (diff > 0) {
    return {
      outcome: 'win',
      diff,
      text: `You beat your ghost by ${diff} ${diff === 1 ? 'rep' : 'reps'}!`,
    };
  } else if (diff === 0) {
    return {
      outcome: 'tied',
      diff: 0,
      text: 'Tied with your ghost! Push harder next time.',
    };
  } else {
    return {
      outcome: 'loss',
      diff: Math.abs(diff),
      text: `Ghost wins this time by ${Math.abs(diff)} reps. Try again!`,
    };
  }
}
