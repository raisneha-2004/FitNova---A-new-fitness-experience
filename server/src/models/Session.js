const mongoose = require('express') && require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: 'demo-user',
    },
    exercise: {
      type: String,
      required: true,
    },
    totalReps: {
      type: Number,
      required: true,
      min: 0,
    },
    goodReps: {
      type: Number,
      required: true,
      min: 0,
    },
    shallowReps: {
      type: Number,
      default: 0,
      min: 0,
    },
    badReps: {
      type: Number,
      default: 0,
      min: 0,
    },
    accuracy: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    avgAngle: {
      type: Number,
      default: 0,
      min: 0,
    },
    bestAngle: {
      type: Number,
      default: 0,
      min: 0,
    },
    xpEarned: {
      type: Number,
      required: true,
      min: 0,
    },
    durationSeconds: {
      type: Number,
      required: true,
      min: 0,
    },
    targetReps: {
      type: Number,
      default: 10,
      min: 0,
    },
    // TODO: Day 2 - Add per-rep detailed timestamps, joint angle logs, and achievement unlocked hooks
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Session', sessionSchema);
