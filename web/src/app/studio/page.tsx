'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Cookie, BarChart3 } from 'lucide-react';
import { ExerciseType } from '@/types/fitness';
import { usePoseTracker } from '@/hooks/usePoseTracker';
import { ZainabNavbar } from '@/components/ZainabNavbar';
import { Header } from '@/components/Header';
import { VisionCanvas } from '@/components/VisionCanvas';
import { RepCounterCard } from '@/components/RepCounterCard';
import { NlpMentorStudio } from '@/components/NlpMentorStudio';
import { WorkoutAnalyticsModal } from '@/components/WorkoutAnalyticsModal';
import { LaboratoryHUDToolbar } from '@/components/LaboratoryHUDToolbar';
import { ForceVelocityPowerCard } from '@/components/ForceVelocityPowerCard';
import { ClinicalReportGeneratorModal } from '@/components/ClinicalReportGeneratorModal';
import { sounds } from '@/lib/soundEffects';

export default function StudioPage() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);
  const [exercise, setExercise] = useState<ExerciseType>('squat');
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showClinicalReport, setShowClinicalReport] = useState(false);

  useEffect(() => {
    // Instant Next.js route prefetching for smooth back-navigation
    router.prefetch('/');
  }, [router]);

  const handleBackToHome = (e: React.MouseEvent) => {
    e.preventDefault();
    sounds.playButtonClick();
    setIsExiting(true);

    setTimeout(() => {
      router.push('/');
    }, 200);
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
    clinicalTelemetry,
    coachPersona,
    showGoniometer,
    showPowerVbt,
    setCoachPersona,
    setShowGoniometer,
    setShowPowerVbt,
    startCamera,
    stopCamera,
    resetReps,
    setVoiceEnabled
  } = usePoseTracker(exercise);

  return (
    <div
      className={`min-h-screen bg-[#080808] bg-noise text-white flex flex-col selection:bg-neutral-700 selection:text-white will-change-opacity transition-opacity duration-200 ease-out font-mono ${
        !isExiting ? 'opacity-100' : 'opacity-0'
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

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sounds.playButtonClick();
                setShowAnalytics(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-900 border border-white/[0.08] hover:border-white/25 text-xs text-neutral-300 hover:text-white transition-all cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Telemetry Analytics</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="text-neutral-500 font-bold">//</span>
              <span className="uppercase tracking-widest text-[11px] text-neutral-300">Live Studio</span>
            </div>
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
              {/* High-End Laboratory HUD Toolbar */}
              <LaboratoryHUDToolbar
                showGoniometer={showGoniometer}
                setShowGoniometer={setShowGoniometer}
                showPowerVbt={showPowerVbt}
                setShowPowerVbt={setShowPowerVbt}
                coachPersona={coachPersona}
                setCoachPersona={setCoachPersona}
                onOpenReport={() => setShowClinicalReport(true)}
              />

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
                telemetry={clinicalTelemetry}
                showGoniometer={showGoniometer}
                exercise={exercise}
              />

              {/* Real-Time Linear Position Transducer (VBT) & Power Card */}
              <ForceVelocityPowerCard
                velocityMps={clinicalTelemetry.barVelocityMps}
                peakPowerWatts={clinicalTelemetry.peakPowerWatts}
                fatiguePercent={clinicalTelemetry.fatigueIndexPercent}
                concentricSec={repHistory[0]?.concentricSec || 0.5}
                eccentricSec={repHistory[0]?.eccentricSec || 0.8}
                isEnabled={showPowerVbt}
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

        {/* Minimal Solo Builder Footer */}
        <footer className="pt-4 pb-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 border-t border-white/[0.05]">
          <span>© 2026 kinetic.online — Built by Tamas</span>
          <div className="flex items-center gap-4 text-neutral-400">
            <a href="https://github.com/tamas2006" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
            <span>•</span>
            <a href="/" className="hover:text-white transition-colors">Home</a>
            <span>•</span>
            <a href="/studio" className="hover:text-white transition-colors">Studio</a>
          </div>
        </footer>
      </main>

      {/* Floating Cookie Consent Capsule matching screenshot */}
      {showAnnouncement && (
        <div className="fixed bottom-6 left-6 z-50 animate-fadeIn flex items-center gap-3 p-3 pl-4 rounded-2xl bg-[#0c0c0d]/95 backdrop-blur-xl border border-white/[0.12] shadow-2xl text-xs max-w-md text-neutral-300 font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-white text-[10px] uppercase font-bold tracking-wider">
            <Cookie className="w-3 h-3" />
            <span>Cookies</span>
          </div>
          <p className="text-[11px] text-neutral-300 flex-1 leading-tight">
            We use one cookie for <strong className="text-white font-bold">anonymous site analytics</strong>. Reject keeps you fully untracked.
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowAnnouncement(false)}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-bold cursor-pointer transition-colors"
            >
              Reject
            </button>
            <button
              onClick={() => setShowAnnouncement(false)}
              className="px-3 py-1.5 rounded-lg bg-white text-black text-[11px] font-bold cursor-pointer hover:bg-neutral-200 transition-colors"
            >
              Accept
            </button>
          </div>
        </div>
      )}

      {/* Workout Analytics & Telemetry Modal */}
      <WorkoutAnalyticsModal
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        repHistory={repHistory}
        exercise={exercise}
      />

      {/* Clinical Diagnostic PDF Report Generator Modal */}
      <ClinicalReportGeneratorModal
        isOpen={showClinicalReport}
        onClose={() => setShowClinicalReport(false)}
        exercise={exercise}
        repHistory={repHistory}
        telemetry={clinicalTelemetry}
        formScore={formScore}
      />
    </div>
  );
}
