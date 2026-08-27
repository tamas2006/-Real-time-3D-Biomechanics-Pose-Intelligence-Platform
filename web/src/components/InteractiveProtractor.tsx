'use client';

import React, { useState } from 'react';
import { ExerciseType } from '@/types/fitness';
import { EXERCISE_CONFIGS } from '@/lib/kinematics';
import { sounds } from '@/lib/soundEffects';

export const InteractiveProtractor: React.FC = () => {
  const [selectedEx, setSelectedEx] = useState<ExerciseType>('squat');
  const [angle, setAngle] = useState(110);

  const cfg = EXERCISE_CONFIGS[selectedEx];

  let depth = 0;
  let statusText = '';
  let statusColor = '';

  if (selectedEx === 'shoulder_press') {
    depth = Math.min(100, Math.max(0, ((angle - cfg.startThresh) / (cfg.inflectionThresh - cfg.startThresh)) * 100));
    if (angle >= cfg.inflectionThresh - 10) {
      statusText = 'Full Lockout Overhead • Rep Complete';
      statusColor = 'text-amber-200 bg-amber-500/20 border-amber-400/40';
    } else if (angle > cfg.startThresh + 20) {
      statusText = 'Concentric Pressing Phase';
      statusColor = 'text-cyan-300 bg-cyan-500/20 border-cyan-400/40';
    } else {
      statusText = 'Start / Rack Position';
      statusColor = 'text-slate-300 bg-white/10 border-white/20';
    }
  } else {
    depth = Math.min(100, Math.max(0, ((cfg.startThresh - angle) / (cfg.startThresh - cfg.inflectionThresh)) * 100));
    if (angle <= cfg.inflectionThresh) {
      statusText = 'Target Depth Reached • Optimal Muscular Recruitment';
      statusColor = 'text-amber-200 bg-amber-500/20 border-amber-400/40';
    } else if (angle < cfg.startThresh - 15) {
      statusText = 'Eccentric Descent Phase (Control Velocity)';
      statusColor = 'text-amber-300 bg-amber-500/20 border-amber-400/40';
    } else {
      statusText = 'Standing / Starting Lockout';
      statusColor = 'text-slate-300 bg-white/10 border-white/20';
    }
  }

  return (
    <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto w-full">
      {/* Mac Terminal Window Card Container */}
      <div className="rounded-[36px] bg-[#0B1120] border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.4)] overflow-hidden">
        {/* Top Mac Window Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-black/50 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
          </div>
          <span className="text-xs font-mono text-slate-400 tracking-widest uppercase font-bold">
            PROTRACTOR.LAB // KINEMATICS.AI
          </span>
          <div className="flex items-center gap-2 text-[11px] font-mono text-amber-200">
            <span className="w-2 h-2 rounded-full warm-glow-dot animate-pulse" />
            <span>SIMULATION ACTIVE</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-8 md:p-12 flex flex-col gap-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="text-cyan-400 font-mono text-xs font-bold tracking-widest uppercase mb-2">
                <span>INTERACTIVE BIOMECHANICS SIMULATOR</span>
              </div>
              <h3 className="text-3xl md:text-5xl font-serif tracking-tight text-white">
                Kinematic Angle <span className="italic text-amber-200">Protractor</span>
              </h3>
            </div>

            {/* Exercise Selector Pills */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-full bg-black/40 border border-white/10">
              {(['squat', 'pushup', 'bicep_curl', 'shoulder_press'] as ExerciseType[]).map((ex) => (
                <button
                  key={ex}
                  onClick={() => {
                    sounds.playButtonClick();
                    setSelectedEx(ex);
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase transition-all ${
                    selectedEx === ex
                      ? 'bg-white text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {ex.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Simulation Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white/[0.03] p-8 rounded-3xl border border-white/10">
            {/* Left: Huge Angle Readout */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-black/50 border border-white/15 text-center">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">
                SIMULATED PRIMARY ANGLE
              </span>
              <span className="text-6xl font-black font-mono text-amber-200 drop-shadow-[0_0_15px_rgba(254,240,138,0.4)]">
                {angle}°
              </span>
              <span className={`mt-3 px-3 py-1 rounded-full text-[11px] font-mono border ${statusColor}`}>
                {statusText}
              </span>
            </div>

            {/* Right: Interactive Slider & Range Bar */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-2">
                  <span className="uppercase">Adjust Joint Angle:</span>
                  <span className="font-bold text-white">{angle} Degrees</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="180"
                  value={angle}
                  onChange={(e) => setAngle(parseInt(e.target.value))}
                  className="w-full h-3 bg-black/60 rounded-lg appearance-none cursor-pointer accent-amber-300 border border-white/20"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                  <span>40° (Deep Peak)</span>
                  <span>110° (Inflection)</span>
                  <span>180° (Full Lockout)</span>
                </div>
              </div>

              {/* Range of Motion Meter */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-300">
                  <span>Muscular Recruitment Depth:</span>
                  <span className="font-bold text-amber-200">{Math.round(depth)}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-black/60 overflow-hidden p-0.5 border border-white/20">
                  <div
                    className="h-full bg-gradient-to-r from-amber-200 to-yellow-400 rounded-full transition-all duration-100 shadow-[0_0_12px_rgba(254,240,138,0.8)]"
                    style={{ width: `${depth}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
