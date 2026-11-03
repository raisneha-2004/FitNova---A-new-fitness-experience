import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Crown, Flame, ArrowRight, Trophy, Sparkles, Play, RefreshCw, Dumbbell, Zap, Rocket, Shield } from 'lucide-react';
import { getLeaderboardApi, getMyLeaderboardRankApi } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import { getAvatarById } from '../config/player';

const AVATAR_ICON_MAP = {
  dumbbell: Dumbbell,
  flame: Flame,
  zap: Zap,
  rocket: Rocket,
  shield: Shield,
  trophy: Trophy,
};

/**
 * Renders a player's avatar icon with gradient background
 */
function PlayerAvatar({ avatarId, className = 'w-10 h-10', iconSize = 'w-5 h-5' }) {
  const av = getAvatarById(avatarId);
  const IconComponent = AVATAR_ICON_MAP[av?.id] || Flame;
  const gradient = av?.gradient || 'from-[#ff5a36] to-amber-500';

  return (
    <div
      className={`${className} rounded-full flex items-center justify-center shrink-0 bg-gradient-to-tr ${gradient} text-white shadow-md`}
    >
      <IconComponent className={iconSize} />
    </div>
  );
}

/**
 * Calculates human-readable relative time ("just now", "1m ago", etc.)
 */
function getRelativeTimeString(date) {
  if (!date) return 'Updated just now';
  const diffSec = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diffSec < 15) return 'Updated just now';
  if (diffSec < 60) return `Updated ${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Updated ${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  return `Updated ${diffHr}h ago`;
}

/**
 * TopPlayersCard Component
 * Displays real verified players for today's leaderboard.
 * Zero demo data or fake athletes.
 */
export default function TopPlayersCard() {
  const { player } = usePlayer();
  const shouldReduceMotion = useReducedMotion();

  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [myRankInfo, setMyRankInfo] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [relativeTime, setRelativeTime] = useState('Updated just now');
  const [isOffline, setIsOffline] = useState(false);

  const isMountedRef = useRef(true);

  // Fetch real leaderboard entries
  const fetchBoard = useCallback(async () => {
    try {
      const res = await getLeaderboardApi({ range: 'today', limit: 5 });
      if (!isMountedRef.current) return;

      if (res.isOffline) {
        setIsOffline(true);
      } else {
        setIsOffline(false);
        const list = res.data?.entries || [];
        setEntries(list);
        setTotalPlayers(res.data?.totalPlayers || list.length);
        const now = new Date();
        setLastUpdated(now);
        setRelativeTime('Updated just now');
      }

      // If player has a guest ID, fetch their personal rank
      if (player?.id) {
        const myRes = await getMyLeaderboardRankApi(player.id);
        if (isMountedRef.current) {
          if (myRes.data && myRes.data.isRanked) {
            setMyRankInfo(myRes.data);
          } else {
            setMyRankInfo(null);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to fetch leaderboard:', err);
      if (isMountedRef.current) setIsOffline(true);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [player?.id]);

  // Initial fetch and 60-second polling while tab is visible
  useEffect(() => {
    isMountedRef.current = true;
    fetchBoard();

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        fetchBoard();
      }
    }, 60000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchBoard();
      }
    };

    const handleLeaderboardUpdate = () => {
      fetchBoard();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('fq_leaderboard_updated', handleLeaderboardUpdate);
    window.addEventListener('fq_sessions_updated', handleLeaderboardUpdate);

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('fq_leaderboard_updated', handleLeaderboardUpdate);
      window.removeEventListener('fq_sessions_updated', handleLeaderboardUpdate);
    };
  }, [fetchBoard]);

  // Update relative time string every 10 seconds
  useEffect(() => {
    const timeInterval = setInterval(() => {
      if (lastUpdated) {
        setRelativeTime(getRelativeTimeString(lastUpdated));
      }
    }, 10000);

    return () => clearInterval(timeInterval);
  }, [lastUpdated]);

  // Podium order: 2nd place (left), 1st place (center), 3rd place (right)
  const topThree = entries.slice(0, 3);
  const remainingRows = entries.slice(3, 5);

  let podiumList = [];
  if (topThree.length === 1) {
    podiumList = [null, topThree[0], null];
  } else if (topThree.length === 2) {
    podiumList = [topThree[1], topThree[0], null];
  } else if (topThree.length >= 3) {
    podiumList = [topThree[1], topThree[0], topThree[2]];
  }

  // Check if current player is in the displayed top 5 entries
  const playerInTop5 = entries.some(
    (e) => myRankInfo?.entry && e.displayName === myRankInfo.entry.displayName
  );

  return (
    <motion.div
      whileHover={shouldReduceMotion ? {} : { y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="rounded-3xl p-6 sm:p-8 bg-white/[0.04] border border-white/10 shadow-xl backdrop-blur-xl flex flex-col justify-between h-full relative overflow-hidden"
    >
      <div>
        {/* Header Row: Title & Real Relative Time Status */}
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#ff5a36]/15 border border-[#ff5a36]/30 flex items-center justify-center text-[#ff5a36]">
              <Trophy className="w-4 h-4" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Top Players Today
            </h3>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{relativeTime}</span>
          </div>
        </div>

        {/* Loading State Skeletons */}
        {loading && entries.length === 0 && (
          <div className="py-8 space-y-4 animate-pulse">
            <div className="h-32 rounded-2xl bg-white/5" />
            <div className="h-10 rounded-xl bg-white/5" />
            <div className="h-10 rounded-xl bg-white/5" />
          </div>
        )}

        {/* Empty State: No players yet */}
        {!loading && entries.length === 0 && (
          <div className="py-8 px-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center my-4">
            <div className="w-14 h-14 rounded-2xl bg-[#ff5a36]/15 border border-[#ff5a36]/30 flex items-center justify-center text-[#ff5a36] mb-3">
              <Sparkles className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">
              No players yet
            </h4>
            <p className="text-xs text-slate-400 max-w-xs mb-5">
              Be the first on today's board! Start a workout in the arena to set the pace.
            </p>
            <Link
              to="/live-arena"
              className="px-5 py-2.5 rounded-xl bg-[#ff5a36] hover:bg-[#ff7455] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-[#ff5a36]/25 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Enter Arena</span>
            </Link>
          </div>
        )}

        {/* Real Top 3 Podium */}
        {!loading && entries.length > 0 && (
          <>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 items-end pt-3 pb-5 border-b border-white/10 mb-5">
              {podiumList.map((entrant, idx) => {
                if (!entrant) {
                  return (
                    <div
                      key={`empty-podium-${idx}`}
                      className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/[0.01] border border-dashed border-white/5 pb-4"
                    >
                      <div className="w-10 h-10 rounded-full border border-dashed border-white/10 flex items-center justify-center text-slate-600 text-xs font-bold mb-2">
                        -
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">Open</span>
                    </div>
                  );
                }

                const isFirst = entrant.rank === 1;
                const isYou = myRankInfo?.entry && entrant.displayName === myRankInfo.entry.displayName;

                return (
                  <div
                    key={entrant.displayName || entrant.rank}
                    className={`flex flex-col items-center text-center p-2.5 sm:p-3 rounded-2xl relative transition-all ${
                      isFirst
                        ? 'bg-[#ff5a36]/10 border border-[#ff5a36]/40 shadow-lg shadow-[#ff5a36]/15 pb-4'
                        : isYou
                        ? 'bg-[#ff5a36]/15 border border-[#ff5a36]/50 pb-3'
                        : 'bg-white/[0.02] border border-white/5 pb-3'
                    }`}
                  >
                    {/* Crown or Rank Indicator */}
                    {isFirst ? (
                      <motion.div
                        animate={shouldReduceMotion ? {} : { y: [0, -3, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="mb-1 text-yellow-400"
                      >
                        <Crown className="w-5 h-5 fill-yellow-400" />
                      </motion.div>
                    ) : (
                      <div className="w-4 h-4 mb-1 text-slate-500 font-bold text-[11px]">
                        #{entrant.rank}
                      </div>
                    )}

                    {/* Real Avatar */}
                    <PlayerAvatar
                      avatarId={entrant.avatarId}
                      className={isFirst ? 'w-12 h-12 ring-2 ring-[#ff5a36]' : 'w-10 h-10'}
                      iconSize={isFirst ? 'w-6 h-6' : 'w-5 h-5'}
                    />

                    {/* Nickname#Tag */}
                    <div className="text-xs font-bold text-white truncate max-w-[85px] sm:max-w-[100px] mt-1.5">
                      {entrant.displayName}
                    </div>

                    {isYou && (
                      <span className="text-[9px] font-black uppercase text-[#ff5a36] bg-[#ff5a36]/20 px-1.5 py-0.2 rounded mt-0.5">
                        You
                      </span>
                    )}

                    {/* XP Score */}
                    <div className="text-xs font-black text-[#ff5a36] mt-0.5">
                      {entrant.xpToday ?? entrant.xp} XP
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Compact List for Ranks 4 and 5 */}
            {remainingRows.length > 0 && (
              <div className="space-y-2 mb-4">
                {remainingRows.map((entrant) => {
                  const isYou = myRankInfo?.entry && entrant.displayName === myRankInfo.entry.displayName;

                  return (
                    <div
                      key={entrant.displayName || entrant.rank}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                        isYou
                          ? 'bg-[#ff5a36]/15 border-[#ff5a36]/40 font-semibold'
                          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-xs font-bold text-slate-500 w-4 text-center shrink-0">
                          #{entrant.rank}
                        </span>
                        <PlayerAvatar
                          avatarId={entrant.avatarId}
                          className="w-7 h-7"
                          iconSize="w-3.5 h-3.5"
                        />
                        <div className="truncate text-xs sm:text-sm font-medium text-slate-200">
                          <span>{entrant.displayName}</span>
                          {isYou && (
                            <span className="ml-1.5 text-[10px] font-bold text-[#ff5a36] bg-[#ff5a36]/20 px-1 py-0.2 rounded">
                              You
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                          <Flame className="w-3 h-3 fill-amber-400" />
                          {entrant.streak}d
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-white">
                          {entrant.xpToday ?? entrant.xp} XP
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Current Player's Row Highlighted if Outside Top 5 */}
            {myRankInfo && myRankInfo.rankToday > 5 && !playerInTop5 && (
              <div className="mb-4 pt-2 border-t border-dashed border-white/10">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#ff5a36]/15 border border-[#ff5a36]/40 font-semibold">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono text-xs font-bold text-[#ff5a36] w-6 text-center shrink-0">
                      #{myRankInfo.rankToday}
                    </span>
                    <PlayerAvatar
                      avatarId={myRankInfo.entry.avatarId}
                      className="w-7 h-7"
                      iconSize="w-3.5 h-3.5"
                    />
                    <div className="truncate text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{myRankInfo.entry.displayName}</span>
                      <span className="text-[10px] uppercase text-[#ff5a36] bg-[#ff5a36]/20 px-1.5 py-0.2 rounded">
                        You
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                      <Flame className="w-3 h-3 fill-amber-400" />
                      {myRankInfo.entry.streak}d
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#ff5a36]">
                      {myRankInfo.entry.xpToday} XP
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Link to /leaderboard */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-auto">
        <span className="text-xs text-slate-400">
          {totalPlayers > 0 ? `${totalPlayers} athlete${totalPlayers === 1 ? '' : 's'} recorded` : 'Live arena rankings'}
        </span>
        <Link
          to="/leaderboard"
          className="group inline-flex items-center gap-1.5 text-sm font-bold text-[#ff5a36] hover:text-[#ff7a52] transition-colors focus:outline-none"
        >
          <span>View full leaderboard</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </motion.div>
  );
}
