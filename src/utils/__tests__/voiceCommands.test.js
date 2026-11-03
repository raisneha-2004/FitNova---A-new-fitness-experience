import assert from 'node:assert/strict';
import {
  normalizeSpeechText,
  matchesPhrase,
  parseVoiceCommand,
} from '../voiceCommands.js';
import { VOICE_COMMANDS } from '../../config/voiceConfig.js';

console.log('--- RUNNING VOICE COMMAND PARSER PURE-FUNCTION TESTS ---');

// 1. Normalization tests
console.log('Test 1: Normalization');
assert.equal(normalizeSpeechText('  START!  '), 'start');
assert.equal(normalizeSpeechText('Ruko, Please!'), 'ruko please');
assert.equal(normalizeSpeechText('DOBARA...?'), 'dobara');
assert.equal(normalizeSpeechText('   Shuru    Karo!  '), 'shuru karo');

// 2. Exact word matching tests (no partial substring false positives)
console.log('Test 2: Phrase Matching & Near-misses');
// Exact matches
assert.equal(matchesPhrase('start', 'start'), true);
assert.equal(matchesPhrase('shuru karo', 'shuru karo'), true);
assert.equal(matchesPhrase('ruk jao', 'ruk jao'), true);
assert.equal(matchesPhrase('bas', 'bas'), true);

// Near misses that must NOT trigger
assert.equal(matchesPhrase('restart', 'start'), false, "'restart' must NOT match 'start'");
assert.equal(matchesPhrase('starter', 'start'), false, "'starter' must NOT match 'start'");
assert.equal(matchesPhrase('basket', 'bas'), false, "'basket' must NOT match 'bas'");
assert.equal(matchesPhrase('continuous', 'continue'), false, "'continuous' must NOT match 'continue'");

// 3. Command Parsing: English and Hinglish phrases
console.log('Test 3: English and Hinglish Commands');

// start command
const testPhrases = {
  start: ['start', 'begin', 'go', 'shuru', 'shuru karo'],
  pause: ['pause', 'stop', 'ruko', 'ruk jao', 'wait'],
  resume: ['resume', 'continue', 'chalo', 'phir se'],
  finish: ['finish', 'done', 'end', 'khatam', 'bas'],
  playAgain: ['play again', 'restart', 'dobara'],
  muteVoice: ['mute', 'quiet', 'chup'],
};

for (const [expectedCmd, phrases] of Object.entries(testPhrases)) {
  for (const phrase of phrases) {
    const res = parseVoiceCommand([{ transcript: phrase, confidence: 0.9 }], {
      requirePrefix: false,
      lastCommandTime: 0,
      now: 10000,
      cooldownMs: 1500,
      isCoachSpeaking: false,
    });
    assert.equal(
      res.command,
      expectedCmd,
      `Phrase "${phrase}" should parse as command "${expectedCmd}" but got "${res.command}"`
    );
  }
}

// 4. Prefix Mode ("arena <command>")
console.log('Test 4: Prefix Mode');

// When requirePrefix is TRUE:
// "arena start" should trigger "start"
const prefixPass = parseVoiceCommand([{ transcript: 'arena start', confidence: 0.9 }], {
  requirePrefix: true,
  lastCommandTime: 0,
  now: 10000,
  cooldownMs: 1500,
  isCoachSpeaking: false,
});
assert.equal(prefixPass.command, 'start', "'arena start' should trigger 'start' when prefix required");

// "arena ruko" should trigger "pause"
const prefixHinglishPass = parseVoiceCommand([{ transcript: 'arena ruko', confidence: 0.9 }], {
  requirePrefix: true,
  lastCommandTime: 0,
  now: 10000,
  cooldownMs: 1500,
  isCoachSpeaking: false,
});
assert.equal(prefixHinglishPass.command, 'pause', "'arena ruko' should trigger 'pause' when prefix required");

// Bare "start" without "arena" must NOT trigger when requirePrefix is true
const prefixFail = parseVoiceCommand([{ transcript: 'start', confidence: 0.9 }], {
  requirePrefix: true,
  lastCommandTime: 0,
  now: 10000,
  cooldownMs: 1500,
  isCoachSpeaking: false,
});
assert.equal(prefixFail.command, null, "Bare 'start' must NOT trigger when requirePrefix is TRUE");

// 5. Cooldown Protection (1.5 seconds)
console.log('Test 5: Cooldown Enforcement');

// First command at t=10000
const firstCmd = parseVoiceCommand([{ transcript: 'pause', confidence: 0.9 }], {
  requirePrefix: false,
  lastCommandTime: 0,
  now: 10000,
  cooldownMs: 1500,
  isCoachSpeaking: false,
});
assert.equal(firstCmd.command, 'pause');

// Follow-up command at t=10800 (only 800ms elapsed, cooldown is 1500ms)
const duringCooldown = parseVoiceCommand([{ transcript: 'resume', confidence: 0.9 }], {
  requirePrefix: false,
  lastCommandTime: 10000,
  now: 10800,
  cooldownMs: 1500,
  isCoachSpeaking: false,
});
assert.equal(duringCooldown.command, null, 'Command during cooldown must be ignored');
assert.equal(duringCooldown.rejectedReason, 'cooldown');

// Follow-up command at t=11600 (1600ms elapsed, cooldown expired)
const afterCooldown = parseVoiceCommand([{ transcript: 'resume', confidence: 0.9 }], {
  requirePrefix: false,
  lastCommandTime: 10000,
  now: 11600,
  cooldownMs: 1500,
  isCoachSpeaking: false,
});
assert.equal(afterCooldown.command, 'resume', 'Command after cooldown expiration must trigger');

// 6. Suspension during Coach Speech Synthesis
console.log('Test 6: Coach Speech Synthesis Guard');
const whileSpeaking = parseVoiceCommand([{ transcript: 'start', confidence: 0.9 }], {
  requirePrefix: false,
  lastCommandTime: 0,
  now: 10000,
  cooldownMs: 1500,
  isCoachSpeaking: true, // Coach voice currently speaking
});
assert.equal(whileSpeaking.command, null, 'Commands must be ignored while coach audio is speaking');
assert.equal(whileSpeaking.rejectedReason, 'coach_speaking');

// 7. Multi-alternative recognition evaluation
console.log('Test 7: Multi-alternative Resolution');
// First alternative is gibberish from background noise, second alternative is clear "khatam"
const multiAlt = parseVoiceCommand(
  [
    { transcript: 'ummm', confidence: 0.3 },
    { transcript: 'khatam', confidence: 0.85 },
  ],
  {
    requirePrefix: false,
    lastCommandTime: 0,
    now: 10000,
    cooldownMs: 1500,
    isCoachSpeaking: false,
  }
);
assert.equal(multiAlt.command, 'finish', 'Should evaluate secondary alternatives if top is not a command');

console.log('ALL VOICE COMMAND PARSER TESTS PASSED SUCCESSFULLY! (7/7 Suites)');
