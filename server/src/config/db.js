const mongoose = require('mongoose');

// In-memory fallback stores for when MongoDB is not connected
const inMemoryStore = {
  progress: {
    userId: 'demo-user',
    xp: 0,
    level: 1,
    streak: 0,
    longestStreak: 0,
    lastWorkoutDate: null,
    totalReps: 0,
    personalBest: {
      maxReps: 0,
      maxXp: 0,
      bestAccuracy: 0,
      longestStreak: 0,
    },
  },
  sessions: [],
  contacts: [],
  leaderboard: [],
};

let isConnected = false;

/**
 * Connect to MongoDB if MONGO_URI is set.
 * Falls back safely to in-memory store on missing URI or connection error.
 */
async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri || uri.trim() === '') {
    console.log('No MONGO_URI provided. Running with in-memory storage.');
    console.warn('[Leaderboard] Warning: Running with in-memory storage. The leaderboard resets on server restart.');
    return;
  }

  try {
    await mongoose.connect(uri);
    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.log('Running with in-memory storage.');
    console.warn('[Leaderboard] Warning: Running with in-memory storage. The leaderboard resets on server restart.');
    isConnected = false;
  }
}

function getDatabaseStatus() {
  return isConnected;
}

module.exports = {
  connectDB,
  getDatabaseStatus,
  inMemoryStore,
};
