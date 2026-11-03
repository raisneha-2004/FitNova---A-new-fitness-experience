import {
  Dumbbell,
  Flame,
  Zap,
  Rocket,
  Shield,
  Trophy,
} from 'lucide-react';

/**
 * 6 Original Player Avatars with vibrant gradient backdrops and Lucide icons
 */
export const AVATARS = [
  {
    id: 'dumbbell',
    name: 'Iron Lifter',
    icon: Dumbbell,
    gradient: 'from-amber-500 to-[#ff5a36]',
    border: 'border-[#ff5a36]/50',
    bg: 'bg-[#ff5a36]/15',
    color: 'text-[#ff5a36]',
  },
  {
    id: 'flame',
    name: 'Blaze Striker',
    icon: Flame,
    gradient: 'from-[#ff5a36] to-rose-600',
    border: 'border-rose-500/50',
    bg: 'bg-rose-500/15',
    color: 'text-rose-400',
  },
  {
    id: 'zap',
    name: 'Volt Rusher',
    icon: Zap,
    gradient: 'from-yellow-400 to-amber-500',
    border: 'border-yellow-400/50',
    bg: 'bg-yellow-400/15',
    color: 'text-yellow-400',
  },
  {
    id: 'rocket',
    name: 'Aero Vanguard',
    icon: Rocket,
    gradient: 'from-cyan-400 to-blue-600',
    border: 'border-cyan-400/50',
    bg: 'bg-cyan-400/15',
    color: 'text-cyan-400',
  },
  {
    id: 'shield',
    name: 'Aegis Guardian',
    icon: Shield,
    gradient: 'from-emerald-400 to-teal-600',
    border: 'border-emerald-400/50',
    bg: 'bg-emerald-400/15',
    color: 'text-emerald-400',
  },
  {
    id: 'trophy',
    name: 'Arena Champion',
    icon: Trophy,
    gradient: 'from-amber-400 to-yellow-600',
    border: 'border-amber-400/50',
    bg: 'bg-amber-400/15',
    color: 'text-amber-400',
  },
];

export function getAvatarById(avatarId) {
  return AVATARS.find((a) => a.id === avatarId) || AVATARS[0];
}

/**
 * Word lists for the "Random name" dice generator (e.g. "SwiftTiger42")
 */
export const NAME_ADJECTIVES = [
  'Swift',
  'Iron',
  'Hyper',
  'Cyber',
  'Nova',
  'Apex',
  'Brave',
  'Flash',
  'Mighty',
  'Shadow',
  'Blaze',
  'Sonic',
  'Titan',
  'Turbo',
  'Vortex',
];

export const NAME_NOUNS = [
  'Tiger',
  'Phoenix',
  'Falcon',
  'Wolf',
  'Viper',
  'Hawk',
  'Panther',
  'Dragon',
  'Ranger',
  'Knight',
  'Runner',
  'Prowler',
  'Storm',
  'Beast',
  'Cobra',
];

/**
 * Generates a random friendly nickname
 */
export function generateRandomNickname() {
  const adj = NAME_ADJECTIVES[Math.floor(Math.random() * NAME_ADJECTIVES.length)];
  const noun = NAME_NOUNS[Math.floor(Math.random() * NAME_NOUNS.length)];
  const num = Math.floor(Math.random() * 90) + 10; // 10-99
  return `${adj}${noun}${num}`;
}

export const getRandomNickname = generateRandomNickname;

/**
 * Validates nickname:
 * 2 to 16 characters, letters, numbers, spaces and underscores only
 */
export function validateNickname(nickname) {
  if (!nickname || typeof nickname !== 'string') {
    return { isValid: false, message: 'Nickname is required', error: 'Nickname is required' };
  }
  const trimmed = nickname.trim();
  if (trimmed.length < 2) {
    return { isValid: false, message: 'Must be at least 2 characters', error: 'Must be at least 2 characters' };
  }
  if (trimmed.length > 16) {
    return { isValid: false, message: 'Must be 16 characters or less', error: 'Must be 16 characters or less' };
  }
  const regex = /^[a-zA-Z0-9_ ]+$/;
  if (!regex.test(nickname)) {
    return { isValid: false, message: 'Letters, numbers, spaces & underscores only', error: 'Letters, numbers, spaces & underscores only' };
  }
  return { isValid: true, message: '', error: '' };
}

