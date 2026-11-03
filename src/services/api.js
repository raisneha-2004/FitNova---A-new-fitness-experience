import axios from 'axios';

/**
 * Axios instance configured for FitNova backend services.
 * BaseURL defaults to http://localhost:5000/api or VITE_API_URL if provided.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 3500, // Quick timeout to prevent UI hang when backend is offline
  headers: {
    'Content-Type': 'application/json',
  },
});

// Default fallback data for Day 1 offline mode
export const DEFAULT_EXERCISE_CONFIG = {
  exerciseId: 'squat',
  name: 'Bodyweight Squat',
  targetReps: 10,
  xpReward: 50,
  instructions: 'Keep your chest up and lower hips until thighs are parallel to the floor.',
};

export const DEFAULT_USER_PROGRESS = {
  xp: 0,
  level: 1,
  streak: 0,
  totalReps: 0,
};

/**
 * Fetch exercise configuration from backend.
 * Falls back to DEFAULT_EXERCISE_CONFIG gracefully if offline.
 */
export async function getExerciseConfig() {
  try {
    const response = await apiClient.get('/config');
    return { data: response.data, isOffline: false };
  } catch {
    // Graceful offline fallback
    return { data: DEFAULT_EXERCISE_CONFIG, isOffline: true };
  }
}

/**
 * Fetch user progress stats (XP, level, streak, personalBest).
 * Falls back to DEFAULT_USER_PROGRESS gracefully if offline.
 */
export async function getUserProgress() {
  try {
    const response = await apiClient.get('/progress');
    const resData = response.data && response.data.data ? response.data.data : response.data;
    return { data: resData, isOffline: false };
  } catch {
    // Graceful offline fallback
    return { data: DEFAULT_USER_PROGRESS, isOffline: true };
  }
}

/**
 * POST /api/sessions
 * Saves completed session to server, falls back to offline flag if server is down.
 */
export async function saveSessionApi(sessionPayload) {
  try {
    const response = await apiClient.post('/sessions', sessionPayload);
    return { data: response.data, isOffline: false };
  } catch (err) {
    return { error: err.message, isOffline: true };
  }
}

/**
 * POST /api/progress
 * Updates user XP, streak and personal records on server.
 */
export async function updateProgressApi(progressPayload) {
  try {
    const response = await apiClient.post('/progress', progressPayload);
    return { data: response.data, isOffline: false };
  } catch (err) {
    return { error: err.message, isOffline: true };
  }
}

/**
 * GET /api/sessions
 * Retrieves recent sessions from backend.
 */
export async function getRecentSessionsApi() {
  try {
    const response = await apiClient.get('/sessions');
    const sessions = response.data && response.data.data ? response.data.data : response.data;
    return { data: Array.isArray(sessions) ? sessions : [], isOffline: false };
  } catch {
    return { data: [], isOffline: true };
  }
}

const LB_TOKEN_KEY = 'fq_lb_token';
const LB_OPTIN_KEY = 'fq_lb_optin';

export function getStoredLeaderboardToken() {
  try {
    return localStorage.getItem(LB_TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

export function setStoredLeaderboardToken(token) {
  try {
    if (token) {
      localStorage.setItem(LB_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(LB_TOKEN_KEY);
    }
  } catch {
    // ignore
  }
}

export function getLeaderboardOptIn() {
  try {
    const raw = localStorage.getItem(LB_OPTIN_KEY);
    if (raw === null) return true; // Default ON for new players
    return raw === 'true';
  } catch {
    return true;
  }
}

export function setLeaderboardOptIn(optIn) {
  try {
    localStorage.setItem(LB_OPTIN_KEY, String(Boolean(optIn)));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fq_optin_changed', { detail: { optIn: Boolean(optIn) } }));
    }
  } catch {
    // ignore
  }
}

/**
 * GET /api/leaderboard?range=today|week|all&limit=50
 */
export async function getLeaderboardApi({ range = 'today', limit = 50 } = {}) {
  try {
    const response = await apiClient.get('/leaderboard', {
      params: { range, limit },
    });
    return { data: response.data, isOffline: false };
  } catch (err) {
    return {
      data: { range, totalPlayers: 0, entries: [] },
      isOffline: true,
      error: err.message,
    };
  }
}

/**
 * POST /api/leaderboard/submit
 */
export async function submitLeaderboardApi(payload) {
  try {
    const token = payload.token || getStoredLeaderboardToken();
    const body = {
      ...payload,
      token,
    };
    const response = await apiClient.post('/leaderboard/submit', body);
    if (response.data && response.data.token) {
      setStoredLeaderboardToken(response.data.token);
    }
    return { data: response.data, isOffline: false };
  } catch (err) {
    return {
      data: null,
      isOffline: !err.response,
      error: err.response?.data?.error || err.message,
    };
  }
}

/**
 * GET /api/leaderboard/me
 */
export async function getMyLeaderboardRankApi(guestId) {
  try {
    const response = await apiClient.get('/leaderboard/me', {
      params: { guestId },
    });
    return { data: response.data, isOffline: false };
  } catch (err) {
    return { data: null, isOffline: !err.response, error: err.message };
  }
}

/**
 * DELETE /api/leaderboard/me
 */
export async function deleteMyLeaderboardApi(guestId) {
  try {
    const token = getStoredLeaderboardToken();
    const response = await apiClient.delete('/leaderboard/me', {
      data: { guestId, token },
    });
    setStoredLeaderboardToken(null);
    return { data: response.data, isOffline: false };
  } catch (err) {
    return {
      data: null,
      isOffline: !err.response,
      error: err.response?.data?.error || err.message,
    };
  }
}
