'use client';

import React, { useEffect, useState } from 'react';
import { sounds } from '@/lib/soundEffects';

interface SectionTarget {
  id: string;
  label: string;
}

const SECTIONS: SectionTarget[] = [
  { id: 'hero', label: 'Overview' },
  { id: 'features', label: 'Protractor Lab' },
  { id: 'studio', label: 'Live AI Studio' },
  { id: 'rulebook', label: 'Rulebook' },
  { id: 'dataset', label: '175K Ensemble' },
  { id: 'mentor', label: 'NLP Mentor' }
];

export const InteractiveScrollExperience: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    // 1. Scroll Progress & Active Section Tracker
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      const progress = totalHeight > 0 ? (currentScroll / totalHeight) * 100 : 0;
      setScrollProgress(progress);

      // Identify active section
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.45) {
            setActiveSection(SECTIONS[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // 2. IntersectionObserver for Smooth Reveal Animations
    const observerCallback: IntersectionObserverCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.12,
      rootMargin: '0px 0px -50px 0px'
    });

    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const scrollTo = (id: string) => {
    sounds.playButtonClick();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* 1. TOP INTERACTIVE KINETIC SCROLL PROGRESS BAR */}
      <div className="fixed top-0 left-0 w-full h-[3.5px] z-50 pointer-events-none bg-black/40 backdrop-blur-sm">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-300 transition-all duration-75 shadow-[0_0_12px_rgba(16,185,129,0.9)]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* 2. INTERACTIVE FLOATING RIGHT QUICK-NAV DOCK */}
      <aside
        className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-3 p-2 rounded-full bg-black/60 border border-white/20 backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.6)] select-none animate-fadeIn"
        aria-label="Section Navigation Dock"
      >
        {SECTIONS.map((sec) => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => scrollTo(sec.id)}
              className="group relative flex items-center justify-center p-1.5 focus:outline-none"
              aria-label={`Jump to ${sec.label}`}
            >
              {/* Tooltip on Hover */}
              <span className="absolute right-9 px-2.5 py-1 rounded-lg bg-black/90 border border-white/20 text-[10px] font-mono font-bold text-white uppercase tracking-wider whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 shadow-xl -translate-x-1 group-hover:translate-x-0">
                {sec.label}
              </span>

              {/* Glowing Indicator Dot */}
              <span
                className={`transition-all duration-300 rounded-full ${
                  isActive
                    ? 'w-3 h-6 bg-emerald-400 shadow-[0_0_12px_#10B981]'
                    : 'w-2 h-2 bg-white/30 group-hover:bg-white/70 group-hover:scale-125'
                }`}
              />
            </button>
          );
        })}
      </aside>
    </>
  );
};
