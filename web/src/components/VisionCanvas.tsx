'use client';

import React, { useState, useRef } from 'react';
import { MovementPhase, ClinicalTelemetry } from '@/types/fitness';
import { sounds } from '@/lib/soundEffects';
import { Camera, X, CheckCircle2 } from 'lucide-react';
import { ClinicalGoniometerHUD } from '@/components/ClinicalGoniometerHUD';

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
  telemetry?: ClinicalTelemetry;
  showGoniometer?: boolean;
  exercise?: string;
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
  warnings,
  telemetry,
  showGoniometer = true,
  exercise = 'squat'
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
      className="relative rounded-none overflow-hidden bg-black border border-[#222222] flex flex-col items-center justify-center min-h-[420px] aspect-video w-full font-mono"
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
          className="w-full h-full object-contain rounded-none"
        />

        {/* Clean Standby Screen */}
        {!isStreaming && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-6 bg-black/90">
            <h4 className="text-sm font-mono font-bold text-white uppercase tracking-widest">
              Camera Offline
            </h4>
            <p className="text-xs text-neutral-500 max-w-xs">
              Click Start Camera to begin real-time kinematic tracking.
            </p>
          </div>
        )}

        {/* Top Status Bar */}
        {isStreaming && (
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto z-20">
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-1 rounded-none bg-black/80 border border-[#333333] text-[11px] font-mono font-bold text-white">
                LIVE • {fps} FPS
              </div>
              <div className={`px-2.5 py-1 rounded-none border text-[11px] font-mono font-bold uppercase ${stageColor}`}>
                {stageLabel}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleFullscreen}
                className="px-3 py-1 rounded-none bg-black/80 hover:bg-black border border-[#333333] text-[11px] font-bold text-white transition-colors cursor-pointer uppercase"
              >
                {isFullscreen ? 'Exit Full' : 'Fullscreen'}
              </button>
            </div>
          </div>
        )}

        {/* Spatial Goniometer HUD Overlay */}
        {isStreaming && telemetry && (
          <ClinicalGoniometerHUD
            telemetry={telemetry}
            exercise={exercise}
            isEnabled={showGoniometer}
          />
        )}

        {/* Live Warning Banner */}
        {warnings.length > 0 && isStreaming && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 pointer-events-none z-20">
            <div className="px-3 py-1 rounded-none bg-black text-rose-400 font-mono text-xs font-bold uppercase tracking-wider border border-rose-500/40 shadow-lg">
              {warnings[0]}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
