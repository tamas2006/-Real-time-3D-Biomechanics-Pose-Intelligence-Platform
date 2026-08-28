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
    <div className="absolute top-14 left-4 z-20 flex flex-col gap-2 p-3 rounded-2xl bg-[#0c0c0d]/90 backdrop-blur-xl border border-white/[0.12] shadow-2xl text-xs font-mono text-white max-w-xs animate-fadeIn pointer-events-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
        <div className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-white animate-spin-slow" />
          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-300">
            Spatial Goniometer
          </span>
        </div>
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/10 text-white border border-white/20">
          CLINICAL
        </span>
      </div>

      {/* Joint Angles Grid */}
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        {/* Left vs Right Knee */}
        <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col">
          <span className="text-[9px] uppercase text-neutral-500 font-bold">L/R Knee Flexion</span>
          <div className="flex items-baseline justify-between mt-1 font-bold">
            <span className="text-white">{leftKneeAngle}°</span>
            <span className="text-neutral-500 font-normal">/</span>
            <span className="text-white">{rightKneeAngle}°</span>
          </div>
        </div>

        {/* Torso Incline */}
        <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col">
          <span className="text-[9px] uppercase text-neutral-500 font-bold">Spine Incline</span>
          <span className="text-white font-bold mt-1">{torsoInclination}° from vertical</span>
        </div>

        {/* Hip Flexion */}
        <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col">
          <span className="text-[9px] uppercase text-neutral-500 font-bold">Hip Angle</span>
          <div className="flex items-baseline justify-between mt-1 font-bold">
            <span className="text-white">{leftHipAngle}°</span>
            <span className="text-neutral-500">/</span>
            <span className="text-white">{rightHipAngle}°</span>
          </div>
        </div>

        {/* Bilateral Balance Meter */}
        <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col">
          <span className="text-[9px] uppercase text-neutral-500 font-bold">Bilateral Load</span>
          <div className="flex items-center gap-1.5 mt-1">
            {isSymmetrical ? (
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span className={`text-[10px] font-bold ${isSymmetrical ? 'text-white' : 'text-rose-400'}`}>
              {symmetryBalance}% L / {100 - symmetryBalance}% R
            </span>
          </div>
        </div>
      </div>

      {/* Live Balance Bar Gauge */}
      <div className="w-full h-1.5 rounded-full bg-neutral-900 border border-white/[0.08] overflow-hidden relative">
        <div
          className="absolute top-0 bottom-0 bg-white transition-all duration-150"
          style={{
            left: `${Math.min(symmetryBalance, 50)}%`,
            right: `${Math.min(100 - symmetryBalance, 50)}%`
          }}
        />
        {/* Center alignment marker */}
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-neutral-500 -translate-x-1/2 z-10" />
      </div>
    </div>
  );
};
