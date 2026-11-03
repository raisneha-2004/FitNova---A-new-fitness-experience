const { getDatabaseStatus, inMemoryStore } = require('../config/db');
const Progress = require('../models/Progress');
const Session = require('../models/Session');

/**
 * Storage Abstraction:
 * Controllers interact exclusively through these functions,
 * making MongoDB completely interchangeable with in-memory storage.
 */

async function getProgress(userId = 'demo-user') {
  if (getDatabaseStatus()) {
    let doc = await Progress.findOne({ userId });
    if (!doc) {
      doc = await Progress.create({ userId });
    }
    return {
      xp: doc.xp,
      level: doc.level,
      streak: doc.streak,
      longestStreak: doc.longestStreak || doc.streak || 0,
      lastWorkoutDate: doc.lastWorkoutDate,
      totalReps: doc.totalReps,
      personalBest: doc.personalBest || {},
    };
  }

  // Fallback to in-memory
  const p = inMemoryStore.progress;
  return {
    xp: p.xp,
    level: p.level,
    streak: p.streak,
    longestStreak: p.longestStreak || p.streak || 0,
    lastWorkoutDate: p.lastWorkoutDate,
    totalReps: p.totalReps,
    personalBest: p.personalBest || {},
  };
}

async function saveProgress(updatedData, userId = 'demo-user') {
  if (getDatabaseStatus()) {
    const doc = await Progress.findOneAndUpdate(
      { userId },
      { $set: updatedData },
      { new: true, upsert: true }
    );
    return {
      xp: doc.xp,
      level: doc.level,
      streak: doc.streak,
      longestStreak: doc.longestStreak || doc.streak || 0,
      lastWorkoutDate: doc.lastWorkoutDate,
      totalReps: doc.totalReps,
      personalBest: doc.personalBest || {},
    };
  }

  // Fallback to in-memory
  inMemoryStore.progress = {
    ...inMemoryStore.progress,
    ...updatedData,
  };
  return inMemoryStore.progress;
}

async function addSession(sessionData, userId = 'demo-user') {
  const fullData = {
    userId,
    ...sessionData,
    createdAt: new Date().toISOString(),
  };

  if (getDatabaseStatus()) {
    const doc = await Session.create(fullData);
    return doc;
  }

  // Fallback to in-memory
  inMemoryStore.sessions.unshift({
    id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    ...fullData,
  });
  return inMemoryStore.sessions[0];
}

async function getRecentSessions(limit = 10, userId = 'demo-user') {
  if (getDatabaseStatus()) {
    return await Session.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  // Fallback to in-memory
  return inMemoryStore.sessions.slice(0, limit);
}

module.exports = {
  getProgress,
  saveProgress,
  addSession,
  getRecentSessions,
};
