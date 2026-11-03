/**
 * Daily Challenge Definitions for FitNova
 *
 * Each challenge connects to a verified live-arena exercise engine.
 * Properties:
 * - id: unique challenge string
 * - exerciseId: matches an engine in EXERCISES (squat, jumping-jacks, bicep-curl, wall-sit, butt-kicks, lunge)
 * - name: Display title
 * - target: target repetition count or hold seconds
 * - type: 'reps' | 'hold'
 * - rewardXp: XP awarded upon completion (default 100)
 * - description: Form guidance and biomechanical cue
 */
export const DAILY_CHALLENGES = [
  {
    id: 'daily-squat-10',
    exerciseId: 'squat',
    name: '10 Controlled Squats',
    target: 10,
    type: 'reps',
    rewardXp: 100,
    description: 'Keep your full body in frame and break parallel with clean 100° knee depth.',
    metricCue: 'Depth angle verified (≤ 100°)',
  },
  {
    id: 'daily-jacks-20',
    exerciseId: 'jumping-jacks',
    name: '20 Jumping Jacks',
    target: 20,
    type: 'reps',
    rewardXp: 100,
    description: 'Coordinate wide bilateral arm abduction and synchronized foot spread.',
    metricCue: 'Arm & ankle spread cadence tracked',
  },
  {
    id: 'daily-curls-12',
    exerciseId: 'bicep-curl',
    name: '12 Bicep Curls',
    target: 12,
    type: 'reps',
    rewardXp: 100,
    description: 'Pin your elbows firmly to your sides and hit full peak contraction.',
    metricCue: 'Elbow flexion & pinned form verified',
  },
  {
    id: 'daily-wallsit-30',
    exerciseId: 'wall-sit',
    name: '30 s Wall Sit',
    target: 30,
    type: 'hold',
    rewardXp: 100,
    description: 'Hold a strict 90° thigh-parallel posture with your back flat against the wall.',
    metricCue: '90° knee hold angle tracked',
  },
  {
    id: 'daily-buttkicks-20',
    exerciseId: 'butt-kicks',
    name: '20 Butt Kicks',
    target: 20,
    type: 'reps',
    rewardXp: 100,
    description: 'Drive your heels dynamically up toward your glutes with high tempo.',
    metricCue: 'Knee flexion angle validated',
  },
  {
    id: 'daily-lunges-10',
    exerciseId: 'lunge',
    name: '10 Forward Lunges',
    target: 10,
    type: 'reps',
    rewardXp: 100,
    description: 'Step into a deep, stable lunge with an upright torso and clean knee clearance.',
    metricCue: 'Staggered stance & depth validated',
  },
  {
    id: 'daily-squat-15',
    exerciseId: 'squat',
    name: '15 Power Squats',
    target: 15,
    type: 'reps',
    rewardXp: 100,
    description: 'Maintain steady rhythm while executing 15 full-depth bodyweight squats.',
    metricCue: '15 verified parallel depth reps',
  },
  {
    id: 'daily-wallsit-45',
    exerciseId: 'wall-sit',
    name: '45 s Wall Sit Endurance',
    target: 45,
    type: 'hold',
    rewardXp: 100,
    description: 'Test your isometric endurance with an extended 45-second wall hold.',
    metricCue: 'Sustained 90° quad isometric tension',
  },
  {
    id: 'daily-jacks-30',
    exerciseId: 'jumping-jacks',
    name: '30 Jumping Jacks Burnout',
    target: 30,
    type: 'reps',
    rewardXp: 100,
    description: 'High tempo cardio workout tracking full arm reach and wide landing.',
    metricCue: 'High cadence full-range jumping jacks',
  },
];

