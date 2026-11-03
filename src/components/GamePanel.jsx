import React from 'react';
import { Flame, Star, Zap, Dumbbell, Rocket, Shield, Trophy } from 'lucide-react';
import { GAME_CONFIG } from '../config/gameConfig';
import { usePlayer } from '../context/PlayerContext';
import { AVATARS } from '../config/player';

const AVATAR_ICONS = {
  dumbbell: Dumbbell,
  flame: Flame,
  zap: Zap,
  rocket: Rocket,
  shield: Shield,
  trophy: Trophy
};

import EnergyBar from './EnergyBar';
import { loadPowerState, POWERS } from '../config/powers';

export default function GamePanel({
  xp = 0,
  level = 1,
  streak = 0,
  energyPercent = 0,
  combo = 1,
  selectedExerciseId = 'squat',
}) {
  const { player } = usePlayer();
  const xpPerLevel = GAME_CONFIG.xpPerLevel || 100;
  const currentLevelXp = xp % xpPerLevel;
  const xpPercentage = Math.min(100, Math.round((currentLevelXp / xpPerLevel) * 100));

  const currentAvatar = AVATARS.find(a => a.id === player?.avatarId) || AVATARS[0];
  const AvatarIcon = AVATAR_ICONS[currentAvatar.icon] || Flame;

  // Check if power boost is ready
  const powerState = loadPowerState();
  const isPowerReady = Boolean(powerState?.powerReady?.[selectedExerciseId]);
  const activePowerDef = POWERS[selectedExerciseId] || POWERS.squat;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111424]/85 backdrop-blur-md p-5 shadow-lg transition-all hover:border-[#ff5a36]/30 space-y-4">
      {/* Header with Player Chip */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#ff5a36]/15 border border-[#ff5a36]/30 flex items-center justify-center text-[#ff5a36]">
            <Zap className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Game Progress
          </span>
        </div>

        {/* Playing as <nickname> with avatar */}
        {player?.nickname && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
            <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${currentAvatar.gradient} flex items-center justify-center text-white`}>
              <AvatarIcon className="w-2.5 h-2.5" />
            </div>
            <span className="text-[11px] font-semibold text-white/90 truncate max-w-[100px]">
              {player.nickname}
            </span>
          </div>
        )}
      </div>

      {/* Power Ready Chip if Superpower Armed */}
      {isPowerReady && (
        <div className="p-2 rounded-xl bg-gradient-to-r from-amber-500/15 via-[#ff5a36]/15 to-transparent border border-amber-400/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-bold text-amber-300">
              Power ready: <span className="text-white font-normal">x1.5 XP next workout</span>
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-400 text-black">
            ARMED
          </span>
        </div>
      )}

      {/* 3 Stat Tiles in a row: STREAK, XP, LEVEL */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Streak Tile */}
        <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
            <Flame className="w-3.5 h-3.5 text-[#ff5a36]" />
            Streak
          </div>
          <span className="text-lg sm:text-xl font-extrabold text-white">{streak} d</span>
        </div>

        {/* XP Tile */}
        <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
            <Zap className="w-3.5 h-3.5 text-[#ff5a36]" />
            Total XP
          </div>
          <span className="text-lg sm:text-xl font-extrabold text-[#ff5a36]">{xp}</span>
        </div>

        {/* Level Tile */}
        <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
            Level
          </div>
          <span className="text-lg sm:text-xl font-extrabold text-white"># {level}</span>
        </div>
      </div>

      {/* Level XP Progress Bar */}
      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
          <span>Level {level} Progress</span>
          <span className="text-slate-300 font-semibold">{currentLevelXp} / {xpPerLevel} XP</span>
        </div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
          <div
            className="h-full rounded-full bg-[#ff5a36] transition-all duration-500 shadow-sm shadow-[#ff5a36]/30"
            style={{ width: `${xpPercentage}%` }}
          />
        </div>
      </div>

      {/* AI Power Mode Large Energy Bar */}
      <EnergyBar energyPercent={energyPercent} combo={combo} />
    </div>
  );
}

