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
  return (
    <div className="flex flex-col gap-3 h-full font-mono">
      {/* 1. REPETITIONS & DEPTH CARD */}
      <div className="p-4 rounded-none bg-[#0a0a0a] border border-[#222222] flex items-center justify-between text-white">
        <div>
          <div className="text-[10px] uppercase text-neutral-400 font-bold mb-1">
            REPETITIONS
          </div>

          <div className="flex items-baseline gap-3">
            <div className="px-3 py-1 rounded-none bg-black text-white font-black text-3xl border border-[#333333]">
              {repCount < 10 ? `0${repCount}` : repCount}
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-neutral-300 bg-white/5 px-2 py-0.5 border border-[#333333] w-max">
                {validReps} Clean Reps
              </span>
              <span className="text-[10px] text-neutral-500 mt-1">Full ROM</span>
            </div>
          </div>
        </div>

        {/* Depth Bar */}
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] uppercase text-neutral-400 font-bold">Depth</span>
          <div className="text-xl font-black text-white">{depthPercentage}%</div>
          <div className="w-16 h-1.5 bg-[#222222] rounded-none overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100"
              style={{ width: `${depthPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. TEMPO STATS */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-none bg-[#0a0a0a] border border-[#222222] flex flex-col justify-between">
          <div className="text-neutral-400 text-[10px] mb-1 uppercase tracking-wider font-bold">
            TEMPO (ECC : CON)
          </div>
          <div className="text-sm font-bold text-white">
            {repHistory[0] ? `${repHistory[0].eccentricSec}s : ${repHistory[0].concentricSec}s` : '-- : --'}
          </div>
        </div>

        <div className="p-3 rounded-none bg-[#0a0a0a] border border-[#222222] flex flex-col justify-between">
          <div className="text-neutral-400 text-[10px] mb-1 uppercase tracking-wider font-bold">
            LAST DURATION
          </div>
          <div className="text-sm font-bold text-white">
            {repHistory[0] ? `${repHistory[0].durationSec}s` : '0.0s'}
          </div>
        </div>
      </div>

      {/* 3. REP LOG */}
      <div className="p-3.5 rounded-none bg-[#0a0a0a] border border-[#222222] flex-1 flex flex-col min-h-[160px]">
        <div className="flex items-center justify-between pb-2 border-b border-[#222222] mb-2">
          <span className="text-[10px] uppercase font-bold text-neutral-400">
            Rep Log
          </span>
          <span className="text-[10px] text-neutral-500">History</span>
        </div>

        <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[160px] pr-1">
          {repHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center my-auto text-neutral-500 py-6 text-center text-xs">
              <span>Ready</span>
            </div>
          ) : (
            repHistory.map((r, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-none bg-black border border-[#222222] text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-neutral-200">Rep {r.repNumber}</span>
                  <span className="text-neutral-500">•</span>
                  <span className="text-neutral-400">{r.durationSec}s</span>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-none ${
                  r.formScore >= 75 ? 'bg-white/10 text-white border border-white/20' : 'bg-rose-500/10 text-rose-400 border border-rose-400/20'
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
