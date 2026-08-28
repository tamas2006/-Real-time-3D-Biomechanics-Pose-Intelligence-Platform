'use client';

import React from 'react';
import { sounds } from '@/lib/soundEffects';
import { ZainabNavbar } from '@/components/ZainabNavbar';

interface LandingHeroProps {
  onLaunchStudio: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onLaunchStudio }) => {
  return (
    <section className="relative w-full min-h-[96vh] flex flex-col justify-between overflow-hidden bg-slate-900 text-white px-6 md:px-12 pt-6 pb-12 select-none">
      {/* 1. CINEMATIC AMBIENT VIDEO BACKGROUND WITH GLASS OVERLAY */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-105 transition-transform duration-1000 ease-out"
        >
          <source src="/hero_bg.mp4" type="video/mp4" />
        </video>

        {/* Elegant Designer Color Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2563EB]/70 via-[#3B82F6]/50 to-[#1E3A8A]/80 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
      </div>

      {/* 2. TOP NAVBAR */}
      <ZainabNavbar onLaunchStudio={onLaunchStudio} />

      {/* 3. DECORATIVE ELEMENTS: STRIPED SUN */}
      <div className="absolute top-20 right-8 md:right-24 w-36 h-36 md:w-48 md:h-48 rounded-full sun-pattern opacity-90 pointer-events-none z-10 animate-pulse" />

      {/* 4. HERO EDITORIAL HEADLINE & VALUE PROPOSITION */}
      <div className="relative z-20 max-w-5xl mx-auto w-full my-auto text-center flex flex-col items-center pt-8 pb-12">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-sans font-black tracking-tight text-white leading-tight uppercase mb-6 select-none drop-shadow-md">
          Trainer who <span className="text-emerald-400 font-black">Coaches</span>
        </h1>

        {/* Value Proposition Pills (Pure White-Yellowish Glowing Dots) */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10 max-w-2xl">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-xl border border-white/30 text-xs font-mono font-bold text-white shadow-lg">
            <span className="w-2 h-2 rounded-full warm-glow-dot animate-pulse" />
            <span>Clinical Posture Guarding</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-xl border border-white/30 text-xs font-mono font-bold text-white shadow-lg">
            <span className="w-2 h-2 rounded-full warm-glow-dot animate-pulse" />
            <span>60 FPS 3D Kinematics</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-xl border border-white/30 text-xs font-mono font-bold text-white shadow-lg">
            <span className="w-2 h-2 rounded-full warm-glow-dot animate-pulse" />
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
            className="px-9 py-4.5 rounded-full bg-white text-slate-900 font-bold text-base shadow-[0_15px_35px_rgba(0,0,0,0.3)] hover:bg-slate-100 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all"
          >
            Launch Live Workout Studio
          </button>
          
          <a
            href="#features"
            onClick={() => sounds.playButtonClick()}
            className="px-7 py-4.5 rounded-full bg-black/25 hover:bg-black/40 border border-white/30 text-white font-bold text-base backdrop-blur-md transition-all shadow-lg"
          >
            Explore Kinematics
          </a>
        </div>
      </div>

      {/* 5. ORGANIC CLOUDS AT BOTTOM */}
      <div className="absolute -bottom-16 left-0 right-0 h-44 pointer-events-none z-10 flex items-end">
        <svg
          viewBox="0 0 1440 220"
          className="w-full h-full text-[#FAF9F5] fill-current drop-shadow-lg"
          preserveAspectRatio="none"
        >
          <path d="M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,128C672,107,768,85,864,96C960,107,1056,149,1152,154.7C1248,160,1344,128,1392,112L1440,96L1440,220L1392,220C1344,220,1248,220,1152,220C1056,220,960,220,864,220C768,220,672,220,576,220C480,220,384,220,288,220C192,220,96,220,48,220L0,220Z"></path>
        </svg>
      </div>
    </section>
  );
};
