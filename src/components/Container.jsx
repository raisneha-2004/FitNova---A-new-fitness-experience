import React from 'react';

/**
 * Container Component
 * Unified layout container ensuring consistent left/right alignment across
 * all pages, headers, and footers.
 * - Standard screens: max-w-7xl (1280px), mx-auto, px-4 sm:px-6 lg:px-10
 * - Ultra-wide screens (>1600px / 2xl:): max-w-[1440px]
 */
export default function Container({ children, className = '' }) {
  return (
    <div className={`w-full max-w-7xl 2xl:max-w-360 mx-auto px-4 sm:px-6 lg:px-10 ${className}`}>
      {children}
    </div>
  );
}
