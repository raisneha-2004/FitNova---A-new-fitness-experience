import React, { useState, useEffect, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Container from '../components/Container';
import PageHeader from '../components/PageHeader';
import {
  Flame,
  Trophy,
  Crown,
  Sparkles,
  Play,
  WifiOff,
  Filter,
  Dumbbell,
  Zap,
  Rocket,
  Shield,
  Clock,
} from 'lucide-react';
import { getLeaderboardApi, getMyLeaderboardRankApi } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import { getAvatarById } from '../config/player';
import { EXERCISES } from '../config/exercises';
import { loadRecentSessions, loadUserProgress } from '../utils/progressStorage';

const AVATAR_ICON_MAP = {
  dumbbell: Dumbbell,
  flame: Flame,
  zap: Zap,
  rocket: Rocket,
  shield: Shield,
  trophy: Trophy,
};

function PlayerAvatarBadge({ avatarId, className = 'w-14 h-14', iconSize = 'w-7 h-7' }) {
  const av = getAvatarById(avatarId);
  const IconComponent = AVATAR_ICON_MAP[av?.id] || Flame;
  const gradient = av?.gradient || 'from-[#ff5a36] to-amber-500';

  return (
    <div
      className={`${className} rounded-2xl flex items-center justify-center bg-gradient-to-tr ${gradient} text-white shadow-md shrink-0`}
    >
      <IconComponent className={iconSize} />
    </div>
  );
}

export default function Leaderboard() {
  const { player } = usePlayer();
  const shouldReduceMotion = useReducedMotion();

  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'week' | 'all'
  const [exerciseFilter, setExerciseFilter] = useState('all'); // 'all' or exerciseId
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [entries, setEntries] = useState([]);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [myRankData, setMyRankData] = useState(null);

  // Load real leaderboard data from backend
  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getLeaderboardApi({ range: activeTab, limit: 50 });
      if (res.isOffline) {
        setIsOffline(true);
      } else {
        setIsOffline(false);
        const list = res.data?.entries || [];
        setEntries(list);
        setTotalPlayers(res.data?.totalPlayers || list.length);
      }

      // Fetch personal rank if guest has an ID
      if (player?.id) {
        const myRes = await getMyLeaderboardRankApi(player.id);
        if (myRes.data && myRes.data.isRanked) {
          setMyRankData(myRes.data);
        } else {
          setMyRankData(null);
        }
      }
    } catch (err) {
      console.warn('Leaderboard fetch caught error:', err);
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  }, [activeTab, player?.id]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Construct local board fallback from player's fq_sessions when offline
  const localSessions = loadRecentSessions(20);
  const localProgress = loadUserProgress();
  const localBoardEntries = localSessions.map((s, idx) => ({
    rank: idx + 1,
    nickname: player?.nickname || 'You (Local)',
    nicknameTag: '0001',
    displayName: `${player?.nickname || 'Athlete'}#0001`,
    avatarId: player?.avatarId || 'dumbbell',
    xp: s.xpEarned || 0,
    streak: localProgress.streak || 1,
    level: localProgress.level || 1,
    exerciseName: s.exerciseName || s.exercise || 'Arena Session',
    isYou: true,
  }));

  // Effective entries to display: online list or offline local board
  const displayEntries = isOffline ? localBoardEntries : entries;

  // Top 3 for podium
  const topThree = displayEntries.slice(0, 3);
  const remainingRows = displayEntries.slice(3);

  // Podium visual order: [2nd (left), 1st (center), 3rd (right)]
  let podiumOrder = [];
  if (topThree.length === 1) {
    podiumOrder = [null, topThree[0], null];
  } else if (topThree.length === 2) {
    podiumOrder = [topThree[1], topThree[0], null];
  } else if (topThree.length >= 3) {
    podiumOrder = [topThree[1], topThree[0], topThree[2]];
  }

  // Check if caller's profile is in the top 3
  const isCallerInPodium = topThree.some(
    (e) => myRankData?.entry && e.displayName === myRankData.entry.displayName
  );

  return (
    <div className="pt-8 md:pt-12 pb-10 md:pb-14">
      <Container>
        <PageHeader
          title="Arena Leaderboard"
          subtitle="Real-time rankings of verified athletes competing in the live computer-vision arena."
          breadcrumb={[{ label: 'Leaderboard' }]}
        />

        {/* Offline Banner if Backend is Unreachable */}
        {isOffline && (
          <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <WifiOff className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Online leaderboard is offline</h4>
                <p className="text-xs text-slate-300">
                  Showing your verified local training records. Online sync resumes automatically when server reconnects.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Local Board Active
            </span>
          </div>
        )}

        {/* Filter & Range Selector Bar */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          {/* Range Tabs: Today / This Week / All Time */}
          <div className="inline-flex p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
            {[
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'This Week' },
              { id: 'all', label: 'All Time' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#ff5a36] ${
                  activeTab === tab.id
                    ? 'bg-[#ff5a36] text-white shadow-lg shadow-[#ff5a36]/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Exercise Filter Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={exerciseFilter}
                onChange={(e) => setExerciseFilter(e.target.value)}
                className="appearance-none bg-white/[0.04] border border-white/10 hover:border-white/20 rounded-xl px-4 py-2.5 pr-8 text-xs sm:text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#ff5a36] cursor-pointer"
              >
                <option value="all" className="bg-[#111424] text-white">All Disciplines</option>
                {EXERCISES.map((ex) => (
                  <option key={ex.id} value={ex.id} className="bg-[#111424] text-white">
                    {ex.name}
                  </option>
                ))}
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {totalPlayers > 0 && !isOffline && (
              <span className="text-xs font-mono text-slate-400 bg-white/5 border border-white/10 px-3 py-2 rounded-xl">
                {totalPlayers} athlete{totalPlayers === 1 ? '' : 's'}
              </span>
            )}
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-6 py-6 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-64">
              <div className="rounded-3xl bg-white/5" />
              <div className="rounded-3xl bg-white/5" />
              <div className="rounded-3xl bg-white/5" />
            </div>
            <div className="h-48 rounded-3xl bg-white/5" />
          </div>
        )}

        {/* Empty State: Zero players yet */}
        {!loading && displayEntries.length === 0 && (
          <div className="py-16 px-6 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center my-6">
            <div className="w-16 h-16 rounded-2xl bg-[#ff5a36]/15 border border-[#ff5a36]/30 flex items-center justify-center text-[#ff5a36] mb-4">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No players yet</h3>
            <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
              Be the first on today's board! Step into the Live Arena, log a verified set of reps, and claim the #1 spot.
            </p>
            <Link
              to="/live-arena"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-[#ff5a36] to-[#ff7455] text-white text-sm font-bold flex items-center gap-2 shadow-xl shadow-[#ff5a36]/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Training Now</span>
            </Link>
          </div>
        )}

        {/* Real Top-3 Podium */}
        {!loading && displayEntries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-end mb-14">
            {podiumOrder.map((athlete, idx) => {
              if (!athlete) {
                return (
                  <div
                    key={`empty-podium-slot-${idx}`}
                    className="fq-card p-6 rounded-3xl border border-dashed border-white/5 flex flex-col justify-center items-center text-center h-56 text-slate-600 text-xs font-semibold"
                  >
                    Slot Open
                  </div>
                );
              }

              const isFirst = athlete.rank === 1;
              const isSecond = athlete.rank === 2;
              const isYou =
                athlete.isYou ||
                (myRankData?.entry && athlete.displayName === myRankData.entry.displayName);

              const podiumHeight = isFirst ? 'h-72 sm:h-80' : isSecond ? 'h-60 sm:h-68' : 'h-56 sm:h-60';
              const medalColor = isFirst
                ? 'text-yellow-400 border-yellow-400/50 bg-yellow-400/15'
                : isSecond
                ? 'text-slate-300 border-slate-300/50 bg-slate-300/15'
                : 'text-amber-500 border-amber-500/50 bg-amber-500/15';

              return (
                <motion.div
                  key={athlete.displayName || athlete.rank}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className={`fq-card p-6 md:p-8 rounded-3xl flex flex-col justify-between items-center text-center relative overflow-hidden ${podiumHeight} ${
                    isFirst
                      ? 'border-[#ff5a36] shadow-[0_16px_48px_-10px_rgba(255,90,54,0.4)] order-first md:order-none'
                      : isYou
                      ? 'border-[#ff5a36]/60 bg-[#ff5a36]/10'
                      : 'border-white/10'
                  }`}
                >
                  {isFirst && (
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#ff5a36] to-transparent" />
                  )}

                  {/* Rank Badge or Crown */}
                  <div className="flex items-center gap-1.5">
                    {isFirst && (
                      <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400 mb-1" />
                    )}
                    <div
                      className={`w-10 h-10 rounded-full border flex items-center justify-center font-black text-sm ${medalColor} shadow-md`}
                    >
                      #{athlete.rank}
                    </div>
                  </div>

                  {/* Athlete Avatar & Info */}
                  <div className="flex flex-col items-center">
                    <PlayerAvatarBadge
                      avatarId={athlete.avatarId}
                      className={isFirst ? 'w-16 h-16 ring-2 ring-[#ff5a36]' : 'w-14 h-14'}
                      iconSize={isFirst ? 'w-8 h-8' : 'w-7 h-7'}
                    />
                    <h4 className="text-base sm:text-lg font-bold text-white tracking-tight mt-2 flex items-center gap-1.5">
                      <span>{athlete.displayName}</span>
                      {isYou && (
                        <span className="text-[10px] uppercase font-black text-[#ff5a36] bg-[#ff5a36]/20 px-1.5 py-0.2 rounded">
                          You
                        </span>
                      )}
                    </h4>
                  </div>

                  {/* Stats Footer */}
                  <div className="w-full pt-4 border-t border-white/10 flex items-center justify-around text-xs sm:text-sm">
                    <div>
                      <span className="text-slate-400 block text-[11px] uppercase font-medium">XP</span>
                      <span className="font-extrabold text-white">{athlete.xp.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px] uppercase font-medium">Level</span>
                      <span className="font-extrabold text-[#ff5a36]">Lvl {athlete.level}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px] uppercase font-medium">Streak</span>
                      <span className="font-extrabold text-amber-400 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 fill-amber-400" />
                        {athlete.streak}d
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Ranks 4+ Table */}
        {!loading && remainingRows.length > 0 && (
          <div className="rounded-3xl bg-white/[0.03] border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm md:text-base">
                <thead className="bg-white/5 border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Rank</th>
                    <th className="px-6 py-4">Athlete</th>
                    <th className="px-6 py-4">Level</th>
                    <th className="px-6 py-4">Streak</th>
                    <th className="px-6 py-4 text-right">XP Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {remainingRows.map((row) => {
                    const isYou =
                      row.isYou ||
                      (myRankData?.entry && row.displayName === myRankData.entry.displayName);

                    return (
                      <tr
                        key={row.displayName || row.rank}
                        className={`transition-colors ${
                          isYou
                            ? 'bg-[#ff5a36]/15 hover:bg-[#ff5a36]/20 border-y border-[#ff5a36]/30 font-semibold'
                            : 'hover:bg-white/[0.04]'
                        }`}
                      >
                        <td className="px-6 py-4 font-bold text-slate-400 font-mono">
                          <span className={isYou ? 'text-[#ff5a36]' : ''}>#{row.rank}</span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-white flex items-center gap-3">
                          <PlayerAvatarBadge
                            avatarId={row.avatarId}
                            className="w-9 h-9"
                            iconSize="w-4 h-4"
                          />
                          <div className="flex items-center gap-2">
                            <span className={isYou ? 'text-[#ff5a36] font-bold' : ''}>
                              {row.displayName}
                            </span>
                            {isYou && (
                              <span className="text-[10px] uppercase font-bold text-[#ff5a36] bg-[#ff5a36]/20 px-1.5 py-0.5 rounded">
                                You
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-[#ff5a36]">
                          Lvl {row.level}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-400">
                            <Flame className="w-4 h-4 fill-amber-400" />
                            {row.streak} days
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-black text-white">
                          {row.xp.toLocaleString()} XP
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
