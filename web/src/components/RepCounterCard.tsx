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
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (depthPercentage / 100) * circumference;

  return (
    <div className="flex flex-col gap-3.5 h-full font-mono">
      {/* 1. REPETITIONS & DEPTH CARD */}
      <div className="p-5 rounded-2xl bg-[#0e0e0f] border border-white/[0.08] shadow-xl flex items-center justify-between text-white">
        <div>
          <div className="text-[11px] uppercase text-neutral-400 font-bold mb-2 flex items-center gap-2">
            <span className="text-neutral-500">//</span>
            <span>COMPLETED REPS</span>
          </div>

          <div className="flex items-baseline gap-3">
            <div className="px-4 py-1.5 rounded-xl bg-[#080808] text-white font-black text-4xl tracking-tight border border-white/[0.08]">
              {repCount < 10 ? `0${repCount}` : repCount}
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-400/20 w-max">
                {validReps} Verified
              </span>
              <span className="text-[10px] text-neutral-500 mt-1">Full Range Required</span>
            </div>
          </div>
        </div>

        {/* Circular Depth Gauge */}
        <div className="relative flex items-center justify-center w-20 h-20">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="#10B981"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-100"
            />
          </svg>
          <div className="absolute text-xs font-black text-white">
            {depthPercentage}%
          </div>
        </div>
      </div>

      {/* 2. TEMPO STATS */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-[#0e0e0f] border border-white/[0.08] flex flex-col justify-between">
          <div className="text-neutral-400 text-[10px] mb-1 uppercase tracking-wider">
            TEMPO (ECC : CON)
          </div>
          <div className="text-sm font-bold text-white">
            {repHistory[0] ? `${repHistory[0].eccentricSec}s : ${repHistory[0].concentricSec}s` : '-- : --'}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0e0e0f] border border-white/[0.08] flex flex-col justify-between">
          <div className="text-neutral-400 text-[10px] mb-1 uppercase tracking-wider">
            LAST DURATION
          </div>
          <div className="text-sm font-bold text-white">
            {repHistory[0] ? `${repHistory[0].durationSec}s` : '0.0s'}
          </div>
        </div>
      </div>

      {/* 3. REP LOG */}
      <div className="p-4 rounded-2xl bg-[#0e0e0f] border border-white/[0.08] shadow-xl flex-1 flex flex-col min-h-[160px]">
        <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08] mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 font-bold">//</span>
            <span className="text-[11px] uppercase font-bold text-neutral-300">
              ACTIVITY STREAM
            </span>
          </div>
          <span className="text-[10px] text-neutral-500">Live Telemetry</span>
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto max-h-[160px] pr-1">
          {repHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center my-auto text-neutral-500 py-6 text-center text-xs">
              <span>Ready for rep 01</span>
              <span className="text-[10px] text-neutral-600 mt-1">Camera active and monitoring</span>
            </div>
          ) : (
            repHistory.map((r, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-[#080808] border border-white/[0.05] text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-neutral-200">Rep #{r.repNumber}</span>
                  <span className="text-neutral-500">•</span>
                  <span className="text-neutral-400">{r.durationSec}s</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  r.formScore >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-400/20' : 'bg-rose-500/10 text-rose-400 border border-rose-400/20'
                }`}>
                  {r.formScore}% Score
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
