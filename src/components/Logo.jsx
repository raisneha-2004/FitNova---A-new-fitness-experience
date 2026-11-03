import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Reusable FitNova Gym-Themed Logo Component
 *
 * @param {number} size - Dimension of the icon tile in px (default: 40)
 * @param {boolean} showText - Whether to render "FitNova" typography alongside the icon (default: true)
 * @param {string} className - Additional CSS classes for outer container
 * @param {string} textClassName - Optional text styling overrides
 * @param {string} to - Destination route when clicked (default: "/")
 */
export default function Logo({
  size = 40,
  showText = true,
  className = '',
  textClassName = '',
  to = '/'
}) {
  const shouldReduceMotion = useReducedMotion();

  // Scales stroke and elements proportionally if size changes significantly
  // Standard icon viewBox is 0 0 48 48
  const iconContent = (
    <motion.div
      className="relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden cursor-pointer shadow-lg shadow-[#ff5a36]/25 group-hover:shadow-[#ff5a36]/50 transition-shadow duration-300"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #ff5a36 0%, #ff7a52 100%)'
      }}
    >
      {/* Hand-drawn SVG Dumbbell with Pose-Landmark Joint Trio */}
      <motion.svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[68%] h-[68%] text-white"
        initial={false}
        animate={{ rotate: 0 }}
        whileHover={shouldReduceMotion ? {} : { rotate: -12 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        style={{ transformOrigin: 'center center' }}
        aria-hidden="true"
      >
        {/* Horizontal Dumbbell Bar */}
        <line
          x1="8"
          y1="24"
          x2="40"
          y2="24"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Left Outer Weight Plate */}
        <rect
          x="10"
          y="16"
          width="3.5"
          height="16"
          rx="1.5"
          fill="currentColor"
        />

        {/* Left Inner Weight Plate */}
        <rect
          x="15"
          y="18"
          width="3"
          height="12"
          rx="1"
          fill="currentColor"
        />

        {/* Right Inner Weight Plate */}
        <rect
          x="30"
          y="18"
          width="3"
          height="12"
          rx="1"
          fill="currentColor"
        />

        {/* Right Outer Weight Plate */}
        <rect
          x="34.5"
          y="16"
          width="3.5"
          height="16"
          rx="1.5"
          fill="currentColor"
        />

        {/* Pose Landmark Joint Trio (Stick-figure joint trio connected by thin lines) */}
        {/* Connecting Lines */}
        <line
          x1="24"
          y1="19"
          x2="21.5"
          y2="28"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.9"
        />
        <line
          x1="24"
          y1="19"
          x2="26.5"
          y2="28"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Top Joint Landmark (Center top dot) */}
        <circle cx="24" cy="19" r="2.2" fill="currentColor" />

        {/* Left Lower Joint Landmark */}
        <circle cx="21.5" cy="28" r="1.8" fill="currentColor" />

        {/* Right Lower Joint Landmark */}
        <circle cx="26.5" cy="28" r="1.8" fill="currentColor" />
      </motion.svg>
    </motion.div>
  );

  return (
    <Link
      to={to}
      aria-label="FitNova home"
      className={`group inline-flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a36] rounded-xl px-1 ${className}`}
    >
      {iconContent}

      {showText && (
        <span
          className={`font-extrabold tracking-tight whitespace-nowrap select-none ${
            textClassName || (size >= 40 ? 'text-xl sm:text-2xl' : 'text-xl')
          }`}
        >
          <span className="text-white">Fit</span>
          <span className="text-[#ff5a36]">Nova</span>
        </span>
      )}
    </Link>
  );
}
