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
      {/* 1. REPETITIONS & DEPTH CARD */}
      <div className="p-6 rounded-3xl bg-[#0B1120] border border-white/15 shadow-xl flex items-center justify-between text-white">
        <div>
          <div className="text-xs font-mono uppercase text-slate-400 font-bold mb-2">
            Completed Reps
          </div>

          <div className="flex items-baseline gap-3">
            <div className="px-5 py-2 rounded-2xl bg-black/60 text-white font-mono font-black text-5xl tracking-tight border border-white/15">
              {repCount < 10 ? `0${repCount}` : repCount}
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30 w-max">
                {validReps} Verified
              </span>
              <span className="text-[10px] font-mono text-slate-400 mt-1">Full ROM Required</span>
            </div>
          </div>
        </div>

        {/* Circular Depth Gauge */}
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
              stroke="#10B981"
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-100"
            />
          </svg>
          <div className="absolute font-mono text-sm font-black text-white">
            {depthPercentage}%
          </div>
        </div>
      </div>

      {/* 2. TEMPO STATS */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-[#0B1120] border border-white/15 flex flex-col justify-between">
          <div className="text-slate-400 text-xs mb-1 font-mono uppercase">
            TEMPO (ECC : CON)
          </div>
          <div className="font-mono text-xl font-bold text-white">
            {repHistory[0] ? `${repHistory[0].eccentricSec}s : ${repHistory[0].concentricSec}s` : '-- : --'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B1120] border border-white/15 flex flex-col justify-between">
          <div className="text-slate-400 text-xs mb-1 font-mono uppercase">
            LAST DURATION
          </div>
          <div className="font-mono text-xl font-bold text-white">
            {repHistory[0] ? `${repHistory[0].durationSec}s` : '0.0s'}
          </div>
        </div>
      </div>

      {/* 3. REP LOG */}
      <div className="p-5 rounded-3xl bg-[#0B1120] border border-white/15 shadow-xl flex-1 flex flex-col min-h-[200px]">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <span className="text-xs font-mono uppercase font-bold text-slate-300">
            Repetition History
          </span>
          <span className="text-xs font-mono text-slate-400">
            {repHistory.length} Total
          </span>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2 max-h-[160px] pr-1">
          {repHistory.length === 0 ? (
            <div className="flex items-center justify-center my-auto text-slate-400 text-center py-4 text-xs font-mono">
              Complete your first repetition to record telemetry.
            </div>
          ) : (
            repHistory.map((rep, idx) => {
              const isClean = rep.formScore >= 70;
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono text-white ${
                    isClean
                      ? 'bg-white/5 border-white/10'
                      : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-[10px] flex items-center justify-center font-bold">
                      #{rep.repNumber}
                    </span>
                    <span>{rep.durationSec}s</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{rep.eccentricSec}s down</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        isClean
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {isClean ? `${rep.formScore}% Clean` : `${rep.formScore}% No Rep`}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
