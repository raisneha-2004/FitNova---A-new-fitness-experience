const leaderboardService = require('../services/leaderboardService');
const { validateNickname, validateSessionData } = require('../utils/leaderboardUtils');

/**
 * POST /api/leaderboard/submit
 * Submits a completed workout session to update the public leaderboard.
 */
async function submitScore(req, res, next) {
  try {
    const { guestId, nickname, avatarId, session, token } = req.body;

    if (!guestId || typeof guestId !== 'string') {
      return res.status(400).json({ error: 'Valid guestId is required' });
    }

    // 1. Nickname Validation & Sanitization
    const nickValidation = validateNickname(nickname);
    if (!nickValidation.isValid) {
      return res.status(400).json({ error: nickValidation.error });
    }

    // 2. Anti-Abuse Session Validation
    const sessionValidation = validateSessionData(session);
    if (!sessionValidation.isValid) {
      return res.status(400).json({ error: sessionValidation.error });
    }

    // 3. Submit Score via Service
    const result = await leaderboardService.submitScore({
      guestId: guestId.trim(),
      nickname: nickValidation.sanitized,
      avatarId: avatarId || 'dumbbell',
      session: sessionValidation.sanitized,
      token,
    });

    return res.status(result.isNew ? 201 : 200).json(result);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    next(err);
  }
}

/**
 * GET /api/leaderboard
 * Retrieves public ranked leaderboard entries.
 * Query params: range=today|week|all, limit=50
 */
async function getLeaderboard(req, res, next) {
  try {
    const { range = 'today', limit = 50 } = req.query;
    const data = await leaderboardService.getLeaderboard({ range, limit });
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/leaderboard/me
 * Retrieves current caller's placement on the leaderboard.
 */
async function getMyRank(req, res, next) {
  try {
    const guestId = req.query.guestId || req.headers['x-guest-id'];
    if (!guestId) {
      return res.status(400).json({ error: 'guestId parameter or x-guest-id header is required' });
    }

    const rankInfo = await leaderboardService.getPlayerRank(guestId);
    if (!rankInfo) {
      return res.status(200).json({ isRanked: false, message: 'Player not yet recorded on the leaderboard' });
    }

    return res.status(200).json({ isRanked: true, ...rankInfo });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/leaderboard/me
 * Removes the player's entry using their secret anti-hijacking token.
 */
async function deleteMyEntry(req, res, next) {
  try {
    const guestId = req.body?.guestId || req.query?.guestId || req.headers['x-guest-id'];
    const token = req.body?.token || req.query?.token || req.headers['x-player-token'];

    if (!guestId || !token) {
      return res.status(400).json({ error: 'Both guestId and token are required to delete entry' });
    }

    const result = await leaderboardService.deletePlayerEntry(guestId, token);
    return res.status(200).json(result);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    next(err);
  }
}

module.exports = {
  submitScore,
  getLeaderboard,
  getMyRank,
  deleteMyEntry,
};
