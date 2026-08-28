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
      statusColor = 'text-emerald-300 bg-emerald-500/20 border-emerald-400/40';
    } else if (angle > cfg.startThresh + 20) {
      statusText = 'Concentric Pressing Phase';
      statusColor = 'text-cyan-300 bg-cyan-500/20 border-cyan-400/40';
    } else {
      statusText = 'Starting Position';
      statusColor = 'text-slate-300 bg-white/10 border-white/20';
    }
  } else {
    depth = Math.min(100, Math.max(0, ((cfg.startThresh - angle) / (cfg.startThresh - cfg.inflectionThresh)) * 100));
    if (angle <= cfg.inflectionThresh) {
      statusText = 'Target Depth Reached • Full Rep Confirmed';
      statusColor = 'text-emerald-300 bg-emerald-500/20 border-emerald-400/40';
    } else if (angle < cfg.startThresh - 15) {
      statusText = 'Lowering Phase (Controlled Descent)';
      statusColor = 'text-amber-300 bg-amber-500/20 border-amber-400/40';
    } else {
      statusText = 'Starting Lockout';
      statusColor = 'text-slate-300 bg-white/10 border-white/20';
    }
  }

  return (
    <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto w-full">
      <div className="rounded-3xl bg-[#0B1120] border border-white/15 shadow-2xl p-6 md:p-8 flex flex-col gap-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-2xl md:text-3xl font-sans font-bold text-white">
              Interactive Angle & Depth Simulator
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Drag the angle slider below to preview joint inflection thresholds for any exercise.
            </p>
          </div>

          {/* Exercise Selector */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/60 border border-white/15">
            <select
              value={selectedEx}
              onChange={(e) => {
                sounds.playButtonClick();
                setSelectedEx(e.target.value as ExerciseType);
              }}
              className="bg-transparent text-xs font-mono font-bold text-white outline-none cursor-pointer px-3 py-1"
            >
              <option value="squat" className="bg-slate-900 text-white">Squat</option>
              <option value="bicep_curl" className="bg-slate-900 text-white">Bicep Curl</option>
              <option value="pushup" className="bg-slate-900 text-white">Push-Up</option>
              <option value="lunge" className="bg-slate-900 text-white">Lunge</option>
              <option value="shoulder_press" className="bg-slate-900 text-white">Shoulder Press</option>
            </select>
          </div>
        </div>

        {/* Main Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Interactive Angle Dial & Slider */}
          <div className="flex flex-col gap-4 p-6 rounded-2xl bg-black/40 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400">Simulated Joint Angle:</span>
              <span className="text-2xl font-mono font-black text-emerald-300">
                {angle}°
              </span>
            </div>

            <input
              type="range"
              min={selectedEx === 'shoulder_press' ? 70 : 60}
              max={180}
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>Deep Flexion ({selectedEx === 'shoulder_press' ? '70°' : '60°'})</span>
              <span>Lockout (180°)</span>
            </div>
          </div>

          {/* Real-Time Depth Response */}
          <div className="flex flex-col gap-4 p-6 rounded-2xl bg-black/40 border border-white/10 justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400">Target Depth:</span>
              <span className="text-2xl font-mono font-black text-white">
                {Math.round(depth)}%
              </span>
            </div>

            <div className="w-full bg-black/80 h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-150"
                style={{ width: `${depth}%` }}
              />
            </div>

            <div className={`px-4 py-2 rounded-xl border text-xs font-mono font-bold text-center ${statusColor}`}>
              {statusText}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
