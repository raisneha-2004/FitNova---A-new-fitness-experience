import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * PageHeader
 * Reusable header displayed at the top of each individual route.
 * Shows title, subtitle, and an interactive breadcrumb ("Home / PageName").
 * Matches requirement:
 * - Page title: text-4xl md:text-5xl font-extrabold
 * - Subtitle: text-base md:text-lg text-slate-400 max-w-2xl
 * - Breadcrumb: text-sm
 */
export default function PageHeader({ title, subtitle, breadcrumb = [] }) {
  return (
    <div className="mb-10 sm:mb-12">
      {/* Breadcrumb: text-sm */}
      <nav aria-label="Breadcrumb" className="mb-3.5 flex items-center gap-2 text-sm text-slate-400">
        <Link
          to="/"
          className="hover:text-white transition-colors focus:outline-none focus:text-coral"
        >
          Home
        </Link>
        {breadcrumb.map((item, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            {item.to ? (
              <Link
                to={item.to}
                className="hover:text-white transition-colors focus:outline-none focus:text-coral"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-coral font-semibold">{item.label}</span>
            )}
          </React.Fragment>
        ))}

      </nav>

      {/* Main Page Title: text-4xl md:text-5xl font-extrabold */}
      <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
        {title}
      </h1>

      {/* Subtitle: text-base md:text-lg text-slate-400 max-w-2xl */}
      {subtitle && (
        <p className="text-base md:text-lg text-slate-400 mt-3 max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
