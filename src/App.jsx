import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import GymBackground from './components/GymBackground';

import { PlayerProvider } from './context/PlayerContext';

// Dedicated Route Pages
import Home from './pages/Home';
import Features from './pages/Features';
import Exercises from './pages/Exercises';
import HowItWorks from './pages/HowItWorks';
import Leaderboard from './pages/Leaderboard';
import LiveArena from './pages/LiveArena';
import PlayGate from './pages/PlayGate';
import Challenges from './pages/Challenges';
import Achievements from './pages/Achievements';
import ProgressPage from './pages/ProgressPage';
import Privacy from './pages/Privacy';
import Disclaimer from './pages/Disclaimer';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

import ErrorBoundary from './components/ErrorBoundary';

/**
 * AnimatedRoutes Component
 * Wraps routes inside AnimatePresence with a slight slide up + fade (250ms)
 * Keyed by location.pathname to animate cleanly between page changes.
 */
function AnimatedRoutes({ setIsOffline }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full"
      >
        <Routes location={location}>
          {/* 1. Landing Page (Hero + short previews only) */}
          <Route path="/" element={<Home />} />

          {/* 2. Guest Game Flow Routes */}
          <Route path="/play" element={<PlayGate />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/progress" element={<ProgressPage />} />

          {/* 3. Features Page (4 interactive cards + playground) */}
          <Route path="/features" element={<Features />} />

          {/* 4. Exercises Page (Bodyweight Squat + coming soon disciplines) */}
          <Route path="/exercises" element={<Exercises />} />

          {/* 5. How It Works Page (3 step cards + CTA) */}
          <Route path="/how-it-works" element={<HowItWorks />} />

          {/* 6. Leaderboard Page (Tabs + podium + rankings table) */}
          <Route path="/leaderboard" element={<Leaderboard />} />

          {/* 7. Live Arena Page (replaces /dashboard; keeps camera + MediaPipe logic) */}
          <Route
            path="/live-arena"
            element={
              <ErrorBoundary>
                <LiveArena setIsOffline={setIsOffline} />
              </ErrorBoundary>
            }
          />

          {/* 8. Trust & Legal Pages */}
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/contact" element={<Contact />} />

          {/* 9. Backward compatibility redirect: /dashboard -> /live-arena */}
          <Route path="/dashboard" element={<Navigate to="/live-arena" replace />} />

          {/* 10. 404 Fallback Catch-All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const [isOffline, setIsOffline] = useState(false);

  return (
    <PlayerProvider>
      <BrowserRouter>
        {/* Scroll window to (0, 0) on every route navigation */}
        <ScrollToTop />

        {/* Root Layout Pattern: Only this root wrapper uses min-h-screen */}
        <div className="flex min-h-screen flex-col bg-[#0b0d17] text-slate-100 relative overflow-x-hidden selection:bg-[#ff5a36] selection:text-white">
          {/* Subtle orange/coral GRID pattern spanning full viewport */}
          <div className="fixed inset-0 -z-10 bg-orange-grid pointer-events-none" />

          {/* Ambient Glows across the screen: position fixed, inset-0, -z-10 */}
          <div
            className="fixed -top-40 -left-40 w-[36rem] h-[36rem] rounded-full bg-[#ff5a36]/15 blur-[150px] pointer-events-none -z-10"
            aria-hidden="true"
          />
          <div
            className="fixed top-1/2 -right-40 w-[30rem] h-[30rem] rounded-full bg-[#ff5a36]/8 blur-[160px] pointer-events-none -z-10"
            aria-hidden="true"
          />

          {/* Animated Gym-Themed Background Elements */}
          <GymBackground />

          {/* 1. Sticky Navbar */}
          <Navbar isOffline={isOffline} />

          {/* 2. Main Page Content (Normal height, sizes to content) */}
          <main className="flex-1">
            <AnimatedRoutes setIsOffline={setIsOffline} />
          </main>

          {/* 3. Footer with mt-auto */}
          <Footer className="mt-auto" />
        </div>
      </BrowserRouter>
    </PlayerProvider>
  );
}
