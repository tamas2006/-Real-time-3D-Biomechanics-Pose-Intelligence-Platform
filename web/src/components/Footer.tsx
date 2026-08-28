'use client';

import React from 'react';
import { ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative w-full bg-black text-white pt-20 pb-12 px-6 md:px-12 mt-20 overflow-hidden border-t border-white/15 select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 pb-12 border-b border-white/10">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl font-black font-mono tracking-wider text-white">
              KINETIC.AI
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-sm font-sans">
            Next-Gen Edge Biomechanics & AI Pose Intelligence. Designed with modern editorial precision for athletes and coaches.
          </p>
        </div>

        {/* Pure Clean Obsidian Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="px-4 py-2 rounded-full bg-white/5 border border-white/15 text-xs font-mono font-bold text-slate-300 shadow-sm">
            MediaPipe 60 FPS
          </div>
          <div className="px-4 py-2 rounded-full bg-white/5 border border-white/15 text-xs font-mono font-bold text-slate-300 shadow-sm">
            175,000 Dataset
          </div>
          <div className="px-4 py-2 rounded-full bg-white/5 border border-white/15 text-xs font-mono font-bold text-slate-300 shadow-sm">
            Zero False Reps
          </div>
        </div>

        {/* Scroll To Top Button */}
        <button
          onClick={scrollToTop}
          className="w-12 h-12 rounded-full bg-white/10 border border-white/20 hover:border-white hover:bg-white hover:text-black flex items-center justify-center shadow-md transition-all active:scale-95 group text-white"
          aria-label="Scroll to Top"
        >
          <ArrowUp className="w-5 h-5 text-white group-hover:text-black transition-colors" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-[11px] font-mono text-slate-500 text-center sm:text-left">
        <p>© 2026 KINETIC.AI • All Rights Reserved</p>
        <p className="flex items-center gap-1 justify-center">
          Built with Next.js 16, TypeScript & MediaPipe
        </p>
      </div>
    </footer>
  );
};
