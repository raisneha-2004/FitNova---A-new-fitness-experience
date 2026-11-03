import { Flame, Zap, Shield, Activity, Wind } from 'lucide-react';

export const POWERS_STORAGE_KEY = 'fq_powers';

/**
 * Superpower definitions (one per exercise)
 */
export const POWERS = {
  squat: {
    id: 'fire-legs',
    name: 'Fire Legs',
    exerciseId: 'squat',
    exerciseName: 'Bodyweight Squat',
    tagline: 'Inferno Quad Drive',
    description: 'Blaze through squats with unyielding lower-body torque. Next squat session earns 1.5x XP!',
    icon: Flame,
    color: 'from-[#ff5a36] to-red-600',
    borderColor: 'border-[#ff5a36]/50',
    glowColor: 'rgba(255, 90, 54, 0.4)',
  },
  'jumping-jacks': {
    id: 'lightning-boost',
    name: 'Lightning Boost',
    exerciseId: 'jumping-jacks',
    exerciseName: 'Jumping Jacks',
    tagline: 'Thunderous Aerobic Tempo',
    description: 'Electric conditioning pulse across all muscle fibers. Next workout earns 1.5x XP!',
    icon: Zap,
    color: 'from-amber-400 to-yellow-500',
    borderColor: 'border-amber-400/50',
    glowColor: 'rgba(251, 191, 36, 0.4)',
  },
  'bicep-curl': {
    id: 'iron-arms',
    name: 'Iron Arms',
    exerciseId: 'bicep-curl',
    exerciseName: 'Bicep Curl',
    tagline: 'Titanium Flex Control',
    description: 'Pinpoint mechanical advantage with rock-solid peak contraction. Next workout earns 1.5x XP!',
    icon: Shield,
    color: 'from-cyan-400 to-blue-600',
    borderColor: 'border-cyan-400/50',
    glowColor: 'rgba(56, 189, 248, 0.4)',
  },
  'high-knees': {
    id: 'speed-surge',
    name: 'Speed Surge',
    exerciseId: 'high-knees',
    exerciseName: 'High Knees',
    tagline: 'Kinetic Cadence Overdrive',
    description: 'Explosive hip flexor cadence breaking through limits. Next workout earns 1.5x XP!',
    icon: Wind,
    color: 'from-emerald-400 to-teal-500',
    borderColor: 'border-emerald-400/50',
    glowColor: 'rgba(52, 211, 153, 0.4)',
  },
  plank: {
    id: 'steel-core',
    name: 'Steel Core',
    exerciseId: 'plank',
    exerciseName: 'Isometric Plank',
    tagline: 'Indestructible Midsection',
    description: 'Unyielding isometric brace resisting every drop of fatigue. Next workout earns 1.5x XP!',
    icon: Activity,
    color: 'from-purple-500 to-indigo-600',
    borderColor: 'border-purple-500/50',
    glowColor: 'rgba(168, 85, 247, 0.4)',
  },
  'wall-sit': {
    id: 'stone-guard',
    name: 'Stone Guard',
    exerciseId: 'wall-sit',
    exerciseName: 'Wall Sit',
    tagline: 'Unyielding Fortress Stance',
    description: 'Lock into parallel thigh resilience that never wavers. Next workout earns 1.5x XP!',
    icon: Shield,
    color: 'from-emerald-500 to-teal-700',
    borderColor: 'border-emerald-500/50',
    glowColor: 'rgba(16, 185, 129, 0.4)',
  },
  'butt-kicks': {
    id: 'rocket-heels',
    name: 'Rocket Heels',
    exerciseId: 'butt-kicks',
    exerciseName: 'Butt Kicks',
    tagline: 'Supersonic Glute Cadence',
    description: 'Explosive heel-to-glute velocity powering rhythmic stride burn. Next workout earns 1.5x XP!',
    icon: Zap,
    color: 'from-orange-400 to-amber-600',
    borderColor: 'border-orange-400/50',
    glowColor: 'rgba(251, 146, 60, 0.4)',
  },
  lunge: {
    id: 'titan-stride',
    name: 'Titan Stride',
    exerciseId: 'lunge',
    exerciseName: 'Forward Lunge',
    tagline: 'Colossal Unilateral Power',
    description: 'Command deep staggered drop lunges with unbreakable stability. Next workout earns 1.5x XP!',
    icon: Flame,
    color: 'from-rose-500 to-red-700',
    borderColor: 'border-rose-500/50',
    glowColor: 'rgba(244, 63, 94, 0.4)',
  },
};

/**
 * Challenge Ladder Tiers
 * 3 tiers per exercise: Rookie, Pro, Elite
 */
export const CHALLENGE_TIERS = {
  squat: [
    { tier: 1, name: 'Rookie', target: 10, label: '10 Reps' },
    { tier: 2, name: 'Pro', target: 15, label: '15 Reps' },
    { tier: 3, name: 'Elite', target: 20, label: '20 Reps' },
  ],
  'jumping-jacks': [
    { tier: 1, name: 'Rookie', target: 15, label: '15 Reps' },
    { tier: 2, name: 'Pro', target: 25, label: '25 Reps' },
    { tier: 3, name: 'Elite', target: 40, label: '40 Reps' },
  ],
  'bicep-curl': [
    { tier: 1, name: 'Rookie', target: 8, label: '8 Reps' },
    { tier: 2, name: 'Pro', target: 14, label: '14 Reps' },
    { tier: 3, name: 'Elite', target: 20, label: '20 Reps' },
  ],
  'high-knees': [
    { tier: 1, name: 'Rookie', target: 20, label: '20 Reps' },
    { tier: 2, name: 'Pro', target: 35, label: '35 Reps' },
    { tier: 3, name: 'Elite', target: 50, label: '50 Reps' },
  ],
  plank: [
    { tier: 1, name: 'Rookie', target: 15, label: '15s Hold' },
    { tier: 2, name: 'Pro', target: 30, label: '30s Hold' },
    { tier: 3, name: 'Elite', target: 45, label: '45s Hold' },
  ],
  'wall-sit': [
    { tier: 1, name: 'Rookie', target: 15, label: '15s Hold' },
    { tier: 2, name: 'Pro', target: 30, label: '30s Hold' },
    { tier: 3, name: 'Elite', target: 45, label: '45s Hold' },
  ],
  'butt-kicks': [
    { tier: 1, name: 'Rookie', target: 20, label: '20 Reps' },
    { tier: 2, name: 'Pro', target: 30, label: '30 Reps' },
    { tier: 3, name: 'Elite', target: 40, label: '40 Reps' },
  ],
  lunge: [
    { tier: 1, name: 'Rookie', target: 6, label: '6 Reps' },
    { tier: 2, name: 'Pro', target: 10, label: '10 Reps' },
    { tier: 3, name: 'Elite', target: 14, label: '14 Reps' },
  ],
};

const DEFAULT_UNLOCKED_TIERS = {
  squat: 1,
  'jumping-jacks': 1,
  'bicep-curl': 1,
  'high-knees': 1,
  plank: 1,
  'wall-sit': 1,
  'butt-kicks': 1,
  lunge: 1,
};

/**
 * Storage helpers for Powers & Challenge Ladders
 * Format: { unlockedTiers: { [exerciseId]: number }, powerReady: { [exerciseId]: boolean } }
 */
export function loadPowerState() {
  try {
    const raw = localStorage.getItem(POWERS_STORAGE_KEY);
    if (!raw) {
      return {
        unlockedTiers: { ...DEFAULT_UNLOCKED_TIERS },
        powerReady: {},
      };
    }
    const parsed = JSON.parse(raw);
    return {
      unlockedTiers: {
        ...DEFAULT_UNLOCKED_TIERS,
        ...(parsed.unlockedTiers || {}),
      },
      powerReady: parsed.powerReady || {},
    };
  } catch (err) {
    console.warn('Failed to load fq_powers:', err);
    return {
      unlockedTiers: { ...DEFAULT_UNLOCKED_TIERS },
      powerReady: {},
    };
  }
}

export function savePowerState(state) {
  try {
    localStorage.setItem(POWERS_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to save fq_powers:', err);
  }
}

/**
 * Marks power as unlocked and unlocks next challenge tier if target completed
 */
export function recordWorkoutPowerCompletion(exerciseId, targetCompleted) {
  const state = loadPowerState();
  let nextTierUnlocked = null;

  if (targetCompleted) {
    // 1. Arm 1.5x XP power ready for next session
    state.powerReady = {
      ...(state.powerReady || {}),
      [exerciseId]: true,
    };

    // 2. Advance challenge ladder tier (up to tier 3: Elite)
    const currentTier = state.unlockedTiers[exerciseId] || 1;
    if (currentTier < 3) {
      const nextTier = currentTier + 1;
      state.unlockedTiers[exerciseId] = nextTier;
      const tierDef = (CHALLENGE_TIERS[exerciseId] || []).find((t) => t.tier === nextTier);
      nextTierUnlocked = tierDef ? tierDef.name : `Tier ${nextTier}`;
    }

    savePowerState(state);
  }

  return { state, nextTierUnlocked };
}

/**
 * Consumes the power boost when starting a workout
 */
export function consumePowerBoost(exerciseId) {
  const state = loadPowerState();
  if (state.powerReady && state.powerReady[exerciseId]) {
    state.powerReady[exerciseId] = false;
    savePowerState(state);
    return true;
  }
  return false;
}
