'use client';

import React, { useState, useRef } from 'react';
import { MovementPhase } from '@/types/fitness';
import { sounds } from '@/lib/soundEffects';
import { Camera, X, CheckCircle2 } from 'lucide-react';

interface VisionCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isStreaming: boolean;
  fps: number;
  phase: MovementPhase;
  primaryAngle: number;
  depthPercentage: number;
  formScore: number;
  warnings: string[];
  aiDetected?: string;
  aiConfidence?: number;
}

interface VisionResult {
  assessment: string;
  correction: string;
  score: number;
  model: string;
  snapshotUrl?: string;
}

export const VisionCanvas: React.FC<VisionCanvasProps> = ({
  videoRef,
  canvasRef,
  isStreaming,
  fps,
  phase,
  primaryAngle,
  depthPercentage,
  formScore,
  warnings
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAnalyzingVision, setIsAnalyzingVision] = useState(false);
  const [visionResult, setVisionResult] = useState<VisionResult | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const toggleFullscreen = () => {
    sounds.playButtonClick();
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {});
    }
  };

  const captureVisionDiagnostic = async () => {
    if (!canvasRef.current || isAnalyzingVision) return;
    sounds.playButtonClick();
    setIsAnalyzingVision(true);

    try {
      const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.85);

      const res = await fetch('http://127.0.0.1:8000/api/mentor/vision-diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_b64: dataUrl,
          exercise: 'squat',
          angle: primaryAngle,
          warnings: warnings
        })
      });

      if (res.ok) {
        const data = await res.json();
        setVisionResult({
          assessment: data.assessment,
          correction: data.correction,
          score: data.score || 90,
          model: data.model || 'Kinetic AI Multimodal Vision',
          snapshotUrl: dataUrl
        });
      }
    } catch (e) {
      console.error('Vision diagnostic error:', e);
    } finally {
      setIsAnalyzingVision(false);
    }
  };

  let stageLabel = 'READY';
  let stageColor = 'bg-white/10 text-white border-white/20';

  if (phase === 'inflection') {
    stageLabel = 'DEEP DEPTH';
    stageColor = 'bg-white/20 text-white border-white/40';
  } else if (phase === 'eccentric') {
    stageLabel = 'LOWERING';
    stageColor = 'bg-amber-500/20 text-amber-200 border-amber-400/40';
  } else if (phase === 'concentric') {
    stageLabel = 'DRIVING UP';
    stageColor = 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40';
  }

  return (
    <div
      ref={containerRef}
      className="relative rounded-3xl overflow-hidden bg-black border border-white/15 shadow-2xl flex flex-col items-center justify-center min-h-[420px] aspect-video w-full"
    >
      {/* 1:1 Camera Output Canvas */}
      <div className="relative w-full h-full flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="absolute top-0 left-0 w-1 h-1 opacity-0 pointer-events-none"
        />

        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain rounded-3xl"
        />

        {/* Clean Standby Screen */}
        {!isStreaming && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center p-8 bg-black/80 backdrop-blur-md">
            <h4 className="text-2xl sm:text-3xl font-sans font-bold text-white">
              Camera Viewfinder
            </h4>
            <p className="text-sm text-slate-300 max-w-sm">
              Click <strong className="text-white font-bold">&quot;Start Camera&quot;</strong> above to begin real-time repetition tracking and multimodal AI vision.
            </p>
          </div>
        )}

        {/* Top HUD Bar */}
        {isStreaming && (
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto z-20">
            <div className="flex items-center gap-2">
              <div className="px-3.5 py-1 rounded-full bg-black/60 border border-white/20 text-xs font-mono font-bold text-white backdrop-blur-md">
                LIVE • {fps} FPS
              </div>
              <div className={`px-4 py-1 rounded-full border text-xs font-mono font-bold uppercase transition-all backdrop-blur-md ${stageColor}`}>
                {stageLabel}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Multimodal AI Vision Snapshot Button */}
              <button
                onClick={captureVisionDiagnostic}
                disabled={isAnalyzingVision}
                className="px-3.5 py-1.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-xs font-mono font-bold text-cyan-200 transition-all flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer disabled:opacity-50 backdrop-blur-md"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isAnalyzingVision ? 'Analyzing Frame...' : 'AI Vision Scan'}</span>
              </button>

              <button
                onClick={toggleFullscreen}
                className="px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-xs font-mono font-bold text-white transition-all cursor-pointer backdrop-blur-md"
              >
                {isFullscreen ? 'EXIT FULL' : 'FULLSCREEN'}
              </button>
            </div>
          </div>
        )}

        {/* Live Warning Banner */}
        {warnings.length > 0 && isStreaming && !visionResult && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none z-20">
            <div className="px-5 py-2 rounded-full bg-amber-400 text-black font-sans text-xs font-black uppercase tracking-wide shadow-xl border border-white">
              {warnings[0]}
            </div>
          </div>
        )}

        {/* Multimodal AI Vision Diagnostic Modal Card */}
        {visionResult && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-xl z-30 p-6 flex flex-col items-center justify-center text-white animate-fadeIn">
            <div className="relative max-w-lg w-full p-6 rounded-3xl bg-[#0B1120] border border-cyan-400/40 shadow-[0_0_40px_rgba(0,229,255,0.25)] flex flex-col gap-4">
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>Kinetic AI Multimodal Vision Analysis</span>
                </div>
                <button
                  onClick={() => setVisionResult(null)}
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Snapshot Thumbnail + Visual Assessment */}
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {visionResult.snapshotUrl && (
                  <div className="w-28 h-28 rounded-2xl overflow-hidden border border-cyan-400/50 shadow-md flex-shrink-0 bg-black">
                    <img
                      src={visionResult.snapshotUrl}
                      alt="Analyzed Frame"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-2 flex-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Visual Posture Assessment:</span>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {visionResult.assessment}
                  </p>
                </div>
              </div>

              {/* Actionable Form Correction Box */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/15 flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold">Actionable Coaching Cue:</span>
                <p className="text-xs text-white font-sans font-medium">
                  {visionResult.correction}
                </p>
              </div>

              {/* Close / Continue Button */}
              <button
                onClick={() => setVisionResult(null)}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-200 text-black font-sans font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Continue Workout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
