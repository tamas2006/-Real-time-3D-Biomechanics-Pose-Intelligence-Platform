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

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${apiUrl}/api/mentor/vision-diagnostic`, {
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
    stageColor = 'bg-white text-black border-white font-black';
  } else if (phase === 'eccentric') {
    stageLabel = 'LOWERING';
    stageColor = 'bg-white/20 text-white border-white/40';
  } else if (phase === 'concentric') {
    stageLabel = 'DRIVING UP';
    stageColor = 'bg-white/30 text-white border-white/60';
  }

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl overflow-hidden bg-black border border-white/[0.08] shadow-2xl flex flex-col items-center justify-center min-h-[420px] aspect-video w-full font-mono"
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
          className="w-full h-full object-contain rounded-2xl"
        />

        {/* Clean Standby Screen */}
        {!isStreaming && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center p-8 bg-black/85 backdrop-blur-md">
            <h4 className="text-xl sm:text-2xl font-mono font-bold text-white uppercase tracking-wider">
              // Camera Viewfinder
            </h4>
            <p className="text-xs text-neutral-400 max-w-sm">
              Click <strong className="text-white font-bold">&quot;Start Camera&quot;</strong> above to begin real-time repetition tracking and multimodal AI vision.
            </p>
          </div>
        )}

        {/* Top HUD Bar */}
        {isStreaming && (
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto z-20">
            <div className="flex items-center gap-2">
              <div className="px-3.5 py-1 rounded-lg bg-black/70 border border-white/20 text-xs font-mono font-bold text-white backdrop-blur-md">
                LIVE • {fps} FPS
              </div>
              <div className={`px-3.5 py-1 rounded-lg border text-xs font-mono font-bold uppercase transition-all backdrop-blur-md ${stageColor}`}>
                {stageLabel}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Multimodal AI Vision Snapshot Button */}
              <button
                onClick={captureVisionDiagnostic}
                disabled={isAnalyzingVision}
                className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isAnalyzingVision ? 'Scanning...' : 'AI Vision Scan'}</span>
              </button>

              <button
                onClick={toggleFullscreen}
                className="px-3 py-1.5 rounded-lg bg-black/70 hover:bg-black/90 border border-white/20 text-xs font-mono font-bold text-white transition-all cursor-pointer backdrop-blur-md uppercase"
              >
                {isFullscreen ? 'Exit Full' : 'Fullscreen'}
              </button>
            </div>
          </div>
        )}

        {/* Live Warning Banner */}
        {warnings.length > 0 && isStreaming && !visionResult && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none z-20">
            <div className="px-4 py-1.5 rounded-lg bg-[#0c0c0d] text-white font-mono text-xs font-bold uppercase tracking-wider shadow-xl border border-white/40">
              {warnings[0]}
            </div>
          </div>
        )}

        {/* Multimodal AI Vision Diagnostic Modal Card */}
        {visionResult && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl z-30 p-6 flex flex-col items-center justify-center text-white animate-fadeIn">
            <div className="relative max-w-lg w-full p-6 rounded-2xl bg-[#0c0c0d] border border-white/[0.15] shadow-2xl flex flex-col gap-4">
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2 text-white font-mono text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Kinetic AI Multimodal Vision Analysis</span>
                </div>
                <button
                  onClick={() => setVisionResult(null)}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Snapshot Thumbnail + Visual Assessment */}
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {visionResult.snapshotUrl && (
                  <div className="w-28 h-28 rounded-xl overflow-hidden border border-white/20 shadow-md flex-shrink-0 bg-black">
                    <img
                      src={visionResult.snapshotUrl}
                      alt="Analyzed Frame"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-2 flex-1">
                  <span className="text-[10px] font-mono uppercase text-neutral-400">Visual Posture Assessment:</span>
                  <p className="text-xs text-neutral-200 leading-relaxed font-mono">
                    {visionResult.assessment}
                  </p>
                </div>
              </div>

              {/* Actionable Form Correction Box */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/15 flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold">Actionable Coaching Cue:</span>
                <p className="text-xs text-white font-mono font-medium">
                  {visionResult.correction}
                </p>
              </div>

              {/* Close / Continue Button */}
              <button
                onClick={() => setVisionResult(null)}
                className="w-full py-2.5 rounded-lg bg-white hover:bg-neutral-200 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
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
