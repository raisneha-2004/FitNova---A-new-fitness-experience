import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Flame } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="py-24 sm:py-32 max-w-xl mx-auto px-4 text-center flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-2xl bg-[#ff5a36]/15 border border-[#ff5a36]/30 flex items-center justify-center text-[#ff5a36] mb-6 shadow-xl shadow-[#ff5a36]/20">
        <Flame className="w-8 h-8" />
      </div>

      <span className="text-xs font-bold uppercase tracking-wider text-[#ff5a36] block mb-2">
        Error 404
      </span>

      <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
        Page Not Found
      </h1>

      <p className="text-xs sm:text-sm text-slate-400 mb-8 leading-relaxed max-w-sm">
        The arena zone you're looking for doesn't exist or has moved. Return to the main arena to resume training.
      </p>

      <Link
        to="/"
        className="btn-coral px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg shadow-[#ff5a36]/30 focus:outline-none focus:ring-2 focus:ring-[#ff5a36]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to home</span>
      </Link>
    </div>
  );
}
