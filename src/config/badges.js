import {
  Trophy,
  Flame,
  Zap,
  Target,
  Award,
  Sparkles,
  Shield,
  Star,
  Activity,
  Layers,
  Ghost,
} from 'lucide-react';


/**
 * 15 Achievement Badge Definitions for FitNova
 *
 * Rules:
 * - Badges MUST check the exercise id and the right metric.
 * - "Plank 30s" unlocks only when exercise === "plank" (or "core-plank") and holdSeconds >= 30.
 * - "10 Good Reps" and "Iron Will" require rep-based exercises (isHold === false) and use reps.
 * - Hold badges never fire from rep exercises and vice-versa.
 * - Badges unlock only once and only on the workout that actually earned them.
 */
export const BADGES = [
  {
    id: 'first-rep',
    title: 'First Rep',
    description: 'Complete your first verified repetition in the arena.',
    hint: 'Perform at least 1 rep of any rep-based exercise.',
    icon: Star,
    gradient: 'from-amber-400 to-[#ff5a36]',
    check: ({ isHold, sessionTotalReps }) => !isHold && (sessionTotalReps || 0) >= 1,
  },
  {
    id: 'ten-good-reps',
    title: '10 Good Reps',
    description: 'Score 10 reps with good biomechanical depth in a single workout.',
    hint: 'Complete 10 good reps in one rep-based session.',
    icon: Award,
    gradient: 'from-emerald-400 to-teal-500',
    check: ({ isHold, sessionGoodReps }) => !isHold && (sessionGoodReps || 0) >= 10,
  },
  {
    id: 'iron-will',
    title: 'Iron Will',
    description: 'Power through 20 total repetitions in a single session.',
    hint: 'Complete 20 reps in one rep-based session.',
    icon: Flame,
    gradient: 'from-[#ff5a36] to-red-600',
    check: ({ isHold, sessionTotalReps }) => !isHold && (sessionTotalReps || 0) >= 20,
  },
  {
    id: 'streak-3',
    title: 'Streak 3',
    description: 'Train 3 consecutive calendar days.',
    hint: 'Build a 3-day daily streak.',
    icon: Zap,
    gradient: 'from-amber-400 to-yellow-500',
    check: ({ streak, longestStreak }) => Math.max(streak || 0, longestStreak || 0) >= 3,
  },
  {
    id: 'streak-7',
    title: 'Streak 7',
    description: 'Maintain an unbroken 7-day training habit.',
    hint: 'Build a 7-day daily streak.',
    icon: Trophy,
    gradient: 'from-yellow-400 to-amber-600',
    check: ({ streak, longestStreak }) => Math.max(streak || 0, longestStreak || 0) >= 7,
  },
  {
    id: 'level-5',
    title: 'Level 5',
    description: 'Reach Level 5 by earning over 400 total XP.',
    hint: 'Earn at least 400 XP.',
    icon: Shield,
    gradient: 'from-purple-500 to-indigo-600',
    check: ({ level, totalXp }) => (level || 1) >= 5 || (totalXp || 0) >= 400,
  },
  {
    id: 'plank-30s',
    title: 'Plank 30s',
    description: 'Complete a plank hold session lasting 30 seconds or longer.',
    hint: 'Hold a verified plank for at least 30 seconds.',
    icon: Activity,
    gradient: 'from-blue-400 to-cyan-500',
    check: ({ exercise, isHold, holdSeconds, durationSeconds }) => {
      const isPlank = exercise === 'plank' || exercise === 'core-plank';
      if (!isPlank) return false;
      const actualHold = holdSeconds !== undefined ? holdSeconds : durationSeconds;
      return (actualHold || 0) >= 30;
    },
  },
  {
    id: 'wall-sit-30s',
    title: 'Wall Sit 30s',
    description: 'Hold a verified 90-degree wall sit for 30 seconds or longer.',
    hint: 'Complete a wall sit hold lasting at least 30 seconds.',
    icon: Shield,
    gradient: 'from-emerald-400 to-teal-600',
    check: ({ exercise, isHold, holdSeconds, durationSeconds }) => {
      const isWallSit = exercise === 'wall-sit';
      if (!isWallSit) return false;
      const actualHold = holdSeconds !== undefined ? holdSeconds : durationSeconds;
      return (actualHold || 0) >= 30;
    },
  },
  {
    id: 'lunge-pro',
    title: 'Lunge Pro',
    description: 'Execute 10 reps of deep, stable lunges with good depth in a single workout.',
    hint: 'Score 10 good lunges in one workout session.',
    icon: Flame,
    gradient: 'from-rose-500 to-[#ff5a36]',
    check: ({ exercise, isHold, sessionGoodReps }) => {
      if (exercise !== 'lunge' || isHold) return false;
      return (sessionGoodReps || 0) >= 10;
    },
  },
  {
    id: 'kick-starter',
    title: 'Kick Starter',
    description: 'Blaze through 20 butt kicks in a single rhythm workout.',
    hint: 'Complete 20 butt kicks in one workout session.',
    icon: Zap,
    gradient: 'from-amber-400 to-orange-500',
    check: ({ exercise, isHold, sessionTotalReps }) => {
      if (exercise !== 'butt-kicks' || isHold) return false;
      return (sessionTotalReps || 0) >= 20;
    },
  },
  {
    id: 'all-rounder',
    title: 'All-Rounder',
    description: 'Train across distinct disciplines in the live arena.',
    hint: 'Log verified reps or holds in 3 different exercises.',
    icon: Layers,
    gradient: 'from-teal-400 to-emerald-600',
    check: ({ distinctExercisesCount }) => (distinctExercisesCount || 0) >= 3,
  },
  {
    id: 'personal-best',
    title: 'Personal Best',
    description: 'Shatter your all-time record for reps, XP, or accuracy.',
    hint: 'Beat any existing personal record.',
    icon: Sparkles,
    gradient: 'from-rose-500 to-amber-500',
    check: ({ hasNewRecord }) => Boolean(hasNewRecord),
  },
  {
    id: 'five-workouts',
    title: '5 Workouts Done',
    description: 'Complete 5 verified arena workout sessions.',
    hint: 'Finish 5 total sessions.',
    icon: Target,
    gradient: 'from-[#ff5a36] to-pink-600',
    check: ({ totalSessionsCount }) => (totalSessionsCount || 0) >= 5,
  },
  {
    id: 'ghost-buster',
    title: 'Ghost Buster',
    description: 'Outperform and defeat your recorded ghost in the live arena.',
    hint: 'Beat your ghost in any workout.',
    icon: Ghost,
    gradient: 'from-cyan-400 to-blue-600',
    check: ({ beatGhost }) => Boolean(beatGhost),
  },
  {
    id: 'ghost-streak-3',
    title: 'Ghost Streak 3',
    description: 'Defeat your ghost in 3 consecutive workouts.',
    hint: 'Beat your ghost 3 times in a row.',
    icon: Zap,
    gradient: 'from-amber-400 to-[#ff5a36]',
    check: ({ ghostStreak }) => (ghostStreak || 0) >= 3,
  },
  {
    id: 'power-up',
    title: 'Power Up',
    description: 'Charge your energy bar to 100% and unlock your first superpower.',
    hint: 'Unlock a power by completing target energy.',
    icon: Flame,
    gradient: 'from-rose-500 to-amber-500',
    check: ({ unlockedPower }) => Boolean(unlockedPower),
  },
  {
    id: 'combo-x5',
    title: 'Combo x5',
    description: 'Perform 5 consecutive good reps without breaking tempo.',
    hint: 'Reach a max combo multiplier of x5.',
    icon: Sparkles,
    gradient: 'from-amber-400 to-yellow-500',
    check: ({ isHold, maxCombo }) => !isHold && (maxCombo || 1) >= 5,
  },
  {
    id: 'elite-player',
    title: 'Elite Player',
    description: 'Conquer challenges to unlock an Elite tier difficulty.',
    hint: 'Unlock an Elite tier on any exercise ladder.',
    icon: Trophy,
    gradient: 'from-purple-500 to-indigo-600',
    check: ({ hasEliteTier }) => Boolean(hasEliteTier),
  },
  {
    id: 'daily-champion',
    title: 'Daily Champion',
    description: 'Complete today\'s verified arena daily challenge.',
    hint: 'Complete a verified daily challenge.',
    icon: Trophy,
    gradient: 'from-[#ff5a36] to-amber-500',
    check: ({ dailyCompleted }) => Boolean(dailyCompleted),
  },
  {
    id: 'seven-day-challenger',
    title: '7-Day Challenger',
    description: 'Complete the daily challenge on 7 different days.',
    hint: 'Complete the daily challenge on 7 distinct days.',
    icon: Zap,
    gradient: 'from-amber-400 to-purple-600',
    check: ({ dailyCompletedDays }) => (dailyCompletedDays || 0) >= 7,
  },
];

const BADGES_STORAGE_KEY = 'fq_badges';
const SESSIONS_STORAGE_KEY = 'fq_sessions';
const PROGRESS_STORAGE_KEY = 'fq_progress';

/**
 * Loads unlocked badges map from localStorage ({ badgeId: unlockedAtISO })
 */
export function loadUnlockedBadges() {
  try {
    const raw = localStorage.getItem(BADGES_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch (err) {
    console.warn('Failed to load fq_badges from localStorage:', err);
    return {};
  }
}

/**
 * Saves unlocked badges to localStorage
 */
export function saveUnlockedBadges(badgesMap) {
  try {
    localStorage.setItem(BADGES_STORAGE_KEY, JSON.stringify(badgesMap));
    return badgesMap;
  } catch (err) {
    console.warn('Failed to save fq_badges to localStorage:', err);
    return badgesMap;
  }
}

/**
 * Recomputes unlocked badges strictly from saved session history (fq_sessions)
 * and player progress (fq_progress) as the single source of truth.
 * Removes any badge that historical sessions cannot justify, while preserving
 * the original unlocked date for legitimate badges.
 */
export function recomputeUnlockedBadgesFromHistory(passedSessions = null, passedProgress = null) {
  try {
    const currentUnlocked = loadUnlockedBadges();

    // Load sessions
    let sessions = passedSessions;
    if (!sessions) {
      const rawSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
      sessions = rawSessions ? JSON.parse(rawSessions) : [];
      if (!Array.isArray(sessions)) sessions = [];
    }

    // Load progress
    let progress = passedProgress;
    if (!progress) {
      const rawProgress = localStorage.getItem(PROGRESS_STORAGE_KEY);
      progress = rawProgress ? JSON.parse(rawProgress) : {};
    }

    const recomputedMap = {};

    // 1. Check session-level badges across all recorded historical sessions
    for (const session of sessions) {
      const ex = session.exercise;
      const isHold = ex === 'plank' || ex === 'core-plank' || ex === 'wall-sit' || session.isHold === true;
      const durationSeconds = session.durationSeconds || 0;
      const holdSeconds = session.holdSeconds !== undefined ? session.holdSeconds : (isHold ? durationSeconds : 0);
      const totalReps = session.totalReps || 0;
      const goodReps = session.goodReps || 0;

      const sessionCtx = {
        exercise: ex,
        isHold,
        durationSeconds,
        holdSeconds,
        sessionTotalReps: totalReps,
        sessionGoodReps: goodReps,
        beatGhost: Boolean(session.beatGhost),
        unlockedPower: Boolean(session.unlockedPower),
        maxCombo: session.maxCombo || 1,
      };

      BADGES.forEach((badge) => {
        if (!recomputedMap[badge.id]) {
          try {
            if (badge.check(sessionCtx)) {
              recomputedMap[badge.id] = currentUnlocked[badge.id] || session.createdAt || new Date().toISOString();
            }
          } catch (e) {
            // Ignore check failures for unrelated properties
          }
        }
      });
    }

    // 2. Check aggregate-level badges (streak, level, distinct exercises, total sessions)
    const distinctExercises = new Set(
      sessions.map((s) => s.exercise).filter(Boolean)
    );
    const validSessionsCount = sessions.filter(
      (s) => (s.totalReps || 0) > 0 || ((s.exercise === 'plank' || s.exercise === 'core-plank') && (s.durationSeconds || 0) > 0)
    ).length;

    const streak = progress.streak || 0;
    const longestStreak = progress.longestStreak || streak;
    const level = progress.level || 1;
    const totalXp = progress.totalXp || progress.xp || 0;

    let dailyCompleted = Boolean(currentUnlocked['daily-champion']);
    let dailyCompletedDays = 0;
    try {
      const dailyRaw = localStorage.getItem('fq_daily');
      if (dailyRaw) {
        const parsedDaily = JSON.parse(dailyRaw);
        if (parsedDaily.claimed) dailyCompleted = true;
        if (Array.isArray(parsedDaily.completedDates)) {
          dailyCompletedDays = parsedDaily.completedDates.length;
        }
      }
    } catch (e) {
      // ignore
    }

    const aggregateCtx = {
      isHold: false,
      streak,
      longestStreak,
      level,
      totalXp,
      distinctExercisesCount: distinctExercises.size,
      totalSessionsCount: validSessionsCount,
      hasNewRecord: Boolean(progress.hasNewRecord),
      hasEliteTier: Boolean(progress.hasEliteTier),
      ghostStreak: progress.ghostStreak || 0,
      dailyCompleted,
      dailyCompletedDays,
    };

    BADGES.forEach((badge) => {
      if (!recomputedMap[badge.id]) {
        try {
          if (badge.check(aggregateCtx)) {
            recomputedMap[badge.id] = currentUnlocked[badge.id] || new Date().toISOString();
          }
        } catch (e) {
          // Ignore
        }
      }
    });

    saveUnlockedBadges(recomputedMap);
    return recomputedMap;
  } catch (err) {
    console.warn('Failed to recompute unlocked badges from history:', err);
    return loadUnlockedBadges();
  }
}

/**
 * Evaluates all badges against the current state and session metrics.
 * Returns newly unlocked badges array and updated badges map.
 */
export function evaluateBadges({
  sessionStats = {},
  progress = {},
  allSessions = [],
  hasNewRecord = false,
}) {
  // First recompute history to guarantee clean state
  const currentUnlocked = recomputeUnlockedBadgesFromHistory(allSessions, progress);
  const newlyUnlocked = [];
  const updatedMap = { ...currentUnlocked };

  // Calculate distinct exercises trained
  const distinctExercises = new Set(allSessions.map((s) => s.exercise).filter(Boolean));
  if (sessionStats.exercise) distinctExercises.add(sessionStats.exercise);

  const isHold = sessionStats.isHold || sessionStats.exercise === 'plank' || sessionStats.exercise === 'core-plank' || sessionStats.exercise === 'wall-sit';

  const evaluationContext = {
    exercise: sessionStats.exercise || null,
    isHold,
    holdSeconds: sessionStats.holdSeconds !== undefined ? sessionStats.holdSeconds : (isHold ? sessionStats.durationSeconds : 0),
    totalReps: (progress.totalReps || 0) + (sessionStats.totalReps || 0),
    sessionTotalReps: sessionStats.totalReps || 0,
    sessionGoodReps: sessionStats.goodReps || 0,
    streak: progress.streak || 0,
    longestStreak: progress.longestStreak || progress.streak || 0,
    level: progress.level || 1,
    totalXp: (progress.totalXp || 0) + (sessionStats.xpEarned || 0),
    durationSeconds: sessionStats.durationSeconds || 0,
    distinctExercisesCount: distinctExercises.size,
    hasNewRecord,
    totalSessionsCount: allSessions.length + (sessionStats.totalReps > 0 || (isHold && sessionStats.durationSeconds > 0) ? 1 : 0),
    beatGhost: Boolean(sessionStats.beatGhost),
    ghostStreak: sessionStats.ghostStreak || 0,
    unlockedPower: Boolean(sessionStats.unlockedPower),
    maxCombo: sessionStats.maxCombo || 1,
    hasEliteTier: Boolean(sessionStats.hasEliteTier),
  };

  const nowIso = new Date().toISOString();

  BADGES.forEach((badge) => {
    // Only check if not already unlocked
    if (!currentUnlocked[badge.id]) {
      try {
        if (badge.check(evaluationContext)) {
          updatedMap[badge.id] = nowIso;
          newlyUnlocked.push({
            ...badge,
            unlockedAt: nowIso,
          });
        }
      } catch (e) {
        console.warn(`Badge evaluation error for ${badge.id}:`, e);
      }
    }
  });

  if (newlyUnlocked.length > 0) {
    saveUnlockedBadges(updatedMap);
  }

  return { newlyUnlocked, allUnlocked: updatedMap };
}

/**
 * Dev-only unit test assertion function proving badge logic isolation:
 * Confirms that a Jumping Jacks workout does NOT unlock Plank 30s.
 */
export function runBadgeUnitTests() {
  const plankBadge = BADGES.find((b) => b.id === 'plank-30s');
  const tenGoodRepsBadge = BADGES.find((b) => b.id === 'ten-good-reps');
  const wallSitBadge = BADGES.find((b) => b.id === 'wall-sit-30s');
  const lungeProBadge = BADGES.find((b) => b.id === 'lunge-pro');
  const kickStarterBadge = BADGES.find((b) => b.id === 'kick-starter');

  if (plankBadge) {
    // Test 1: Jumping Jacks 35 seconds session MUST NOT unlock Plank 30s
    const jjContext = {
      exercise: 'jumping-jacks',
      isHold: false,
      durationSeconds: 35,
      sessionTotalReps: 25,
      sessionGoodReps: 25,
    };
    const jjUnlocked = plankBadge.check(jjContext);
    console.assert(
      !jjUnlocked,
      '[BADGE TEST FAILED] Jumping Jacks with duration >= 30s must NOT unlock Plank 30s!'
    );

    // Test 2: Real Plank with holdSeconds >= 30 MUST unlock Plank 30s
    const plankContext = {
      exercise: 'plank',
      isHold: true,
      holdSeconds: 30,
      durationSeconds: 30,
    };
    const plankUnlocked = plankBadge.check(plankContext);
    console.assert(
      plankUnlocked,
      '[BADGE TEST FAILED] Plank with holdSeconds >= 30s must unlock Plank 30s!'
    );
  }

  if (wallSitBadge) {
    // Wall sit 30s unlocks on wall-sit hold >= 30, never on squat
    const squatContext = {
      exercise: 'squat',
      isHold: false,
      durationSeconds: 40,
      sessionTotalReps: 30,
    };
    console.assert(
      !wallSitBadge.check(squatContext),
      '[BADGE TEST FAILED] Squat must NOT unlock Wall Sit 30s!'
    );

    const wallSitValid = {
      exercise: 'wall-sit',
      isHold: true,
      holdSeconds: 30,
    };
    console.assert(
      wallSitBadge.check(wallSitValid),
      '[BADGE TEST FAILED] Wall Sit 30s must unlock on wall-sit hold!'
    );
  }

  if (lungeProBadge) {
    const lungeValid = {
      exercise: 'lunge',
      isHold: false,
      sessionGoodReps: 10,
    };
    console.assert(
      lungeProBadge.check(lungeValid),
      '[BADGE TEST FAILED] 10 good lunges must unlock Lunge Pro!'
    );

    const squat10 = {
      exercise: 'squat',
      isHold: false,
      sessionGoodReps: 15,
    };
    console.assert(
      !lungeProBadge.check(squat10),
      '[BADGE TEST FAILED] Squat 15 reps must NOT unlock Lunge Pro!'
    );
  }

  if (kickStarterBadge) {
    const buttKicksValid = {
      exercise: 'butt-kicks',
      isHold: false,
      sessionTotalReps: 20,
    };
    console.assert(
      kickStarterBadge.check(buttKicksValid),
      '[BADGE TEST FAILED] 20 butt kicks must unlock Kick Starter!'
    );

    const jj20 = {
      exercise: 'jumping-jacks',
      isHold: false,
      sessionTotalReps: 25,
    };
    console.assert(
      !kickStarterBadge.check(jj20),
      '[BADGE TEST FAILED] Jumping jacks must NOT unlock Kick Starter!'
    );
  }

  if (tenGoodRepsBadge) {
    // Test 3: Plank hold MUST NOT unlock 10 Good Reps badge
    const plankRepContext = {
      exercise: 'plank',
      isHold: true,
      holdSeconds: 45,
      sessionGoodReps: 0,
    };
    const repUnlockedOnPlank = tenGoodRepsBadge.check(plankRepContext);
    console.assert(
      !repUnlockedOnPlank,
      '[BADGE TEST FAILED] Plank hold must NOT unlock 10 Good Reps!'
    );
  }
}

// Recompute badges from history on app load
if (typeof window !== 'undefined') {
  try {
    recomputeUnlockedBadgesFromHistory();
  } catch (e) {
    console.warn('Initial badge recompute error:', e);
  }
}

// Run unit tests in development mode
if (typeof window !== 'undefined' && import.meta?.env?.DEV) {
  runBadgeUnitTests();
}

