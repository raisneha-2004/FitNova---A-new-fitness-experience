import { DAILY_CHALLENGES } from '../config/dailyChallenges.js';
import {
  getLocalDateString,
  loadUserProgress,
  saveUserProgress,
  calculateStreak,
  calculateLevel,
  loadRecentSessions,
} from './progressStorage.js';
import { loadUnlockedBadges, saveUnlockedBadges } from '../config/badges.js';

export const DAILY_STORAGE_KEY = 'fq_daily';

/**
 * Returns the deterministic daily challenge for a given calendar date.
 * Based on calendar day index modulo the list length.
 * Everyone on the same local date receives the exact same challenge.
 *
 * @param {Date} [date=new Date()]
 * @returns {object} Daily challenge configuration object
 */
export function getDailyChallenge(date = new Date()) {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();

  // Day index since UTC reference
  const dayIndex = Math.floor(Date.UTC(y, m, d) / (1000 * 60 * 60 * 24));
  const listLen = DAILY_CHALLENGES.length;
  const challengeIndex = ((dayIndex % listLen) + listLen) % listLen;

  return DAILY_CHALLENGES[challengeIndex];
}

/**
 * Formats difference to local midnight in hh:mm:ss
 *
 * @param {Date} [now=new Date()]
 * @returns {{ hours: number, minutes: number, seconds: number, formatted: string, diffMs: number }}
 */
export function getTimeUntilMidnight(now = new Date()) {
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0); // Next local midnight

  const diffMs = Math.max(0, midnight.getTime() - now.getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  const pad = (n) => String(n).padStart(2, '0');
  const formatted = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return { hours, minutes, seconds, formatted, diffMs };
}

/**
 * Helper to test whether a timestamp falls on the same local calendar date.
 */
export function isSameLocalDate(isoOrDateStr, targetDate = new Date()) {
  if (!isoOrDateStr) return false;
  const d = new Date(isoOrDateStr);
  if (isNaN(d.getTime())) return false;

  return (
    d.getFullYear() === targetDate.getFullYear() &&
    d.getMonth() === targetDate.getMonth() &&
    d.getDate() === targetDate.getDate()
  );
}

/**
 * Loads daily state from localStorage (fq_daily).
 * Schema: { date: 'YYYY-MM-DD', challengeId: string, claimed: boolean, completedDates: string[] }
 */
export function loadDailyState(targetDate = new Date()) {
  const todayStr = getLocalDateString(targetDate);
  try {
    const raw = localStorage.getItem(DAILY_STORAGE_KEY);
    if (!raw) {
      return {
        date: todayStr,
        challengeId: getDailyChallenge(targetDate).id,
        claimed: false,
        completedDates: [],
      };
    }

    const parsed = JSON.parse(raw);
    const completedDates = Array.isArray(parsed.completedDates) ? parsed.completedDates : [];

    // If stored state is from a prior day, keep completedDates history but reset today's claimed status
    if (parsed.date !== todayStr) {
      return {
        date: todayStr,
        challengeId: getDailyChallenge(targetDate).id,
        claimed: false,
        completedDates,
      };
    }

    return {
      date: todayStr,
      challengeId: parsed.challengeId || getDailyChallenge(targetDate).id,
      claimed: Boolean(parsed.claimed),
      completedDates,
    };
  } catch (err) {
    console.warn('Failed to load fq_daily from localStorage:', err);
    return {
      date: todayStr,
      challengeId: getDailyChallenge(targetDate).id,
      claimed: false,
      completedDates: [],
    };
  }
}

/**
 * Saves daily state to localStorage (fq_daily)
 */
export function saveDailyState(state) {
  try {
    localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(state));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fq_daily_updated', { detail: state }));
    }
  } catch (err) {
    console.warn('Failed to save fq_daily to localStorage:', err);
  }
}

/**
 * Computes today's real progress from saved workout sessions in fq_sessions.
 * Progress is always recalculated from historical sessions, eliminating state drift.
 *
 * @param {object} challenge
 * @param {Array} [passedSessions=null]
 * @param {Date} [targetDate=new Date()]
 * @returns {{ current: number, target: number, percentage: number, isCompleted: boolean, unit: string }}
 */
export function getDailyChallengeProgress(challenge, passedSessions = null, targetDate = new Date()) {
  if (!challenge) {
    return { current: 0, target: 10, percentage: 0, isCompleted: false, unit: 'reps' };
  }

  let sessions = passedSessions;
  if (!sessions) {
    sessions = loadRecentSessions(100);
  }

  const isHold = challenge.type === 'hold';
  const target = Math.max(1, challenge.target);

  // Filter sessions strictly matching today's local date and challenge exerciseId
  const todaySessions = sessions.filter((s) => {
    if (!s) return false;
    const sessionDate = s.createdAt || s.date;
    const matchesDate = isSameLocalDate(sessionDate, targetDate);
    const matchesExercise = s.exercise === challenge.exerciseId;
    return matchesDate && matchesExercise;
  });

  // Calculate sum of good reps (or hold seconds)
  let current = 0;
  for (const s of todaySessions) {
    if (isHold) {
      const holdTime = Number(s.holdSeconds ?? s.durationSeconds ?? 0);
      current += Math.max(0, holdTime);
    } else {
      // Prioritize verified good reps; fall back to total reps if goodReps is omitted
      const reps = Number(s.goodReps ?? s.totalReps ?? s.reps ?? 0);
      current += Math.max(0, reps);
    }
  }

  const percentage = Math.min(100, Math.round((current / target) * 100));
  const isCompleted = current >= target;

  return {
    current,
    target,
    percentage,
    isCompleted,
    unit: isHold ? 's' : 'reps',
  };
}

/**
 * Claims the completion rewards for today's daily challenge.
 * Grants:
 * - +100 XP added to total XP (and recalculated level)
 * - Keeps daily streak alive
 * - Unlocks "daily-champion" badge
 * - Evaluates "seven-day-challenger" badge (if completed on >= 7 distinct days)
 * - Updates fq_daily state with claimed: true
 *
 * Cannot be claimed twice on the same day.
 */
export function claimDailyReward(challenge, targetDate = new Date()) {
  const todayStr = getLocalDateString(targetDate);
  const currentState = loadDailyState(targetDate);

  // Guard against duplicate claims on the same day
  if (currentState.claimed && currentState.date === todayStr) {
    return {
      success: false,
      alreadyClaimed: true,
      message: 'Daily reward already claimed today.',
    };
  }

  // 1. Grant XP & Streak
  const userProgress = loadUserProgress();
  const rewardXp = Number(challenge.rewardXp) || 100;
  const newTotalXp = userProgress.totalXp + rewardXp;
  const newLevel = calculateLevel(newTotalXp);

  // Keep streak alive
  const { streak: updatedStreak, lastDate } = calculateStreak(
    userProgress.streak,
    userProgress.lastWorkoutDate
  );

  const updatedProgress = {
    ...userProgress,
    totalXp: newTotalXp,
    level: newLevel,
    streak: updatedStreak,
    lastWorkoutDate: lastDate,
  };
  saveUserProgress(updatedProgress);

  // 2. Unlock Badges
  const badges = loadUnlockedBadges();
  const newlyUnlocked = [];

  if (!badges['daily-champion']) {
    badges['daily-champion'] = new Date().toISOString();
    newlyUnlocked.push('daily-champion');
  }

  // Update completed dates list
  const completedDates = new Set(currentState.completedDates || []);
  completedDates.add(todayStr);
  const updatedDatesList = Array.from(completedDates);

  if (updatedDatesList.length >= 7 && !badges['seven-day-challenger']) {
    badges['seven-day-challenger'] = new Date().toISOString();
    newlyUnlocked.push('seven-day-challenger');
  }

  saveUnlockedBadges(badges);

  // 3. Mark claimed in fq_daily
  const nextDailyState = {
    date: todayStr,
    challengeId: challenge.id,
    claimed: true,
    completedDates: updatedDatesList,
  };
  saveDailyState(nextDailyState);

  // Notify UI of updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('fq_progress_updated', { detail: updatedProgress }));
    window.dispatchEvent(new CustomEvent('fq_badges_updated', { detail: badges }));
  }

  return {
    success: true,
    alreadyClaimed: false,
    rewardXp,
    newTotalXp,
    newLevel,
    streak: updatedStreak,
    newlyUnlocked,
  };
}
