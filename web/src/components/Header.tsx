'use client';

import React from 'react';
import { ExerciseType } from '@/types/fitness';
import { sounds } from '@/lib/soundEffects';

interface HeaderProps {
  exercise: ExerciseType;
  onSelectExercise: (ex: ExerciseType) => void;
  isStreaming: boolean;
  onToggleCamera: () => void;
  onReset: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  exercise,
  onSelectExercise,
  isStreaming,
  onToggleCamera,
  onReset,
  voiceEnabled,
  onToggleVoice
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-[28px] bg-[#0B1120]/75 border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-2xl text-white">
      {/* Left Brand Badge */}
      <div className="flex items-center gap-3">
        <div>
          <h3 className="text-sm font-bold font-mono tracking-wider text-white flex items-center gap-2">
            KINETIC.AI <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 font-mono font-bold">175K ENSEMBLE</span>
          </h3>
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            Optical Biomechanics Terminal
          </p>
        </div>
      </div>

      {/* Center & Right Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Tactile Exercise Dropdown */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/40 border border-white/20 shadow-inner">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Target:</span>
          <select
            value={exercise}
            onChange={(e) => {
              sounds.playButtonClick();
              onSelectExercise(e.target.value as ExerciseType);
            }}
            className="bg-transparent text-xs font-bold font-mono text-white outline-none cursor-pointer pr-1"
          >
            <option value="squat" className="bg-slate-900 text-white">Barbell / Bodyweight Squat</option>
            <option value="bicep_curl" className="bg-slate-900 text-white">Standing Bicep Curl</option>
            <option value="pushup" className="bg-slate-900 text-white">Standard Push-Up</option>
            <option value="lunge" className="bg-slate-900 text-white">Forward / Reverse Lunge</option>
            <option value="shoulder_press" className="bg-slate-900 text-white">Overhead Shoulder Press</option>
            <option value="plank" className="bg-slate-900 text-white">Isometric Core Plank</option>
          </select>
        </div>

        {/* Primary Camera Toggle Button (Pure Text) */}
        <button
          onClick={() => {
            sounds.playButtonClick();
            onToggleCamera();
          }}
          className={`px-6 py-2.5 rounded-2xl font-bold font-mono text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all ${
            isStreaming
              ? 'bg-red-500/80 hover:bg-red-600 text-white border border-red-400/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
              : 'bg-white text-slate-900 hover:bg-slate-100 shadow-[0_0_20px_rgba(255,255,255,0.4)]'
          }`}
        >
          {isStreaming ? 'Stop Camera' : 'Start Camera'}
        </button>

        {/* Reset Session Button (Pure Text) */}
        <button
          onClick={() => {
            sounds.playButtonClick();
            onReset();
          }}
          className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono font-bold uppercase text-slate-300 hover:text-white transition-all active:scale-90 shadow-sm"
        >
          Reset
        </button>

        {/* Voice Coach Toggle (Pure Text) */}
        <button
          onClick={() => {
            sounds.playButtonClick();
            onToggleVoice();
          }}
          className={`px-4 py-2.5 rounded-2xl border text-xs font-mono font-bold uppercase transition-all active:scale-90 shadow-sm ${
            voiceEnabled
              ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_10px_rgba(0,242,254,0.3)]'
              : 'bg-white/5 border-white/15 text-slate-500'
          }`}
        >
          {voiceEnabled ? 'Voice ON' : 'Voice OFF'}
        </button>
      </div>
    </div>
  );
};
