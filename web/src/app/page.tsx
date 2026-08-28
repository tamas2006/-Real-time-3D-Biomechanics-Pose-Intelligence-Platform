'use client';

import { LandingHero } from '@/components/LandingHero';

export default function Home() {
  return (
    <main className="h-screen w-screen max-h-screen overflow-hidden bg-black text-white selection:bg-neutral-700 selection:text-white">
      <LandingHero />
    </main>
  );
}
