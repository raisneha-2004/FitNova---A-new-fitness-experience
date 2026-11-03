import { Dumbbell, Activity, Flame, Target, Sparkles, Zap } from 'lucide-react';

/**
 * Exercise Registry for FitNova
 * Single source of truth for all exercises, live-arena parameters, thresholds, and XP rewards.
 */
export const EXERCISES = [
  {
    id: 'squat',
    name: 'Bodyweight Squat',
    icon: Dumbbell,
    type: 'reps',
    cameraView: 'Side view',
    cameraTip: 'Camera tip: Side view, step back 6-8 feet, full body in frame',
    requiredBody: 'full', // 'full' (shoulders, hips, knees, ankles) or 'upper' (shoulders, elbows, wrists)
    targetOptions: [5, 10, 15, 20],
    defaultTarget: 10,
    difficulty: 'Beginner',
    difficultyColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    targetMuscles: 'Quadriceps, Glutes, Hamstrings, Core',
    description:
      'Master fundamental lower body strength and knee tracking. Real-time depth angle validation ensures you break parallel safely every repetition.',
    xp: {
      good: 10,
      partial: 2,
    },
    thresholds: {
      standingAngle: 160,
      goodDepthAngle: 100,
      shallowAngle: 125,
      minRepSeconds: 0.8,
      minFramesPerPhase: 6,
      smoothingFrames: 5,
    },
    metricLabel: 'Knee',
    unit: '°',
  },
  {
    id: 'jumping-jacks',
    name: 'Jumping Jacks',
    icon: Activity,
    type: 'reps',
    cameraView: 'Front view',
    cameraTip: 'Camera tip: Front view, step back 7-9 feet, full body in frame',
    requiredBody: 'full',
    targetOptions: [10, 20, 30, 50],
    defaultTarget: 20,
    difficulty: 'Beginner',
    difficultyColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    targetMuscles: 'Cardiovascular, Calves, Deltoids, Full Body',
    description:
      'Dynamic full-body conditioning tracking bilateral arm abduction and foot spread cadence for high-tempo aerobic burns.',
    xp: {
      good: 10,
      partial: 2,
    },
    thresholds: {
      minRepSeconds: 0.5,
      minFramesPerPhase: 6,
      smoothingFrames: 5,
      ankleSpreadMultiplierOpen: 1.5, // ankle distance > 1.5 * shoulder width
      ankleSpreadMultiplierClosed: 1.0, // ankle distance < 1.0 * shoulder width
    },
    metricLabel: 'State',
    unit: '',
  },
  {
    id: 'bicep-curl',
    name: 'Bicep Curl',
    icon: Zap,
    type: 'reps',
    cameraView: 'Front view',
    cameraTip: 'Camera tip: Front or side view, upper body in frame, keep elbows pinned',
    requiredBody: 'upper', // shoulders, elbows, wrists
    targetOptions: [5, 10, 15, 20],
    defaultTarget: 10,
    difficulty: 'Beginner',
    difficultyColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    targetMuscles: 'Biceps Brachii, Brachialis, Forearms',
    description:
      'Bodyweight or resistance curls tracking elbow flexion range of motion while enforcing pinned-elbow form guidance.',
    xp: {
      good: 10,
      partial: 2,
    },
    thresholds: {
      extendedAngle: 150, // above 150° is extended
      curledGoodAngle: 55, // below 55° is good curl
      curledPartialAngle: 80, // 55° - 80° is partial curl
      minRepSeconds: 0.8,
      minFramesPerPhase: 6,
      smoothingFrames: 5,
      elbowFlareTolerance: 0.08, // 8% frame width movement away from shoulder
    },
    metricLabel: 'Elbow',
    unit: '°',
  },
  {
    id: 'wall-sit',
    name: 'Wall Sit',
    icon: Target,
    type: 'hold',
    cameraView: 'Side view',
    cameraTip: 'Camera tip: Side view, step back 6-8 feet, full body in frame',
    requiredBody: 'full',
    targetOptions: [15, 30, 45, 60],
    defaultTarget: 30,
    difficulty: 'Beginner',
    difficultyColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    targetMuscles: 'Quadriceps, Glutes, Calves, Core',
    description:
      'Isometric quad burn measuring exact 90-degree thigh parallel hold time with back posture support detection.',
    xp: {
      good: 10, // +10 XP per 5s in form
      partial: 2,
    },
    thresholds: {
      minKneeAngle: 80,
      maxKneeAngle: 105,
      maxHipKneeYDiff: 0.10,
      maxTorsoXDiff: 0.08,
      gracePeriodSeconds: 0.5,
      smoothingFrames: 5,
    },
    metricLabel: 'Knee',
    unit: '°',
  },
  {
    id: 'butt-kicks',
    name: 'Butt Kicks',
    icon: Sparkles,
    type: 'reps',
    cameraView: 'Side or Front view',
    cameraTip: 'Camera tip: Side or Front view, step back 6-8 feet, full body in frame',
    requiredBody: 'full',
    targetOptions: [20, 30, 40, 50],
    defaultTarget: 20,
    difficulty: 'Beginner',
    difficultyColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    targetMuscles: 'Hamstrings, Glutes, Quadriceps, Calves',
    description:
      'High-tempo dynamic running drill driving heels to glutes with bilateral knee flexion tracking.',
    xp: {
      good: 10,
      partial: 2,
    },
    thresholds: {
      kickThresholdAngle: 60,
      kickGoodAngle: 45,
      extendedAngle: 120,
      minRepSeconds: 0.25,
      minFramesPerPhase: 4,
      smoothingFrames: 3,
    },
    metricLabel: 'Kick',
    unit: '',
  },
  {
    id: 'lunge',
    name: 'Forward Lunge',
    icon: Activity,
    type: 'reps',
    cameraView: 'Side view',
    cameraTip: 'Camera tip: Side view, step back 6-8 feet, full body in frame',
    requiredBody: 'full',
    targetOptions: [6, 10, 14, 20],
    defaultTarget: 10,
    difficulty: 'Intermediate',
    difficultyColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    targetMuscles: 'Quadriceps, Glutes, Hamstrings, Calves, Stabilizers',
    description:
      'Unilateral lower body lunges enforcing a true staggered stance with knee flexion tracking and upright torso guidance.',
    xp: {
      good: 10,
      partial: 2,
    },
    thresholds: {
      standingKneeAngle: 160,
      bottomFrontKneeAngle: 110,
      bottomRearKneeAngle: 130,
      goodFrontKneeAngle: 100,
      partialFrontKneeAngle: 120,
      staggerRatioThreshold: 0.80,
      maxTorsoLean: 0.12,
      minRepSeconds: 1.0,
      minFramesPerPhase: 6,
      smoothingFrames: 5,
    },
    metricLabel: 'Front Knee',
    unit: '°',
  },
];

/**
 * List of upcoming exercises shown on Exercises page
 */
export const COMING_SOON_EXERCISES = [
  {
    id: 'push-up',
    name: 'Standard Push-up',
    difficulty: 'Intermediate',
    difficultyColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    targetMuscles: 'Pectorals, Anterior Deltoids, Triceps',
    cameraView: 'Side view',
    description:
      'Horizontal pressing tracking with elbow flare monitoring and spinal plank alignment alerts to prevent sagging hips.',
    icon: Flame,
  },
  {
    id: 'core-plank',
    name: 'Isometric Plank',
    difficulty: 'Intermediate',
    difficultyColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    targetMuscles: 'Rectus Abdominis, Transverse Abdominis, Shoulders',
    cameraView: 'Side view',
    description:
      'Time-under-tension stopwatch with joint collinearity detection that automatically pauses when pelvic tilt deviates.',
    icon: Sparkles,
  },
];

/**
 * Helper to retrieve an exercise by id with fallback to squat.
 * Handles bicepCurl, bicep_curl, bicep-curl, high-knees, plank, etc.
 */
export function getExerciseById(id) {
  if (!id || typeof id !== 'string') return EXERCISES[0];

  // Convert camelCase to kebab-case, replace underscores with hyphens, and lowercase
  const normalized = id
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase()
    .trim();

  // Check aliases
  let targetId = normalized;
  if (normalized === 'bodyweight-squat' || normalized === 'squats') {
    targetId = 'squat';
  } else if (normalized === 'jumpingjacks' || normalized === 'jumping-jack') {
    targetId = 'jumping-jacks';
  } else if (normalized === 'bicepcurl' || normalized === 'bicep-curls' || normalized === 'curls') {
    targetId = 'bicep-curl';
  } else if (normalized === 'wallsit' || normalized === 'wall-sit') {
    targetId = 'wall-sit';
  } else if (normalized === 'buttkicks' || normalized === 'butt-kicks' || normalized === 'butt-kick') {
    targetId = 'butt-kicks';
  } else if (normalized === 'walking-lunge' || normalized === 'lunges' || normalized === 'lunge') {
    targetId = 'lunge';
  } else if (normalized === 'highknees' || normalized === 'high-knee') {
    targetId = 'high-knees';
  } else if (normalized === 'core-plank' || normalized === 'isometric-plank') {
    targetId = 'plank';
  }

  const found = EXERCISES.find(
    (e) => e.id === targetId || e.id === normalized || e.id === id
  );

  return found || EXERCISES[0];
}
