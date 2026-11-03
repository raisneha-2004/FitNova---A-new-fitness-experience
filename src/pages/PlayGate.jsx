import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Dumbbell, Award, TrendingUp, Sparkles, ChevronRight, Zap } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import PlayerProfileModal from '../components/PlayerProfileModal';

export default function PlayGate() {
  const navigate = useNavigate();
  const { player, hasProfile } = usePlayer();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePlayClick = () => {
    if (hasProfile) {
      navigate('/challenges');
    } else {
      setIsModalOpen(true);
    }
  };

  const handleModalSuccess = () => {
    navigate('/challenges');
  };

  const menuOptions = [
    {
      id: 'play',
      title: hasProfile ? 'Resume Challenge' : 'Play as Guest',
      description: hasProfile ? `Welcome back, ${player?.nickname}! Enter arena.` : 'Instant access. No email, no password needed.',
      icon: Play,
      isPrimary: true,
      onClick: handlePlayClick
    },
    {
      id: 'challenges',
      title: 'Choose Your Challenge',
      description: 'Select squat, jumping jacks, or bicep curls and set targets.',
      icon: Dumbbell,
      isPrimary: false,
      onClick: () => navigate('/challenges')
    },
    {
      id: 'achievements',
      title: 'View Achievements',
      description: 'Unlock 10 distinct badges as you conquer your training goals.',
      icon: Award,
      isPrimary: false,
      onClick: () => navigate('/achievements')
    },
    {
      id: 'progress',
      title: 'My Progress',
      description: 'Review lifetime stats, streaks, personal bests, and XP charts.',
      icon: TrendingUp,
      isPrimary: false,
      onClick: () => navigate('/progress')
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Subtle Animated Grid and Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ff5a36 1px, transparent 0)`,
            backgroundSize: '36px 36px'
          }}
        />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ff5a36]/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl w-full mx-auto text-center z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#ff5a36] uppercase tracking-wider mb-4 shadow-inner">
            <Zap className="w-3.5 h-3.5 text-[#ff5a36]" />
            Arena Game Hub
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-3">
            FIT<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5a36] to-[#ff7455]">NOVA</span>
          </h1>
          <p className="text-base sm:text-xl text-white/70 font-medium max-w-xl mx-auto">
            Your Body. Your Challenge. Your Arena.
          </p>
          <p className="text-xs sm:text-sm text-[#ff5a36] font-semibold mt-1 tracking-wide">
            Your workout is the game. Your body is the controller.
          </p>

          {hasProfile && (
            <motion.p
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-3 text-sm text-emerald-400 font-semibold"
            >
              Active Profile: <span className="text-white underline underline-offset-4">{player.nickname}</span>
            </motion.p>
          )}
        </motion.div>

        {/* 2x2 Glass Buttons Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-left"
        >
          {menuOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <motion.button
                key={opt.id}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={opt.onClick}
                className={`group relative p-6 sm:p-7 rounded-2xl text-left transition-all border overflow-hidden backdrop-blur-xl ${
                  opt.isPrimary
                    ? 'bg-gradient-to-br from-[#ff5a36]/20 to-[#ff5a36]/5 border-[#ff5a36]/40 shadow-xl shadow-[#ff5a36]/15 hover:border-[#ff5a36]'
                    : 'bg-white/[0.04] border-white/10 hover:border-white/25 hover:bg-white/[0.07] shadow-lg shadow-black/40'
                }`}
              >
                {/* Glow pill behind icon on hover */}
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none transition-opacity duration-300 ${
                  opt.isPrimary ? 'bg-[#ff5a36]/25 opacity-100' : 'bg-white/5 opacity-0 group-hover:opacity-100'
                }`} />

                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl flex items-center justify-center transition-colors ${
                    opt.isPrimary
                      ? 'bg-[#ff5a36] text-white shadow-md shadow-[#ff5a36]/40'
                      : 'bg-white/10 text-white/90 group-hover:bg-white/15'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <ChevronRight className={`w-5 h-5 transition-transform duration-200 group-hover:translate-x-1 ${
                    opt.isPrimary ? 'text-[#ff5a36]' : 'text-white/40 group-hover:text-white'
                  }`} />
                </div>

                <h3 className="text-xl font-bold text-white mb-1.5 flex items-center gap-2">
                  {opt.title}
                  {opt.isPrimary && (
                    <Sparkles className="w-4 h-4 text-[#ff5a36] animate-pulse" />
                  )}
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  {opt.description}
                </p>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Small Notice at Bottom */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-8 text-xs text-white/40"
        >
          No sign-up needed. Your progress is saved in this browser.
        </motion.p>
      </div>

      {/* Guest Setup Modal */}
      <PlayerProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
