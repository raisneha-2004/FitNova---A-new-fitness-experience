const mongoose = require('mongoose');

/**
 * LeaderboardEntry Mongoose Schema
 * Stores competitive public profile stats while preserving anonymous guest privacy.
 */
const leaderboardEntrySchema = new mongoose.Schema(
  {
    guestId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    nickname: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 16,
    },
    nicknameTag: {
      type: String,
      required: true,
      length: 4,
    },
    avatarId: {
      type: String,
      default: 'dumbbell',
      trim: true,
    },
    xpToday: {
      type: Number,
      default: 0,
      min: 0,
    },
    xpWeek: {
      type: Number,
      default: 0,
      min: 0,
    },
    xpTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    streak: {
      type: Number,
      default: 1,
      min: 0,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    dayKey: {
      type: String,
      required: true,
      index: true,
    },
    weekKey: {
      type: String,
      required: true,
      index: true,
    },
    deleteToken: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for high-performance ranking queries
leaderboardEntrySchema.index({ xpToday: -1, updatedAt: -1 });
leaderboardEntrySchema.index({ xpWeek: -1, updatedAt: -1 });
leaderboardEntrySchema.index({ xpTotal: -1, updatedAt: -1 });

module.exports = mongoose.model('LeaderboardEntry', leaderboardEntrySchema);

