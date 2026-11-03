import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices, Sparkles, X, Check, Dumbbell, Flame, Zap, Rocket, Shield, Trophy, Globe, Trash2 } from 'lucide-react';
import { AVATARS, getRandomNickname, validateNickname } from '../config/player';
import { usePlayer } from '../context/PlayerContext';
import { getLeaderboardOptIn, setLeaderboardOptIn, deleteMyLeaderboardApi } from '../services/api';

const AVATAR_ICONS = {
  dumbbell: Dumbbell,
  flame: Flame,
  zap: Zap,
  rocket: Rocket,
  shield: Shield,
  trophy: Trophy
};

export default function PlayerProfileModal({ isOpen, onClose, onSuccess, initialStep = 'setup' }) {
  const { player, saveProfile, isStorageAvailable } = usePlayer();
  const [nickname, setNickname] = useState('');
  const [avatarId, setAvatarId] = useState('flame');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const [optInLeaderboard, setOptInLeaderboard] = useState(getLeaderboardOptIn);
  const [removeStatus, setRemoveStatus] = useState('');

  useEffect(() => {
    if (isOpen) {
      setOptInLeaderboard(getLeaderboardOptIn());
      setRemoveStatus('');
      if (player && player.nickname) {
        setNickname(player.nickname);
        setAvatarId(player.avatarId || 'flame');
      } else {
        setNickname(getRandomNickname());
        setAvatarId('flame');
      }
      setError('');
      setTouched(false);
    }
  }, [isOpen, player]);

  const handleNicknameChange = (e) => {
    const val = e.target.value;
    setNickname(val);
    setTouched(true);
    const validation = validateNickname(val);
    setError(validation.isValid ? '' : validation.error);
  };

  const handleRandomize = () => {
    const random = getRandomNickname();
    setNickname(random);
    setTouched(true);
    setError('');
  };

  const handleToggleOptIn = (e) => {
    const val = e.target.checked;
    setOptInLeaderboard(val);
    setLeaderboardOptIn(val);
  };

  const handleRemoveFromLeaderboard = async () => {
    if (!player?.id) return;
    try {
      setRemoveStatus('Removing...');
      const res = await deleteMyLeaderboardApi(player.id);
      if (res.data) {
        setRemoveStatus('Removed from leaderboard.');
        setOptInLeaderboard(false);
        setLeaderboardOptIn(false);
        window.dispatchEvent(new CustomEvent('fq_leaderboard_updated'));
      } else {
        setRemoveStatus(res.error || 'Failed to remove entry');
      }
    } catch (err) {
      setRemoveStatus(err.message || 'Error removing entry');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateNickname(nickname);
    if (!validation.isValid) {
      setError(validation.error);
      setTouched(true);
      return;
    }

    const saved = saveProfile({
      nickname: nickname.trim(),
      avatarId
    });

    if (onSuccess) {
      onSuccess(saved);
    }
    if (onClose) {
      onClose();
    }
  };

  const validation = validateNickname(nickname);
  const isValid = validation.isValid;
  const currentAvatar = AVATARS.find(a => a.id === avatarId) || AVATARS[0];
  const CurrentIcon = AVATAR_ICONS[currentAvatar.icon] || Flame;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        onKeyDown={(e) => { if (e.key === 'Escape' && onClose) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg rounded-2xl bg-[#0e1222] border border-white/10 shadow-2xl p-6 sm:p-8 text-white overflow-hidden"
        >
          {/* Subtle glowing accent */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#ff5a36]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close button if modal is dismissible */}
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-lg hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff5a36]"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Header */}
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#ff5a36]/15 text-[#ff5a36] border border-[#ff5a36]/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              {player?.nickname ? 'Update Hero Identity' : 'Guest Player Profile'}
            </span>
            <h2 id="profile-modal-title" className="text-2xl font-bold tracking-tight">
              {player?.nickname ? 'Customize Your Athlete' : 'Choose Your Arena Persona'}
            </h2>
            <p className="text-sm text-white/60 mt-1">
              No account required. Jump straight into the action with your custom callsign.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Live Preview Card */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${currentAvatar.gradient} flex items-center justify-center shadow-lg border border-white/20 text-white shrink-0`}>
                <CurrentIcon className="w-7 h-7" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-white/50 uppercase tracking-wider font-semibold">Live Preview</div>
                <div className="text-lg font-bold truncate text-white">
                  {nickname.trim() || 'Arena Challenger'}
                </div>
                <div className="text-xs text-[#ff5a36] flex items-center gap-1">
                  <span>Guest Champion</span> &bull; <span>Ready to Train</span>
                </div>
              </div>
            </div>

            {/* Nickname Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="player-nickname" className="text-xs font-semibold uppercase tracking-wider text-white/70">
                  Player Nickname
                </label>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${nickname.length > 16 || (nickname.length < 2 && touched) ? 'text-red-400' : 'text-white/40'}`}>
                    {nickname.length}/16
                  </span>
                  <button
                    type="button"
                    onClick={handleRandomize}
                    className="inline-flex items-center gap-1 text-xs text-[#ff5a36] hover:text-[#ff7455] font-medium transition-colors focus:outline-none focus:underline"
                    aria-label="Generate random nickname"
                  >
                    <Dices className="w-3.5 h-3.5" />
                    Randomize
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  id="player-nickname"
                  type="text"
                  value={nickname}
                  onChange={handleNicknameChange}
                  maxLength={16}
                  placeholder="e.g. SwiftTiger42"
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${error && touched ? 'border-red-500/70 focus:border-red-500' : 'border-white/10 focus:border-[#ff5a36]'} text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5a36]/40 transition-colors`}
                  autoFocus
                />
              </div>

              {error && touched && (
                <p className="mt-1.5 text-xs text-red-400 font-medium">
                  {error}
                </p>
              )}
            </div>

            {/* Avatar Picker */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                Select Badge Avatar
              </label>
              <div className="grid grid-cols-6 gap-2.5">
                {AVATARS.map((av) => {
                  const IconComp = AVATAR_ICONS[av.icon] || Flame;
                  const isSelected = av.id === avatarId;
                  return (
                    <motion.button
                      key={av.id}
                      type="button"
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setAvatarId(av.id)}
                      aria-label={`Select ${av.name} avatar`}
                      aria-pressed={isSelected}
                      className={`relative aspect-square rounded-xl flex items-center justify-center p-2.5 transition-all ${
                        isSelected
                          ? 'ring-2 ring-[#ff5a36] ring-offset-2 ring-offset-[#0b0d17] shadow-lg shadow-[#ff5a36]/30'
                          : 'opacity-70 hover:opacity-100 border border-white/5'
                      } bg-gradient-to-br ${av.gradient}`}
                    >
                      <IconComp className="w-5 h-5 text-white" />
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff5a36] flex items-center justify-center text-white text-[10px]">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Leaderboard Opt-In & Privacy */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={optInLeaderboard}
                  onChange={handleToggleOptIn}
                  className="mt-1 w-4 h-4 rounded text-[#ff5a36] focus:ring-[#ff5a36] bg-black/40 border-white/20 cursor-pointer"
                />
                <div className="flex-1 text-xs">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#ff5a36]" />
                    <span>Show me on the public leaderboard</span>
                  </div>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    Only your guest nickname, avatar, XP, and streak are publicly displayed. No camera frames, email, or real identity are ever shared.
                  </p>
                </div>
              </label>

              {player?.id && (
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleRemoveFromLeaderboard}
                    className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove me from leaderboard</span>
                  </button>
                  {removeStatus && (
                    <span className="text-[10px] text-slate-300 italic">{removeStatus}</span>
                  )}
                </div>
              )}
            </div>

            {!isStorageAvailable && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-center">
                Local storage unavailable. Session progress will be retained in memory until page reload.
              </div>
            )}

            {/* Action Button */}
            <button
              type="submit"
              disabled={!isValid}
              className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 ${
                isValid
                  ? 'bg-gradient-to-r from-[#ff5a36] to-[#ff7455] text-white hover:brightness-110 shadow-[#ff5a36]/25 cursor-pointer active:scale-[0.99]'
                  : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/5'
              }`}
            >
              <span>{player?.nickname ? 'Save Changes' : 'Enter the Arena'}</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
