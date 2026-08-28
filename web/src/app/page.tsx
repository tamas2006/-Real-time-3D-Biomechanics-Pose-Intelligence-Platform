'use client';

import { useState, useRef } from 'react';
import { ExerciseType } from '@/types/fitness';
import { usePoseTracker } from '@/hooks/usePoseTracker';
import { LandingHero } from '@/components/LandingHero';
import { InteractiveProtractor } from '@/components/InteractiveProtractor';
import { BiomechanicalRules } from '@/components/BiomechanicalRules';
import { NlpMentorStudio } from '@/components/NlpMentorStudio';
import { Header } from '@/components/Header';
import { VisionCanvas } from '@/components/VisionCanvas';
import { RepCounterCard } from '@/components/RepCounterCard';
import { Footer } from '@/components/Footer';

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
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-emerald-400 selection:text-black">
      {/* 1. HERO */}
      <LandingHero onLaunchStudio={scrollToStudio} />

      {/* 2. MAIN LIVE AI WORKOUT STUDIO */}
      <section
        id="studio"
        ref={studioRef}
        className="relative z-20 max-w-7xl mx-auto w-full px-6 md:px-12 py-10 my-4"
      >
        <div className="p-6 md:p-10 rounded-3xl bg-[#0B1120] border border-white/15 shadow-2xl flex flex-col gap-6 text-white">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-sans font-bold text-white tracking-tight">
                Live AI Workout Studio
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Position your camera with target limbs visible to track reps and receive real-time voice coaching.
              </p>
            </div>
          </div>

          {/* Controls */}
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
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

            {/* Repetition Sidebar (4 Columns) */}
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

      {/* 3. REAL-TIME AI COACH Q&A */}
      <NlpMentorStudio
        exercise={exercise}
        repCount={repCount}
        formScore={formScore}
        warnings={warnings}
      />

      {/* 4. INTERACTIVE DEPTH SIMULATOR */}
      <InteractiveProtractor />

      {/* 5. SUPPORTED EXERCISES */}
      <BiomechanicalRules />

      {/* 6. FOOTER */}
      <Footer />
    </div>
  );
}
