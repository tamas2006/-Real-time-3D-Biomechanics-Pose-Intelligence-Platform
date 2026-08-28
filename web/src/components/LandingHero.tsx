'use client';

import React from 'react';
import { sounds } from '@/lib/soundEffects';
import { ZainabNavbar } from '@/components/ZainabNavbar';

interface LandingHeroProps {
  onLaunchStudio: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onLaunchStudio }) => {
  return (
    <section className="relative w-full min-h-[85vh] flex flex-col justify-between overflow-hidden bg-black text-white px-6 md:px-12 pt-6 pb-12 select-none">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
      </div>

      {/* 2. TOP NAVBAR */}
      <ZainabNavbar onLaunchStudio={onLaunchStudio} />

      {/* 3. HERO HEADLINE & CTA */}
      <div className="relative z-20 max-w-4xl mx-auto w-full my-auto text-center flex flex-col items-center pt-8 pb-10">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-sans font-black tracking-tight text-white leading-tight uppercase mb-8 select-none drop-shadow-2xl">
          Trainer who <span className="text-white font-black">Coaches</span>
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => {
              sounds.playButtonClick();
              onLaunchStudio();
            }}
            className="px-9 py-4 rounded-full bg-white text-black font-black text-sm uppercase tracking-wider shadow-2xl hover:bg-slate-200 hover:scale-105 active:scale-95 transition-all"
          >
            Launch Live Workout Studio
          </button>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent pointer-events-none z-10" />
    </section>
  );
};
