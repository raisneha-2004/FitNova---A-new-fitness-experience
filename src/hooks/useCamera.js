import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook to safely control webcam access using navigator.mediaDevices.getUserMedia.
 * Handles permission denied, not found, or busy states with clear user messages.
 * Automatically cleans up tracks on stop or unmount.
 */
export function useCamera() {
  const [isActive, setIsActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping track:', e);
        }
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
  }, []);

  // Start camera stream
  const startCamera = useCallback(async () => {
    setCameraError(null);

    // Check mediaDevices support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const msg = 'Camera access is not supported in this browser environment. Ensure you are on HTTPS or localhost.';
      setCameraError(msg);
      return false;
    }

    try {
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((playErr) => {
          console.warn('Video play interrupted:', playErr);
        });
      }

      setIsActive(true);
      return true;
    } catch (err) {
      console.error('Camera access error:', err);
      let userFriendlyMsg = 'Unable to access camera.';

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        userFriendlyMsg = 'Camera permission was denied. Please allow camera access in your browser settings to continue.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        userFriendlyMsg = 'No camera device found on your system. Please connect a webcam.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        userFriendlyMsg = 'Camera is currently in use by another application or tab. Please close other camera apps and retry.';
      } else if (err.name === 'OverconstrainedError') {
        userFriendlyMsg = 'Camera does not satisfy resolution requirements. Falling back to default resolution.';
      } else {
        userFriendlyMsg = err.message || 'An unexpected error occurred while starting the camera.';
      }

      setCameraError(userFriendlyMsg);
      setIsActive(false);
      return false;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    isActive,
    cameraError,
    startCamera,
    stopCamera,
    clearError: () => setCameraError(null),
  };
}
