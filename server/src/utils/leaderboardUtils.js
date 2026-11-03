const crypto = require('crypto');

const TIMEZONE = 'Asia/Kolkata';

// Disallowed or reserved words in nicknames
const BLOCKED_WORDS = [
  'admin',
  'administrator',
  'moderator',
  'mod',
  'system',
  'root',
  'support',
  'official',
  'fitnova',
  'null',
  'undefined',
  'nazi',
  'hitler',
  'fuck',
  'shit',
  'bitch',
  'asshole',
  'dick',
  'cunt',
  'pussy',
  'nigger',
  'faggot',
];

/**
 * Returns date key in YYYY-MM-DD for Asia/Kolkata timezone
 */
function getDayKey(date = new Date(), timeZone = TIMEZONE) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const y = parts.find((p) => p.type === 'year').value;
  const m = parts.find((p) => p.type === 'month').value;
  const d = parts.find((p) => p.type === 'day').value;
  return `${y}-${m}-${d}`;
}

/**
 * Returns week key in YYYY-Www for Asia/Kolkata timezone
 */
function getWeekKey(date = new Date(), timeZone = TIMEZONE) {
  const dayStr = getDayKey(date, timeZone);
  const [y, m, d] = dayStr.split('-').map(Number);
  const target = new Date(Date.UTC(y, m - 1, d));

  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = target.getTime();

  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) {
    target.setUTCMonth(0, 1 + ((4 - target.getUTCDay() + 7) % 7));
  }
  const weekNr = 1 + Math.ceil((firstThursday - target.getTime()) / 604800000);
  return `${y}-W${String(weekNr).padStart(2, '0')}`;
}

/**
 * Validates a guest nickname
 */
function validateNickname(nickname) {
  if (!nickname || typeof nickname !== 'string') {
    return { isValid: false, error: 'Nickname is required' };
  }

  const trimmed = nickname.trim();
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Nickname must be at least 2 characters' };
  }
  if (trimmed.length > 16) {
    return { isValid: false, error: 'Nickname must be 16 characters or fewer' };
  }

  const safeRegex = /^[a-zA-Z0-9_ ]+$/;
  if (!safeRegex.test(trimmed)) {
    return { isValid: false, error: 'Nickname contains invalid characters (letters, numbers, spaces, underscores only)' };
  }

  const lower = trimmed.toLowerCase();
  for (const blocked of BLOCKED_WORDS) {
    if (lower.includes(blocked)) {
      return { isValid: false, error: 'Nickname contains disallowed or reserved words' };
    }
  }

  return { isValid: true, sanitized: trimmed };
}

/**
 * Generates a random 4-digit numeric tag
 */
function generateNicknameTag() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/**
 * Generates an unhashed secret token for entry authorization
 */
function generateSecretToken() {
  return crypto.randomBytes(24).toString('hex');
}

/**
 * Hashes a secret token with SHA-256 for secure database storage
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

/**
 * Verifies a token against a stored hash
 */
function verifyToken(token, hashed) {
  if (!token || !hashed) return false;
  const candidateHash = hashToken(token);
  return candidateHash === hashed;
}

/**
 * Validates submitted workout session metrics against sanity and anti-abuse rules.
 */
function validateSessionData(session) {
  if (!session || typeof session !== 'object') {
    return { isValid: false, error: 'Session data object is required' };
  }

  const durationSeconds = Number(session.durationSeconds || 0);
  const totalReps = Number(session.totalReps ?? session.reps ?? 0);
  const holdSeconds = Number(session.holdSeconds ?? 0);
  const xpEarned = Number(session.xpEarned ?? 0);
  const streak = Number(session.streak ?? 1);
  const level = Number(session.level ?? 1);

  // Negative value checks
  if (durationSeconds < 0 || totalReps < 0 || holdSeconds < 0 || xpEarned < 0 || streak < 0 || level < 1) {
    return { isValid: false, error: 'Negative numbers or invalid metrics in session payload' };
  }

  // Minimum duration constraint
  if (durationSeconds < 1 && totalReps > 0) {
    return { isValid: false, error: 'Workout duration must be at least 1 second' };
  }

  // Rep speed sanity check: maximum 3 reps per second
  if (totalReps > 0 && durationSeconds > 0) {
    const maxPossibleReps = Math.max(10, Math.ceil(durationSeconds * 3));
    if (totalReps > maxPossibleReps) {
      return {
        isValid: false,
        error: `Impossible rep cadence: ${totalReps} reps in ${durationSeconds}s exceeds physical limits`,
      };
    }
  }

  // Hold duration sanity check
  if (holdSeconds > durationSeconds + 5) {
    return { isValid: false, error: 'Hold duration cannot exceed total workout elapsed time' };
  }

  // XP sanity check: standard rep XP is 10 (good) / 2 (partial), plus reasonable combo, ghost, daily bonus
  const effectiveCount = Math.max(1, totalReps || Math.ceil(holdSeconds / 3));
  const maxXpPerRep = 10;
  const maxAllowableSessionXp = Math.ceil(effectiveCount * maxXpPerRep * 1.5) + 350;

  if (xpEarned > maxAllowableSessionXp) {
    return {
      isValid: false,
      error: `Excessive XP earned in session (${xpEarned} XP exceeds max cap of ${maxAllowableSessionXp})`,
    };
  }

  return {
    isValid: true,
    sanitized: {
      durationSeconds: Math.round(durationSeconds),
      totalReps: Math.round(totalReps),
      holdSeconds: Math.round(holdSeconds),
      xpEarned: Math.round(xpEarned),
      streak: Math.max(1, Math.round(streak)),
      level: Math.max(1, Math.round(level)),
      exerciseId: String(session.exerciseId || 'squat').slice(0, 32),
    },
  };
}

module.exports = {
  TIMEZONE,
  BLOCKED_WORDS,
  getDayKey,
  getWeekKey,
  validateNickname,
  generateNicknameTag,
  generateSecretToken,
  hashToken,
  verifyToken,
  validateSessionData,
};

