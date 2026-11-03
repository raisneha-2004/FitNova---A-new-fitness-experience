import { useRef, useState, useCallback, useEffect } from 'react';
import { GAME_CONFIG } from '../config/gameConfig';
import { getKneeAngleFromLandmarks, smoothAngle } from '../utils/angles';
import { checkWallSitForm } from '../utils/exercises/wallSit';

const STORAGE_KEY = 'fq_auto_start';

/**
 * Loads the auto-start toggle preference from localStorage.
 * Defaults to true (ON).
 */
export function loadAutoStartPreference() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return true;
    return saved === 'true';
  } catch (err) {
    console.warn('Failed to read fq_auto_start preference:', err);
    return true;
  }
}

/**
 * Saves the auto-start toggle preference to localStorage.
 */
export function saveAutoStartPreference(enabled) {
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch (err) {
    console.warn('Failed to save fq_auto_start preference:', err);
  }
}

/**
 * Custom Hook: useAutoStart
 *
 * Continuously evaluates pose landmarks when the camera is running and the workout is idle.
 * When the user stands straight, in full view, and holds steady for 2 continuous seconds,
 * triggers `onReadyToStart()`.
 *
 * Conditions required for 2 continuous seconds:
 * 1. Body status is "READY" / "Body Detected" (shoulders, hips, knees, ankles visible > 0.5 within [0,1])
 * 2. Standing straight: knee angle >= standingAngle (160°)
 * 3. Steady: movement of shoulders and hips <= steadyTolerance (2% of frame size) between frames
 * 4. Camera is active, workout is inactive, and modal is closed
 *
 * Single-trigger safety:
 * - Once auto-start triggers, it remains locked until reset (e.g. user finishes/cancels workout
 *   or explicitly re-arms by leaving frame or calling armAutoStart).
 */
export function useAutoStart({
  isCameraActive = false,
  isWorkoutActive = false,
  isModalOpen = false,
  bodyStatus = null,
  requiredBody = 'full',
  exerciseId = 'squat',
  onReadyToStart = null,
  voiceCueEnabled = false,
}) {
  // Enabled preference state
  const [isAutoStartEnabled, setIsAutoStartEnabled] = useState(loadAutoStartPreference);

  // UI-facing states throttled into coarse progress buckets (0 to 1) and status messages
  const [holdProgress, setHoldProgress] = useState(0); // 0 to 1
  const [holdSecondsRemaining, setHoldSecondsRemaining] = useState(GAME_CONFIG.autoStartHoldSeconds || 2);
  const [autoStatusMessage, setAutoStatusMessage] = useState('Stand straight in full frame');
  const [isHolding, setIsHolding] = useState(false);

  // Performance & state-tracking refs
  const holdStartTimeRef = useRef(null);
  const previousLandmarksRef = useRef(null);
  const angleHistoryRef = useRef([]);
  const hasTriggeredRef = useRef(false);
  const lastBucketRef = useRef(0);
  const lastStatusRef = useRef('Stand straight in full frame');

  // Toggle handler with persistence
  const toggleAutoStart = useCallback((newValue) => {
    const nextVal = typeof newValue === 'boolean' ? newValue : !isAutoStartEnabled;
    setIsAutoStartEnabled(nextVal);
    saveAutoStartPreference(nextVal);

    if (!nextVal) {
      holdStartTimeRef.current = null;
      setHoldProgress(0);
      setIsHolding(false);
      setAutoStatusMessage('Stand straight in full frame');
    }
  }, [isAutoStartEnabled]);

  // Re-arm auto-start (e.g. on Play Again or explicit user reset)
  const armAutoStart = useCallback(() => {
    hasTriggeredRef.current = false;
    holdStartTimeRef.current = null;
    previousLandmarksRef.current = null;
    angleHistoryRef.current = [];
    lastBucketRef.current = 0;
    setHoldProgress(0);
    setIsHolding(false);
    setAutoStatusMessage('Stand straight in full frame');
  }, []);

  // Voice cue helper using browser speechSynthesis
  const speakVoiceCue = useCallback((phrase) => {
    if (!voiceCueEnabled) return;
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Cancel any pending utterances
        const utterance = new SpeechSynthesisUtterance(phrase);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.warn('Voice cue error:', err);
    }
  }, [voiceCueEnabled]);

  // Reset hold state immediately
  const resetHold = useCallback((message = 'Stand straight in full frame') => {
    holdStartTimeRef.current = null;
    if (lastBucketRef.current !== 0) {
      lastBucketRef.current = 0;
      setHoldProgress(0);
    }
    if (lastStatusRef.current !== message) {
      lastStatusRef.current = message;
      setAutoStatusMessage(message);
    }
    setIsHolding(false);
  }, []);

  /**
   * Main per-frame evaluator called from pose detection loop
   */
  const processAutoStartFrame = useCallback(
    (landmarks) => {
      // Guard 1: Auto start must be turned ON
      if (!isAutoStartEnabled) {
        if (holdStartTimeRef.current !== null) resetHold();
        return;
      }

      // Guard 2: Must not run if camera is off, workout is running, or modal is open
      if (!isCameraActive || isWorkoutActive || isModalOpen) {
        if (holdStartTimeRef.current !== null) resetHold();
        return;
      }

      // Guard 3: Single-trigger lock - don't fire repeatedly
      if (hasTriggeredRef.current) {
        return;
      }

      // Condition A: Body status is "Body Detected" / "READY"
      const isBodyReady =
        bodyStatus &&
        (bodyStatus.statusCode === 'READY' || bodyStatus.statusText === 'Body Detected') &&
        bodyStatus.allVisible;

      if (!isBodyReady || !landmarks || landmarks.length < (requiredBody === 'upper' ? 17 : 29)) {
        resetHold(requiredBody === 'upper' ? 'Stand in frame, arms visible' : 'Stand straight in full frame');
        previousLandmarksRef.current = null;
        return;
      }

      // Condition B: Posture Check (Wall Sit hold position for wall-sit, standing straight for other full-body exercises)
      if (exerciseId === 'wall-sit') {
        const wallForm = checkWallSitForm(landmarks);
        if (!wallForm.isInForm) {
          resetHold('Get into wall sit position (thighs parallel)');
          previousLandmarksRef.current = null;
          return;
        }
      } else if (requiredBody === 'full') {
        const rawKneeAngle = getKneeAngleFromLandmarks(landmarks);
        if (rawKneeAngle === null) {
          resetHold('Stand straight in full frame');
          previousLandmarksRef.current = null;
          return;
        }

        const smoothedAngle = smoothAngle(
          angleHistoryRef.current,
          rawKneeAngle,
          GAME_CONFIG.smoothingFrames || 5
        );

        const isStandingStraight = smoothedAngle >= (GAME_CONFIG.standingAngle || 160);
        if (!isStandingStraight) {
          resetHold('Stand straight in full frame');
          previousLandmarksRef.current = null;
          return;
        }
      }

      // Condition C: Steady (shoulders and hips/elbows movement <= steadyTolerance, e.g. 0.02)
      const prev = previousLandmarksRef.current;
      const keyIndices = requiredBody === 'upper' ? [11, 12, 13, 14] : [11, 12, 23, 24];
      const tolerance = GAME_CONFIG.steadyTolerance || 0.02;

      let isSteady = true;
      if (prev) {
        for (const idx of keyIndices) {
          const currPt = landmarks[idx];
          const prevPt = prev[idx];
          if (currPt && prevPt) {
            const dx = Math.abs(currPt.x - prevPt.x);
            const dy = Math.abs(currPt.y - prevPt.y);
            if (dx > tolerance || dy > tolerance) {
              isSteady = false;
              break;
            }
          }
        }
      }

      // Store current landmarks for next frame delta check
      previousLandmarksRef.current = landmarks;

      if (!isSteady) {
        // User is moving too much (walking or waving) -> reset hold timer
        resetHold('Hold still to start');
        return;
      }

      // All conditions passed: Advance hold timer
      const now = performance.now();
      if (holdStartTimeRef.current === null) {
        holdStartTimeRef.current = now;
      }

      const holdDurationSec = (now - holdStartTimeRef.current) / 1000;
      const targetSec = GAME_CONFIG.autoStartHoldSeconds || 2;
      const rawProgress = Math.min(1, holdDurationSec / targetSec);
      const remainingSec = Math.max(0, targetSec - holdDurationSec);

      // Quantize progress into 10% buckets to avoid unnecessary React re-renders at 60fps
      const bucket = Math.round(rawProgress * 20) / 20;
      if (bucket !== lastBucketRef.current) {
        lastBucketRef.current = bucket;
        setHoldProgress(bucket);
        setHoldSecondsRemaining(Number(remainingSec.toFixed(1)));
      }

      setIsHolding(true);

      if (lastStatusRef.current !== 'Hold still to start' && rawProgress < 0.95) {
        lastStatusRef.current = 'Hold still to start';
        setAutoStatusMessage('Hold still to start');
      }

      // Hold threshold completed!
      if (holdDurationSec >= targetSec) {
        hasTriggeredRef.current = true;
        holdStartTimeRef.current = null;
        lastStatusRef.current = 'Get ready!';
        setAutoStatusMessage('Get ready!');
        setHoldProgress(1);
        setIsHolding(false);

        speakVoiceCue('Get ready');

        if (typeof onReadyToStart === 'function') {
          onReadyToStart();
        }
      }
    },
    [
      isAutoStartEnabled,
      isCameraActive,
      isWorkoutActive,
      isModalOpen,
      bodyStatus,
      onReadyToStart,
      resetHold,
      speakVoiceCue,
    ]
  );

  // Reset when camera turns off, workout starts, or component unmounts
  useEffect(() => {
    if (!isCameraActive || isWorkoutActive) {
      resetHold();
    }
  }, [isCameraActive, isWorkoutActive, resetHold]);

  return {
    isAutoStartEnabled,
    toggleAutoStart,
    holdProgress,
    holdSecondsRemaining,
    autoStatusMessage,
    isHolding,
    processAutoStartFrame,
    armAutoStart,
    resetHold,
  };
}
