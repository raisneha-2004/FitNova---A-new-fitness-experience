import React from 'react';
import Hero from '../components/Hero';
import ArenaSection from '../components/ArenaSection';

/**
 * Home Page
 * - Hero section (unchanged)
 * - "Step into the Arena" section: Daily Challenge Card, Top Players Leaderboard Card,
 *   and Quick FAQ Accordion
 */
export default function Home() {
  return (
    <div className="space-y-6 sm:space-y-10 pb-10 md:pb-14">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Step into the Arena Section (Replaces old feature preview strip) */}
      <ArenaSection />
    </div>
  );
}
