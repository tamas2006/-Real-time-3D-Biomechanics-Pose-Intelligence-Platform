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
    <div className="p-3.5 rounded-none bg-[#0a0a0a] border border-[#222222] flex flex-col gap-2.5 font-mono text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#222222] pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white">
          Linear Velocity & Power
        </h3>
        <span className="text-[10px] text-neutral-400 font-bold">
          DYNAMICS
        </span>
      </div>

      {/* Grid of Power Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Mean Propulsive Velocity */}
        <div className="p-2.5 rounded-none bg-black border border-[#222222] flex flex-col">
          <span className="text-[10px] uppercase text-neutral-500 font-bold">Velocity (MPV)</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-bold text-white">{velocityMps.toFixed(2)}</span>
            <span className="text-[10px] text-neutral-400">m/s</span>
          </div>
        </div>

        {/* Peak Power Output */}
        <div className="p-2.5 rounded-none bg-black border border-[#222222] flex flex-col">
          <span className="text-[10px] uppercase text-neutral-500 font-bold">Peak Power</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-bold text-white">{peakPowerWatts}</span>
            <span className="text-[10px] text-neutral-400">W</span>
          </div>
        </div>

        {/* Dynamic Fatigue Index */}
        <div className="p-2.5 rounded-none bg-black border border-[#222222] flex flex-col">
          <span className="text-[10px] uppercase text-neutral-500 font-bold">Fatigue Drop</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-bold text-white">-{fatiguePercent}%</span>
          </div>
        </div>

        {/* C/E Ratio */}
        <div className="p-2.5 rounded-none bg-black border border-[#222222] flex flex-col">
          <span className="text-[10px] uppercase text-neutral-500 font-bold">C/E Ratio</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-bold text-white">{tempoRatio}</span>
            <span className="text-[10px] text-neutral-400">ratio</span>
          </div>
        </div>
      </div>
    </div>
  );
};
