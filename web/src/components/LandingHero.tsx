'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sounds } from '@/lib/soundEffects';
import { ZainabNavbar } from '@/components/ZainabNavbar';

export const LandingHero: React.FC = () => {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleBeginExperience = (e: React.MouseEvent) => {
    e.preventDefault();
    sounds.playButtonClick();
    setIsTransitioning(true);

    setTimeout(() => {
      router.push('/studio');
    }, 450);
  };

  return (
    <section className="relative w-full h-screen max-h-screen flex flex-col justify-between overflow-hidden bg-black text-white px-6 md:px-12 py-6 select-none">
      {/* 1. CINEMATIC BACKGROUND VIDEO */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className={`w-full h-full object-cover scale-105 transition-all duration-700 ease-out ${
            isTransitioning ? 'opacity-20 scale-110 blur-lg' : 'opacity-90 scale-105'
          }`}
        >
          <source src="/hero_bg.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
      </div>

      {/* 2. TOP NAVBAR */}
      <div className={`transition-all duration-500 ease-out ${isTransitioning ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <ZainabNavbar />
      </div>

      {/* 3. HERO HEADLINE & CONTINUOUS LOOPING GLOW BUTTON */}
      <div
        className={`relative z-20 max-w-5xl mx-auto w-full my-auto text-center flex flex-col items-center transition-all duration-500 ease-out ${
          isTransitioning ? 'opacity-0 scale-95 blur-md -translate-y-2' : 'opacity-100 scale-100 blur-0 translate-y-0'
        }`}
      >
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-display font-bold tracking-[0.06em] text-white leading-[1.05] uppercase select-none drop-shadow-2xl">
          TRAINER
        </h1>
        <h2 className="text-5xl sm:text-7xl md:text-8xl font-vogue italic font-normal text-white leading-[1.1] mb-6 select-none drop-shadow-2xl">
          WHO COACHES
        </h2>

        <p className="text-xs sm:text-sm font-open-sans italic text-slate-300 max-w-md mb-10 leading-relaxed text-center">
          Real-time 3D pose intelligence and biomechanical coaching powered by edge vision and clinical form guarding.
        </p>

        <div className="flex items-center justify-center">
          <button
            onClick={handleBeginExperience}
            disabled={isTransitioning}
            className="group relative p-[1.5px] rounded-full overflow-hidden inline-flex items-center justify-center shadow-[0_0_30px_rgba(0,229,255,0.45)] hover:shadow-[0_0_55px_rgba(0,229,255,0.85)] active:scale-95 transition-all duration-300 hover:scale-105 cursor-pointer focus:outline-none"
          >
            {/* 1. Continuous Looping Rotating Neon Conic Beam */}
            <div className="absolute inset-[-180%] animate-spin-beam bg-[conic-gradient(from_0deg,transparent_0deg,transparent_260deg,#00E5FF_315deg,#FFFFFF_350deg,#00E5FF_360deg)] pointer-events-none" />

            {/* 2. Outer Diffuse Glow Aura */}
            <div className="absolute inset-[-180%] animate-spin-beam bg-[conic-gradient(from_0deg,transparent_0deg,transparent_260deg,#00E5FF_315deg,#00E5FF_360deg)] blur-md opacity-85 pointer-events-none" />

            {/* 3. Inner Dark Glass Button Body */}
            <div className="relative z-10 w-full h-full rounded-full bg-[#030B17]/90 hover:bg-[#030B17]/70 backdrop-blur-2xl px-9 py-4 flex items-center gap-3.5 text-xs font-mono font-bold uppercase tracking-[0.22em] text-white transition-colors duration-300">
              <span className="drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]">
                BEGIN THE EXPERIENCE
              </span>
              <span className="text-sm font-sans text-[#00E5FF] transition-transform group-hover:translate-x-1 duration-300 drop-shadow-[0_0_8px_#00E5FF]">
                →
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 4. MINIMAL BOTTOM BAR */}
      <div className={`relative z-20 max-w-7xl mx-auto w-full flex items-center justify-between text-[11px] font-mono text-slate-400 transition-all duration-500 ease-out ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <span>© 2026 KINETIC.AI</span>
        <span>ENGINEERED FOR THE FUTURE</span>
      </div>

      {/* Smooth Dark Transition Overlay */}
      <div
        className={`fixed inset-0 bg-black pointer-events-none z-50 transition-opacity duration-500 ease-in-out ${
          isTransitioning ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </section>
  );
};
