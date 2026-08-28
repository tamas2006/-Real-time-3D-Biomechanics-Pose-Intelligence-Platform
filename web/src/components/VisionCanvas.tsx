'use client';

import React, { useState, useRef } from 'react';
import { MovementPhase } from '@/types/fitness';
import { sounds } from '@/lib/soundEffects';

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
  aiDetected: string;
  aiConfidence: number;
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

  let stageLabel = 'READY';
  let stageColor = 'bg-white/10 text-white border-white/20';

  if (phase === 'inflection') {
    stageLabel = 'DEEP DEPTH';
    stageColor = 'bg-emerald-500/30 text-emerald-200 border-emerald-400';
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
              Click <strong className="text-white font-bold">&quot;Start Camera&quot;</strong> above to begin real-time repetition tracking and audio coaching.
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

            <button
              onClick={toggleFullscreen}
              className="px-3.5 py-1 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-xs font-mono font-bold text-white transition-all"
            >
              {isFullscreen ? 'EXIT FULL' : 'FULLSCREEN'}
            </button>
          </div>
        )}

        {/* Live Warning Banner */}
        {warnings.length > 0 && isStreaming && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none z-20">
            <div className="px-5 py-2 rounded-full bg-amber-400 text-black font-sans text-xs font-black uppercase tracking-wide shadow-xl border border-white">
              {warnings[0]}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
