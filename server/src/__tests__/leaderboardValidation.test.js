/**
 * Server-Side Validation Test Suite
 * Tests:
 * - Nickname validation & sanitization
 * - Blocked words rejection
 * - Session anti-abuse validation (valid, too many reps, negative values, excessive XP)
 * - Cryptographic token generation & verification
 * - Asia/Kolkata date key generation
 */

const assert = require('node:assert');
const {
  validateNickname,
  validateSessionData,
  generateSecretToken,
  hashToken,
  verifyToken,
  getDayKey,
  getWeekKey,
} = require('../utils/leaderboardUtils');

console.log('--- Running Server-Side Anti-Abuse Validation Tests ---');

// 1. Nickname Validation
{
  console.log('Test 1: Nickname validation...');

  // Valid nicknames
  const valid1 = validateNickname('IronPhoenix');
  assert.strictEqual(valid1.isValid, true);
  assert.strictEqual(valid1.sanitized, 'IronPhoenix');

  const valid2 = validateNickname('Apex_Runner 99');
  assert.strictEqual(valid2.isValid, true);

  // Too short (< 2 chars)
  const tooShort = validateNickname('A');
  assert.strictEqual(tooShort.isValid, false);
  assert.match(tooShort.error, /at least 2 characters/i);

  // Too long (> 16 chars)
  const tooLong = validateNickname('ThisNicknameIsFarTooLongForOurApp');
  assert.strictEqual(tooLong.isValid, false);
  assert.match(tooLong.error, /16 characters or fewer/i);

  // Invalid special characters
  const badChars = validateNickname('Hacker<script>');
  assert.strictEqual(badChars.isValid, false);
  assert.match(badChars.error, /invalid characters/i);

  // Blocked or reserved words
  const blockedAdmin = validateNickname('SystemAdmin_99');
  assert.strictEqual(blockedAdmin.isValid, false);
  assert.match(blockedAdmin.error, /disallowed or reserved/i);

  const blockedVulgar = validateNickname('bad_asshole_guy');
  assert.strictEqual(blockedVulgar.isValid, false);

  console.log('  ✓ Nickname rules (length, characters, blocked words) passed');
}

// 2. Session Anti-Abuse Validation
{
  console.log('Test 2: Workout session metrics sanity...');

  // Valid session
  const validSession = {
    exerciseId: 'squat',
    totalReps: 15,
    durationSeconds: 30,
    xpEarned: 150,
    streak: 3,
    level: 2,
  };
  const validRes = validateSessionData(validSession);
  assert.strictEqual(validRes.isValid, true);
  assert.strictEqual(validRes.sanitized.totalReps, 15);
  assert.strictEqual(validRes.sanitized.xpEarned, 150);

  // Impossible reps (e.g. 50 reps in 5 seconds -> > 3 reps/sec)
  const impossibleReps = {
    exerciseId: 'squat',
    totalReps: 50,
    durationSeconds: 5,
    xpEarned: 100,
  };
  const impRes = validateSessionData(impossibleReps);
  assert.strictEqual(impRes.isValid, false);
  assert.match(impRes.error, /Impossible rep cadence/i);

  // Negative values
  const negativeXp = {
    exerciseId: 'squat',
    totalReps: 10,
    durationSeconds: 20,
    xpEarned: -50,
  };
  const negRes = validateSessionData(negativeXp);
  assert.strictEqual(negRes.isValid, false);
  assert.match(negRes.error, /Negative numbers/i);

  const negativeReps = {
    exerciseId: 'squat',
    totalReps: -5,
    durationSeconds: 20,
    xpEarned: 50,
  };
  assert.strictEqual(validateSessionData(negativeReps).isValid, false);

  // Excessive, unreasonable XP
  const massiveXp = {
    exerciseId: 'squat',
    totalReps: 10,
    durationSeconds: 20,
    xpEarned: 999999,
  };
  const massRes = validateSessionData(massiveXp);
  assert.strictEqual(massRes.isValid, false);
  assert.match(massRes.error, /Excessive XP/i);

  console.log('  ✓ Session anti-abuse validation (speed, negatives, excessive XP) passed');
}

// 3. Cryptographic Token Hashing & Verification
{
  console.log('Test 3: Token hashing and anti-hijacking protection...');

  const token = generateSecretToken();
  assert.strictEqual(typeof token, 'string');
  assert.ok(token.length >= 32);

  const hash = hashToken(token);
  assert.strictEqual(typeof hash, 'string');
  assert.strictEqual(hash.length, 64, 'SHA-256 hex must be 64 characters');

  // Verify matching token
  assert.strictEqual(verifyToken(token, hash), true, 'Correct token must verify');

  // Verify wrong token rejected
  assert.strictEqual(verifyToken('wrong-fake-token', hash), false, 'Wrong token must fail');
  assert.strictEqual(verifyToken(null, hash), false, 'Null token must fail');

  console.log('  ✓ Cryptographic token verification passed');
}

// 4. Timezone Key Generation (Asia/Kolkata)
{
  console.log('Test 4: Asia/Kolkata date key rollover helpers...');

  const now = new Date();
  const dayKey = getDayKey(now);
  assert.match(dayKey, /^\d{4}-\d{2}-\d{2}$/, 'Day key must be YYYY-MM-DD');

  const weekKey = getWeekKey(now);
  assert.match(weekKey, /^\d{4}-W\d{2}$/, 'Week key must be YYYY-Www');

  console.log(`  ✓ Date keys: day=${dayKey}, week=${weekKey}`);
}

console.log('--- All Server-Side Validation Tests Passed Successfully! ---\n');

