'use client';

import { LandingHero } from '@/components/LandingHero';

export default function Home() {
  return (
    <main className="h-screen w-screen max-h-screen overflow-hidden bg-black text-white selection:bg-emerald-400 selection:text-black">
      <LandingHero />
    </main>
  );
}
