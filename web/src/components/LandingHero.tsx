'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sounds } from '@/lib/soundEffects';
import { ZainabNavbar } from '@/components/ZainabNavbar';
import { Megaphone, CheckSquare } from 'lucide-react';

export const LandingHero: React.FC = () => {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  const handleBeginExperience = (e: React.MouseEvent) => {
    e.preventDefault();
    sounds.playButtonClick();
    setIsTransitioning(true);

    setTimeout(() => {
      router.push('/studio');
    }, 450);
  };

  return (
    <section className="relative w-full h-screen max-h-screen flex flex-col justify-between overflow-hidden bg-[#080808] bg-noise text-white px-6 md:px-12 py-6 select-none font-mono">
      {/* 1. ARTISTIC STIPPLED POINTILLISM HANDS BACKGROUND */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <img
          src="/hands_bg.jpg"
          alt="Artistic Pointillism Hands"
          className={`w-full h-full object-cover opacity-85 transition-all duration-700 ease-out ${
            isTransitioning ? 'opacity-20 scale-110 blur-lg' : 'opacity-85 scale-100'
          }`}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/80" />
      </div>

      {/* 2. TOP NAVBAR */}
      <div className={`relative z-20 transition-all duration-500 ease-out ${isTransitioning ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <ZainabNavbar />
      </div>

      {/* 3. HERO 2-COLUMN LAYOUT MATCHING SCREENSHOT */}
      <div
        className={`relative z-20 max-w-6xl mx-auto w-full my-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center transition-all duration-500 ease-out ${
          isTransitioning ? 'opacity-0 scale-95 blur-md -translate-y-2' : 'opacity-100 scale-100 blur-0 translate-y-0'
        }`}
      >
        {/* LEFT COLUMN: HEADLINE, SUBTITLE, BULLETS, CTA BUTTON */}
        <div className="md:col-span-7 flex flex-col items-start gap-4 text-left">
          {/* Main Title */}
          <div className="flex items-center gap-1">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white lowercase">
              kinetic.online
            </h1>
            <span className="inline-block w-2.5 h-8 bg-white/80 animate-pulse ml-1" />
          </div>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm font-bold text-neutral-300">
            Built for athletes, by sports scientists + AI engineers
          </p>

          {/* Clean 3-Checklist Points */}
          <div className="flex flex-col gap-2 mt-2 text-xs text-neutral-300 leading-relaxed">
            <div className="flex items-start gap-2.5">
              <CheckSquare className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-white font-bold">No login or sign up</strong>{' '}
                <span className="text-neutral-500 text-[11px]">(zero hardware or wearables required)</span>
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckSquare className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-white font-bold">Sub-40ms spatial joint tracking</strong>{' '}
                <span className="text-neutral-500 text-[11px]">(clinical velocity & angle extraction)</span>
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckSquare className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-white font-bold">Groq Multimodal Vision AI</strong>{' '}
                <span className="text-neutral-500 text-[11px]">(real-time reasoning & posture diagnostics)</span>
              </span>
            </div>
          </div>

          {/* CTA Looping Glow Button */}
          <div className="mt-5">
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
              <div className="relative z-10 w-full h-full rounded-full bg-[#030B17]/90 hover:bg-[#030B17]/70 backdrop-blur-2xl px-8 py-3.5 flex items-center gap-3.5 text-xs font-bold uppercase tracking-[0.20em] text-white transition-colors duration-300">
                <span className="drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]">
                  BEGIN THE EXPERIENCE
                </span>
                <span className="text-sm text-[#00E5FF] transition-transform group-hover:translate-x-1 duration-300 drop-shadow-[0_0_8px_#00E5FF]">
                  →
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: PIXEL ART STICKER GRAPHIC */}
        <div className="md:col-span-5 flex items-center justify-center">
          <div className="relative group cursor-pointer" onClick={handleBeginExperience}>
            <div className="w-64 sm:w-72 md:w-80 rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-105">
              <img
                src="/kinetic_sticker.jpg"
                alt="Kinetic Coach Pixel Graphic"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. MINIMAL BOTTOM BAR & SOCIAL ROW */}
      <div className={`relative z-20 max-w-6xl mx-auto w-full flex items-center justify-between text-xs text-neutral-500 transition-all duration-500 ease-out ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <span>© 2026 kinetic.online — All rights reserved.</span>
        <div className="flex items-center gap-4 text-neutral-400">
          <a href="https://github.com/tamas2006" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
          <span>•</span>
          <a href="/studio" className="hover:text-white transition-colors">Studio</a>
          <span>•</span>
          <a href="https://github.com/tamas2006" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Docs</a>
        </div>
      </div>

      {/* 5. FLOATING ANNOUNCEMENT / COOKIE CAPSULE */}
      {showAnnouncement && (
        <div className="fixed bottom-6 left-6 z-50 animate-fadeIn flex items-center gap-3 p-3 pl-4 rounded-2xl bg-[#0c0c0d]/95 backdrop-blur-xl border border-white/[0.12] shadow-2xl text-xs max-w-md text-neutral-300">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/10 text-white text-[10px] uppercase font-bold tracking-wider">
            <Megaphone className="w-3 h-3" />
            <span>Announcement</span>
          </div>
          <p className="text-[11px] text-neutral-300 flex-1">
            We use zero trackers. Pure private edge intelligence.
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowAnnouncement(false)}
              className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-bold cursor-pointer transition-colors"
            >
              Reject
            </button>
            <button
              onClick={() => setShowAnnouncement(false)}
              className="px-3 py-1 rounded-lg bg-white text-black text-[11px] font-bold cursor-pointer hover:bg-neutral-200 transition-colors"
            >
              Accept
            </button>
          </div>
        </div>
      )}

      {/* Smooth Dark Transition Overlay */}
      <div
        className={`fixed inset-0 bg-black pointer-events-none z-50 transition-opacity duration-500 ease-in-out ${
          isTransitioning ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </section>
  );
};
