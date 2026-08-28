'use client';

import React from 'react';
import Link from 'next/link';
import { sounds } from '@/lib/soundEffects';

export const ZainabNavbar: React.FC = () => {
  return (
    <nav className="relative z-40 flex items-center justify-between gap-4 max-w-7xl mx-auto w-full pt-4 px-4 select-none">
      {/* 1. LEFT BRAND LOGO */}
      <Link
        href="/"
        onClick={() => sounds.playButtonClick()}
        className="flex items-center gap-2 text-white text-sm font-mono font-black tracking-wider uppercase hover:opacity-80 transition-opacity"
      >
        <span>KINETIC.AI</span>
      </Link>

      {/* 2. CENTER FROSTED CAPSULE WITH SAITAMA AVATAR */}
      <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg">
        {/* Saitama Avatar */}
        <Link
          href="/studio"
          onClick={() => sounds.playButtonClick()}
          className="relative flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border border-white/50 cursor-pointer hover:scale-110 transition-transform shadow-md"
          title="Launch Studio"
        >
          <img
            src="/coach_pfp.jpg"
            alt="AI Coach"
            className="w-full h-full object-cover object-center"
          />
        </Link>

        {/* Text Navigation Link */}
        <Link
          href="/studio"
          onClick={() => sounds.playButtonClick()}
          className="text-xs font-mono font-bold text-slate-300 hover:text-white uppercase tracking-wider transition-colors pr-1"
        >
          Workout Studio
        </Link>
      </div>

      {/* 3. RIGHT GITHUB ICON */}
      <div className="flex items-center">
        <a
          href="https://github.com/tamas2006"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => sounds.playButtonClick()}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 shadow-sm transition-all active:scale-90 hover:scale-110"
          title="GitHub"
          aria-label="GitHub Profile"
        >
          <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </a>
      </div>
    </nav>
  );
};
