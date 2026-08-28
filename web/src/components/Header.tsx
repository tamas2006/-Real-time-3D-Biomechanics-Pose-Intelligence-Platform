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
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-[#0B1120] border border-white/15 shadow-xl text-white">
      {/* Left Brand Badge */}
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-bold font-mono tracking-wider text-white">
          AI WORKOUT COACH
        </h3>
      </div>

      {/* Center & Right Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Exercise Dropdown */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/50 border border-white/15">
          <span className="text-xs font-mono uppercase text-slate-400">Exercise:</span>
          <select
            value={exercise}
            onChange={(e) => {
              sounds.playButtonClick();
              onSelectExercise(e.target.value as ExerciseType);
            }}
            className="bg-transparent text-xs font-bold font-mono text-white outline-none cursor-pointer pr-1"
          >
            <option value="squat" className="bg-slate-900 text-white">Squat</option>
            <option value="bicep_curl" className="bg-slate-900 text-white">Bicep Curl</option>
            <option value="pushup" className="bg-slate-900 text-white">Push-Up</option>
            <option value="lunge" className="bg-slate-900 text-white">Lunge</option>
            <option value="shoulder_press" className="bg-slate-900 text-white">Shoulder Press</option>
            <option value="plank" className="bg-slate-900 text-white">Plank</option>
          </select>
        </div>

        {/* Start / Stop Camera Button */}
        <button
          onClick={() => {
            sounds.playButtonClick();
            onToggleCamera();
          }}
          className={`px-6 py-2.5 rounded-2xl font-bold font-mono text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all ${
            isStreaming
              ? 'bg-rose-600 hover:bg-rose-700 text-white border border-rose-500/50'
              : 'bg-white text-black hover:bg-slate-200'
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
          className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-mono font-bold uppercase text-slate-300 hover:text-white transition-all active:scale-90"
        >
          Reset
        </button>

        {/* GitHub Icon Button */}
        <a
          href="https://github.com/tamas2006"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => sounds.playButtonClick()}
          className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all active:scale-90 hover:scale-105"
          title="GitHub"
          aria-label="GitHub"
        >
          <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </a>
      </div>
    </div>
  );
};
