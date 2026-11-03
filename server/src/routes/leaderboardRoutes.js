const express = require('express');
const rateLimit = require('express-rate-limit');
const leaderboardController = require('../controllers/leaderboardController');

const router = express.Router();

// Rate limiter for submissions: 20 per hour per IP / guestId combination
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${req.ip || 'ip'}_${req.body?.guestId || 'guest'}`,
  message: {
    error: 'Submission rate limit reached (maximum 20 submissions per hour). Please wait before submitting again.',
  },
});

// Submit verified workout score
router.post('/submit', submitLimiter, leaderboardController.submitScore);

// Fetch ranked public entries
router.get('/', leaderboardController.getLeaderboard);

// Fetch caller's individual rank
router.get('/me', leaderboardController.getMyRank);

// Delete caller's entry
router.delete('/me', leaderboardController.deleteMyEntry);

module.exports = router;

