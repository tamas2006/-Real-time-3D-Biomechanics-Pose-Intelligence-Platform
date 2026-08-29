'use client';

import React from 'react';
import Link from 'next/link';
import { sounds } from '@/lib/soundEffects';

export const ZainabNavbar: React.FC = () => {
  return (
    <nav className="relative z-40 flex items-center justify-between gap-4 max-w-6xl mx-auto w-full pt-4 px-4 select-none font-mono">
      {/* 1. LEFT BRAND LOGO */}
      <Link
        href="/"
        onClick={() => sounds.playButtonClick()}
        className="flex items-center gap-2 text-white text-xs tracking-wider uppercase hover:opacity-85 transition-opacity"
      >
        <span className="text-white font-bold tracking-tight">KINETIC</span>
        <span className="text-neutral-500 font-normal">/</span>
        <span className="text-neutral-400 font-normal">STUDIO</span>
      </Link>

      {/* 2. MINIMALIST NAV LINKS */}
      <div className="flex items-center gap-4 text-xs text-neutral-400">
        <Link
          href="/"
          onClick={() => sounds.playButtonClick()}
          className="hover:text-white transition-colors"
        >
          Home
        </Link>
        <Link
          href="/studio"
          onClick={() => sounds.playButtonClick()}
          className="text-white font-bold"
        >
          Studio
        </Link>
        <a
          href="https://github.com/tamas2006"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => sounds.playButtonClick()}
          className="hover:text-white transition-colors"
        >
          GitHub
        </a>
      </div>
    </nav>
  );
};
