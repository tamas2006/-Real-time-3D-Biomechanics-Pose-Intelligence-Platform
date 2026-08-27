'use client';

import React from 'react';
import { ArrowUp, Zap, Sparkles, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative w-full bg-[#EAE8E1] text-slate-800 pt-20 pb-12 px-6 md:px-12 mt-20 overflow-hidden border-t-4 border-[#DCD9D0]">
      {/* Top Wave Curve */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 pb-12 border-b border-slate-300">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              <Zap className="w-3.5 h-3.5 text-cyan-300 fill-cyan-300" />
            </div>
            <span className="text-xl font-black font-mono tracking-wider text-slate-900">
              KINETIC.AI
            </span>
          </div>
          <p className="text-xs text-slate-600 max-w-sm font-sans">
            Next-Gen Edge Biomechanics & AI Pose Intelligence. Designed with modern editorial precision for athletes and coaches.
          </p>
        </div>

        {/* Badges without emojis */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-300 text-xs font-mono font-bold text-slate-700 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>MediaPipe 60 FPS</span>
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-300 text-xs font-mono font-bold text-slate-700 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>175,000 Dataset</span>
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-300 text-xs font-mono font-bold text-slate-700 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero False Reps</span>
          </div>
        </div>

        {/* Scroll To Top Button */}
        <button
          onClick={scrollToTop}
          className="w-12 h-12 rounded-full bg-white border-2 border-slate-300 hover:border-slate-900 hover:bg-slate-900 hover:text-white flex items-center justify-center shadow-md transition-all active:scale-95 group"
        >
          <ArrowUp className="w-5 h-5 text-slate-700 group-hover:text-white transition-colors" />
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
