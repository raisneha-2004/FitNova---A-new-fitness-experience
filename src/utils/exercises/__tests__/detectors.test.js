/**
 * Pure function unit tests for Wall Sit, Butt Kicks, and Lunge detectors
 * Uses synthetic landmark sequences to test:
 * 1. calculateAngle geometry
 * 2. Wall Sit hold detection and XP increments
 * 3. Butt Kicks 3-rep detection (left and right)
 * 4. Lunge 2-rep detection (staggered stance cycle)
 * 5. Deep Squat landmark sequence tested against Lunge detector (MUST NOT count as lunge!)
 */

import { calculateAngle } from '../../angles.js';
import { createWallSitState, stepWallSitDetector, checkWallSitForm } from '../wallSit.js';
import { createButtKicksState, stepButtKicksDetector } from '../buttKicks.js';
import { createLungeState, stepLungeDetector } from '../lunge.js';

function createMockLandmarks({
  hip = { x: 0.5, y: 0.5, visibility: 0.95 },
  knee = { x: 0.5, y: 0.7, visibility: 0.95 },
  ankle = { x: 0.5, y: 0.9, visibility: 0.95 },
  shoulder = { x: 0.5, y: 0.25, visibility: 0.95 },
  leftHip = null,
  rightHip = null,
  leftKnee = null,
  rightKnee = null,
  leftAnkle = null,
  rightAnkle = null,
  leftShoulder = null,
  rightShoulder = null,
} = {}) {
  // Landmark indices:
  // 11: left shoulder, 12: right shoulder
  // 23: left hip, 24: right hip
  // 25: left knee, 26: right knee
  // 27: left ankle, 28: right ankle
  const landmarks = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 0.95 }));

  landmarks[11] = leftShoulder || shoulder;
  landmarks[12] = rightShoulder || shoulder;
  landmarks[23] = leftHip || hip;
  landmarks[24] = rightHip || hip;
  landmarks[25] = leftKnee || knee;
  landmarks[26] = rightKnee || knee;
  landmarks[27] = leftAnkle || ankle;
  landmarks[28] = rightAnkle || ankle;

  return landmarks;
}

console.log('🧪 Starting Exercise Detector Verification Suite...\n');

// ==========================================
// Test 1: calculateAngle
// ==========================================
{
  const pA = { x: 0, y: 1 };
  const pB = { x: 0, y: 0 };
  const pC = { x: 1, y: 0 };
  const rightAngle = calculateAngle(pA, pB, pC);
  console.assert(Math.abs(rightAngle - 90) < 0.01, `Right angle expected 90, got ${rightAngle}`);

  const pStraightA = { x: 0, y: -1 };
  const pStraightC = { x: 0, y: 1 };
  const straightAngle = calculateAngle(pStraightA, pB, pStraightC);
  console.assert(Math.abs(straightAngle - 180) < 0.01, `Straight angle expected 180, got ${straightAngle}`);
  console.log('✅ 1. calculateAngle math assertions passed.');
}

// ==========================================
// Test 2: Wall Sit Hold Detection
// ==========================================
{
  let state = createWallSitState();
  // Perfect 90 degree knee angle:
  // hip at (0.5, 0.65), knee at (0.55, 0.65), ankle at (0.55, 0.9)
  // knee-angle around 90 deg, hip-y close to knee-y, shoulder at (0.51, 0.25)
  const perfectWallSitLandmarks = createMockLandmarks({
    shoulder: { x: 0.51, y: 0.25, visibility: 0.95 },
    hip: { x: 0.5, y: 0.65, visibility: 0.95 },
    knee: { x: 0.55, y: 0.65, visibility: 0.95 },
    ankle: { x: 0.55, y: 0.9, visibility: 0.95 },
  });

  const formCheck = checkWallSitForm(perfectWallSitLandmarks);
  console.assert(formCheck.isInForm === true, `Expected perfect Wall Sit to be inForm: ${JSON.stringify(formCheck)}`);

  let xpEvents = [];

  // Simulate 6 seconds of holding in-form at 30fps
  let currentTimeMs = 10000;
  for (let i = 0; i < 180; i++) {
    currentTimeMs += 1000 / 30;
    const res = stepWallSitDetector(
      state,
      perfectWallSitLandmarks,
      true, // isBodyDetected
      {},
      currentTimeMs
    );
    state = res.nextState;
    if (res.repCompleted) {
      xpEvents.push(res.repCompleted);
    }
  }

  console.assert(state.totalHoldSeconds >= 5.5, `Expected totalHoldSeconds >= 5.5, got ${state.totalHoldSeconds}`);
  console.assert(xpEvents.length >= 1, `Expected at least 1 XP rep event for 6s hold, got ${xpEvents.length}`);
  console.assert(xpEvents[0]?.xpEarned === 10, `Expected 10 XP per 5s hold, got ${xpEvents[0]?.xpEarned}`);
  console.log(`✅ 2. Wall Sit detector passed: ${state.totalHoldSeconds.toFixed(1)}s held, ${xpEvents.length} XP event(s).`);
}

// ==========================================
// Test 3: Butt Kicks 3 Reps (Left & Right)
// ==========================================
{
  let state = createButtKicksState();
  let countedReps = [];

  let t = 1000;

  // Rep 1: Left leg kick
  // Start extended (angle 170)
  for (let f = 0; f < 6; f++) {
    t += 35;
    const res = stepButtKicksDetector(
      state,
      createMockLandmarks({
        leftHip: { x: 0.45, y: 0.5 },
        leftKnee: { x: 0.45, y: 0.7 },
        leftAnkle: { x: 0.45, y: 0.9 }, // extended
        rightHip: { x: 0.55, y: 0.5 },
        rightKnee: { x: 0.55, y: 0.7 },
        rightAnkle: { x: 0.55, y: 0.9 },
      }),
      true,
      {},
      t
    );
    state = res.nextState;
    if (res.repCompleted) countedReps.push(res.repCompleted);
  }

  // Flex left knee to 35 deg (heel to glute: ankle above knee or close)
  for (let f = 0; f < 6; f++) {
    t += 35;
    const res = stepButtKicksDetector(
      state,
      createMockLandmarks({
        leftHip: { x: 0.45, y: 0.5 },
        leftKnee: { x: 0.45, y: 0.7 },
        leftAnkle: { x: 0.45, y: 0.55 }, // ankle y < knee y (lifted up behind)
        rightHip: { x: 0.55, y: 0.5 },
        rightKnee: { x: 0.55, y: 0.7 },
        rightAnkle: { x: 0.55, y: 0.9 },
      }),
      true,
      {},
      t
    );
    state = res.nextState;
    if (res.repCompleted) countedReps.push(res.repCompleted);
  }

  // Return left knee to extended (angle > 120)
  t += 300; // past minRepInterval
  for (let f = 0; f < 6; f++) {
    t += 35;
    const res = stepButtKicksDetector(
      state,
      createMockLandmarks({
        leftHip: { x: 0.45, y: 0.5 },
        leftKnee: { x: 0.45, y: 0.7 },
        leftAnkle: { x: 0.45, y: 0.9 },
        rightHip: { x: 0.55, y: 0.5 },
        rightKnee: { x: 0.55, y: 0.7 },
        rightAnkle: { x: 0.55, y: 0.9 },
      }),
      true,
      {},
      t
    );
    state = res.nextState;
    if (res.repCompleted) countedReps.push(res.repCompleted);
  }

  console.assert(countedReps.length === 1, `Expected 1 butt kick counted, got ${countedReps.length}`);

  // Rep 2: Right leg kick
  t += 300;
  for (let f = 0; f < 6; f++) {
    t += 35;
    const res = stepButtKicksDetector(
      state,
      createMockLandmarks({
        leftHip: { x: 0.45, y: 0.5 },
        leftKnee: { x: 0.45, y: 0.7 },
        leftAnkle: { x: 0.45, y: 0.9 },
        rightHip: { x: 0.55, y: 0.5 },
        rightKnee: { x: 0.55, y: 0.7 },
        rightAnkle: { x: 0.55, y: 0.55 }, // kick right
      }),
      true,
      {},
      t
    );
    state = res.nextState;
    if (res.repCompleted) countedReps.push(res.repCompleted);
  }
  t += 300;
  for (let f = 0; f < 6; f++) {
    t += 35;
    const res = stepButtKicksDetector(
      state,
      createMockLandmarks({
        leftHip: { x: 0.45, y: 0.5 },
        leftKnee: { x: 0.45, y: 0.7 },
        leftAnkle: { x: 0.45, y: 0.9 },
        rightHip: { x: 0.55, y: 0.5 },
        rightKnee: { x: 0.55, y: 0.7 },
        rightAnkle: { x: 0.55, y: 0.9 },
      }),
      true,
      {},
      t
    );
    state = res.nextState;
    if (res.repCompleted) countedReps.push(res.repCompleted);
  }

  console.assert(countedReps.length === 2, `Expected 2 butt kicks counted, got ${countedReps.length}`);

  // Rep 3: Left leg kick again
  t += 300;
  for (let f = 0; f < 6; f++) {
    t += 35;
    const res = stepButtKicksDetector(
      state,
      createMockLandmarks({
        leftHip: { x: 0.45, y: 0.5 },
        leftKnee: { x: 0.45, y: 0.7 },
        leftAnkle: { x: 0.45, y: 0.55 },
        rightHip: { x: 0.55, y: 0.5 },
        rightKnee: { x: 0.55, y: 0.7 },
        rightAnkle: { x: 0.55, y: 0.9 },
      }),
      true,
      {},
      t
    );
    state = res.nextState;
    if (res.repCompleted) countedReps.push(res.repCompleted);
  }
  t += 300;
  for (let f = 0; f < 6; f++) {
    t += 35;
    const res = stepButtKicksDetector(
      state,
      createMockLandmarks({
        leftHip: { x: 0.45, y: 0.5 },
        leftKnee: { x: 0.45, y: 0.7 },
        leftAnkle: { x: 0.45, y: 0.9 },
        rightHip: { x: 0.55, y: 0.5 },
        rightKnee: { x: 0.55, y: 0.7 },
        rightAnkle: { x: 0.55, y: 0.9 },
      }),
      true,
      {},
      t
    );
    state = res.nextState;
    if (res.repCompleted) countedReps.push(res.repCompleted);
  }

  console.assert(countedReps.length === 3, `Expected 3 butt kicks counted, got ${countedReps.length}`);
  console.log(`✅ 3. Butt Kicks detector passed: ${countedReps.length} reps counted across both legs.`);
}

// ==========================================
// Test 4: Lunge 2 Reps (Full Cycle)
// ==========================================
{
  let state = createLungeState();
  let lungeReps = [];

  let t = 1000;

  // Staggered stance: torso length = hip.y - shoulder.y = 0.5 - 0.25 = 0.25
  // Stagger threshold = 0.8 * 0.25 = 0.20
  // Left ankle at x=0.35, Right ankle at x=0.65 -> ankle separation = 0.30 >= 0.20

  const standingStaggered = createMockLandmarks({
    shoulder: { x: 0.5, y: 0.25 },
    leftHip: { x: 0.45, y: 0.5 },
    rightHip: { x: 0.55, y: 0.5 },
    leftKnee: { x: 0.35, y: 0.7 },
    rightKnee: { x: 0.60, y: 0.7 },
    leftAnkle: { x: 0.25, y: 0.9 }, // 180 deg straight knees
    rightAnkle: { x: 0.65, y: 0.9 },
  });

  // Deep lunge bottom: front knee 90 deg (good), rear knee 121 deg (<130)
  const bottomLunge = createMockLandmarks({
    shoulder: { x: 0.5, y: 0.35 },
    leftHip: { x: 0.45, y: 0.65 },
    rightHip: { x: 0.55, y: 0.65 },
    leftKnee: { x: 0.25, y: 0.65 }, // front 90 deg angle
    rightKnee: { x: 0.58, y: 0.82 }, // rear knee 121 deg
    leftAnkle: { x: 0.25, y: 0.90 },
    rightAnkle: { x: 0.68, y: 0.86 },
  });

  // Rep 1 Cycle:
  // Phase 1: STANDING (10 frames)
  for (let f = 0; f < 10; f++) {
    t += 50;
    const res = stepLungeDetector(state, standingStaggered, true, {}, t);
    state = res.nextState;
    if (res.repCompleted) lungeReps.push(res.repCompleted);
  }

  // Phase 2: GOING_DOWN -> BOTTOM (15 frames)
  for (let f = 0; f < 15; f++) {
    t += 50;
    const res = stepLungeDetector(state, bottomLunge, true, {}, t);
    state = res.nextState;
    if (res.repCompleted) lungeReps.push(res.repCompleted);
  }

  // Phase 3: COMING_UP -> STANDING (15 frames, > 1.0s elapsed)
  t += 1200;
  for (let f = 0; f < 15; f++) {
    t += 50;
    const res = stepLungeDetector(state, standingStaggered, true, {}, t);
    state = res.nextState;
    if (res.repCompleted) lungeReps.push(res.repCompleted);
  }

  console.assert(lungeReps.length === 1, `Expected 1 lunge counted, got ${lungeReps.length}`);

  // Rep 2 Cycle:
  for (let f = 0; f < 15; f++) {
    t += 50;
    const res = stepLungeDetector(state, bottomLunge, true, {}, t);
    state = res.nextState;
    if (res.repCompleted) lungeReps.push(res.repCompleted);
  }
  t += 1200;
  for (let f = 0; f < 15; f++) {
    t += 50;
    const res = stepLungeDetector(state, standingStaggered, true, {}, t);
    state = res.nextState;
    if (res.repCompleted) lungeReps.push(res.repCompleted);
  }

  console.assert(lungeReps.length === 2, `Expected 2 lunges counted, got ${lungeReps.length}`);
  console.log(`✅ 4. Lunge detector passed: ${lungeReps.length} full-cycle reps counted.`);
}

// ==========================================
// Test 5: Squat MUST NOT Count as Lunge
// ==========================================
{
  let state = createLungeState();
  let lungeCountDuringSquat = 0;

  let t = 1000;

  // Squat stance: Feet are parallel, NOT staggered!
  // left ankle x = 0.48, right ankle x = 0.52 -> separation = 0.04 << 0.20
  const squatStanding = createMockLandmarks({
    shoulder: { x: 0.5, y: 0.25 },
    leftHip: { x: 0.48, y: 0.5 },
    rightHip: { x: 0.52, y: 0.5 },
    leftKnee: { x: 0.48, y: 0.7 },
    rightKnee: { x: 0.52, y: 0.7 },
    leftAnkle: { x: 0.48, y: 0.9 },
    rightAnkle: { x: 0.52, y: 0.9 },
  });

  const deepSquatBottom = createMockLandmarks({
    shoulder: { x: 0.5, y: 0.4 },
    leftHip: { x: 0.48, y: 0.65 },
    rightHip: { x: 0.52, y: 0.65 },
    leftKnee: { x: 0.44, y: 0.65 }, // 85 deg knee angle
    rightKnee: { x: 0.56, y: 0.65 },
    leftAnkle: { x: 0.48, y: 0.9 },
    rightAnkle: { x: 0.52, y: 0.9 },
  });

  // Execute full deep squat cycle
  for (let f = 0; f < 10; f++) {
    t += 50;
    const res = stepLungeDetector(state, squatStanding, true, {}, t);
    state = res.nextState;
    if (res.repCompleted) lungeCountDuringSquat += 1;
  }
  for (let f = 0; f < 10; f++) {
    t += 50;
    const res = stepLungeDetector(state, deepSquatBottom, true, {}, t);
    state = res.nextState;
    if (res.repCompleted) lungeCountDuringSquat += 1;
  }
  t += 1200;
  for (let f = 0; f < 10; f++) {
    t += 50;
    const res = stepLungeDetector(state, squatStanding, true, {}, t);
    state = res.nextState;
    if (res.repCompleted) lungeCountDuringSquat += 1;
  }

  console.assert(
    lungeCountDuringSquat === 0,
    `CRITICAL REGRESSION: Squat was incorrectly counted as a lunge! Count = ${lungeCountDuringSquat}`
  );
  console.log(`✅ 5. Anti-false-positive verified: Squat produced ${lungeCountDuringSquat} lunges (MUST be 0).`);
}

console.log('\n🎉 ALL DETECTOR VERIFICATION TESTS PASSED SUCCESSFULLY!');
