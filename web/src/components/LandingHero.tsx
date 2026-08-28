'use client';

import React from 'react';
import Link from 'next/link';
import { sounds } from '@/lib/soundEffects';
import { ZainabNavbar } from '@/components/ZainabNavbar';

export const LandingHero: React.FC = () => {
  return (
    <section className="relative w-full h-screen max-h-screen flex flex-col justify-between overflow-hidden bg-black text-white px-6 md:px-12 py-6 select-none">
      {/* 1. CINEMATIC BACKGROUND VIDEO */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-105 opacity-90"
        >
          <source src="/hero_bg.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
      </div>

      {/* 2. TOP NAVBAR */}
      <ZainabNavbar />

      {/* 3. HERO HEADLINE & EXACT MATCH CTA BUTTON */}
      <div className="relative z-20 max-w-5xl mx-auto w-full my-auto text-center flex flex-col items-center">
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-sans font-black tracking-tight text-white leading-tight uppercase mb-8 select-none drop-shadow-2xl">
          Trainer who <span className="text-white font-black">Coaches</span>
        </h1>

        <div className="flex items-center justify-center">
          <Link
            href="/studio"
            onClick={() => sounds.playButtonClick()}
            className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-white/10 hover:bg-white text-white hover:text-black border border-white/30 hover:border-white text-xs font-mono font-bold uppercase tracking-[0.2em] backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <span>BEGIN THE EXPERIENCE</span>
            <span className="text-sm font-sans transition-transform group-hover:translate-x-1 duration-300">→</span>
          </Link>
        </div>
      </div>

      {/* 4. MINIMAL BOTTOM BAR */}
      <div className="relative z-20 max-w-7xl mx-auto w-full flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>© 2026 KINETIC.AI</span>
        <span>ENGINEERED FOR THE FUTURE</span>
      </div>
    </section>
  );
};
