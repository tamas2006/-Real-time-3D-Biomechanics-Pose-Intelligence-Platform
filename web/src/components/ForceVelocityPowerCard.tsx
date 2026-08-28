'use client';

import React from 'react';
import { Zap, Gauge, Flame, TrendingUp } from 'lucide-react';

interface ForceVelocityPowerCardProps {
  velocityMps: number;
  peakPowerWatts: number;
  fatiguePercent: number;
  concentricSec: number;
  eccentricSec: number;
  isEnabled: boolean;
}

export const ForceVelocityPowerCard: React.FC<ForceVelocityPowerCardProps> = ({
  velocityMps,
  peakPowerWatts,
  fatiguePercent,
  concentricSec,
  eccentricSec,
  isEnabled
}) => {
  if (!isEnabled) return null;

  const tempoRatio = eccentricSec > 0 ? (concentricSec / eccentricSec).toFixed(2) : '1.00';

  return (
    <div className="p-5 rounded-2xl bg-[#0c0c0d] border border-white/[0.08] shadow-2xl flex flex-col gap-4 font-mono text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-white" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Linear Transducer & Power (VBT)
          </h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white font-bold border border-white/20">
          LIVE DYNAMICS
        </span>
      </div>

      {/* Grid of Power Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Mean Propulsive Velocity */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col">
          <div className="flex items-center gap-1 text-[10px] uppercase text-neutral-500 font-bold">
            <Gauge className="w-3 h-3 text-neutral-400" />
            <span>Velocity (MPV)</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold text-white">{velocityMps.toFixed(2)}</span>
            <span className="text-[10px] text-neutral-400">m/s</span>
          </div>
        </div>

        {/* Peak Power Output */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col">
          <div className="flex items-center gap-1 text-[10px] uppercase text-neutral-500 font-bold">
            <Flame className="w-3 h-3 text-neutral-400" />
            <span>Peak Power</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold text-white">{peakPowerWatts}</span>
            <span className="text-[10px] text-neutral-400">Watts</span>
          </div>
        </div>

        {/* Dynamic Fatigue Index */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col">
          <div className="flex items-center gap-1 text-[10px] uppercase text-neutral-500 font-bold">
            <TrendingUp className="w-3 h-3 text-neutral-400" />
            <span>Fatigue Drop</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className={`text-xl font-bold ${fatiguePercent > 20 ? 'text-rose-400' : 'text-white'}`}>
              {fatiguePercent}%
            </span>
            <span className="text-[10px] text-neutral-400">drop</span>
          </div>
        </div>

        {/* Concentric/Eccentric Tempo Ratio */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col">
          <span className="text-[10px] uppercase text-neutral-500 font-bold">Tempo Ratio</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold text-white">{tempoRatio}</span>
            <span className="text-[10px] text-neutral-400">C/E</span>
          </div>
        </div>
      </div>
    </div>
  );
};
