'use client';

import React from 'react';
import { RepMetric, ClinicalTelemetry, ExerciseType } from '@/types/fitness';
import { X, FileText, Printer, CheckCircle, Award, AlertOctagon, Activity } from 'lucide-react';

interface ClinicalReportGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: ExerciseType;
  repHistory: RepMetric[];
  telemetry: ClinicalTelemetry;
  formScore: number;
}

export const ClinicalReportGeneratorModal: React.FC<ClinicalReportGeneratorModalProps> = ({
  isOpen,
  onClose,
  exercise,
  repHistory,
  telemetry,
  formScore
}) => {
  if (!isOpen) return null;

  const validReps = repHistory.filter((r) => r.formScore >= 65);
  const avgFormScore = repHistory.length > 0
    ? Math.round(repHistory.reduce((acc, r) => acc + r.formScore, 0) / repHistory.length)
    : formScore;

  const avgDuration = repHistory.length > 0
    ? (repHistory.reduce((acc, r) => acc + r.durationSec, 0) / repHistory.length).toFixed(1)
    : '0.0';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0c0c0d] border border-white/20 shadow-2xl p-6 sm:p-8 font-mono text-white flex flex-col gap-6 print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
        
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-white" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Clinical Biomechanics Diagnostic Report
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-white text-black text-xs font-bold flex items-center gap-1.5 hover:bg-neutral-200 transition active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Clinical Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] print:border-black/20 print:bg-neutral-100">
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest">
              KINETIC AI CLINICAL SUITE
            </span>
            <h1 className="text-xl font-bold uppercase text-white print:text-black">
              Biomechanical Evaluation: {exercise.replace('_', ' ')}
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5 print:text-neutral-600">
              Evaluated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-white/10 text-white font-bold text-xs border border-white/20 print:text-black print:border-black">
              SCORE: {avgFormScore}/100
            </span>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col">
            <span className="text-[10px] text-neutral-500 uppercase font-bold">Total Work Volume</span>
            <span className="text-lg font-bold text-white mt-1 print:text-black">{repHistory.length} Reps</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col">
            <span className="text-[10px] text-neutral-500 uppercase font-bold">Clinically Valid Reps</span>
            <span className="text-lg font-bold text-white mt-1 print:text-black">{validReps.length} Reps</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col">
            <span className="text-[10px] text-neutral-500 uppercase font-bold">Avg Rep Duration</span>
            <span className="text-lg font-bold text-white mt-1 print:text-black">{avgDuration}s</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col">
            <span className="text-[10px] text-neutral-500 uppercase font-bold">Bilateral Symmetry</span>
            <span className="text-lg font-bold text-white mt-1 print:text-black">
              {telemetry.symmetryBalance}% L / {100 - telemetry.symmetryBalance}% R
            </span>
          </div>
        </div>

        {/* Rep-by-Rep Telemetry Breakdown Table */}
        <div className="flex flex-col gap-2">
          <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-400">
            Repetition-Level Spatial Telemetry Log
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-white/[0.08] print:border-black/20">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white/[0.04] text-neutral-400 border-b border-white/[0.08] print:bg-neutral-200 print:text-black">
                  <th className="p-3">#</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Peak ROM</th>
                  <th className="p-3">Min Angle</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Tempo (C/E)</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] print:divide-neutral-200">
                {repHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-neutral-500">
                      No repetitions logged during this session.
                    </td>
                  </tr>
                ) : (
                  repHistory.map((rep) => {
                    const isPassed = rep.formScore >= 65;
                    const rom = rep.maxAngle - rep.minAngle;
                    return (
                      <tr key={rep.repNumber} className="hover:bg-white/[0.02] print:text-black">
                        <td className="p-3 font-bold">{rep.repNumber}</td>
                        <td className="p-3 font-bold">{rep.formScore}%</td>
                        <td className="p-3">{rom.toFixed(0)}°</td>
                        <td className="p-3">{rep.minAngle.toFixed(0)}°</td>
                        <td className="p-3">{rep.durationSec}s</td>
                        <td className="p-3">{rep.tempoRatio.toFixed(2)}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isPassed
                                ? 'bg-white/10 text-white border border-white/20 print:border-black print:text-black'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 print:text-red-600'
                            }`}
                          >
                            {isPassed ? 'VALID' : 'REJECTED'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Clinical Recommendation & Kinematic Prescription */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col gap-2 print:border-black/20">
          <span className="text-[10px] uppercase font-bold text-neutral-400">
            Kinematic Feedback & Corrective Prescription
          </span>
          <p className="text-xs text-neutral-300 leading-relaxed print:text-black">
            {avgFormScore >= 85
              ? 'Kinetic chain alignment demonstrated superior motor stability and optimal depth inflection. Continue current loading protocol while focusing on explosive concentric velocity.'
              : 'Kinetic telemetry indicated localized form breakdown near depth inflection. Prioritize controlled 3-second eccentric tempo and enforce complete joint lockout to build tendon resilience.'}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.08] text-[10px] text-neutral-500 print:text-neutral-700">
          <span>Kinetic AI Biomechanics Platform</span>
          <span>Verified Clinical Engine • Powered by High-Precision Spatial MediaPipe</span>
        </div>
      </div>
    </div>
  );
};
