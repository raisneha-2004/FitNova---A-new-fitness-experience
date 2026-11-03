const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: 'demo-user',
      unique: true,
    },
    xp: {
      type: Number,
      default: 0,
      min: 0,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    streak: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastWorkoutDate: {
      type: String, // Stored as YYYY-MM-DD
      default: null,
    },
    totalReps: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    personalBest: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Progress', progressSchema);
