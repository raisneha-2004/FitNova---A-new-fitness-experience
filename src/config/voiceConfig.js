/**
 * FitNova - Voice Command Dictionary & Configuration
 * Supports English and Hinglish phrases with clean intent normalization.
 */

export const VOICE_STORAGE_KEY = 'fq_voice';

export const VOICE_LANGUAGES = [
  { code: 'en-IN', label: 'English (India)' },
  { code: 'hi-IN', label: 'Hindi (India)' },
];

/**
 * Default Voice Settings
 */
export const DEFAULT_VOICE_SETTINGS = {
  enabled: false,
  lang: 'en-IN',
  requirePrefix: false, // Setting: "Require 'Arena' before commands"
  hasAcceptedNotice: false,
};

/**
 * Command dictionary with English and Hinglish keywords
 */
export const VOICE_COMMANDS = {
  start: {
    id: 'start',
    label: 'Start Workout',
    description: 'Triggers the 3-2-1 countdown when camera and body are ready',
    phrases: ['start', 'begin', 'go', 'shuru', 'shuru karo'],
    example: '"Start" or "Shuru karo"',
  },
  pause: {
    id: 'pause',
    label: 'Pause Workout',
    description: 'Pauses active workout counting, timer and energy',
    phrases: ['pause', 'stop', 'ruko', 'ruk jao', 'wait'],
    example: '"Pause" or "Ruko"',
  },
  resume: {
    id: 'resume',
    label: 'Resume Workout',
    description: 'Resumes paused workout from the current state',
    phrases: ['resume', 'continue', 'chalo', 'phir se'],
    example: '"Resume" or "Chalo"',
  },
  finish: {
    id: 'finish',
    label: 'Finish Workout',
    description: 'Concludes active workout and opens the summary modal',
    phrases: ['finish', 'done', 'end', 'khatam', 'bas'],
    example: '"Finish" or "Khatam"',
  },
  playAgain: {
    id: 'playAgain',
    label: 'Play Again',
    description: 'Restarts a new session when summary modal is open',
    phrases: ['play again', 'restart', 'dobara'],
    example: '"Play again" or "Dobara"',
  },
  muteVoice: {
    id: 'muteVoice',
    label: 'Mute/Unmute Audio',
    description: 'Toggles audio feedback voice cue mute',
    phrases: ['mute', 'quiet', 'chup'],
    example: '"Mute" or "Quiet"',
  },
};

export const PREFIX_WORD = 'arena';
