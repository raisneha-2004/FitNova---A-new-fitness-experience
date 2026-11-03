/**
 * Pure function voice command parser and text normalization
 * Implements exact-word / exact-phrase matching, alternative checks,
 * optional prefix enforcement, and cooldown timing.
 */

import { VOICE_COMMANDS, PREFIX_WORD } from '../config/voiceConfig.js';

/**
 * Normalizes speech text:
 * Lowercases, strips punctuation, collapses whitespace, trims.
 *
 * @param {string} text - Raw transcript text
 * @returns {string} Normalized string
 */
export function normalizeSpeechText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?'"\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks whether an alternative transcript matches a specific target phrase as whole words.
 *
 * @param {string} candidate - Normalized spoken transcript
 * @param {string} phrase - Normalized target command phrase (e.g. "shuru karo")
 * @returns {boolean}
 */
export function matchesPhrase(candidate, phrase) {
  if (!candidate || !phrase) return false;
  const normCandidate = normalizeSpeechText(candidate);
  const normPhrase = normalizeSpeechText(phrase);

  if (normCandidate === normPhrase) return true;

  // Exact word boundary matching so "restart" does NOT trigger "start"
  // Escape regex special chars in phrase
  const escaped = normPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(^|\\s)${escaped}(\\s|$)`, 'i');
  return regex.test(normCandidate);
}

/**
 * Parses spoken alternatives and detects if any command is triggered.
 *
 * @param {Array<string|{transcript: string, confidence?: number}>} alternatives
 * @param {Object} options
 * @param {boolean} [options.requirePrefix=false] - Whether "arena" is required before command
 * @param {number} [options.lastCommandTime=0] - Timestamp of previous matched command
 * @param {number} [options.now=Date.now()] - Current timestamp
 * @param {number} [options.cooldownMs=1500] - Minimum milliseconds between commands
 * @param {boolean} [options.isCoachSpeaking=false] - Ignore if speechSynthesis is active
 * @returns {{
 *   command: string|null,
 *   rawTranscript: string,
 *   matchedPhrase: string|null,
 *   confidence: number,
 *   rejectedReason?: 'cooldown' | 'coach_speaking' | 'prefix_missing' | null
 * }}
 */
export function parseVoiceCommand(alternatives = [], options = {}) {
  const {
    requirePrefix = false,
    lastCommandTime = 0,
    now = Date.now(),
    cooldownMs = 1500,
    isCoachSpeaking = false,
  } = options;

  // Extract raw transcripts and first available candidate text
  const cleanList = (Array.isArray(alternatives) ? alternatives : [alternatives])
    .filter(Boolean)
    .map((alt) => {
      if (typeof alt === 'string') return { transcript: alt, confidence: 1 };
      return {
        transcript: alt.transcript || '',
        confidence: alt.confidence !== undefined ? alt.confidence : 1,
      };
    })
    .filter((a) => Boolean(a.transcript.trim()));

  if (cleanList.length === 0) {
    return {
      command: null,
      rawTranscript: '',
      matchedPhrase: null,
      confidence: 0,
      rejectedReason: null,
    };
  }

  const primaryRaw = cleanList[0].transcript;

  // Guard 1: Ignore commands while coach voice is speaking
  if (isCoachSpeaking) {
    return {
      command: null,
      rawTranscript: primaryRaw,
      matchedPhrase: null,
      confidence: cleanList[0].confidence,
      rejectedReason: 'coach_speaking',
    };
  }

  // Iterate through alternatives in confidence order
  for (const item of cleanList) {
    const raw = item.transcript;
    const normalized = normalizeSpeechText(raw);

    if (!normalized) continue;

    // Handle optional "arena" prefix
    let targetText = normalized;
    if (requirePrefix) {
      const words = normalized.split(' ');
      if (words[0] !== PREFIX_WORD) {
        // Prefix is missing
        continue;
      }
      // Remove prefix word "arena"
      targetText = words.slice(1).join(' ').trim();
      if (!targetText) continue;
    }

    // Match against each defined command
    for (const [commandId, def] of Object.entries(VOICE_COMMANDS)) {
      for (const phrase of def.phrases) {
        if (matchesPhrase(targetText, phrase)) {
          // Check cooldown
          if (now - lastCommandTime < cooldownMs) {
            return {
              command: null,
              rawTranscript: raw,
              matchedPhrase: phrase,
              confidence: item.confidence,
              rejectedReason: 'cooldown',
            };
          }

          return {
            command: commandId,
            rawTranscript: raw,
            matchedPhrase: phrase,
            confidence: item.confidence,
            rejectedReason: null,
          };
        }
      }
    }
  }

  // If requirePrefix was on and alternative had text but lacked prefix
  if (requirePrefix && cleanList.length > 0) {
    return {
      command: null,
      rawTranscript: primaryRaw,
      matchedPhrase: null,
      confidence: cleanList[0].confidence,
      rejectedReason: 'prefix_missing',
    };
  }

  return {
    command: null,
    rawTranscript: primaryRaw,
    matchedPhrase: null,
    confidence: cleanList[0]?.confidence || 0,
    rejectedReason: null,
  };
}

/**
 * Storage helpers for Voice Settings
 */
export function loadVoiceSettings(storageKey = 'fq_voice') {
  try {
    if (typeof localStorage === 'undefined') {
      return {
        enabled: false,
        lang: 'en-IN',
        requirePrefix: false,
        hasAcceptedNotice: false,
      };
    }
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return {
        enabled: false,
        lang: 'en-IN',
        requirePrefix: false,
        hasAcceptedNotice: false,
      };
    }
    const parsed = JSON.parse(raw);
    return {
      enabled: Boolean(parsed.enabled),
      lang: parsed.lang === 'hi-IN' ? 'hi-IN' : 'en-IN',
      requirePrefix: Boolean(parsed.requirePrefix),
      hasAcceptedNotice: Boolean(parsed.hasAcceptedNotice),
    };
  } catch (err) {
    console.warn('Failed to load fq_voice settings:', err);
    return {
      enabled: false,
      lang: 'en-IN',
      requirePrefix: false,
      hasAcceptedNotice: false,
    };
  }
}

export function saveVoiceSettings(settings, storageKey = 'fq_voice') {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(storageKey, JSON.stringify(settings));
  } catch (err) {
    console.warn('Failed to save fq_voice settings:', err);
  }
}
