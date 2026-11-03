import { useRef, useState, useCallback, useEffect } from 'react';
import { getExerciseById } from '../config/exercises';
import { createSquatState, stepSquatDetector } from '../utils/exercises/squat';
import { createJumpingJacksState, stepJumpingJacksDetector } from '../utils/exercises/jumpingJacks';
import { createBicepCurlState, stepBicepCurlDetector } from '../utils/exercises/bicepCurl';
import { createWallSitState, stepWallSitDetector } from '../utils/exercises/wallSit';
import { createButtKicksState, stepButtKicksDetector } from '../utils/exercises/buttKicks';
import { createLungeState, stepLungeDetector } from '../utils/exercises/lunge';

/**
 * useExerciseEngine
 * Generic exercise detection engine managing state, hysteresis, and rep detection
 * for Squat, Jumping Jacks, Bicep Curl, Wall Sit, Butt Kicks, and Lunge.
 *
 * @param {string} exerciseId - 'squat' | 'jumping-jacks' | 'bicep-curl' | 'wall-sit' | 'butt-kicks' | 'lunge'
 * @param {boolean} isWorkoutActive - Workout running flag
 * @param {boolean} isPaused - Workout paused flag
 * @param {Object} bodyStatus - Visibility status object
 * @param {Function} onRepCounted - Callback when a rep completes
 */
export function useExerciseEngine({
  exerciseId = 'squat',
  isWorkoutActive = false,
  isPaused = false,
  bodyStatus = null,
  targetReps = Infinity,
  onRepCounted = null,
}) {
  const exerciseConfig = getExerciseById(exerciseId);

  // UI-facing states
  const [reps, setReps] = useState(0);
  const repsRef = useRef(0);
  const isWorkoutActiveRef = useRef(isWorkoutActive);
  const isPausedRef = useRef(isPaused);
  const targetRepsRef = useRef(targetReps);

  useEffect(() => {
    isWorkoutActiveRef.current = isWorkoutActive;
  }, [isWorkoutActive]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    targetRepsRef.current = targetReps;
  }, [targetReps]);

  const [phase, setPhase] = useState('READY');
  const [liveMetric, setLiveMetric] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [lastRepQuality, setLastRepQuality] = useState(null);
  const [repHistory, setRepHistory] = useState([]);

  // Internal detector states stored in refs to prevent 60fps React re-renders - initialised immediately
  const initDetectorState = (id) => {
    if (id === 'jumping-jacks') return createJumpingJacksState();
    if (id === 'bicep-curl') return createBicepCurlState();
    if (id === 'wall-sit') return createWallSitState();
    if (id === 'butt-kicks') return createButtKicksState();
    if (id === 'lunge') return createLungeState();
    return createSquatState();
  };

  const detectorStateRef = useRef(initDetectorState(exerciseId));
  const activeExerciseIdRef = useRef(exerciseId);

  // Initialize or reset detector state
  const resetEngine = useCallback((newExerciseId = exerciseId) => {
    activeExerciseIdRef.current = newExerciseId;
    detectorStateRef.current = initDetectorState(newExerciseId);

    if (newExerciseId === 'jumping-jacks') {
      setPhase('CLOSED');
      setLiveMetric('Closed');
    } else if (newExerciseId === 'bicep-curl') {
      setPhase('EXTENDED');
      setLiveMetric(180);
    } else if (newExerciseId === 'wall-sit') {
      setPhase('SEARCHING');
      setLiveMetric(90);
    } else if (newExerciseId === 'butt-kicks') {
      setPhase('READY');
      setLiveMetric('Ready');
    } else if (newExerciseId === 'lunge') {
      setPhase('STANDING');
      setLiveMetric(180);
    } else {
      setPhase('STANDING');
      setLiveMetric(180);
    }

    repsRef.current = 0;
    repEventIdRef.current = 0;
    setReps(0);
    setFeedback(null);
    setLastRepQuality(null);
    setRepHistory([]);
  }, [exerciseId]);

  // Monotonic rep event ID reference
  const repEventIdRef = useRef(0);

  // Reset when exerciseId changes
  useEffect(() => {
    resetEngine(exerciseId);
  }, [exerciseId, resetEngine]);

  // Frame processing function called from MediaPipe loop
  const processFrame = useCallback(
    (landmarks) => {
      // Ignore frames if workout is inactive, paused, or target already reached
      if (!isWorkoutActiveRef.current || isPausedRef.current || (targetRepsRef.current && repsRef.current >= targetRepsRef.current)) {
        return;
      }

      if (!detectorStateRef.current) {
        resetEngine(exerciseId);
      }

      const isBodyDetected =
        bodyStatus &&
        (bodyStatus.statusCode === 'READY' || bodyStatus.statusText === 'Body Detected');

      const now = performance.now();
      const currentConfig = exerciseConfig.thresholds || {};

      let result = null;
      const currentId = activeExerciseIdRef.current;

      if (currentId === 'jumping-jacks') {
        result = stepJumpingJacksDetector(
          detectorStateRef.current,
          landmarks,
          isBodyDetected,
          currentConfig,
          now
        );
      } else if (currentId === 'bicep-curl') {
        result = stepBicepCurlDetector(
          detectorStateRef.current,
          landmarks,
          isBodyDetected,
          currentConfig,
          now
        );
      } else if (currentId === 'wall-sit') {
        result = stepWallSitDetector(
          detectorStateRef.current,
          landmarks,
          isBodyDetected,
          currentConfig,
          now
        );
      } else if (currentId === 'butt-kicks') {
        result = stepButtKicksDetector(
          detectorStateRef.current,
          landmarks,
          isBodyDetected,
          currentConfig,
          now
        );
      } else if (currentId === 'lunge') {
        result = stepLungeDetector(
          detectorStateRef.current,
          landmarks,
          isBodyDetected,
          currentConfig,
          now
        );
      } else {
        // Default to Squat
        result = stepSquatDetector(
          detectorStateRef.current,
          landmarks,
          isBodyDetected,
          currentConfig,
          now
        );
      }

      if (!result) return;

      // Update detector state ref
      detectorStateRef.current = result.nextState;

      // Update phase if changed
      if (result.nextState.phase && result.nextState.phase !== phase) {
        setPhase(result.nextState.phase);
      }

      // Update live metric (angle or state label)
      if (result.liveMetric !== null && result.liveMetric !== undefined) {
        setLiveMetric((prev) => {
          if (typeof result.liveMetric === 'number') {
            return Math.abs(prev - result.liveMetric) >= 1 ? result.liveMetric : prev;
          }
          return result.liveMetric !== prev ? result.liveMetric : prev;
        });
      }

      // Update feedback if new feedback emitted
      if (result.feedback) {
        setFeedback(result.feedback);
      }

      // Handle rep completion: emit exactly one RepEvent with monotonic id
      if (result.repCompleted) {
        if (targetRepsRef.current && repsRef.current >= targetRepsRef.current) {
          return;
        }

        repsRef.current += 1;
        repEventIdRef.current += 1;
        const newRepCount = repsRef.current;
        const eventId = repEventIdRef.current;

        const metricVal =
          result.repCompleted.minAngle ??
          result.repCompleted.maxSpreadRatio ??
          null;

        const repData = {
          id: eventId,
          repNumber: newRepCount,
          time: now,
          quality: result.repCompleted.quality,
          metric: metricVal,
          exerciseId: currentId,
          duration: result.repCompleted.duration,
          minAngle: result.repCompleted.minAngle ?? null,
          maxSpreadRatio: result.repCompleted.maxSpreadRatio ?? null,
        };

        setReps(newRepCount);
        setLastRepQuality(result.repCompleted.quality);
        setRepHistory((h) => [...h, repData]);

        if (typeof onRepCounted === 'function') {
          onRepCounted(repData);
        }
      }
    },
    [isWorkoutActive, bodyStatus, exerciseConfig, exerciseId, phase, onRepCounted, resetEngine]
  );

  return {
    reps,
    phase,
    liveMetric,
    feedback,
    lastRepQuality,
    repHistory,
    processFrame,
    resetCounter: resetEngine,
  };
}
