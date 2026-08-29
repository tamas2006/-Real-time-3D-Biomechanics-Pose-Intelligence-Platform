'use client';

import React from 'react';
import { ClinicalTelemetry } from '@/types/fitness';
import { Compass, Activity, ShieldCheck, AlertTriangle } from 'lucide-react';

interface ClinicalGoniometerHUDProps {
  telemetry: ClinicalTelemetry;
  exercise: string;
  isEnabled: boolean;
}

export const ClinicalGoniometerHUD: React.FC<ClinicalGoniometerHUDProps> = ({
  telemetry,
  exercise,
  isEnabled
}) => {
  if (!isEnabled) return null;

  const {
    leftKneeAngle,
    rightKneeAngle,
    leftHipAngle,
    rightHipAngle,
    torsoInclination,
    symmetryBalance
  } = telemetry;

  const isSymmetrical = Math.abs(50 - symmetryBalance) <= 6;

  return (
    <div className="absolute top-12 left-3 z-20 flex flex-col gap-1.5 p-2.5 rounded-none bg-black/90 border border-[#333333] text-xs font-mono text-white max-w-xs pointer-events-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-[#222222]">
        <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-300">
          Spatial Goniometer
        </span>
        <span className="text-[9px] font-bold text-neutral-400">
          DEGREES
        </span>
      </div>

      {/* Joint Angles Grid */}
      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
        {/* Left vs Right Knee */}
        <div className="p-1.5 rounded-none bg-black border border-[#222222] flex flex-col">
          <span className="text-[9px] uppercase text-neutral-500 font-bold">L/R Knee Flexion</span>
          <div className="flex items-baseline justify-between mt-0.5 font-bold">
            <span className="text-white">{leftKneeAngle}°</span>
            <span className="text-neutral-500 font-normal">/</span>
            <span className="text-white">{rightKneeAngle}°</span>
          </div>
        </div>

        {/* Torso Incline */}
        <div className="p-1.5 rounded-none bg-black border border-[#222222] flex flex-col">
          <span className="text-[9px] uppercase text-neutral-500 font-bold">Spine Incline</span>
          <div className="mt-0.5 font-bold text-white">
            {torsoInclination}° <span className="text-[9px] font-normal text-neutral-500">from vertical</span>
          </div>
        </div>

        {/* Hip Flexion */}
        <div className="p-1.5 rounded-none bg-black border border-[#222222] flex flex-col">
          <span className="text-[9px] uppercase text-neutral-500 font-bold">Hip Angle</span>
          <div className="flex items-baseline justify-between mt-0.5 font-bold">
            <span className="text-white">{leftHipAngle}°</span>
            <span className="text-neutral-500 font-normal">/</span>
            <span className="text-white">{rightHipAngle}°</span>
          </div>
        </div>

        {/* Bilateral Load */}
        <div className="p-1.5 rounded-none bg-black border border-[#222222] flex flex-col">
          <span className="text-[9px] uppercase text-neutral-500 font-bold">Bilateral Load</span>
          <div className="mt-0.5 font-bold text-white flex items-center justify-between">
            <span>{symmetryBalance}% L</span>
            <span className="text-neutral-500 font-normal">/</span>
            <span>{100 - symmetryBalance}% R</span>
          </div>
        </div>
      </div>

      {/* Live Balance Bar Gauge */}
      <div className="w-full h-1 bg-[#222222] rounded-none overflow-hidden relative">
        <div
          className="absolute top-0 bottom-0 bg-white transition-all duration-150"
          style={{
            left: `${Math.min(symmetryBalance, 50)}%`,
            right: `${Math.min(100 - symmetryBalance, 50)}%`
          }}
        />
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-neutral-600 -translate-x-1/2 z-10" />
      </div>
    </div>
  );
};
