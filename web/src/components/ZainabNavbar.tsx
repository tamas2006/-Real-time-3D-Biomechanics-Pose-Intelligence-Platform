'use client';

import React, { useState } from 'react';
import { sounds } from '@/lib/soundEffects';

interface ZainabNavbarProps {
  onLaunchStudio: () => void;
}

export const ZainabNavbar: React.FC<ZainabNavbarProps> = ({ onLaunchStudio }) => {
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
      {/* 1. LEFT BRAND LOGO */}
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

        {/* Solid White Pill CTA Button */}
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

      {/* 3. RIGHT GITHUB PROFILE LINK */}
      <div className="flex items-center">
        <a
          href="https://github.com/tamas2006"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => sounds.playButtonClick()}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/40 text-xs font-mono font-bold text-white shadow-sm transition-all active:scale-90 hover:scale-105"
          title="GitHub @tamas2006"
        >
          <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          <span className="hidden sm:inline tracking-wider">tamas2006</span>
        </a>
      </div>
    </nav>
  );
};
