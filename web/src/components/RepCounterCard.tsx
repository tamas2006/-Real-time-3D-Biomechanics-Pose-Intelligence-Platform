'use client';

import React from 'react';
import { RepMetric } from '@/types/fitness';

interface RepCounterCardProps {
  repCount: number;
  validReps: number;
  depthPercentage: number;
  repHistory: RepMetric[];
}

export const RepCounterCard: React.FC<RepCounterCardProps> = ({
  repCount,
  validReps,
  depthPercentage,
  repHistory
}) => {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (depthPercentage / 100) * circumference;

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* 1. TRANSLUCENT OBSIDIAN STATS CARD (Tamas-Ingle Style) */}
      <div className="p-6 rounded-[32px] bg-[#0B1120]/75 border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-2xl flex items-center justify-between text-white">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-[10px] font-mono tracking-widest uppercase text-slate-300 mb-3 shadow-inner">
            <span className="w-2 h-2 rounded-full warm-glow-dot animate-pulse" />
            <span>PHYSICAL REPETITIONS // VERIFIED</span>
          </div>

          <div className="flex items-baseline gap-4">
            {/* Split Flap Glowing Number Display */}
            <div className="px-5 py-2.5 rounded-2xl bg-black/60 text-white font-mono font-black text-5xl tracking-tight shadow-xl border border-white/20">
              {repCount < 10 ? `0${repCount}` : repCount}
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-mono font-bold text-amber-200 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-300/40 w-max shadow-sm">
                {validReps} Verified
              </span>
              <span className="text-[10px] font-mono text-slate-400 mt-1">100% Full ROM Gate</span>
            </div>
          </div>
        </div>

        {/* Circular Dial Depth Gauge */}
        <div className="relative flex items-center justify-center w-24 h-24">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="7"
              fill="transparent"
            />
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="#FEF08A"
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-100 drop-shadow-[0_0_8px_#FEF08A]"
            />
          </svg>
          <div className="absolute font-mono text-sm font-black text-amber-200">
            {depthPercentage}%
          </div>
        </div>
      </div>

      {/* 2. KINETIC TEMPO TELEMETRY METERS */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-[#0B1120]/75 border border-white/20 shadow-lg backdrop-blur-2xl flex flex-col justify-between">
          <div className="text-slate-400 text-xs mb-1 font-mono uppercase">
            <span className="text-[10px]">ECC / CON TEMPO</span>
          </div>
          <div className="font-mono text-xl font-bold text-white">
            {repHistory[0] ? `${repHistory[0].eccentricSec}s : ${repHistory[0].concentricSec}s` : '-- : --'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B1120]/75 border border-white/20 shadow-lg backdrop-blur-2xl flex flex-col justify-between">
          <div className="text-slate-400 text-xs mb-1 font-mono uppercase">
            <span className="text-[10px]">LAST DURATION</span>
          </div>
          <div className="font-mono text-xl font-bold text-white">
            {repHistory[0] ? `${repHistory[0].durationSec}s` : '0.0s'}
          </div>
        </div>
      </div>

      {/* 3. VERIFIED MOVEMENT AUDIT LOG */}
      <div className="p-5 rounded-[28px] bg-[#0B1120]/75 border border-white/20 shadow-lg backdrop-blur-2xl flex-1 flex flex-col min-h-[220px]">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <span className="text-xs font-mono uppercase font-bold text-slate-300">
            Verified Movement Log
          </span>
          <span className="text-[10px] font-mono text-slate-400 bg-white/10 px-2 py-0.5 rounded-full border border-white/15">
            {repHistory.length} Logged
          </span>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2 max-h-[160px] pr-1">
          {repHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center my-auto text-slate-400 text-center gap-2 py-4">
              <p className="text-xs font-mono max-w-xs leading-relaxed text-slate-400">
                Complete your first repetition to record tempo & cadence telemetry.
              </p>
            </div>
          ) : (
            repHistory.map((rep, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white animate-fadeIn hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-200 text-[10px] flex items-center justify-center font-bold">
                    #{rep.repNumber}
                  </span>
                  <span>{rep.durationSec}s Total</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">{rep.eccentricSec}s down</span>
                  <span className="text-amber-200 font-bold">{rep.formScore}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
