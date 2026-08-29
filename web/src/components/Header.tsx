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
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-none bg-[#0a0a0a] border border-[#222222] text-white font-mono">
      {/* Left Exercise Dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-bold">Exercise:</span>
        <select
          value={exercise}
          onChange={(e) => {
            sounds.playButtonClick();
            onSelectExercise(e.target.value as ExerciseType);
          }}
          className="bg-black text-xs font-bold text-white border border-[#333333] px-3 py-1.5 rounded-none outline-none cursor-pointer"
        >
          <option value="squat" className="bg-black text-white">Squat</option>
          <option value="bicep_curl" className="bg-black text-white">Bicep Curl</option>
          <option value="pushup" className="bg-black text-white">Push-Up</option>
          <option value="lunge" className="bg-black text-white">Lunge</option>
          <option value="shoulder_press" className="bg-black text-white">Shoulder Press</option>
          <option value="plank" className="bg-black text-white">Plank</option>
        </select>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Start / Stop Camera Button */}
        <button
          onClick={() => {
            sounds.playButtonClick();
            onToggleCamera();
          }}
          className={`px-4 py-1.5 rounded-none font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border ${
            isStreaming
              ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500'
              : 'bg-white text-black hover:bg-neutral-200 border-white'
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
          className="px-3.5 py-1.5 rounded-none bg-black hover:bg-neutral-900 border border-[#333333] text-xs font-bold uppercase text-neutral-300 hover:text-white transition-colors cursor-pointer"
        >
          Reset
        </button>
      </div>
    </div>
  );
};
