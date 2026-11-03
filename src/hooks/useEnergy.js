import { useState, useEffect, useRef, useCallback } from 'react';
import { GAME_CONFIG } from '../config/gameConfig';

/**
 * useEnergy Hook
 * Tracks energy bar (0-100%), combo multiplier (x1 to x5), and triggers power unlock.
 * Rules:
 * - Combo and quality bonuses speed up visual fill, but bar is capped at 99% until target is completed.
 * - When target is completed (reps or hold duration reached), jumps to 100% and fires power event once per workout.
 * - Resets on workout start/stop, exercise change, and play again.
 */
export function useEnergy({
  isWorkoutActive,
  targetReps = 10,
  isHold = false,
  onPowerUnlocked = null,
}) {
  const [energyPercent, setEnergyPercent] = useState(0);
  const [combo, setCombo] = useState(1);
  const [maxComboReached, setMaxComboReached] = useState(1);
  const [hasTriggeredPower, setHasTriggeredPower] = useState(false);

  const lastRepTimeRef = useRef(null);
  const pauseCheckerRef = useRef(null);
  const accumulatedRawEnergyRef = useRef(0);
  const hasTriggeredPowerRef = useRef(false);

  const resetEnergy = useCallback(() => {
    setEnergyPercent(0);
    setCombo(1);
    setMaxComboReached(1);
    setHasTriggeredPower(false);
    hasTriggeredPowerRef.current = false;
    accumulatedRawEnergyRef.current = 0;
    lastRepTimeRef.current = null;
    if (pauseCheckerRef.current) {
      clearInterval(pauseCheckerRef.current);
      pauseCheckerRef.current = null;
    }
  }, []);

  // Reset energy & combo when workout stops or starts
  useEffect(() => {
    if (!isWorkoutActive) {
      resetEnergy();
      return;
    }

    lastRepTimeRef.current = performance.now();

    // Check for pause to reset combo
    const pauseLimitMs = (GAME_CONFIG.comboResetPauseSeconds || 4.0) * 1000;
    pauseCheckerRef.current = setInterval(() => {
      if (lastRepTimeRef.current && performance.now() - lastRepTimeRef.current > pauseLimitMs) {
        setCombo((prev) => (prev > 1 ? 1 : prev));
      }
    }, 1000);

    return () => {
      if (pauseCheckerRef.current) clearInterval(pauseCheckerRef.current);
    };
  }, [isWorkoutActive, resetEnergy]);

  /**
   * Called by the exercise engine when a rep completes.
   * Capped at 99% until triggerTargetComplete is called.
   * @param {'good' | 'shallow' | 'partial'} quality
   * @param {number} [currentRepCount] Optional current rep number
   */
  const registerRepEnergy = useCallback(
    (quality, currentRepCount = null) => {
      if (!isWorkoutActive) return;

      lastRepTimeRef.current = performance.now();
      const isGood = quality === 'good';

      // 1. Update Combo
      let newCombo = 1;
      if (isGood) {
        setCombo((prev) => {
          const next = Math.min(GAME_CONFIG.comboMax || 5, prev + 1);
          setMaxComboReached((m) => Math.max(m, next));
          newCombo = next;
          return next;
        });
      } else {
        setCombo(1);
        newCombo = 1;
      }

      // 2. Compute Energy fill percentage
      const safeTarget = Math.max(1, targetReps);
      const baseFill = isGood ? 100 / safeTarget : 50 / safeTarget;
      const comboBonus = (newCombo - 1) * (GAME_CONFIG.comboEnergyBonusPercent || 2);
      const repEnergy = baseFill + (isGood ? comboBonus : 0);

      accumulatedRawEnergyRef.current += repEnergy;

      // Check if this rep reached or exceeded the target
      const isTargetReached = currentRepCount !== null ? currentRepCount >= targetReps : false;

      if (isTargetReached) {
        setEnergyPercent(100);
        if (!hasTriggeredPowerRef.current) {
          hasTriggeredPowerRef.current = true;
          setHasTriggeredPower(true);
          if (typeof onPowerUnlocked === 'function') {
            onPowerUnlocked();
          }
        }
      } else {
        // Capped at 99% until target is completed
        const capped = Math.min(99, Math.round(accumulatedRawEnergyRef.current));
        setEnergyPercent(capped);
      }
    },
    [isWorkoutActive, targetReps, onPowerUnlocked]
  );

  /**
   * For hold exercises: update energy by held seconds.
   * Capped at 99% until target is reached.
   */
  const registerHoldEnergy = useCallback(
    (heldSeconds) => {
      if (!isWorkoutActive || !isHold) return;
      const targetSec = Math.max(1, targetReps);

      if (heldSeconds >= targetSec) {
        setEnergyPercent(100);
        if (!hasTriggeredPowerRef.current) {
          hasTriggeredPowerRef.current = true;
          setHasTriggeredPower(true);
          if (typeof onPowerUnlocked === 'function') {
            onPowerUnlocked();
          }
        }
      } else {
        const pct = Math.min(99, Math.round((heldSeconds / targetSec) * 100));
        setEnergyPercent(pct);
      }
    },
    [isWorkoutActive, isHold, targetReps, onPowerUnlocked]
  );

  /**
   * Explicitly triggers target completion (e.g., when targetReps reached).
   * Jumps energy to 100% and fires power unlock once per workout.
   */
  const triggerTargetComplete = useCallback(() => {
    setEnergyPercent(100);
    if (!hasTriggeredPowerRef.current) {
      hasTriggeredPowerRef.current = true;
      setHasTriggeredPower(true);
      if (typeof onPowerUnlocked === 'function') {
        onPowerUnlocked();
      }
    }
  }, [onPowerUnlocked]);

  return {
    energyPercent,
    combo,
    maxComboReached,
    registerRepEnergy,
    registerHoldEnergy,
    triggerTargetComplete,
    resetEnergy,
    hasTriggeredPower,
  };
}

