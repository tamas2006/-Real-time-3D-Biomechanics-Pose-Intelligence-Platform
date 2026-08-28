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
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#0c0c0d] border border-white/[0.08] shadow-2xl font-mono text-white text-xs">
      {/* Tool Toggles */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase font-bold text-neutral-500 mr-1">
          LAB SUITE:
        </span>

        {/* Goniometer Toggle */}
        <button
          onClick={() => setShowGoniometer(!showGoniometer)}
          className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold transition active:scale-95 ${
            showGoniometer
              ? 'bg-white text-black border-white'
              : 'bg-white/[0.03] text-neutral-400 border-white/[0.08] hover:text-white hover:border-white/20'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Goniometer</span>
        </button>

        {/* Velocity / VBT Toggle */}
        <button
          onClick={() => setShowPowerVbt(!showPowerVbt)}
          className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold transition active:scale-95 ${
            showPowerVbt
              ? 'bg-white text-black border-white'
              : 'bg-white/[0.03] text-neutral-400 border-white/[0.08] hover:text-white hover:border-white/20'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>VBT & Power</span>
        </button>

        {/* PDF Lab Report Generator */}
        <button
          onClick={onOpenReport}
          className="px-3 py-1.5 rounded-xl bg-white/[0.03] text-neutral-300 border border-white/[0.08] hover:text-white hover:border-white/20 flex items-center gap-1.5 font-bold transition active:scale-95"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Clinical PDF</span>
        </button>
      </div>

      {/* AI Coach Persona Selector */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase font-bold text-neutral-500">
          COACH PERSONA:
        </span>
        <div className="flex items-center p-0.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
          <button
            onClick={() => setCoachPersona('olympic')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
              coachPersona === 'olympic'
                ? 'bg-white text-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Olympic
          </button>
          <button
            onClick={() => setCoachPersona('physio')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
              coachPersona === 'physio'
                ? 'bg-white text-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Physio
          </button>
          <button
            onClick={() => setCoachPersona('mindset')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
              coachPersona === 'mindset'
                ? 'bg-white text-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Mindset
          </button>
        </div>
      </div>
    </div>
  );
};
