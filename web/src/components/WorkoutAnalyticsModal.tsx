'use client';

import React from 'react';
import { RepMetric } from '@/types/fitness';
import { X, Download, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { sounds } from '@/lib/soundEffects';

interface WorkoutAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  repHistory: RepMetric[];
  exercise: string;
}

export const WorkoutAnalyticsModal: React.FC<WorkoutAnalyticsModalProps> = ({
  isOpen,
  onClose,
  repHistory,
  exercise
}) => {
  if (!isOpen) return null;

  const totalReps = repHistory.length;
  const avgScore = totalReps > 0
    ? Math.round(repHistory.reduce((acc, r) => acc + r.formScore, 0) / totalReps)
    : 100;
  const cleanReps = repHistory.filter((r) => r.formScore >= 80).length;

  const exportCSV = () => {
    sounds.playButtonClick();
    const headers = 'Rep Number,Duration (s),Eccentric (s),Concentric (s),Min Angle (deg),Max Angle (deg),Form Score (%)\n';
    const rows = repHistory
      .map((r) => `${r.repNumber},${r.durationSec},${r.eccentricSec},${r.concentricSec},${r.minAngle},${r.maxAngle},${r.formScore}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kinetic_workout_${exercise}_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-6 font-mono text-white animate-fadeIn">
      <div className="relative max-w-2xl w-full p-6 sm:p-8 rounded-3xl bg-[#0c0c0d] border border-white/[0.15] shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-white" />
            <h3 className="text-base font-bold uppercase tracking-wider text-white">
              Workout Biomechanics Telemetry
            </h3>
          </div>
          <button
            onClick={() => {
              sounds.playButtonClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-neutral-900 border border-white/[0.08] hover:border-white/25 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Summary KPI Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col">
            <span className="text-[10px] uppercase text-neutral-500 font-bold">Total Reps</span>
            <span className="text-2xl font-bold text-white mt-1">{totalReps}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col">
            <span className="text-[10px] uppercase text-neutral-500 font-bold">Avg Quality</span>
            <span className="text-2xl font-bold text-white mt-1">{avgScore}%</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col">
            <span className="text-[10px] uppercase text-neutral-500 font-bold">Clean Reps</span>
            <span className="text-2xl font-bold text-white mt-1">{cleanReps}</span>
          </div>
        </div>

        {/* Repetition History Table */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Repetition Breakdown
          </span>

          {repHistory.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500 bg-white/[0.02] rounded-2xl border border-white/[0.05]">
              No repetitions logged in this session yet. Complete reps to view clinical spatial telemetry.
            </div>
          ) : (
            <div className="divide-y divide-white/[0.05] rounded-2xl bg-white/[0.02] border border-white/[0.08] max-h-60 overflow-y-auto">
              {repHistory.map((rep) => (
                <div key={rep.repNumber} className="p-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white">#{rep.repNumber}</span>
                    <span className="text-neutral-400 text-[11px]">{rep.durationSec}s total</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-neutral-400 text-[11px]">
                      ROM: {rep.minAngle}° - {rep.maxAngle}°
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rep.formScore >= 80
                          ? 'bg-white/10 text-white border border-white/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {rep.formScore}% Score
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
          <button
            onClick={exportCSV}
            disabled={repHistory.length === 0}
            className="px-4 py-2 rounded-xl bg-neutral-900 border border-white/[0.08] hover:border-white/25 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              sounds.playButtonClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
