import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAvatarById } from '../config/player';

const PLAYER_STORAGE_KEY = 'fq_player';

const PlayerContext = createContext(null);

/**
 * Loads guest profile from localStorage (key: fq_player).
 * Wrapped in try/catch to gracefully handle disabled/private browsing storage.
 */
function loadStoredPlayer() {
  try {
    const raw = localStorage.getItem(PLAYER_STORAGE_KEY);
    if (!raw) return { profile: null, isStorageAvailable: true };
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.nickname === 'string') {
      return {
        profile: {
          id: parsed.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `guest_${Date.now()}`),
          nickname: parsed.nickname,
          avatarId: parsed.avatarId || 'dumbbell',
          createdAt: parsed.createdAt || new Date().toISOString(),
        },
        isStorageAvailable: true,
      };
    }
    return { profile: null, isStorageAvailable: true };
  } catch (err) {
    console.warn('LocalStorage unavailable for fq_player, using memory fallback:', err);
    return { profile: null, isStorageAvailable: false };
  }
}

export function PlayerProvider({ children }) {
  const [initialData] = useState(loadStoredPlayer);
  const [player, setPlayer] = useState(initialData.profile);
  const [isStorageAvailable, setIsStorageAvailable] = useState(initialData.isStorageAvailable);

  // Save or update player profile
  const savePlayerProfile = useCallback(
    ({ nickname, avatarId }) => {
      const trimmed = (nickname || 'Guest').trim();
      const newProfile = {
        id: player?.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `guest_${Date.now()}`),
        nickname: trimmed,
        avatarId: avatarId || player?.avatarId || 'dumbbell',
        createdAt: player?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(newProfile));
        setIsStorageAvailable(true);
      } catch (err) {
        console.warn('Failed to persist fq_player to localStorage:', err);
        setIsStorageAvailable(false);
      }

      setPlayer(newProfile);
      return newProfile;
    },
    [player]
  );

  // Reset player profile
  const resetPlayerProfile = useCallback(() => {
    try {
      localStorage.removeItem(PLAYER_STORAGE_KEY);
    } catch (err) {
      console.warn('Failed to remove fq_player from localStorage:', err);
    }
    setPlayer(null);
  }, []);

  // Quick auto-create guest if visiting arena directly
  const ensureGuestProfile = useCallback(() => {
    if (!player) {
      return savePlayerProfile({ nickname: 'Guest Athlete', avatarId: 'dumbbell' });
    }
    return player;
  }, [player, savePlayerProfile]);

  const avatar = getAvatarById(player?.avatarId);

  return (
    <PlayerContext.Provider
      value={{
        player,
        avatar,
        hasProfile: Boolean(player && player.nickname),
        isStorageAvailable,
        savePlayerProfile,
        saveProfile: savePlayerProfile,
        resetPlayerProfile,
        ensureGuestProfile,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
