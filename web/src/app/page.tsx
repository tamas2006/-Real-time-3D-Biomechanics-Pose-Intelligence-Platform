'use client';

import { useState, useRef } from 'react';
import { ExerciseType } from '@/types/fitness';
import { usePoseTracker } from '@/hooks/usePoseTracker';
import { LandingHero } from '@/components/LandingHero';
import { InteractiveProtractor } from '@/components/InteractiveProtractor';
import { BiomechanicalRules } from '@/components/BiomechanicalRules';
import { ModelArchitectureShowcase } from '@/components/ModelArchitectureShowcase';
import { NlpMentorStudio } from '@/components/NlpMentorStudio';
import { Header } from '@/components/Header';
import { VisionCanvas } from '@/components/VisionCanvas';
import { RepCounterCard } from '@/components/RepCounterCard';
import { Footer } from '@/components/Footer';
import { EXERCISE_CONFIGS } from '@/lib/kinematics';

export default function Home() {
  const [exercise, setExercise] = useState<ExerciseType>('squat');
  const studioRef = useRef<HTMLDivElement | null>(null);

  const {
    videoRef,
    canvasRef,
    isStreaming,
    fps,
    phase,
    primaryAngle,
    depthPercentage,
    formScore,
    repCount,
    validReps,
    warnings,
    repHistory,
    voiceEnabled,
    aiDetected,
    aiConfidence,
    startCamera,
    stopCamera,
    resetReps,
    setVoiceEnabled
  } = usePoseTracker(exercise);

  const scrollToStudio = () => {
    if (studioRef.current) {
      studioRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    if (!isStreaming) {
      startCamera();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 flex flex-col selection:bg-yellow-300 selection:text-black">
      {/* 1. DYNAMIC EDITORIAL HERO (Matching Reference Aesthetic with Fitness Theme) */}
      <LandingHero onLaunchStudio={scrollToStudio} />

      {/* 2. INTERACTIVE BIOMECHANICAL PROTRACTOR LAB */}
      <InteractiveProtractor />

      {/* 3. MAIN LIVE AI WORKOUT STUDIO SECTION (Styled like a luxury physical apparatus) */}
      <section
        id="studio"
        ref={studioRef}
        className="relative z-20 max-w-7xl mx-auto w-full px-6 md:px-12 py-12 my-6"
      >
        <div className="p-8 md:p-12 rounded-[44px] acrylic-glass-dark border-2 border-white/30 shadow-[0_30px_70px_rgba(0,0,0,0.4)] backdrop-blur-3xl flex flex-col gap-8 text-white">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/15 pb-6">
            <div>
              <div className="flex items-center gap-2 text-amber-200 text-xs font-mono font-bold tracking-widest uppercase mb-2">
                <span className="w-2 h-2 rounded-full warm-glow-dot animate-pulse" />
                <span>EDGE VISION ENGINE // MODEL K-175</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-serif text-white tracking-tight">
                Live AI Biomechanics <span className="italic text-cyan-200">Studio</span>
              </h2>
            </div>
            <p className="text-slate-300 text-sm max-w-md font-open-sans italic leading-relaxed">
              Position your webcam so your target limbs are visible. Execute complete repetitions to record verified tempo & cadence telemetry.
            </p>
          </div>

          {/* Top Tactile Control Header */}
          <Header
            exercise={exercise}
            onSelectExercise={(ex) => {
              setExercise(ex);
              resetReps();
            }}
            isStreaming={isStreaming}
            onToggleCamera={() => (isStreaming ? stopCamera() : startCamera())}
            onReset={resetReps}
            voiceEnabled={voiceEnabled}
            onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
          />

          {/* Studio Workspace Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Vision Viewfinder Area (8 Columns) */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <VisionCanvas
                videoRef={videoRef}
                canvasRef={canvasRef}
                isStreaming={isStreaming}
                fps={fps}
                phase={phase}
                primaryAngle={primaryAngle}
                depthPercentage={depthPercentage}
                formScore={formScore}
                warnings={warnings}
                aiDetected={aiDetected}
                aiConfidence={aiConfidence}
              />
            </div>

            {/* Repetition & Kinematics Sidebar (4 Columns) */}
            <div className="lg:col-span-4 flex flex-col h-full">
              <RepCounterCard
                repCount={repCount}
                validReps={validReps}
                depthPercentage={depthPercentage}
                repHistory={repHistory}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. REAL-TIME NLP BIOMECHANICAL MENTORSHIP STUDIO */}
      <NlpMentorStudio
        exercise={exercise}
        repCount={repCount}
        formScore={formScore}
        warnings={warnings}
      />

      {/* 5. THE BIOMECHANICAL RULEBOOK (6 Movement Patterns in Mac Terminal Window Cards) */}
      <section id="features">
        <BiomechanicalRules />
      </section>

      {/* 6. MODEL ARCHITECTURE & 140K DATASET SHOWCASE */}
      <ModelArchitectureShowcase />

      {/* 7. FOOTER */}
      <Footer />
    </div>
  );
}
