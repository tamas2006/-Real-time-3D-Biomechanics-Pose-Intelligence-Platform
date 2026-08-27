'use client';

import React, { useState } from 'react';
import { sounds } from '@/lib/soundEffects';

interface ZainabNavbarProps {
  onLaunchStudio: () => void;
}

export const ZainabNavbar: React.FC<ZainabNavbarProps> = ({ onLaunchStudio }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState('studio');

  const handleTabClick = (tab: string, targetId?: string) => {
    sounds.playButtonClick();
    setActiveTab(tab);
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="relative z-40 flex items-center justify-between gap-4 max-w-7xl mx-auto w-full pt-2 px-2 select-none">
      {/* 1. LEFT BRAND LOGO (Pure Typography) */}
      <div className="flex items-center gap-2 text-white/95 text-xs font-mono font-bold tracking-wider uppercase drop-shadow-sm">
        <span>KINETIC.AI</span>
      </div>

      {/* 2. CENTER FROSTED CAPSULE */}
      <div className="flex items-center gap-3 sm:gap-6 px-3 py-2 rounded-full bg-white/20 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all hover:border-white/60">
        {/* Coach Photo Avatar */}
        <div
          onClick={onLaunchStudio}
          className="relative flex-shrink-0 w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition-transform"
          title="AI Head Coach"
        >
          <img
            src="/coach_pfp.jpg"
            alt="AI Head Coach"
            className="w-full h-full object-cover object-top"
          />
        </div>

        {/* Text Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-sans font-medium text-white/95 tracking-wide">
          <button
            onClick={() => {
              handleTabClick('studio');
              onLaunchStudio();
            }}
            className={`hover:text-white transition-colors ${
              activeTab === 'studio' ? 'font-bold text-white underline underline-offset-8 decoration-2 decoration-white/60' : 'text-white/90'
            }`}
          >
            Studio
          </button>
          <a
            href="#features"
            onClick={() => handleTabClick('kinematics', 'features')}
            className={`hover:text-white transition-colors ${
              activeTab === 'kinematics' ? 'font-bold text-white underline underline-offset-8 decoration-2 decoration-white/60' : 'text-white/90'
            }`}
          >
            Kinematics
          </a>
          <a
            href="#dataset"
            onClick={() => handleTabClick('dataset', 'dataset')}
            className={`hover:text-white transition-colors ${
              activeTab === 'dataset' ? 'font-bold text-white underline underline-offset-8 decoration-2 decoration-white/60' : 'text-white/90'
            }`}
          >
            175K Dataset
          </a>
        </div>

        {/* Solid White Pill CTA Button (Pure Text) */}
        <button
          onClick={() => {
            sounds.playButtonClick();
            onLaunchStudio();
          }}
          className="px-5 py-2 rounded-full bg-white text-slate-900 text-xs font-bold tracking-wide hover:bg-slate-50 transition-all shadow-md active:scale-95 flex-shrink-0"
        >
          Train with AI
        </button>
      </div>

      {/* 3. RIGHT AUDIO TEXT CONTROL */}
      <div className="flex items-center">
        <button
          onClick={() => {
            sounds.playButtonClick();
            setIsMuted(!isMuted);
          }}
          className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/40 text-[10px] font-mono font-bold uppercase text-white shadow-sm transition-all active:scale-90"
        >
          {isMuted ? 'MUTE' : 'AUDIO'}
        </button>
      </div>
    </nav>
  );
};
