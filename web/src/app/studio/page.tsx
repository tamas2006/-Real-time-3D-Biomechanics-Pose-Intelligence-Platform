'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ExerciseType } from '@/types/fitness';
import { usePoseTracker } from '@/hooks/usePoseTracker';
import { Header } from '@/components/Header';
import { VisionCanvas } from '@/components/VisionCanvas';
import { RepCounterCard } from '@/components/RepCounterCard';
import { NlpMentorStudio } from '@/components/NlpMentorStudio';
import { sounds } from '@/lib/soundEffects';

export default function StudioPage() {
  const [exercise, setExercise] = useState<ExerciseType>('squat');

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

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-emerald-400 selection:text-black">
      {/* Top Studio Bar */}
      <div className="max-w-7xl mx-auto w-full px-6 pt-6 flex items-center justify-between">
        <Link
          href="/"
          onClick={() => sounds.playButtonClick()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-mono font-bold text-white transition-all active:scale-95 shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
          Live Workout Studio
        </span>
      </div>

      {/* Main Studio Container */}
      <main className="max-w-7xl mx-auto w-full px-6 md:px-12 py-6 flex-1 flex flex-col gap-8">
        <div className="p-6 md:p-10 rounded-3xl bg-[#0B1120] border border-white/15 shadow-2xl flex flex-col gap-6 text-white">
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

        {/* AI Coach Q&A Studio */}
        <NlpMentorStudio
          exercise={exercise}
          repCount={repCount}
          formScore={formScore}
          warnings={warnings}
        />
      </main>
    </div>
  );
}
