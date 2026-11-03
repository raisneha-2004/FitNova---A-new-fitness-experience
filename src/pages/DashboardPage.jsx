import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import CameraCard from '../components/CameraCard';
import WorkoutPanel from '../components/WorkoutPanel';
import GamePanel from '../components/GamePanel';
import VisibilityPanel from '../components/VisibilityPanel';
import TipsCard from '../components/TipsCard';
import WorkoutSummaryModal from '../components/WorkoutSummaryModal';
import PersonalBestCard from '../components/PersonalBestCard';
import RecentWorkoutsList from '../components/RecentWorkoutsList';
import ExerciseSelector from '../components/ExerciseSelector';

import { useCamera } from '../hooks/useCamera';
import { usePoseLandmarker } from '../hooks/usePoseLandmarker';
import { useExerciseEngine } from '../hooks/useExerciseEngine';
import { useAutoStart } from '../hooks/useAutoStart';
import { checkBodyVisibility } from '../utils/visibility';
import { GAME_CONFIG } from '../config/gameConfig';
import { EXERCISES, getExerciseById } from '../config/exercises';
import { usePlayer } from '../context/PlayerContext';
import { evaluateBadges } from '../config/badges';
import { useGhost } from '../hooks/useGhost';
import { saveGhostRun, evaluateGhostMatch } from '../utils/ghost';
import { useEnergy } from '../hooks/useEnergy';
import { recordWorkoutPowerCompletion, consumePowerBoost, loadPowerState, POWERS } from '../config/powers';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import { loadVoiceSettings, saveVoiceSettings } from '../utils/voiceCommands';
import { VOICE_COMMANDS } from '../config/voiceConfig';
import VoiceControls from '../components/VoiceControls';
import GhostRaceBar from '../components/GhostRaceBar';
import EnergyBar from '../components/EnergyBar';
import ComboBadge from '../components/ComboBadge';
import PowerUnlockOverlay from '../components/PowerUnlockOverlay';
import GhostResultCard from '../components/GhostResultCard';

import {
  loadUserProgress,
  saveUserProgress,
  calculateLevel,
  calculateStreak,
  checkPersonalBestRecords,
  loadRecentSessions,
  saveRecentSession,
} from '../utils/progressStorage';
import {
  getExerciseConfig,
  getUserProgress,
  saveSessionApi,
  updateProgressApi,
  getRecentSessionsApi,
  submitLeaderboardApi,
  getLeaderboardOptIn,
  DEFAULT_USER_PROGRESS,
} from '../services/api';

export default function DashboardPage({ setIsOffline }) {
  const { ensureGuestProfile } = usePlayer();

  // Read exercise & target from URL query parameter (e.g. /live-arena?exercise=bicep-curl&target=15)
  const [searchParams, setSearchParams] = useSearchParams();
  const initialExerciseParam = searchParams.get('exercise') || 'squat';
  const initialTargetParam = parseInt(searchParams.get('target'), 10);

  // Auto-ensure guest profile so camera arena never breaks for direct visits
  useEffect(() => {
    ensureGuestProfile();
  }, [ensureGuestProfile]);

  // 1. Hardware & MediaPipe Hooks
  const {
    videoRef,
    isActive,
    cameraError,
    startCamera,
    stopCamera,
  } = useCamera();

  const {
    landmarker,
    isLoading: isLandmarkerLoading,
    error: landmarkerError,
  } = usePoseLandmarker();

  // 2. Exercise Selection & Configuration
  const [selectedExerciseId, setSelectedExerciseId] = useState(() => {
    return getExerciseById(initialExerciseParam).id;
  });

  const exerciseConfig = getExerciseById(selectedExerciseId);
  const [targetReps, setTargetReps] = useState(() => {
    if (initialTargetParam && !isNaN(initialTargetParam) && initialTargetParam > 0) {
      return initialTargetParam;
    }
    return exerciseConfig.defaultTarget || 10;
  });

  // 3. User Progress: loaded from localStorage (fq_progress) with fallback to API
  const [userProgress, setUserProgress] = useState(() => {
    const local = loadUserProgress();
    return {
      xp: local.totalXp,
      level: local.level,
      streak: local.streak,
      lastWorkoutDate: local.lastWorkoutDate,
      personalBest: local.personalBest || { ...DEFAULT_PERSONAL_BEST },
    };
  });

  // Recent workouts state: loaded from localStorage (fq_sessions)
  const [recentSessions, setRecentSessions] = useState(() => loadRecentSessions(5));

  // Workout Summary Modal state
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  // Track rep classifications & timing in current session
  const sessionRepsRef = useRef([]);
  const processedRepIdsRef = useRef(new Set());
  const sessionStartTimeRef = useRef(null);
  const activeDurationMsRef = useRef(0);
  const lastActiveTimestampRef = useRef(null);
  const sessionXpEarnedRef = useRef(0);
  const levelBeforeSessionRef = useRef(1);

  // Animation Event States
  const [floatingXp, setFloatingXp] = useState(null); // { id, amount }
  const [levelUpEvent, setLevelUpEvent] = useState(null); // { id, level }
  const [targetCompletedEvent, setTargetCompletedEvent] = useState(null); // celebration overlay

  // 4. Body Visibility & Smoothing State
  const [visibility, setVisibility] = useState({
    shoulders: false,
    hips: false,
    knees: false,
    ankles: false,
    allVisible: false,
    missingGroups: ['Shoulders', 'Hips', 'Knees', 'Ankles'],
    statusText: 'Camera Off',
    statusCode: 'NOT_DETECTED',
  });

  const consecutiveHistoryRef = useRef([]);

  // 5. Workout State
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [countdown, setCountdown] = useState(null);

  // Ghost Mode Hook
  const {
    ghostModeEnabled,
    toggleGhostMode,
    ghostSource,
    setGhostSource,
    activeGhostRun,
    suggestedTarget: ghostSuggestedTarget,
    ghostCurrentReps,
    ghostPulsing,
    refreshGhosts,
  } = useGhost(selectedExerciseId, isWorkoutActive && !isPaused, exerciseConfig.type === 'hold');

  // Power Overlay State
  const [powerUnlockedModalOpen, setPowerUnlockedModalOpen] = useState(false);

  // Power Mode: Energy Bar & Combo Hook
  const {
    energyPercent,
    combo,
    maxComboReached,
    registerRepEnergy,
    registerHoldEnergy,
    triggerTargetComplete,
    resetEnergy,
  } = useEnergy({
    isWorkoutActive: isWorkoutActive && !isPaused,
    targetReps,
    isHold: exerciseConfig.type === 'hold',
    onPowerUnlocked: () => {
      setPowerUnlockedModalOpen(true);
    },
  });

  // Track if power boost was active for current session (1.5x XP)
  const isPowerBoostActiveRef = useRef(false);

  // Auto-set target from Ghost when ghost exists and ghost mode is enabled (unless manually overridden by URL param)
  useEffect(() => {
    if (!initialTargetParam && ghostModeEnabled && ghostSuggestedTarget && !isWorkoutActive) {
      setTargetReps(ghostSuggestedTarget);
    }
  }, [ghostModeEnabled, ghostSuggestedTarget, isWorkoutActive, initialTargetParam]);

  // Keep modal open state in refs for synchronous check in frame loop
  const powerUnlockedModalOpenRef = useRef(false);
  useEffect(() => {
    powerUnlockedModalOpenRef.current = powerUnlockedModalOpen;
  }, [powerUnlockedModalOpen]);

  const isSummaryOpenRef = useRef(false);
  useEffect(() => {
    isSummaryOpenRef.current = isSummaryOpen;
  }, [isSummaryOpen]);

  // Helper to award XP and handle level up
  const awardXp = useCallback((amount) => {
    // If Power boost was active, apply 1.5x multiplier
    const finalAmount = isPowerBoostActiveRef.current ? Math.round(amount * (GAME_CONFIG.powerXpMultiplier || 1.5)) : amount;
    sessionXpEarnedRef.current += finalAmount;


    setUserProgress((prev) => {
      const newTotalXp = prev.xp + amount;
      const prevLevel = prev.level;
      const newLevel = calculateLevel(newTotalXp);

      const updated = {
        ...prev,
        xp: newTotalXp,
        level: newLevel,
      };

      // Save to localStorage
      saveUserProgress({
        totalXp: updated.xp,
        level: updated.level,
        streak: updated.streak,
        lastWorkoutDate: updated.lastWorkoutDate,
        personalBest: updated.personalBest,
      });

      // Trigger floating XP popup
      setFloatingXp({ id: Date.now() + Math.random(), amount });
      setTimeout(() => setFloatingXp(null), 1200);

      // Trigger Level-Up Animation if level increased
      if (newLevel > prevLevel) {
        setLevelUpEvent({ id: Date.now(), level: newLevel });
        setTimeout(() => setLevelUpEvent(null), 3000);
      }

      return updated;
    });
  }, []);

  // Sync progress from backend on mount
  useEffect(() => {
    let isMounted = true;
    async function syncInit() {
      const progressRes = await getUserProgress();
      if (isMounted) {
        if (progressRes.isOffline) {
          if (typeof setIsOffline === 'function') setIsOffline(true);
        } else {
          if (typeof setIsOffline === 'function') setIsOffline(false);
          if (progressRes.data) {
            setUserProgress((prev) => {
              const backendPb = progressRes.data.personalBest || {};
              const mergedPb = {
                maxReps: Math.max(prev.personalBest?.maxReps || 0, backendPb.maxReps || 0),
                maxXp: Math.max(prev.personalBest?.maxXp || 0, backendPb.maxXp || 0),
                bestAccuracy: Math.max(prev.personalBest?.bestAccuracy || 0, backendPb.bestAccuracy || 0),
                longestStreak: Math.max(prev.personalBest?.longestStreak || 0, backendPb.longestStreak || 0),
              };
              const merged = {
                xp: Math.max(prev.xp, progressRes.data.xp || 0),
                level: Math.max(prev.level, progressRes.data.level || 1),
                streak: Math.max(prev.streak, progressRes.data.streak || 0),
                lastWorkoutDate: progressRes.data.lastWorkoutDate || prev.lastWorkoutDate,
                personalBest: mergedPb,
              };
              saveUserProgress({
                totalXp: merged.xp,
                level: merged.level,
                streak: merged.streak,
                lastWorkoutDate: merged.lastWorkoutDate,
                personalBest: merged.personalBest,
              });
              return merged;
            });
          }
        }
      }

      // Sync recent sessions
      const sessionsRes = await getRecentSessionsApi();
      if (isMounted && !sessionsRes.isOffline && Array.isArray(sessionsRes.data) && sessionsRes.data.length > 0) {
        setRecentSessions(sessionsRes.data.slice(0, 5));
      }
    }
    syncInit();
    return () => {
      isMounted = false;
    };
  }, [setIsOffline]);

  // Finishes the workout session: calculates stats, updates Personal Best, saves locally and syncs with backend
  const finishWorkoutSession = useCallback(async () => {
    // Ensure session does not exceed targetReps if target was set
    const rawHistory = sessionRepsRef.current;
    const sessionHistory = targetReps > 0 && rawHistory.length > targetReps
      ? rawHistory.slice(0, targetReps)
      : rawHistory;

    const totalReps = sessionHistory.length;
    const goodReps = sessionHistory.filter((r) => r.quality === 'good').length;
    const shallowReps = sessionHistory.filter((r) => r.quality === 'shallow' || r.quality === 'partial').length;
    const accuracy = totalReps > 0 ? Math.round((goodReps / totalReps) * 100) : 0;

    // Dev-only assertion: saved totalReps must equal the number of rep events and the live count shown to the user
    if (process.env.NODE_ENV !== 'production' || import.meta.env?.DEV) {
      const liveCounterValue = currentReps;
      if (liveCounterValue !== totalReps || sessionHistory.length !== totalReps) {
        console.error(
          `[COUNT MISMATCH ASSERTION FAILED] Saved totalReps (${totalReps}) does not match live counter (${liveCounterValue}) or rep events (${sessionHistory.length})!`
        );
      } else {
        console.info(
          `[COUNT INTEGRITY VERIFIED] ${exerciseConfig.name}: ${totalReps} live reps === ${sessionHistory.length} events === ${totalReps} saved.`
        );
      }
    }

    const durationSeconds = Math.max(
      totalReps > 0 ? 1 : 0,
      Math.round(activeDurationMsRef.current / 1000)
    );

    // Exercise-specific metrics
    let avgAngle = 0;
    let bestAngle = 0;
    let avgRepTime = 0;
    let bestStreak = 0;
    let holdSeconds = durationSeconds;
    let bestHold = durationSeconds;

    // Rep duration calculations (for jumping jacks, high knees, etc.)
    const repDurations = sessionHistory
      .map((r) => r.duration)
      .filter((d) => typeof d === 'number' && d > 0);
    if (repDurations.length > 0) {
      avgRepTime = Math.round((repDurations.reduce((a, b) => a + b, 0) / repDurations.length) * 10) / 10;
    }

    // Longest streak of good reps
    let currentGoodStreak = 0;
    for (const r of sessionHistory) {
      if (r.quality === 'good') {
        currentGoodStreak += 1;
        if (currentGoodStreak > bestStreak) {
          bestStreak = currentGoodStreak;
        }
      } else {
        currentGoodStreak = 0;
      }
    }

    if (selectedExerciseId === 'squat' || selectedExerciseId === 'bicep-curl' || selectedExerciseId === 'lunge' || selectedExerciseId === 'wall-sit') {
      const minAngles = sessionHistory.map((r) => r.minAngle).filter((a) => typeof a === 'number');
      if (minAngles.length > 0) {
        avgAngle = Math.round(minAngles.reduce((a, b) => a + b, 0) / minAngles.length);
        bestAngle = Math.min(...minAngles);
      }
    }

    const isHoldExercise = exerciseConfig.type === 'hold' || selectedExerciseId === 'plank' || selectedExerciseId === 'wall-sit';
    const effectiveRepsOrHold = isHoldExercise ? durationSeconds : totalReps;

    const xpEarned = sessionXpEarnedRef.current;
    const levelBefore = levelBeforeSessionRef.current;
    const levelAfter = userProgress.level;

    // RULE 1: If 0 reps (or 0s hold for hold exercises), show friendly empty state and DO NOT save
    if (effectiveRepsOrHold === 0) {
      setSummaryData({
        exerciseId: selectedExerciseId,
        exerciseName: exerciseConfig.name,
        totalReps: 0,
        goodReps: 0,
        shallowReps: 0,
        accuracy: 0,
        durationSeconds,
        xpEarned: 0,
        avgAngle: 0,
        bestAngle: 0,
        avgRepTime: 0,
        bestStreak: 0,
        holdSeconds: 0,
        bestHold: 0,
        levelBefore,
        levelAfter,
        newRecords: {},
        hasNewRecord: false,
        isFirstRecord: false,
      });
      setIsSummaryOpen(true);
      return;
    }

    // RULE 2: Calculate daily streak update
    const { streak: updatedStreak, lastDate } = calculateStreak(
      userProgress.streak,
      userProgress.lastWorkoutDate
    );

    // RULE 2: Check Personal Best records for the active exercise
    const { newRecords, hasNewRecord, isFirstRecord, updatedPb } = checkPersonalBestRecords(
      { totalReps, xpEarned, accuracy },
      userProgress.personalBest,
      updatedStreak,
      selectedExerciseId
    );

    // Update local React userProgress state & localStorage fq_progress
    const finalProgress = {
      ...userProgress,
      streak: updatedStreak,
      lastWorkoutDate: lastDate,
      personalBest: updatedPb,
    };
    setUserProgress(finalProgress);
    saveUserProgress({
      totalXp: finalProgress.xp,
      level: finalProgress.level,
      streak: finalProgress.streak,
      lastWorkoutDate: finalProgress.lastWorkoutDate,
      personalBest: finalProgress.personalBest,
    });

    // Create session record & save to fq_sessions
    const sessionRecord = {
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      exercise: selectedExerciseId,
      exerciseName: exerciseConfig.name,
      totalReps,
      goodReps,
      shallowReps,
      accuracy,
      avgAngle,
      bestAngle,
      avgRepTime,
      bestStreak,
      xpEarned,
      durationSeconds,
      targetReps,
      createdAt: new Date().toISOString(),
    };

    const updatedRecent = saveRecentSession(sessionRecord, 10);
    setRecentSessions(updatedRecent.slice(0, 5));

    // Evaluate Ghost match if ghost mode was enabled and ghost existed
    let ghostMatch = null;
    let ghostBonusXp = 0;
    const ghostRepsToCompare = activeGhostRun ? (activeGhostRun.reps || 0) : 0;

    if (ghostModeEnabled && activeGhostRun && totalReps > 0) {
      ghostMatch = evaluateGhostMatch(totalReps, ghostRepsToCompare);
      if (ghostMatch.outcome === 'win') {
        ghostBonusXp = GAME_CONFIG.ghostBeatBonusXp || 25;
        awardXp(ghostBonusXp);
      }
    }

    // Save this run as the new ghost for the exercise
    const repTimes = sessionHistory
      .map((r) => r.secondsSinceStart)
      .filter((t) => typeof t === 'number');

    saveGhostRun(selectedExerciseId, {
      date: new Date().toISOString(),
      reps: totalReps,
      goodReps,
      accuracy,
      durationSeconds,
      repTimes,
    });
    refreshGhosts();

    // Check target completion for Challenge Ladder & Superpower unlock
    const targetCompleted = totalReps >= targetReps;
    const { nextTierUnlocked } = recordWorkoutPowerCompletion(selectedExerciseId, targetCompleted);

    // Evaluate badge achievements with Ghost and Power context
    const beatGhost = ghostMatch?.outcome === 'win';
    const newlyUnlocked = evaluateBadges({
      sessionStats: {
        totalReps,
        goodReps,
        accuracy,
        durationSeconds,
        exercise: selectedExerciseId,
        beatGhost,
        ghostStreak: beatGhost ? 1 : 0,
        unlockedPower: energyPercent >= 100 || targetCompleted,
        maxCombo: maxComboReached,
        hasEliteTier: nextTierUnlocked === 'Elite' || loadPowerState().unlockedTiers[selectedExerciseId] >= 3,
      },
      progress: finalProgress,
      allSessions: updatedRecent,
      hasNewRecord,
    });

    // Prepare modal summary payload
    setSummaryData({
      exerciseId: selectedExerciseId,
      exerciseName: exerciseConfig.name,
      totalReps,
      goodReps,
      shallowReps,
      accuracy,
      durationSeconds,
      xpEarned: xpEarned + ghostBonusXp,
      avgAngle,
      bestAngle,
      avgRepTime,
      bestStreak,
      holdSeconds,
      bestHold,
      levelBefore,
      levelAfter,
      newRecords,
      hasNewRecord,
      isFirstRecord,
      newBadges: newlyUnlocked.newlyUnlocked || newlyUnlocked,
      ghostMatch,
      currentRun: { totalReps, accuracy, durationSeconds },
      ghostRun: activeGhostRun,
      ghostBonusXp,
      nextTierUnlocked,
      powerUnlocked: targetCompleted ? (POWERS[selectedExerciseId] || POWERS.squat) : null,
    });
    setIsSummaryOpen(true);

    // Broadcast session update to real-time cards (Daily Challenge, etc.)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fq_sessions_updated'));
    }

    // Background submission to public leaderboard if opted in
    if (getLeaderboardOptIn()) {
      try {
        const guestProfile = ensureGuestProfile();
        submitLeaderboardApi({
          guestId: guestProfile.id,
          nickname: guestProfile.nickname,
          avatarId: guestProfile.avatarId,
          session: {
            exerciseId: selectedExerciseId,
            totalReps,
            holdSeconds,
            durationSeconds,
            xpEarned: xpEarned + ghostBonusXp,
            streak: finalProgress.streak,
            level: finalProgress.level,
          },
        }).then((lbRes) => {
          if (lbRes.data && typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('fq_leaderboard_updated'));
          }
        }).catch((err) => {
          console.warn('Background leaderboard submit failed:', err);
        });
      } catch (err) {
        console.warn('Leaderboard dispatch caught:', err);
      }
    }

    // RULE 3: Sync to Backend with offline fallback
    try {
      const sessionRes = await saveSessionApi({
        exercise: selectedExerciseId,
        totalReps,
        goodReps,
        shallowReps,
        accuracy,
        avgAngle,
        bestAngle,
        xpEarned,
        durationSeconds,
        targetReps,
      });

      const progressRes = await updateProgressApi({
        xpEarned,
        repsDone: totalReps,
        accuracy,
        exercise: selectedExerciseId,
        maxRepsInSession: totalReps,
        durationSeconds,
      });

      if (sessionRes.isOffline || progressRes.isOffline) {
        if (typeof setIsOffline === 'function') setIsOffline(true);
      } else {
        if (typeof setIsOffline === 'function') setIsOffline(false);
      }
    } catch (err) {
      console.warn('Backend sync error (continuing in offline mode):', err);
      if (typeof setIsOffline === 'function') setIsOffline(true);
    }
  }, [
    selectedExerciseId,
    exerciseConfig.name,
    targetReps,
    userProgress,
    setIsOffline,
  ]);

  // Callback when a valid rep is counted by any active exercise detector
  const handleRepCounted = useCallback(
    (repData) => {
      if (!repData || repData.id === undefined || repData.id === null) return;

      // Deduplicate by event id: ignore duplicate processing of the exact same rep event
      if (processedRepIdsRef.current.has(repData.id)) {
        return;
      }
      processedRepIdsRef.current.add(repData.id);

      const nowMs = performance.now();
      const secondsSinceStart = sessionStartTimeRef.current
        ? Math.max(0, Math.round(((nowMs - sessionStartTimeRef.current) / 1000) * 10) / 10)
        : 0;

      const enrichedRep = {
        ...repData,
        secondsSinceStart,
      };

      sessionRepsRef.current.push(enrichedRep);

      // Register energy for AI Power Mode (capped at 99% until target is reached)
      registerRepEnergy(repData.quality, repData.repNumber);

      // Calculate XP for this rep from exercise registry config
      const repXp =
        repData.quality === 'good'
          ? (exerciseConfig.xp?.good || 10)
          : (exerciseConfig.xp?.partial || 2);

      awardXp(repXp);

      // Check if target reps is reached
      if (repData.repNumber >= targetReps) {
        // Stop workout counting immediately so user cannot exceed the target by accident
        setIsWorkoutActive(false);

        // Trigger Power Unlock jump to 100% and single burst event
        triggerTargetComplete();

        // Bonus calculation for target completion
        const sessionHistory = sessionRepsRef.current;
        const goodRepsCount = sessionHistory.filter((r) => r.quality === 'good').length;
        const goodPct = Math.round((goodRepsCount / (sessionHistory.length || 1)) * 100);

        let bonusXp = 0;
        if (goodPct >= Math.round(GAME_CONFIG.goodRepBonusThreshold * 100)) {
          bonusXp = GAME_CONFIG.completionBonusXp;
          awardXp(bonusXp);
        }

        // Open summary immediately so count cannot exceed target and modal opens without delay
        finishWorkoutSession();
      }
    },
    [targetReps, awardXp, exerciseConfig.xp, finishWorkoutSession, registerRepEnergy, triggerTargetComplete]
  );

  // 6. Generic Exercise Engine (Squat, Jumping Jacks, Bicep Curl)
  const {
    reps: currentReps,
    phase,
    liveMetric,
    feedback,
    processFrame,
    resetCounter,
  } = useExerciseEngine({
    exerciseId: selectedExerciseId,
    isWorkoutActive,
    isPaused,
    bodyStatus: visibility,
    targetReps,
    onRepCounted: handleRepCounted,
  });

  // Handle switching exercises
  const handleSelectExercise = useCallback((newExerciseId) => {
    if (isWorkoutActive || countdown !== null) return;

    setSelectedExerciseId(newExerciseId);
    setSearchParams({ exercise: newExerciseId }, { replace: true });

    const newConfig = getExerciseById(newExerciseId);
    setTargetReps(newConfig.defaultTarget || 10);
    resetCounter(newExerciseId);
    resetEnergy();
    setPowerUnlockedModalOpen(false);
    sessionRepsRef.current = [];
    processedRepIdsRef.current = new Set();
  }, [isWorkoutActive, countdown, setSearchParams, resetCounter, resetEnergy]);

  // Ref for countdown timer to clear on camera stop, cancellation or unmount
  const countdownIntervalRef = useRef(null);
  const [autoStartCancelledMessage, setAutoStartCancelledMessage] = useState(null);

  // Core workout start trigger (called either manually or via Auto Start)
  const startWorkoutWithCountdown = useCallback((isTriggeredByAutoStart = false) => {
    if (!visibility.allVisible || isWorkoutActive) return;

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    resetCounter(selectedExerciseId);
    resetEnergy();
    setPowerUnlockedModalOpen(false);
    setIsPaused(false);
    sessionRepsRef.current = [];
    processedRepIdsRef.current = new Set();
    sessionXpEarnedRef.current = 0;
    levelBeforeSessionRef.current = userProgress.level;
    setAutoStartCancelledMessage(null);

    setCountdown(3);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          sessionStartTimeRef.current = performance.now();
          activeDurationMsRef.current = 0;
          lastActiveTimestampRef.current = performance.now();
          // Check and consume Power Boost (1.5x XP)
          isPowerBoostActiveRef.current = consumePowerBoost(selectedExerciseId);
          setIsWorkoutActive(true);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, [visibility.allVisible, isWorkoutActive, resetCounter, selectedExerciseId, userProgress.level]);

  // Hook 7: Auto-Start detection hook
  const {
    isAutoStartEnabled,
    toggleAutoStart,
    holdProgress,
    holdSecondsRemaining,
    autoStatusMessage,
    isHolding,
    processAutoStartFrame,
    armAutoStart,
    resetHold,
  } = useAutoStart({
    isCameraActive: isActive,
    isWorkoutActive: isWorkoutActive || countdown !== null,
    isModalOpen: isSummaryOpen,
    bodyStatus: visibility,
    requiredBody: exerciseConfig.requiredBody || 'full',
    exerciseId: selectedExerciseId,
    onReadyToStart: () => {
      startWorkoutWithCountdown(true);
    },
    voiceCueEnabled: false,
  });

  // Handle smoothed pose detection
  const handlePoseDetected = useCallback((landmarks) => {
    // 1. Process active exercise frame analysis
    processFrame(landmarks);

    // 2. Process Auto-Start ready pose detection
    processAutoStartFrame(landmarks);

    const rawCheck = checkBodyVisibility(landmarks, exerciseConfig.requiredBody || 'full');

    const history = consecutiveHistoryRef.current;
    history.push(rawCheck);
    if (history.length > 5) {
      history.shift();
    }

    const allRecentReady = history.length >= 5 && history.every((item) => item.allVisible);
    const allRecentUndetected = history.length >= 5 && history.every((item) => item.statusCode === 'NOT_DETECTED');

    let smoothedStatusCode = rawCheck.statusCode;
    let smoothedStatusText = rawCheck.statusText;
    let smoothedAllVisible = rawCheck.allVisible;

    if (allRecentReady) {
      smoothedStatusCode = 'READY';
      smoothedStatusText = 'Body Detected';
      smoothedAllVisible = true;
    } else if (allRecentUndetected) {
      smoothedStatusCode = 'NOT_DETECTED';
      smoothedStatusText = 'Person Not Detected';
      smoothedAllVisible = false;
    } else if (history.some((h) => h.statusCode === 'PARTIAL' || h.statusCode === 'NOT_DETECTED')) {
      smoothedStatusCode = 'PARTIAL';
      smoothedStatusText = rawCheck.statusText;
      smoothedAllVisible = false;
    }

    // Active duration tracking:
    // Only accumulate time while workout is active, not paused, body is fully visible, and no modal/overlay is open
    const now = performance.now();
    const isOverlayOpen = isSummaryOpenRef.current || powerUnlockedModalOpenRef.current;
    if (isWorkoutActive && !isPaused && smoothedAllVisible && !isOverlayOpen) {
      if (lastActiveTimestampRef.current !== null) {
        const deltaMs = now - lastActiveTimestampRef.current;
        // Cap single frame delta to 200ms to ignore long background tab freezes
        if (deltaMs > 0 && deltaMs < 500) {
          activeDurationMsRef.current += deltaMs;
        }
      }
      lastActiveTimestampRef.current = now;
    } else {
      // Paused while not visible, paused by user, or during overlay
      lastActiveTimestampRef.current = now;
    }

    // Safety edge case: If body is lost during countdown, cancel countdown
    if (!smoothedAllVisible && countdownIntervalRef.current !== null) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
      setCountdown(null);
      setAutoStartCancelledMessage('Auto start cancelled, stand in frame again');
      setTimeout(() => setAutoStartCancelledMessage(null), 3500);
      armAutoStart();
    }

    setVisibility({
      shoulders: rawCheck.shoulders,
      hips: rawCheck.hips,
      knees: rawCheck.knees,
      ankles: rawCheck.ankles,
      elbows: rawCheck.elbows,
      wrists: rawCheck.wrists,
      allVisible: smoothedAllVisible,
      missingGroups: rawCheck.missingGroups,
      statusText: smoothedStatusText,
      statusCode: smoothedStatusCode,
    });
  }, [processFrame, processAutoStartFrame, exerciseConfig.requiredBody, armAutoStart, isWorkoutActive, isPaused]);

  // Reset visibility, squat counters and timers when camera turns off or on unmount
  useEffect(() => {
    if (!isActive) {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      consecutiveHistoryRef.current = [];
      setVisibility({
        shoulders: false,
        hips: false,
        knees: false,
        ankles: false,
        allVisible: false,
        missingGroups: ['Shoulders', 'Hips', 'Knees', 'Ankles'],
        statusText: 'Camera Off',
        statusCode: 'NOT_DETECTED',
      });
      setIsWorkoutActive(false);
      setIsPaused(false);
      setCountdown(null);
      resetCounter();
      resetHold();
      resetEnergy();
      setPowerUnlockedModalOpen(false);
    }
  }, [isActive, resetCounter, resetHold, resetEnergy]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Manual Start Workout button click handler
  const handleStartWorkout = () => {
    startWorkoutWithCountdown(false);
  };

  // Play Again from Summary Modal
  const handlePlayAgain = () => {
    setIsSummaryOpen(false);
    setSummaryData(null);
    resetEnergy();
    setPowerUnlockedModalOpen(false);
    armAutoStart();
    startWorkoutWithCountdown(false);
  };

  // Pause & Resume Workout Handlers
  const handlePauseWorkout = useCallback(() => {
    if (isWorkoutActive && !isPaused) {
      setIsPaused(true);
      setVoiceToast({ message: 'Workout paused', type: 'info' });
      setTimeout(() => setVoiceToast(null), 2500);
    }
  }, [isWorkoutActive, isPaused]);

  const handleResumeWorkout = useCallback(() => {
    if (isWorkoutActive && isPaused) {
      setIsPaused(false);
      lastActiveTimestampRef.current = performance.now();
      setVoiceToast({ message: 'Workout resumed', type: 'success' });
      setTimeout(() => setVoiceToast(null), 2500);
    }
  }, [isWorkoutActive, isPaused]);

  // Voice Commands Settings & State (persisted in fq_voice)
  const [voiceSettings, setVoiceSettings] = useState(() => loadVoiceSettings());
  const [voiceToast, setVoiceToast] = useState(null); // { message, type }
  const [isCoachMuted, setIsCoachMuted] = useState(false);

  const handleUpdateVoiceSettings = useCallback((newSettings) => {
    setVoiceSettings(newSettings);
    saveVoiceSettings(newSettings);
  }, []);

  const handleToggleCoachMute = useCallback(() => {
    setIsCoachMuted((prev) => {
      const next = !prev;
      setVoiceToast({
        message: next ? 'Coach audio muted' : 'Coach audio unmuted',
        type: 'info',
      });
      setTimeout(() => setVoiceToast(null), 2500);
      return next;
    });
  }, []);

  // Voice Command Dispatcher with Contextual Guard Rules and Hints
  const handleVoiceCommand = useCallback(
    (commandId, meta) => {
      // Rule 4: No commands while a blocking modal is open (except playAgain when summary is open)
      const isBlockingModalOpen = isSummaryOpenRef.current || powerUnlockedModalOpenRef.current;

      switch (commandId) {
        case 'start': {
          if (isBlockingModalOpen) {
            setVoiceToast({ message: 'Close the modal first', type: 'warning' });
            setTimeout(() => setVoiceToast(null), 2500);
            return;
          }
          if (isWorkoutActive) {
            setVoiceToast({ message: 'Workout already in progress', type: 'info' });
            setTimeout(() => setVoiceToast(null), 2500);
            return;
          }
          if (!isActive) {
            setVoiceToast({ message: 'Turn on camera first', type: 'warning' });
            setTimeout(() => setVoiceToast(null), 2500);
            return;
          }
          if (!visibility.allVisible) {
            setVoiceToast({ message: 'Stand in frame so full body is visible', type: 'warning' });
            setTimeout(() => setVoiceToast(null), 2500);
            return;
          }
          setVoiceToast({ message: 'Workout started by voice (3-2-1...)', type: 'success' });
          setTimeout(() => setVoiceToast(null), 3000);
          startWorkoutWithCountdown(false);
          break;
        }

        case 'pause': {
          if (isBlockingModalOpen) return;
          if (!isWorkoutActive) {
            setVoiceToast({ message: "Say 'start' to begin a workout", type: 'hint' });
            setTimeout(() => setVoiceToast(null), 2500);
            return;
          }
          if (isPaused) {
            setVoiceToast({ message: "Workout already paused. Say 'resume' to continue", type: 'info' });
            setTimeout(() => setVoiceToast(null), 2500);
            return;
          }
          handlePauseWorkout();
          break;
        }

        case 'resume': {
          if (isBlockingModalOpen) return;
          if (!isWorkoutActive) {
            setVoiceToast({ message: "Say 'start' to begin", type: 'hint' });
            setTimeout(() => setVoiceToast(null), 2500);
            return;
          }
          if (!isPaused) {
            setVoiceToast({ message: 'Workout is already active', type: 'info' });
            setTimeout(() => setVoiceToast(null), 2500);
            return;
          }
          handleResumeWorkout();
          break;
        }

        case 'finish': {
          if (isBlockingModalOpen) return;
          if (!isWorkoutActive) {
            setVoiceToast({ message: 'No active workout to finish', type: 'hint' });
            setTimeout(() => setVoiceToast(null), 2500);
            return;
          }
          setVoiceToast({ message: 'Finishing workout by voice...', type: 'success' });
          setTimeout(() => setVoiceToast(null), 2500);
          setIsPaused(false);
          finishWorkoutSession();
          break;
        }

        case 'playAgain': {
          if (!isSummaryOpenRef.current) {
            setVoiceToast({ message: "'Play again' is only available on the summary screen", type: 'hint' });
            setTimeout(() => setVoiceToast(null), 2500);
            return;
          }
          setVoiceToast({ message: 'Starting another round by voice!', type: 'success' });
          setTimeout(() => setVoiceToast(null), 2500);
          handlePlayAgain();
          break;
        }

        case 'muteVoice': {
          handleToggleCoachMute();
          break;
        }

        default:
          break;
      }
    },
    [
      isWorkoutActive,
      isPaused,
      isActive,
      visibility.allVisible,
      startWorkoutWithCountdown,
      handlePauseWorkout,
      handleResumeWorkout,
      finishWorkoutSession,
      handlePlayAgain,
      handleToggleCoachMute,
    ]
  );

  // Initialize Voice Commands Hook
  const {
    supported: isVoiceSupported,
    listening: isVoiceListening,
    lastHeard,
    lastCommand,
    error: voiceError,
    errorMessage: voiceErrorMessage,
    start: startVoice,
    stop: stopVoice,
  } = useVoiceCommands({
    enabled: voiceSettings.enabled,
    lang: voiceSettings.lang || 'en-IN',
    requirePrefix: voiceSettings.requirePrefix || false,
    onCommand: handleVoiceCommand,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Dashboard Section Title */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#ff5a36] block">
            Day 1 Live Arena
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Webcam Workout Studio
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-[#ff5a36] animate-pulse" />
            MediaPipe Vision Ready
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Large Camera Card (7-8 cols on desktop) */}
        <section className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Exercise Selector Chips: Squat, Jumping Jacks, Bicep Curl */}
          <ExerciseSelector
            selectedExerciseId={selectedExerciseId}
            onSelectExercise={handleSelectExercise}
            disabled={isWorkoutActive || countdown !== null}
          />

          <CameraCard
            videoRef={videoRef}
            isActive={isActive}
            cameraError={cameraError}
            startCamera={startCamera}
            stopCamera={stopCamera}
            landmarker={landmarker}
            isLandmarkerLoading={isLandmarkerLoading}
            landmarkerError={landmarkerError}
            bodyStatus={visibility}
            onPoseDetected={handlePoseDetected}
            isWorkoutActive={isWorkoutActive}
            isPaused={isPaused}
            onPauseWorkoutClick={handlePauseWorkout}
            onResumeWorkoutClick={handleResumeWorkout}
            onStartWorkoutClick={handleStartWorkout}
            onFinishWorkoutClick={finishWorkoutSession}
            countdown={countdown}
            currentAngle={typeof liveMetric === 'number' ? liveMetric : null}
            liveMetric={liveMetric}
            metricLabel={exerciseConfig.metricLabel || 'Angle'}
            metricUnit={exerciseConfig.unit || ''}
            cameraTip={exerciseConfig.cameraTip}
            phase={phase}
            feedback={feedback}
            floatingXp={floatingXp}
            levelUpEvent={levelUpEvent}
            targetCompletedEvent={targetCompletedEvent}
            isAutoStartEnabled={isAutoStartEnabled}
            onToggleAutoStart={toggleAutoStart}
            autoStartProgress={holdProgress}
            autoStartSecondsRemaining={holdSecondsRemaining}
            autoStatusMessage={autoStatusMessage}
            isAutoStartHolding={isHolding}
            autoStartCancelledMessage={autoStartCancelledMessage}
            // Ghost Mode Props
            ghostModeEnabled={ghostModeEnabled}
            onToggleGhostMode={toggleGhostMode}
            ghostSource={ghostSource}
            onToggleGhostSource={setGhostSource}
            activeGhostRun={activeGhostRun}
            ghostCurrentReps={ghostCurrentReps}
            ghostPulsing={ghostPulsing}
            // AI Power Mode Props
            energyPercent={energyPercent}
            combo={combo}
            // Voice Command Props
            voiceControls={
              <VoiceControls
                supported={isVoiceSupported}
                listening={isVoiceListening}
                error={voiceError}
                errorMessage={voiceErrorMessage}
                lastHeard={lastHeard}
                voiceToast={voiceToast}
                voiceSettings={voiceSettings}
                onUpdateSettings={handleUpdateVoiceSettings}
                onRequestPermission={startVoice}
                isMuted={isCoachMuted}
                onToggleMute={handleToggleCoachMute}
              />
            }
            lastHeard={lastHeard}
            voiceToast={voiceToast}
          />
        </section>

        {/* RIGHT COLUMN: Side Panels (4-5 cols on desktop) */}
        <aside className="lg:col-span-5 xl:col-span-4 space-y-4 sm:space-y-5">
          {/* Workout Progress Card with Target Reps Selector & Ghost Mode Race Bar */}
          <WorkoutPanel
            exerciseName={exerciseConfig.name}
            exerciseDescription={exerciseConfig.description}
            exerciseType={exerciseConfig.type}
            targetOptions={exerciseConfig.targetOptions}
            currentReps={currentReps}
            targetReps={targetReps}
            onTargetRepsChange={setTargetReps}
            isWorkoutActive={isWorkoutActive}
            isPaused={isPaused}
            ghostModeEnabled={ghostModeEnabled}
            onToggleGhostMode={toggleGhostMode}
            ghostSource={ghostSource}
            onToggleGhostSource={setGhostSource}
            activeGhostRun={activeGhostRun}
            ghostCurrentReps={ghostCurrentReps}
            ghostPulsing={ghostPulsing}
            ghostSuggestedTarget={ghostSuggestedTarget}
            combo={combo}
          />

          {/* Game Stats Card with Energy Bar & Power Status */}
          <GamePanel
            xp={userProgress.xp}
            level={userProgress.level}
            streak={userProgress.streak}
            energyPercent={energyPercent}
            combo={combo}
            selectedExerciseId={selectedExerciseId}
          />

          {/* Personal Best Card for Active Exercise */}
          <PersonalBestCard
            personalBest={userProgress.personalBest?.[selectedExerciseId] || { maxReps: 0, maxXp: 0, bestAccuracy: 0 }}
            longestStreak={userProgress.longestStreak || userProgress.streak}
            exerciseName={exerciseConfig.name}
          />

          {/* Recent Workouts List */}
          <RecentWorkoutsList
            sessions={recentSessions}
          />

          {/* Body Visibility Checklist Card */}
          <VisibilityPanel
            visibility={visibility}
            isCameraActive={isActive}
            requiredBody={exerciseConfig.requiredBody || 'full'}
          />

          {/* Arena Setup Tips Card */}
          <TipsCard />
        </aside>
      </div>

      {/* Superpower Full-screen Unlock Burst Overlay */}
      <PowerUnlockOverlay
        exerciseId={selectedExerciseId}
        isOpen={powerUnlockedModalOpen}
        onClose={() => setPowerUnlockedModalOpen(false)}
      />

      {/* Workout Summary & Personal Best Modal */}
      <WorkoutSummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        onPlayAgain={handlePlayAgain}
        summaryData={summaryData}
      />
    </div>
  );
}

