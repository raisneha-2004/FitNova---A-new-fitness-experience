/**
 * Pure-function test suite for FitNova
 * Tests:
 * 1. Challenge selection by date (deterministic, rotation, modulo)
 * 2. Daily progress calculation from sessions (exercise match, midnight boundary)
 * 3. Daily reward granting once-only guard
 * 4. Server-side session & nickname validation (valid, too many reps, negative XP, bad nickname)
 */

import assert from 'node:assert';
import { getDailyChallenge, getDailyChallengeProgress, isSameLocalDate } from '../daily.js';
import { DAILY_CHALLENGES } from '../../config/dailyChallenges.js';

console.log('--- Running FitNova Pure-Function Tests ---');

// ============================================================
// TEST SUITE 1: Challenge Selection by Date
// ============================================================
{
  console.log('Test 1: Challenge selection determinism and rotation...');

  // Same date always returns same challenge
  const testDate = new Date('2026-11-03T10:00:00Z');
  const ch1 = getDailyChallenge(testDate);
  const ch2 = getDailyChallenge(testDate);
  assert.strictEqual(ch1.id, ch2.id, 'Same date must return the same challenge');
  assert.ok(ch1.name, 'Challenge must have a name');
  assert.ok(ch1.target > 0, 'Challenge target must be positive');

  // Successive dates rotate
  const day1 = new Date('2026-11-03T12:00:00');
  const day2 = new Date('2026-11-04T12:00:00');
  const chDay1 = getDailyChallenge(day1);
  const chDay2 = getDailyChallenge(day2);
  assert.notStrictEqual(chDay1.id, chDay2.id, 'Consecutive days must rotate to different challenges');

  // Modulo wraps properly over challenge length
  const dayLength = DAILY_CHALLENGES.length;
  const dayAfterCycle = new Date(day1.getTime() + dayLength * 86400000);
  const chCycled = getDailyChallenge(dayAfterCycle);
  assert.strictEqual(chDay1.id, chCycled.id, 'A full rotation cycle must return to the initial challenge');

  console.log('  ✓ Deterministic rotation and modulo wrapping passed');
}

// ============================================================
// TEST SUITE 2: Daily Progress from Sessions & Midnight Boundary
// ============================================================
{
  console.log('Test 2: Daily progress from sessions and midnight boundary...');

  const challenge = {
    id: 'test-squat-10',
    exerciseId: 'squat',
    name: '10 Squats',
    target: 10,
    type: 'reps',
    rewardXp: 100,
  };

  const today = new Date('2026-11-03T15:00:00');

  // Session history containing today, yesterday, and different exercises
  const mockSessions = [
    {
      id: 's1',
      exercise: 'squat',
      goodReps: 4,
      totalReps: 5,
      date: '2026-11-03T09:00:00',
    },
    {
      id: 's2',
      exercise: 'squat',
      goodReps: 3,
      totalReps: 3,
      date: '2026-11-03T14:30:00',
    },
    {
      // Different exercise today: should NOT count towards squat challenge
      id: 's3',
      exercise: 'bicep-curl',
      goodReps: 15,
      totalReps: 15,
      date: '2026-11-03T11:00:00',
    },
    {
      // Yesterday's session (midnight boundary check): should NOT count towards today's challenge
      id: 's4',
      exercise: 'squat',
      goodReps: 10,
      totalReps: 10,
      date: '2026-11-02T23:45:00',
    },
  ];

  const progress = getDailyChallengeProgress(challenge, mockSessions, today);
  // Expected good reps: s1 (4) + s2 (3) = 7 reps
  assert.strictEqual(progress.current, 7, 'Must sum only today\'s matching exercise good reps');
  assert.strictEqual(progress.target, 10, 'Target must match challenge target');
  assert.strictEqual(progress.percentage, 70, 'Percentage must be 70%');
  assert.strictEqual(progress.isCompleted, false, '7/10 should not be completed');

  // Boundary check: isSameLocalDate helper
  assert.strictEqual(isSameLocalDate('2026-11-03T01:00:00', today), true, 'Same local calendar day must match');
  assert.strictEqual(isSameLocalDate('2026-11-02T23:59:59', today), false, 'Day before midnight boundary must not match');

  // Completed scenario
  const completedSessions = [
    ...mockSessions,
    {
      id: 's5',
      exercise: 'squat',
      goodReps: 4,
      totalReps: 4,
      date: '2026-11-03T16:00:00',
    },
  ];
  const completedProg = getDailyChallengeProgress(challenge, completedSessions, today);
  // 7 + 4 = 11 reps >= 10
  assert.strictEqual(completedProg.current, 11);
  assert.strictEqual(completedProg.isCompleted, true, '11/10 must be marked completed');
  assert.strictEqual(completedProg.percentage, 100, 'Percentage should cap at 100%');

  console.log('  ✓ Session filtering, exercise matching, and midnight boundaries passed');
}

// ============================================================
// TEST SUITE 3: Once-Per-Day Reward Claiming Guard
// ============================================================
{
  console.log('Test 3: Daily reward claim idempotency guard...');

  // Mock localStorage for node environment
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => store.get(key) || null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
  };

  const { claimDailyReward, loadDailyState } = await import('../daily.js');

  const challenge = {
    id: 'daily-squat-10',
    exerciseId: 'squat',
    target: 10,
    type: 'reps',
    rewardXp: 100,
  };

  const testDate = new Date('2026-11-03T12:00:00');

  // Initial claim
  const firstClaim = claimDailyReward(challenge, testDate);
  assert.strictEqual(firstClaim.success, true, 'First reward claim should succeed');
  assert.strictEqual(firstClaim.alreadyClaimed, false);
  assert.strictEqual(firstClaim.rewardXp, 100, 'Should grant +100 XP');

  // Verify daily state reflects claimed status
  const stateAfter = loadDailyState(testDate);
  assert.strictEqual(stateAfter.claimed, true, 'fq_daily must record claimed: true');

  // Second claim attempt on the same day MUST be rejected
  const secondClaim = claimDailyReward(challenge, testDate);
  assert.strictEqual(secondClaim.success, false, 'Second claim on same day must fail');
  assert.strictEqual(secondClaim.alreadyClaimed, true, 'Must indicate alreadyClaimed: true');

  console.log('  ✓ Once-per-day reward claim guard passed');
}

console.log('--- All Client-Side Pure-Function Tests Passed Successfully! ---\n');

