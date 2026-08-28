'use client';

import React from 'react';
import { ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative w-full bg-black text-white pt-16 pb-12 px-6 md:px-12 mt-16 overflow-hidden border-t border-white/10 select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/10">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <span className="text-xl font-mono font-black tracking-wider text-white">
            KINETIC.AI
          </span>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            AI-Powered Pose Intelligence & Real-Time Biomechanical Workout Coach.
          </p>
        </div>

        {/* Scroll To Top Button */}
        <button
          onClick={scrollToTop}
          className="w-10 h-10 rounded-full bg-white/10 border border-white/20 hover:border-white hover:bg-white hover:text-black flex items-center justify-center shadow-md transition-all active:scale-95 group text-white"
          aria-label="Scroll to Top"
        >
          <ArrowUp className="w-4 h-4 text-white group-hover:text-black transition-colors" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs text-slate-500 text-center sm:text-left font-mono">
        <p>© 2026 KINETIC.AI • All Rights Reserved</p>
        <p>Built for Athletes & Fitness Enthusiasts</p>
      </div>
    </footer>
  );
};
