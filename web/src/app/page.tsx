'use client';

import { LandingHero } from '@/components/LandingHero';
import { InteractiveProtractor } from '@/components/InteractiveProtractor';
import { BiomechanicalRules } from '@/components/BiomechanicalRules';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-emerald-400 selection:text-black">
      {/* 1. HERO WITH CTA */}
      <LandingHero />

      {/* 2. INTERACTIVE DEPTH & ANGLE SIMULATOR */}
      <InteractiveProtractor />

      {/* 3. SUPPORTED EXERCISES & TECHNIQUE */}
      <BiomechanicalRules />

      {/* 4. FOOTER */}
      <Footer />
    </div>
  );
}
