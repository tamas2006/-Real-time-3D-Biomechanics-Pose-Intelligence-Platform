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
  warnings,
  aiDetected,
  aiConfidence
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

  let stageLabel = 'EXTENDED // READY';
  let stageColor = 'bg-white/20 text-white border-white/40 shadow-sm';

  if (phase === 'inflection') {
    stageLabel = 'DEEP DEPTH // HOLD';
    stageColor = 'bg-emerald-400/30 text-emerald-200 border-emerald-300/70 shadow-[0_0_20px_rgba(52,211,153,0.6)] animate-pulse';
  } else if (phase === 'eccentric') {
    stageLabel = 'LOWERING // DOWN';
    stageColor = 'bg-amber-400/30 text-amber-200 border-amber-300/60';
  } else if (phase === 'concentric') {
    stageLabel = 'DRIVING // UP';
    stageColor = 'bg-cyan-400/30 text-cyan-200 border-cyan-300/60';
  }

  return (
    <div className="w-full glow-moving-border">
      {/* Liquid Acrylic Plastic Glass Viewfinder Container */}
      <div
        ref={containerRef}
        className="relative w-full h-[580px] acrylic-glass rounded-[38px] overflow-hidden flex items-center justify-center select-none"
      >
        {/* Top Glossy Beveled Light Reflection Sheen */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/30 via-white/5 to-transparent pointer-events-none z-10" />

        {/* Hidden Video Capture Feed */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="absolute top-0 left-0 w-1 h-1 opacity-0 pointer-events-none"
        />

        {/* 1:1 Hardware-Accelerated Output Canvas */}
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain rounded-[38px]"
        />

        {/* Liquid Crystal Standby Graphic */}
        {!isStreaming && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-center p-8 bg-gradient-to-b from-white/25 via-blue-900/40 to-slate-950/80 backdrop-blur-2xl">
            <div className="max-w-md">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full acrylic-glass text-[10px] font-mono tracking-widest uppercase text-white mb-3 shadow-md border border-white/40">
                <span className="w-2 h-2 rounded-full warm-glow-dot animate-pulse" />
                <span>AI VISION SENSOR // READY</span>
              </div>
              <h4 className="text-3xl sm:text-4xl font-serif text-white tracking-wide drop-shadow-md">
                Optical Biomechanics Lens
              </h4>
              <p className="text-xs font-open-sans italic text-slate-100 mt-2 leading-relaxed drop-shadow">
                Click <strong className="text-white underline decoration-amber-200 font-bold">&quot;START CAMERA&quot;</strong> above to initialize 60 FPS 3D spatial keypoint extraction.
              </p>
            </div>

            <div className="flex items-center gap-3 font-mono text-[10px] text-amber-100 uppercase tracking-widest bg-black/20 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-md">
              <span>33 3D Keypoints</span>
              <span>•</span>
              <span>1:1 Sub-Pixel Lock</span>
              <span>•</span>
              <span>175K AI Model</span>
            </div>
          </div>
        )}

        {/* Top Liquid Glass Navigation Pill Bar */}
        <div className="absolute top-5 left-6 right-6 flex items-center justify-between pointer-events-auto z-20">
          <div className="flex items-center gap-2.5">
            {/* Live Recording Capsule */}
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full acrylic-glass border border-white/50 shadow-lg">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isStreaming ? 'warm-glow-dot animate-pulse' : 'bg-slate-300'
                }`}
              />
              <span className="text-[10px] font-open-sans italic font-bold uppercase tracking-wider text-white">
                {isStreaming ? 'REC • 60 FPS' : 'STANDBY'}
              </span>
            </div>

            {/* AI Exercise Classifier Capsule */}
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full acrylic-glass border border-white/50 shadow-lg">
              <span className="text-[11px] font-open-sans italic font-bold uppercase text-white">
                AI: {aiDetected}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/20 text-white font-bold border border-white/30">
                {aiConfidence}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Movement Stage Capsule */}
            <div className={`px-5 py-1.5 rounded-full border backdrop-blur-2xl text-[11px] font-open-sans italic font-bold uppercase tracking-wider transition-all shadow-lg ${stageColor}`}>
              {stageLabel}
            </div>

            {/* Fullscreen Text Button */}
            <button
              onClick={toggleFullscreen}
              className="px-3.5 py-1.5 rounded-full acrylic-glass hover:bg-white/30 border border-white/60 text-[10px] font-mono font-bold uppercase text-white shadow-lg transition-all active:scale-90"
            >
              {isFullscreen ? 'EXIT FULL' : 'FULLSCREEN'}
            </button>
          </div>
        </div>

        {/* Live Form Guidance Warning Banner */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none z-20 transition-all duration-300">
          {warnings.length > 0 ? (
            <div className="flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-amber-400 text-slate-950 font-open-sans italic text-xs font-bold uppercase tracking-wider shadow-2xl animate-bounce border-2 border-white">
              <span>{warnings[0]}</span>
            </div>
          ) : isStreaming ? (
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full acrylic-glass border border-emerald-300/60 shadow-lg">
              <span className="text-[11px] font-open-sans italic font-bold uppercase tracking-wider text-emerald-100">
                Kinetic Alignment: Optimal
              </span>
            </div>
          ) : null}
        </div>

        {/* Bottom Liquid Plastic Glass Telemetry Bar */}
        <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between p-4 sm:p-5 rounded-[28px] acrylic-glass border-2 border-white/60 pointer-events-none z-20 shadow-2xl">
          {/* Joint Angle Column */}
          <div className="flex-1 flex flex-col items-center border-r border-white/25 px-2">
            <span className="text-[10px] font-open-sans italic uppercase tracking-widest text-slate-200 font-bold">
              JOINT ANGLE
            </span>
            <span className="text-3xl font-black font-mono text-white drop-shadow-md mt-0.5">
              {primaryAngle > 0 ? `${primaryAngle}°` : '--°'}
            </span>
          </div>

          {/* Range of Motion Column */}
          <div className="flex-[1.6] flex flex-col items-center border-r border-white/25 px-4 sm:px-6">
            <div className="flex items-center justify-between w-full mb-1.5 text-[10px] font-open-sans italic uppercase tracking-widest text-slate-200 font-bold">
              <span>RANGE OF MOTION</span>
              <span className="text-amber-200 font-black font-mono">{depthPercentage}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-black/30 overflow-hidden p-0.5 shadow-inner border border-white/30">
              <div
                className="h-full bg-gradient-to-r from-amber-200 to-yellow-400 rounded-full transition-all duration-75 shadow-[0_0_12px_rgba(254,240,138,0.8)]"
                style={{ width: `${depthPercentage}%` }}
              />
            </div>
          </div>

          {/* Form Score Column */}
          <div className="flex-1 flex flex-col items-center px-2">
            <span className="text-[10px] font-open-sans italic uppercase tracking-widest text-slate-200 font-bold">
              FORM SCORE
            </span>
            <span
              className={`text-3xl font-black font-mono drop-shadow-md mt-0.5 ${
                formScore >= 80 ? 'text-emerald-300' : formScore >= 60 ? 'text-amber-300' : 'text-red-300'
              }`}
            >
              {formScore}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
