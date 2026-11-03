import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Container from './Container';
import DailyChallengeCard from './DailyChallengeCard';
import TopPlayersCard from './TopPlayersCard';
import FaqAccordion from './FaqAccordion';

/**
 * ArenaSection Component ("Step into the Arena")
 * Replaces the old feature preview strip on the landing page ("/")
 * Layout:
 * - Section Header with orange label, "Step into the Arena" heading, and subtitle
 * - 2 columns on desktop (DailyChallengeCard on left, TopPlayersCard on right), stacking on mobile
 * - Full-width FAQ accordion below
 * - Staggered fade-up animations respecting prefers-reduced-motion
 */
export default function ArenaSection() {
  const shouldReduceMotion = useReducedMotion();

  // Stagger container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: 'easeOut' },
    },
  };

  return (
    <section className="relative z-10 py-6 sm:py-8">
      <Container>
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={itemVariants}
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-14"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-[#ff5a36] block mb-2.5">
            Your arena awaits
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Step into <span className="text-[#ff5a36]">the Arena</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-400 mt-3 leading-relaxed">
            Take today's challenge, climb the board, and get your questions answered.
          </p>
        </motion.div>

        {/* 2-Column Grid for Challenge & Top Players */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch mb-12 sm:mb-16"
        >
          {/* Column 1: Daily Challenge Card */}
          <motion.div variants={itemVariants} className="h-full">
            <DailyChallengeCard />
          </motion.div>

          {/* Column 2: Top Players Card */}
          <motion.div variants={itemVariants} className="h-full">
            <TopPlayersCard />
          </motion.div>
        </motion.div>

        {/* Full Width Quick FAQ Accordion below */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={itemVariants}
          className="max-w-4xl mx-auto"
        >
          <FaqAccordion />
        </motion.div>
      </Container>
    </section>
  );
}
