'use client';

import React from 'react';
import { sounds } from '@/lib/soundEffects';
import { ZainabNavbar } from '@/components/ZainabNavbar';

interface LandingHeroProps {
  onLaunchStudio: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onLaunchStudio }) => {
  return (
    <section className="relative w-full min-h-[92vh] flex flex-col justify-between overflow-hidden bg-[#050505] text-[#EDECE4] px-6 md:px-12 pt-6 pb-16 select-none">
      {/* 1. PARALLAX SEAMLESS VIDEO BACKGROUND WITH PORTFOLIO_V2 OVERLAY */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-105 opacity-55"
        >
          <source src="/hero_bg.mp4" type="video/mp4" />
        </video>

        {/* Portfolio_v2 Ambient Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-transparent to-[#050505] z-10 pointer-events-none" />
      </div>

      {/* 2. TOP NAVBAR */}
      <ZainabNavbar onLaunchStudio={onLaunchStudio} />

      {/* 3. HERO EDITORIAL HEADLINE & VALUE PROPOSITION */}
      <div className="relative z-20 max-w-5xl mx-auto w-full my-auto text-center flex flex-col items-center pt-12 pb-16">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-sans font-black tracking-tight text-white leading-tight uppercase mb-8 select-none drop-shadow-2xl">
          Trainer who <span className="text-[#00F5A0] font-black">Coaches</span>
        </h1>

        {/* Portfolio_v2 Value Proposition Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10 max-w-2xl">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0C0C0E]/80 backdrop-blur-xl border border-white/10 text-xs font-mono font-bold text-[#EDECE4] shadow-lg">
            <span className="w-2 h-2 rounded-full warm-glow-dot" />
            <span>Clinical Posture Guarding</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0C0C0E]/80 backdrop-blur-xl border border-white/10 text-xs font-mono font-bold text-[#EDECE4] shadow-lg">
            <span className="w-2 h-2 rounded-full warm-glow-dot" />
            <span>60 FPS 3D Kinematics</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0C0C0E]/80 backdrop-blur-xl border border-white/10 text-xs font-mono font-bold text-[#EDECE4] shadow-lg">
            <span className="w-2 h-2 rounded-full warm-glow-dot" />
            <span>175K Deep Ensemble</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-5">
          <button
            onClick={() => {
              sounds.playButtonClick();
              onLaunchStudio();
            }}
            className="px-9 py-4 rounded-full bg-white text-black font-black text-sm uppercase tracking-wider shadow-[0_15px_35px_rgba(255,255,255,0.15)] hover:bg-[#EDECE4] hover:scale-105 active:scale-95 transition-all"
          >
            Launch Live Workout Studio
          </button>

          <a
            href="#features"
            onClick={() => sounds.playButtonClick()}
            className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-[#EDECE4] font-mono font-bold text-sm uppercase tracking-wider backdrop-blur-md transition-all shadow-lg active:scale-95"
          >
            Explore Kinematics
          </a>
        </div>
      </div>

      {/* Seamless Bottom Gradient Blend */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none z-10" />
    </section>
  );
};
