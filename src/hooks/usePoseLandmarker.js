import { useState, useEffect, useRef } from 'react';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

const WASM_CDN_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
const MODEL_ASSET_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

/**
 * Custom hook to initialize and manage MediaPipe PoseLandmarker.
 * Attempts GPU delegate first, with automatic fallback to CPU.
 * 
 * @returns {{ landmarker: PoseLandmarker|null, isLoading: boolean, error: string|null }}
 */
export function usePoseLandmarker() {
  const [landmarker, setLandmarker] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    async function initPoseLandmarker() {
      try {
        setIsLoading(true);
        setError(null);

        // 1. Load Fileset Resolver from CDN
        const vision = await FilesetResolver.forVisionTasks(WASM_CDN_URL);

        if (!isMountedRef.current) return;

        let instance = null;

        // 2. Attempt GPU delegate
        try {
          instance = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: MODEL_ASSET_URL,
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numPoses: 1,
            minPoseDetectionConfidence: 0.5,
            minPosePresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });
        } catch (gpuError) {
          console.warn('PoseLandmarker GPU initialization failed, falling back to CPU:', gpuError);
          // Fallback to CPU delegate
          instance = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: MODEL_ASSET_URL,
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numPoses: 1,
            minPoseDetectionConfidence: 0.5,
            minPosePresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });
        }

        if (isMountedRef.current) {
          setLandmarker(instance);
          setIsLoading(false);
          return instance;
        } else {
          instance?.close();
          return null;
        }
      } catch (err) {
        console.error('Failed to initialize PoseLandmarker:', err);
        if (isMountedRef.current) {
          setError(err.message || 'Failed to load AI Pose Detection model');
          setIsLoading(false);
        }
        return null;
      }
    }

    let createdInstance = null;
    initPoseLandmarker().then((inst) => {
      createdInstance = inst;
    });

    return () => {
      isMountedRef.current = false;
      if (createdInstance) {
        try {
          createdInstance.close();
        } catch (e) {
          console.warn('Error closing landmarker:', e);
        }
      }
    };
  }, []);

  return { landmarker, isLoading, error };
}
