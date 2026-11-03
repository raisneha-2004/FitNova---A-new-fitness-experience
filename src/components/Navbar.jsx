import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  ArrowRight, 
  Zap, 
  Dumbbell, 
  Flame, 
  Rocket, 
  Shield, 
  Trophy, 
  Award, 
  TrendingUp, 
  User, 
  RotateCcw, 
  ChevronDown 
} from 'lucide-react';
import Container from './Container';
import Logo from './Logo';
import { usePlayer } from '../context/PlayerContext';
import { AVATARS } from '../config/player';
import PlayerProfileModal from './PlayerProfileModal';

const AVATAR_ICONS = {
  dumbbell: Dumbbell,
  flame: Flame,
  zap: Zap,
  rocket: Rocket,
  shield: Shield,
  trophy: Trophy
};

const NAV_LINKS = [
  { name: 'Features', path: '/features' },
  { name: 'Exercises', path: '/exercises' },
  { name: 'Challenges', path: '/challenges' },
  { name: 'Leaderboard', path: '/leaderboard' },
];

export default function Navbar({ isOffline = false }) {
  const navigate = useNavigate();
  const { player, hasProfile, resetPlayer } = usePlayer();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside or escape
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Compute player level
  let playerLevel = 1;
  try {
    const raw = localStorage.getItem('fq_progress');
    if (raw) {
      const prog = JSON.parse(raw);
      if (prog.level) playerLevel = prog.level;
    }
  } catch (e) {
    playerLevel = 1;
  }

  const currentAvatar = AVATARS.find(a => a.id === player?.avatarId) || AVATARS[0];
  const AvatarIcon = AVATAR_ICONS[currentAvatar.icon] || Flame;

  const handleResetProfile = () => {
    setProfileDropdownOpen(false);
    if (window.confirm('Reset your guest profile and return to setup?')) {
      resetPlayer();
      navigate('/play');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#0b0d17]/90 border-b border-white/10 h-[72px] flex items-center">
        <Container className="flex items-center justify-between">
          {/* Left: Logo */}
          <Logo size={40} />

          {/* Center: Desktop NavLinks */}
          <nav className="hidden md:flex items-center gap-7 text-base font-medium">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `relative py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a36] rounded-md px-1 ${
                    isActive ? 'text-[#ff5a36] font-semibold' : 'text-slate-300 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{link.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeNavUnderline"
                        className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-[#ff5a36] rounded-full shadow-[0_0_10px_rgba(255,90,54,0.9)]"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}

            {/* Live Arena link */}
            <NavLink
              to="/live-arena"
              className={({ isActive }) =>
                `relative py-1.5 px-3 flex items-center gap-2 font-bold text-base transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a36] rounded-xl ${
                  isActive
                    ? 'text-white bg-[#ff5a36]/25 border border-[#ff5a36]/50 shadow-md shadow-[#ff5a36]/20'
                    : 'text-[#ff5a36] hover:text-[#ff7a52] bg-[#ff5a36]/10 border border-[#ff5a36]/20'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Live Arena</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavUnderline"
                      className="absolute -bottom-1 left-2 right-2 h-[2.5px] bg-[#ff5a36] rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          </nav>

          {/* Right: Guest Flow / Player Chip */}
          <div className="hidden md:flex items-center gap-4">
            {isOffline && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Offline mode
              </span>
            )}

            {hasProfile ? (
              /* Player Chip with Accessible Dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  aria-expanded={profileDropdownOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-[#ff5a36]/50 hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-[#ff5a36]"
                >
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${currentAvatar.gradient} flex items-center justify-center text-white shadow-sm`}>
                    <AvatarIcon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-white leading-tight truncate max-w-[110px]">
                      {player.nickname}
                    </span>
                    <span className="text-[10px] text-[#ff5a36] font-semibold leading-none">
                      Lv {playerLevel}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-white/50 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0e1222] border border-white/10 shadow-2xl p-2 text-white z-50 backdrop-blur-xl"
                    >
                      <div className="px-3 py-2 border-b border-white/5 mb-1">
                        <div className="text-[11px] text-white/40 uppercase font-semibold">Guest Arena Account</div>
                        <div className="text-sm font-bold text-white truncate">{player.nickname}</div>
                      </div>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          navigate('/progress');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left"
                      >
                        <TrendingUp className="w-4 h-4 text-[#ff5a36]" />
                        <span>My Progress</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          navigate('/achievements');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left"
                      >
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>Achievements</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setIsEditModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left"
                      >
                        <User className="w-4 h-4 text-blue-400" />
                        <span>Change Avatar / Name</span>
                      </button>

                      <div className="my-1 border-t border-white/5" />

                      <button
                        onClick={handleResetProfile}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Reset Profile</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* No Profile: Play as Guest Button */
              <Link
                to="/play"
                className="btn-coral px-6 py-2.5 rounded-full text-base font-bold flex items-center gap-2 shadow-lg shadow-[#ff5a36]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a36]"
              >
                <span>Play as Guest</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-3">
            <Link
              to={hasProfile ? '/challenges' : '/play'}
              className="btn-coral px-4 py-2 rounded-full text-xs font-bold"
            >
              Play
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#ff5a36]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </Container>

        {/* Mobile Slide-down Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-[72px] inset-x-0 border-b border-white/10 bg-[#0b0d17]/98 backdrop-blur-2xl px-6 pt-4 pb-8 space-y-4 shadow-2xl">
            {hasProfile && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${currentAvatar.gradient} flex items-center justify-center text-white`}>
                    <AvatarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{player.nickname}</div>
                    <div className="text-[10px] text-[#ff5a36]">Level {playerLevel} Challenger</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsEditModalOpen(true);
                  }}
                  className="text-xs text-white/50 hover:text-white underline"
                >
                  Edit
                </button>
              </div>
            )}

            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    isActive
                      ? 'text-[#ff5a36] bg-[#ff5a36]/15 font-bold border border-[#ff5a36]/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            <NavLink
              to="/live-arena"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-xl text-base font-bold transition-colors ${
                  isActive
                    ? 'text-white bg-[#ff5a36] shadow-md shadow-[#ff5a36]/30'
                    : 'text-[#ff5a36] bg-[#ff5a36]/15 hover:bg-[#ff5a36]/25 border border-[#ff5a36]/30'
                }`
              }
            >
              ⚡ Live Arena
            </NavLink>

            {hasProfile && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <NavLink
                  to="/progress"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/5 text-center text-xs font-bold text-white/80 hover:bg-white/10"
                >
                  My Progress
                </NavLink>
                <NavLink
                  to="/achievements"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/5 text-center text-xs font-bold text-white/80 hover:bg-white/10"
                >
                  Achievements
                </NavLink>
              </div>
            )}

            <div className="pt-4 border-t border-white/10">
              <Link
                to={hasProfile ? '/challenges' : '/play'}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full btn-coral px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
              >
                <span>{hasProfile ? 'Continue to Challenges' : 'Play as Guest'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Edit Profile Modal */}
      <PlayerProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  );
}
