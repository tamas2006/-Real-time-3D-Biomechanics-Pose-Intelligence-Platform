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
      className={`min-h-screen bg-black text-white flex flex-col selection:bg-neutral-800 selection:text-white font-mono ${
        !isExiting ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Top Navbar */}
      <ZainabNavbar />

      {/* Main Studio Container */}
      <main className="max-w-6xl mx-auto w-full px-4 py-4 flex-1 flex flex-col gap-4">
        {/* Back & Controls Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToHome}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-black hover:bg-neutral-900 border border-[#333333] text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer rounded-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sounds.playButtonClick();
                setShowAnalytics(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-black border border-[#333333] hover:border-white text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer rounded-none"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>
          </div>
        </div>

        {/* Sharp Studio Workspace Frame */}
        <div className="p-4 md:p-5 rounded-none bg-[#0a0a0a] border border-[#222222] flex flex-col gap-4 text-white">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Vision Viewfinder Area (8 Columns) */}
            <div className="lg:col-span-8 flex flex-col gap-3">
              {/* Laboratory HUD Toolbar */}
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

        {/* Minimal Solo Builder Footer */}
        <footer className="pt-4 pb-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-600 border-t border-[#1a1a1a]">
          <span>© 2026 kinetic.online</span>
          <div className="flex items-center gap-4 text-neutral-500">
            <a href="https://github.com/tamas2006" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
            <span>•</span>
            <a href="/" className="hover:text-white transition-colors">Home</a>
            <span>•</span>
            <a href="/studio" className="hover:text-white transition-colors">Studio</a>
          </div>
        </footer>
      </main>

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
