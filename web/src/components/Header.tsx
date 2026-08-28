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
  voiceEnabled?: boolean;
  onToggleVoice?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  exercise,
  onSelectExercise,
  isStreaming,
  onToggleCamera,
  onReset
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#0e0e0f] border border-white/[0.08] shadow-xl text-white font-mono">
      {/* Left Brand Badge */}
      <div className="flex items-center gap-2">
        <span className="text-neutral-500 font-bold">//</span>
        <span className="text-xs font-bold tracking-wider uppercase text-neutral-300">
          TRAINER TELEMETRY
        </span>
      </div>

      {/* Center & Right Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Exercise Dropdown */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#080808] border border-white/[0.08]">
          <span className="text-[11px] uppercase text-neutral-400">Exercise:</span>
          <select
            value={exercise}
            onChange={(e) => {
              sounds.playButtonClick();
              onSelectExercise(e.target.value as ExerciseType);
            }}
            className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer pr-1"
          >
            <option value="squat" className="bg-neutral-900 text-white">Squat</option>
            <option value="bicep_curl" className="bg-neutral-900 text-white">Bicep Curl</option>
            <option value="pushup" className="bg-neutral-900 text-white">Push-Up</option>
            <option value="lunge" className="bg-neutral-900 text-white">Lunge</option>
            <option value="shoulder_press" className="bg-neutral-900 text-white">Shoulder Press</option>
            <option value="plank" className="bg-neutral-900 text-white">Plank</option>
          </select>
        </div>

        {/* Start / Stop Camera Button */}
        <button
          onClick={() => {
            sounds.playButtonClick();
            onToggleCamera();
          }}
          className={`px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer ${
            isStreaming
              ? 'bg-rose-600 hover:bg-rose-700 text-white border border-rose-500/50'
              : 'bg-white text-black hover:bg-neutral-200'
          }`}
        >
          {isStreaming ? 'Stop Camera' : 'Start Camera'}
        </button>

        {/* Reset Session Button */}
        <button
          onClick={() => {
            sounds.playButtonClick();
            onReset();
          }}
          className="px-4 py-2 rounded-xl bg-[#141416] hover:bg-neutral-800 border border-white/[0.08] text-xs font-bold uppercase text-neutral-300 hover:text-white transition-all active:scale-95 cursor-pointer"
        >
          Reset
        </button>
      </div>
    </div>
  );
};
