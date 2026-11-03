const { getDatabaseStatus, inMemoryStore } = require('../config/db');
const LeaderboardEntry = require('../models/LeaderboardEntry');
const {
  getDayKey,
  getWeekKey,
  generateNicknameTag,
  generateSecretToken,
  hashToken,
  verifyToken,
} = require('../utils/leaderboardUtils');

/**
 * Formats a database or in-memory document for public API consumption.
 * Strictly omits guestId, deleteToken, and internal hashes.
 */
function formatPublicEntry(doc, rank = null) {
  const xp = doc.xp !== undefined ? doc.xp : doc.xpToday || 0;
  return {
    rank: rank !== null ? rank : doc.rank || 0,
    nickname: doc.nickname,
    nicknameTag: doc.nicknameTag,
    displayName: `${doc.nickname}#${doc.nicknameTag}`,
    avatarId: doc.avatarId || 'dumbbell',
    xp,
    xpToday: doc.xpToday || 0,
    xpWeek: doc.xpWeek || 0,
    xpTotal: doc.xpTotal || 0,
    streak: doc.streak || 1,
    level: doc.level || 1,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
  };
}

/**
 * Submits or updates a player's verified score on the leaderboard.
 * Manages daily/weekly rollover and secret token generation for anti-hijacking.
 */
async function submitScore({ guestId, nickname, avatarId, session, token }) {
  const currentDayKey = getDayKey();
  const currentWeekKey = getWeekKey();

  if (getDatabaseStatus()) {
    let entry = await LeaderboardEntry.findOne({ guestId });

    if (!entry) {
      // 1. New Player Entry: issue secret token
      const rawToken = generateSecretToken();
      const hashedToken = hashToken(rawToken);
      const tag = generateNicknameTag();

      entry = await LeaderboardEntry.create({
        guestId,
        nickname,
        nicknameTag: tag,
        avatarId: avatarId || 'dumbbell',
        xpToday: session.xpEarned,
        xpWeek: session.xpEarned,
        xpTotal: session.xpEarned,
        streak: session.streak,
        level: session.level,
        dayKey: currentDayKey,
        weekKey: currentWeekKey,
        deleteToken: hashedToken,
      });

      return {
        success: true,
        isNew: true,
        token: rawToken,
        entry: formatPublicEntry(entry),
      };
    }

    // 2. Existing Player Entry: verify token
    if (!token || !verifyToken(token, entry.deleteToken)) {
      const err = new Error('Invalid or missing secret player token for this guest entry');
      err.statusCode = 401;
      throw err;
    }

    // Rollover checks for Asia/Kolkata timezone
    if (entry.dayKey !== currentDayKey) {
      entry.xpToday = 0;
      entry.dayKey = currentDayKey;
    }
    if (entry.weekKey !== currentWeekKey) {
      entry.xpWeek = 0;
      entry.weekKey = currentWeekKey;
    }

    // Anti-abuse: Sane daily XP ceiling (5,000 XP/day max)
    const availableDailyAllowance = Math.max(0, 5000 - entry.xpToday);
    const addedXp = Math.min(session.xpEarned, availableDailyAllowance);

    entry.xpToday += addedXp;
    entry.xpWeek += addedXp;
    entry.xpTotal += addedXp;
    entry.streak = Math.max(entry.streak, session.streak);
    entry.level = Math.max(entry.level, session.level);
    entry.nickname = nickname;
    if (avatarId) entry.avatarId = avatarId;

    await entry.save();

    return {
      success: true,
      isNew: false,
      entry: formatPublicEntry(entry),
    };
  }

  // Fallback: In-memory store
  const board = inMemoryStore.leaderboard;
  let entry = board.find((e) => e.guestId === guestId);

  if (!entry) {
    const rawToken = generateSecretToken();
    const hashedToken = hashToken(rawToken);
    const tag = generateNicknameTag();

    entry = {
      guestId,
      nickname,
      nicknameTag: tag,
      avatarId: avatarId || 'dumbbell',
      xpToday: session.xpEarned,
      xpWeek: session.xpEarned,
      xpTotal: session.xpEarned,
      streak: session.streak,
      level: session.level,
      dayKey: currentDayKey,
      weekKey: currentWeekKey,
      deleteToken: hashedToken,
      updatedAt: new Date(),
    };
    board.push(entry);

    return {
      success: true,
      isNew: true,
      token: rawToken,
      entry: formatPublicEntry(entry),
    };
  }

  if (!token || !verifyToken(token, entry.deleteToken)) {
    const err = new Error('Invalid or missing secret player token for this guest entry');
    err.statusCode = 401;
    throw err;
  }

  if (entry.dayKey !== currentDayKey) {
    entry.xpToday = 0;
    entry.dayKey = currentDayKey;
  }
  if (entry.weekKey !== currentWeekKey) {
    entry.xpWeek = 0;
    entry.weekKey = currentWeekKey;
  }

  const availableDailyAllowance = Math.max(0, 5000 - entry.xpToday);
  const addedXp = Math.min(session.xpEarned, availableDailyAllowance);

  entry.xpToday += addedXp;
  entry.xpWeek += addedXp;
  entry.xpTotal += addedXp;
  entry.streak = Math.max(entry.streak, session.streak);
  entry.level = Math.max(entry.level, session.level);
  entry.nickname = nickname;
  if (avatarId) entry.avatarId = avatarId;
  entry.updatedAt = new Date();

  return {
    success: true,
    isNew: false,
    entry: formatPublicEntry(entry),
  };
}

/**
 * Retrieves ranked leaderboard entries for today, this week, or all-time.
 */
async function getLeaderboard({ range = 'today', limit = 50 }) {
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 50));
  const currentDayKey = getDayKey();
  const currentWeekKey = getWeekKey();

  let sortField = 'xpToday';
  if (range === 'week' || range === 'thisWeek') sortField = 'xpWeek';
  if (range === 'all' || range === 'allTime') sortField = 'xpTotal';

  if (getDatabaseStatus()) {
    // Reset any stale dayKey/weekKey counters if needed, or query matching keys
    const entries = await LeaderboardEntry.find()
      .sort({ [sortField]: -1, updatedAt: -1 })
      .limit(safeLimit)
      .lean();

    const totalPlayers = await LeaderboardEntry.countDocuments();

    const ranked = entries.map((doc, idx) => {
      // Calculate effective XP for requested range with timezone rollover
      let effectiveXp = doc.xpToday;
      if (range === 'week' || range === 'thisWeek') {
        effectiveXp = doc.weekKey === currentWeekKey ? doc.xpWeek : 0;
      } else if (range === 'all' || range === 'allTime') {
        effectiveXp = doc.xpTotal;
      } else {
        effectiveXp = doc.dayKey === currentDayKey ? doc.xpToday : 0;
      }

      return {
        ...formatPublicEntry(doc, idx + 1),
        xp: effectiveXp,
      };
    });

    return {
      range,
      totalPlayers,
      entries: ranked,
    };
  }

  // Fallback: In-memory
  const board = inMemoryStore.leaderboard;
  const sorted = [...board].sort((a, b) => {
    let xpA = a.xpToday;
    let xpB = b.xpToday;
    if (range === 'week' || range === 'thisWeek') {
      xpA = a.weekKey === currentWeekKey ? a.xpWeek : 0;
      xpB = b.weekKey === currentWeekKey ? b.xpWeek : 0;
    } else if (range === 'all' || range === 'allTime') {
      xpA = a.xpTotal;
      xpB = b.xpTotal;
    } else {
      xpA = a.dayKey === currentDayKey ? a.xpToday : 0;
      xpB = b.dayKey === currentDayKey ? b.xpToday : 0;
    }

    if (xpB !== xpA) return xpB - xpA;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  const totalPlayers = sorted.length;
  const sliced = sorted.slice(0, safeLimit);
  const ranked = sliced.map((entry, idx) => {
    let effectiveXp = entry.xpToday;
    if (range === 'week' || range === 'thisWeek') {
      effectiveXp = entry.weekKey === currentWeekKey ? entry.xpWeek : 0;
    } else if (range === 'all' || range === 'allTime') {
      effectiveXp = entry.xpTotal;
    } else {
      effectiveXp = entry.dayKey === currentDayKey ? entry.xpToday : 0;
    }

    return {
      ...formatPublicEntry(entry, idx + 1),
      xp: effectiveXp,
    };
  });

  return {
    range,
    totalPlayers,
    entries: ranked,
  };
}

/**
 * Calculates current rank for a specific guest ID across today, week, and all time.
 */
async function getPlayerRank(guestId) {
  if (!guestId) return null;

  if (getDatabaseStatus()) {
    const entry = await LeaderboardEntry.findOne({ guestId }).lean();
    if (!entry) return null;

    const rankToday = (await LeaderboardEntry.countDocuments({ xpToday: { $gt: entry.xpToday } })) + 1;
    const rankWeek = (await LeaderboardEntry.countDocuments({ xpWeek: { $gt: entry.xpWeek } })) + 1;
    const rankAll = (await LeaderboardEntry.countDocuments({ xpTotal: { $gt: entry.xpTotal } })) + 1;
    const totalPlayers = await LeaderboardEntry.countDocuments();

    return {
      guestId,
      rankToday,
      rankWeek,
      rankAll,
      totalPlayers,
      entry: formatPublicEntry(entry, rankToday),
    };
  }

  // Fallback: In-memory
  const board = inMemoryStore.leaderboard;
  const entry = board.find((e) => e.guestId === guestId);
  if (!entry) return null;

  const currentDayKey = getDayKey();
  const currentWeekKey = getWeekKey();

  const xpToday = entry.dayKey === currentDayKey ? entry.xpToday : 0;
  const xpWeek = entry.weekKey === currentWeekKey ? entry.xpWeek : 0;
  const xpTotal = entry.xpTotal;

  const rankToday = board.filter((e) => (e.dayKey === currentDayKey ? e.xpToday : 0) > xpToday).length + 1;
  const rankWeek = board.filter((e) => (e.weekKey === currentWeekKey ? e.xpWeek : 0) > xpWeek).length + 1;
  const rankAll = board.filter((e) => e.xpTotal > xpTotal).length + 1;

  return {
    guestId,
    rankToday,
    rankWeek,
    rankAll,
    totalPlayers: board.length,
    entry: formatPublicEntry(entry, rankToday),
  };
}

/**
 * Permanently removes a player entry from the leaderboard using their secret token.
 */
async function deletePlayerEntry(guestId, token) {
  if (!guestId || !token) {
    const err = new Error('Both guestId and secret token are required to remove an entry');
    err.statusCode = 400;
    throw err;
  }

  if (getDatabaseStatus()) {
    const entry = await LeaderboardEntry.findOne({ guestId });
    if (!entry) {
      return { success: true, message: 'No entry found' };
    }

    if (!verifyToken(token, entry.deleteToken)) {
      const err = new Error('Invalid secret token for player entry removal');
      err.statusCode = 401;
      throw err;
    }

    await LeaderboardEntry.deleteOne({ guestId });
    return { success: true, message: 'Player entry permanently removed from leaderboard' };
  }

  // Fallback: In-memory
  const board = inMemoryStore.leaderboard;
  const idx = board.findIndex((e) => e.guestId === guestId);
  if (idx === -1) {
    return { success: true, message: 'No entry found' };
  }

  if (!verifyToken(token, board[idx].deleteToken)) {
    const err = new Error('Invalid secret token for player entry removal');
    err.statusCode = 401;
    throw err;
  }

  board.splice(idx, 1);
  return { success: true, message: 'Player entry permanently removed from leaderboard' };
}

module.exports = {
  submitScore,
  getLeaderboard,
  getPlayerRank,
  deletePlayerEntry,
  formatPublicEntry,
};

