'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Megaphone } from 'lucide-react';
import { ExerciseType } from '@/types/fitness';
import { usePoseTracker } from '@/hooks/usePoseTracker';
import { ZainabNavbar } from '@/components/ZainabNavbar';
import { Header } from '@/components/Header';
import { VisionCanvas } from '@/components/VisionCanvas';
import { RepCounterCard } from '@/components/RepCounterCard';
import { NlpMentorStudio } from '@/components/NlpMentorStudio';
import { sounds } from '@/lib/soundEffects';

export default function StudioPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [exercise, setExercise] = useState<ExerciseType>('squat');
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleBackToHome = (e: React.MouseEvent) => {
    e.preventDefault();
    sounds.playButtonClick();
    setIsExiting(true);

    setTimeout(() => {
      router.push('/');
    }, 450);
  };

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
    <div
      className={`min-h-screen bg-[#080808] bg-noise text-white flex flex-col selection:bg-neutral-700 selection:text-white transition-all duration-700 ease-out font-mono ${
        isLoaded && !isExiting
          ? 'opacity-100 scale-100 blur-0 translate-y-0'
          : 'opacity-0 scale-[0.98] blur-md translate-y-3'
      }`}
    >
      {/* Top Navbar */}
      <ZainabNavbar />

      {/* Main Studio Container */}
      <main className="max-w-6xl mx-auto w-full px-6 py-6 flex-1 flex flex-col gap-6">
        {/* Back Link Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleBackToHome}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#141416] hover:bg-neutral-800 border border-white/[0.08] text-xs text-neutral-300 hover:text-white transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="text-neutral-500 font-bold">//</span>
            <span className="uppercase tracking-widest text-[11px] text-neutral-300">Live Studio</span>
          </div>
        </div>

        {/* Elevated Matte Studio Card */}
        <div className="p-6 md:p-8 rounded-[28px] bg-[#0c0c0d] border border-white/[0.08] shadow-2xl flex flex-col gap-6 text-white">
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

        {/* AI Mentor & Q&A Studio */}
        <NlpMentorStudio
          exercise={exercise}
          repCount={repCount}
          formScore={formScore}
          warnings={warnings}
        />

        {/* Minimal Copyright Footer matching screenshot */}
        <footer className="pt-4 pb-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 border-t border-white/[0.05]">
          <span>© 2026 kinetic.online — All rights reserved.</span>
          <div className="flex items-center gap-4 text-neutral-400">
            <a href="https://github.com/tamas2006" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
            <span>•</span>
            <a href="/studio" className="hover:text-white transition-colors">Studio</a>
            <span>•</span>
            <a href="https://github.com/tamas2006" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Privacy</a>
          </div>
        </footer>
      </main>

      {/* Floating Announcement / Cookie Capsule matching screenshot */}
      {showAnnouncement && (
        <div className="fixed bottom-6 left-6 z-50 animate-fadeIn flex items-center gap-3 p-3 pl-4 rounded-2xl bg-[#0c0c0d]/95 backdrop-blur-xl border border-white/[0.12] shadow-2xl text-xs max-w-md text-neutral-300">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/10 text-white text-[10px] uppercase font-bold tracking-wider">
            <Megaphone className="w-3 h-3" />
            <span>Announcement</span>
          </div>
          <p className="text-[11px] text-neutral-300 flex-1">
            Kinetic AI v2.0 live with Groq Multimodal Vision.
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
    </div>
  );
}
