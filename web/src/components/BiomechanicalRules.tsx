'use client';

import React from 'react';

export const BiomechanicalRules: React.FC = () => {
  const exercises = [
    {
      title: 'Barbell & Bodyweight Squat',
      category: 'Lower Body',
      description: 'Tracks femoral-tibial angles to parallel depth (≤115°) while checking knee valgus and torso uprightness.',
      cue: 'Drive knees outward and keep chest upright'
    },
    {
      title: 'Floor Push-Up',
      category: 'Upper Body & Core',
      description: 'Requires a horizontal prone plank with 90° elbow inflection and zero hip sagging.',
      cue: 'Tuck elbows to 45° and brace abdominal cylinder'
    },
    {
      title: 'Bicep Curl',
      category: 'Arm Isolation',
      description: 'Enforces fixed humeral stability against ribs through full 70° flexion and 140° eccentric extension.',
      cue: 'Pin elbows to torso without swinging shoulders'
    },
    {
      title: 'Overhead Shoulder Press',
      category: 'Shoulders & Triceps',
      description: 'Tracks vertical elbow lockout overhead while ensuring vertical spine alignment.',
      cue: 'Press straight overhead to full lockout'
    },
    {
      title: 'Walking & Reverse Lunge',
      category: 'Unilateral Legs',
      description: 'Monitors lead knee 90° deflection, split-stance balance, and vertical hip drop trajectory.',
      cue: 'Drop back knee towards floor with vertical torso'
    },
    {
      title: 'Core Isometric Plank',
      category: 'Core & Abdominals',
      description: 'Hold stopwatch with shoulder-hip-ankle collinearity and sagging/piking alerts.',
      cue: 'Maintain unbroken rigid line from head to heels'
    }
  ];

  return (
    <section id="exercises" className="py-20 px-6 md:px-12 max-w-7xl mx-auto w-full">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl md:text-5xl font-sans font-bold text-white tracking-tight">
            Supported Exercises & Technique
          </h2>
          <p className="text-slate-400 text-sm max-w-lg mt-2">
            Real-time form tracking and validation for key compound and isolation movements.
          </p>
        </div>
      </div>

      {/* Grid of Clean Exercise Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map((ex, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between p-6 rounded-3xl bg-[#0B1120] border border-white/15 shadow-xl hover:border-white/30 transition-all gap-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-lg font-bold text-white font-sans">
                  {ex.title}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-300 font-mono">
                  {ex.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {ex.description}
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 text-xs text-slate-300">
              <strong className="text-emerald-400 font-mono">Coach Cue:</strong> {ex.cue}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
