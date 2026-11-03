import React, { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/**
 * FeatureCard
 * 
 * Props:
 * - feature: card data item
 * - isActive: boolean (active/featured card state)
 * - onActivate: callback to set this card active
 * - onSelect: callback when user clicks card/chip/link (opens Playground or demo modal)
 * - index: order index for stagger animation
 * 
 * FitNova Spacing & Size Specs:
 * - Card padding: p-6 md:p-8
 * - Icons: 44px to 48px
 * - Title: text-xl or text-2xl
 * - Description: text-sm md:text-base
 * - Badges/chips: text-xs with px-3 py-1
 */
export default function FeatureCard({ feature, isActive, onActivate, onSelect, index }) {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Track cursor position inside the card for soft radial spotlight
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    onActivate();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: -100, y: -100 });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(index);
    }
  };

  const IconComponent = feature.icon;

  return (
    <motion.div
      ref={cardRef}
      role="button"
      tabIndex={0}
      aria-label={`${feature.title} - ${feature.chipText}`}
      onKeyDown={handleKeyDown}
      onClick={() => onSelect(index)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onTouchStart={onActivate}
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      animate={
        isActive && !shouldReduceMotion
          ? { y: -6 }
          : { y: 0 }
      }
      className={`relative group rounded-3xl p-6 md:p-8 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a36] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0d17] select-none h-full ${
        isActive
          ? 'bg-white/[0.08] border-[#ff5a36] shadow-[0_16px_40px_-8px_rgba(255,90,54,0.35)]'
          : 'bg-white/[0.04] hover:bg-white/[0.06] border-white/10 hover:border-white/20'
      } backdrop-blur-xl border`}
      style={{
        minHeight: '360px',
      }}
    >
      {/* 1. Cursor-follow spotlight: soft orange radial highlight */}
      {isHovered && !shouldReduceMotion && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-0 opacity-100"
          style={{
            background: `radial-gradient(240px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 90, 54, 0.2), transparent 80%)`,
          }}
        />
      )}

      {/* 2. Top Bar: Icon Tile (44 to 48px) + Corner Chip (px-3 py-1) */}
      <div className="relative z-10 flex items-start justify-between gap-3 mb-6">
        {/* Icon Tile */}
        <div className="relative">
          {/* Card 2 Stack effect */}
          {feature.hasStackEffect && (
            <>
              <div className="absolute -top-1 -right-1 w-12 h-12 rounded-2xl bg-[#ff5a36]/20 border border-[#ff5a36]/30 -rotate-6 transform transition-transform group-hover:-rotate-12 duration-300" />
              <div className="absolute -top-0.5 -right-0.5 w-12 h-12 rounded-2xl bg-[#ff5a36]/30 border border-[#ff5a36]/40 rotate-3 transform transition-transform group-hover:rotate-6 duration-300" />
            </>
          )}

          {/* Main Icon container: 48px (w-12 h-12) */}
          <div
            className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              feature.iconGradient
                ? feature.iconGradient
                : 'bg-[#ff5a36]/15 border border-[#ff5a36]/30 text-[#ff5a36]'
            } ${
              isActive
                ? 'shadow-[0_0_18px_rgba(255,90,54,0.6)] border-[#ff5a36]'
                : ''
            } ${feature.hasPulsingGlow && !shouldReduceMotion ? 'animate-pulse' : ''}`}
          >
            <IconComponent className="w-6 h-6" />
          </div>
        </div>

        {/* Corner Chip: px-3 py-1 */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(index);
          }}
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold tracking-wide border transition-colors ${
            isActive
              ? 'bg-[#ff5a36]/25 border-[#ff5a36] text-white shadow-sm'
              : 'bg-white/5 border-white/10 text-slate-300 hover:border-[#ff5a36]/40 hover:text-white'
          }`}
        >
          <span>{feature.chipText}</span>
        </button>
      </div>

      {/* 3. Middle Content: Title (text-xl sm:text-2xl), Description (text-sm md:text-base) */}
      <div className="relative z-10 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug mb-3">
              {feature.title}
            </h3>

            {/* Right side visual */}
            {feature.sideVisual && (
              <div className="shrink-0 -mt-2 -mr-1">
                {feature.sideVisual}
              </div>
            )}
          </div>

          <p className="text-sm md:text-base text-slate-400 leading-relaxed">
            {feature.description}
          </p>
        </div>

        {/* Embedded bottom visual */}
        {feature.bottomVisual && (
          <div className="mt-4">
            {feature.bottomVisual}
          </div>
        )}
      </div>

      {/* 4. Bottom Link */}
      <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(index);
          }}
          className="group/link inline-flex items-center gap-2 text-sm md:text-base font-bold text-[#ff5a36] hover:text-[#ff7a52] transition-colors focus:outline-none"
        >
          <span>{feature.linkText}</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1 group-hover:translate-x-1" />
        </button>
      </div>
    </motion.div>
  );
}
