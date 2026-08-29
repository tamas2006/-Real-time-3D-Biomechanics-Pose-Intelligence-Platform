'use client';

import React from 'react';
import { Compass, Zap, FileText, UserCheck, ShieldCheck } from 'lucide-react';
import { ClinicalCoachPersona } from '@/types/fitness';

interface LaboratoryHUDToolbarProps {
  showGoniometer: boolean;
  setShowGoniometer: (val: boolean) => void;
  showPowerVbt: boolean;
  setShowPowerVbt: (val: boolean) => void;
  coachPersona: ClinicalCoachPersona;
  setCoachPersona: (val: ClinicalCoachPersona) => void;
  onOpenReport: () => void;
}

export const LaboratoryHUDToolbar: React.FC<LaboratoryHUDToolbarProps> = ({
  showGoniometer,
  setShowGoniometer,
  showPowerVbt,
  setShowPowerVbt,
  coachPersona,
  setCoachPersona,
  onOpenReport
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-none bg-[#0a0a0a] border border-[#222222] font-mono text-white text-xs">
      {/* Tool Toggles */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase font-bold text-neutral-500 mr-1">
          METRICS:
        </span>

        {/* Goniometer Toggle */}
        <button
          onClick={() => setShowGoniometer(!showGoniometer)}
          className={`px-3 py-1 rounded-none border font-bold transition-colors cursor-pointer text-xs ${
            showGoniometer
              ? 'bg-white text-black border-white'
              : 'bg-black text-neutral-400 border-[#333333] hover:text-white'
          }`}
        >
          Goniometer
        </button>

        {/* Velocity / VBT Toggle */}
        <button
          onClick={() => setShowPowerVbt(!showPowerVbt)}
          className={`px-3 py-1 rounded-none border font-bold transition-colors cursor-pointer text-xs ${
            showPowerVbt
              ? 'bg-white text-black border-white'
              : 'bg-black text-neutral-400 border-[#333333] hover:text-white'
          }`}
        >
          Power & VBT
        </button>

        {/* PDF Lab Report Generator */}
        <button
          onClick={onOpenReport}
          className="px-3 py-1 rounded-none bg-black text-neutral-300 border border-[#333333] hover:text-white hover:border-white font-bold transition-colors cursor-pointer text-xs"
        >
          Export Report
        </button>
      </div>

      {/* AI Coach Persona Selector */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase font-bold text-neutral-500">
          COACH:
        </span>
        <div className="flex items-center border border-[#333333]">
          <button
            onClick={() => setCoachPersona('olympic')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-none cursor-pointer ${
              coachPersona === 'olympic'
                ? 'bg-white text-black'
                : 'bg-black text-neutral-400 hover:text-white'
            }`}
          >
            Olympic
          </button>
          <button
            onClick={() => setCoachPersona('physio')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-none cursor-pointer ${
              coachPersona === 'physio'
                ? 'bg-white text-black'
                : 'bg-black text-neutral-400 hover:text-white'
            }`}
          >
            Physio
          </button>
          <button
            onClick={() => setCoachPersona('mindset')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-none cursor-pointer ${
              coachPersona === 'mindset'
                ? 'bg-white text-black'
                : 'bg-black text-neutral-400 hover:text-white'
            }`}
          >
            Mindset
          </button>
        </div>
      </div>
    </div>
  );
};
