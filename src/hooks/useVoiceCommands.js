import { useState, useEffect, useRef, useCallback } from 'react';
import { parseVoiceCommand, loadVoiceSettings, saveVoiceSettings } from '../utils/voiceCommands.js';
import { DEFAULT_VOICE_SETTINGS } from '../config/voiceConfig.js';

/**
 * Custom Hook: useVoiceCommands
 *
 * Implements browser Web Speech API (webkitSpeechRecognition / SpeechRecognition)
 * with continuous listening, automatic recovery/restarts on silence/disconnection,
 * speech synthesis suspension, error handling, and route/unmount cleanup.
 *
 * @param {Object} props
 * @param {boolean} [props.enabled=false]
 * @param {string} [props.lang='en-IN']
 * @param {boolean} [props.requirePrefix=false]
 * @param {Function} [props.onCommand=null] - (commandId, { transcript, phrase, confidence }) => void
 * @returns {{
 *   supported: boolean,
 *   listening: boolean,
 *   lastHeard: string,
 *   lastCommand: string|null,
 *   error: string|null,
 *   errorMessage: string|null,
 *   start: () => void,
 *   stop: () => void,
 * }}
 */
export function useVoiceCommands({
  enabled = false,
  lang = 'en-IN',
  requirePrefix = false,
  onCommand = null,
} = {}) {
  // Check if browser SpeechRecognition API is available
  const getRecognitionConstructor = () => {
    if (typeof window === 'undefined') return null;
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  };

  const isSupported = Boolean(getRecognitionConstructor());

  const [listening, setListening] = useState(false);
  const [lastHeard, setLastHeard] = useState('');
  const [lastCommand, setLastCommand] = useState(null);
  const [error, setError] = useState(null); // 'not-allowed' | 'audio-capture' | 'network' | 'aborted' | etc.
  const [errorMessage, setErrorMessage] = useState(null);

  // References to handle async loops, reconnections and listeners
  const recognitionRef = useRef(null);
  const isEnabledRef = useRef(enabled);
  const isMountedRef = useRef(true);
  const isIntentionallyStoppedRef = useRef(!enabled);
  const restartTimerRef = useRef(null);
  const retryCountRef = useRef(0);
  const lastCommandTimeRef = useRef(0);
  const onCommandRef = useRef(onCommand);

  useEffect(() => {
    onCommandRef.current = onCommand;
  }, [onCommand]);

  useEffect(() => {
    isEnabledRef.current = enabled;
  }, [enabled]);

  // Map SpeechRecognition error codes to friendly messages
  const getFriendlyErrorMessage = (code) => {
    switch (code) {
      case 'not-allowed':
        return 'Microphone permission denied. Click the lock icon in the address bar to allow mic access.';
      case 'audio-capture':
        return 'No microphone detected. Please check your audio input settings.';
      case 'network':
        return 'Speech recognition needs an active internet connection in Chrome.';
      case 'aborted':
        return null;
      case 'no-speech':
        return null; // Ignore silence
      default:
        return 'Speech recognition paused. Reconnecting...';
    }
  };

  // Safe stop helper
  const stopRecognition = useCallback(() => {
    isIntentionallyStoppedRef.current = true;
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // Ignore abort on already stopped instance
      }
      recognitionRef.current = null;
    }
    setListening(false);
  }, []);

  // Safe start/restart helper
  const startRecognition = useCallback(() => {
    const SpeechConstructor = getRecognitionConstructor();
    if (!SpeechConstructor) {
      return;
    }

    // Clear any pending restart timeout
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // Ignore
      }
      recognitionRef.current = null;
    }

    isIntentionallyStoppedRef.current = false;

    try {
      const recognition = new SpeechConstructor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;
      recognition.lang = lang || 'en-IN';

      recognition.onstart = () => {
        if (!isMountedRef.current) return;
        setListening(true);
        setError(null);
        setErrorMessage(null);
        retryCountRef.current = 0;
      };

      recognition.onresult = (event) => {
        if (!isMountedRef.current) return;

        // Check if browser coach is currently speaking
        const isCoachSpeaking =
          typeof window !== 'undefined' &&
          'speechSynthesis' in window &&
          window.speechSynthesis.speaking;

        const results = event.results;
        if (!results || results.length === 0) return;

        const currentResult = results[results.length - 1];
        const alternatives = [];
        for (let i = 0; i < currentResult.length; i++) {
          alternatives.push({
            transcript: currentResult[i].transcript,
            confidence: currentResult[i].confidence,
          });
        }

        const topTranscript = alternatives[0]?.transcript || '';
        if (topTranscript) {
          setLastHeard(topTranscript.trim());
        }

        // Parse command with cooldown and coach voice suspension
        const parsed = parseVoiceCommand(alternatives, {
          requirePrefix,
          lastCommandTime: lastCommandTimeRef.current,
          now: Date.now(),
          cooldownMs: 1500,
          isCoachSpeaking,
        });

        if (parsed.command) {
          lastCommandTimeRef.current = Date.now();
          setLastCommand(parsed.command);
          if (typeof onCommandRef.current === 'function') {
            onCommandRef.current(parsed.command, {
              transcript: parsed.rawTranscript,
              phrase: parsed.matchedPhrase,
              confidence: parsed.confidence,
            });
          }
        }
      };

      recognition.onerror = (event) => {
        if (!isMountedRef.current) return;

        const errCode = event.error;
        if (errCode === 'no-speech' || errCode === 'aborted') {
          return; // Ignore regular silence or user abort
        }

        setError(errCode);
        const msg = getFriendlyErrorMessage(errCode);
        if (msg) setErrorMessage(msg);

        // If permission was denied or no audio capture hardware, stop retries
        if (errCode === 'not-allowed' || errCode === 'audio-capture') {
          isIntentionallyStoppedRef.current = true;
          setListening(false);
        }
      };

      recognition.onend = () => {
        if (!isMountedRef.current) return;
        setListening(false);

        // Auto-restart if still enabled and not intentionally stopped
        if (isEnabledRef.current && !isIntentionallyStoppedRef.current) {
          if (retryCountRef.current < 15) {
            retryCountRef.current += 1;
            restartTimerRef.current = setTimeout(() => {
              if (isMountedRef.current && isEnabledRef.current && !isIntentionallyStoppedRef.current) {
                startRecognition();
              }
            }, 300);
          } else {
            setError('network');
            setErrorMessage('Speech service interrupted. Click microphone to reconnect.');
          }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Error starting speech recognition:', err);
      setError('start-failed');
      setErrorMessage('Unable to activate microphone. Please try again.');
      setListening(false);
    }
  }, [lang, requirePrefix]);

  // Synchronize recognition state with `enabled` prop and language/prefix settings
  useEffect(() => {
    isMountedRef.current = true;

    if (enabled && isSupported) {
      startRecognition();
    } else {
      stopRecognition();
    }

    return () => {
      isMountedRef.current = false;
      stopRecognition();
    };
  }, [enabled, lang, requirePrefix, isSupported, startRecognition, stopRecognition]);

  return {
    supported: isSupported,
    listening,
    lastHeard,
    lastCommand,
    error,
    errorMessage,
    start: startRecognition,
    stop: stopRecognition,
  };
}
