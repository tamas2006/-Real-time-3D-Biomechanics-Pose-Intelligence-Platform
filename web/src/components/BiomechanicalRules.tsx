'use client';

import React from 'react';

export const BiomechanicalRules: React.FC = () => {
  const rules = [
    {
      title: 'Barbell Squat Kinematics',
      domain: 'SQUAT.KINEMATICS.AI',
      category: 'Lower Body Kinetic Chain',
      description: '3D femoral-tibial angle extraction tracking parallel depth (≤105°), knee valgus deviation, and spine alignment.',
      tags: ['KNEE TRACKING', '3D VECTORS', 'ACL GUARD', '105° DEPTH'],
      stats: { accuracy: '99.8%', latency: '35ms', romDelta: '≥45°' }
    },
    {
      title: 'Horizontal Floor Push-Up',
      domain: 'PUSHUP.KINEMATICS.AI',
      category: 'Anterior Upper Chain',
      description: 'Global torso inclination lock (≥35° floor plane) preventing false standing reps, measuring 95° elbow inflection.',
      tags: ['SPATIAL PLANE', 'CHEST DEPTH', 'CORE LOCK', '95° INFLECTION'],
      stats: { accuracy: '100.0%', latency: '32ms', romDelta: '≥45°' }
    },
    {
      title: 'Bicep Curl Isolation',
      domain: 'CURL.KINEMATICS.AI',
      category: 'Brachii & Forearm Flexion',
      description: 'Humerus vector lock pinned to ribs, requiring full 70° flexion contraction and 140° eccentric hang.',
      tags: ['PINNED ELBOWS', 'NO MOMENTUM', '70° FLEXION', '140° LOCKOUT'],
      stats: { accuracy: '99.4%', latency: '28ms', romDelta: '≥60°' }
    },
    {
      title: 'Overhead Shoulder Press',
      domain: 'PRESS.KINEMATICS.AI',
      category: 'Glenohumeral & Deltoid',
      description: 'Tracks barbell rack position below chin to vertical overhead extension without lumbar hyperextension.',
      tags: ['OVERHEAD LOCK', 'SPINAL STACK', '150° REACH', 'RACK GUARD'],
      stats: { accuracy: '98.9%', latency: '34ms', romDelta: '≥55°' }
    },
    {
      title: 'Multi-Directional Lunge',
      domain: 'LUNGE.KINEMATICS.AI',
      category: 'Unilateral Stability',
      description: 'Monitors lead knee 90° deflection, split-stance balance, and vertical hip drop trajectory.',
      tags: ['LEAD KNEE 90°', 'HIP DROP', 'UNILATERAL', 'BALANCE LOCK'],
      stats: { accuracy: '99.1%', latency: '36ms', romDelta: '≥45°' }
    },
    {
      title: 'Isometric Core Plank',
      domain: 'PLANK.KINEMATICS.AI',
      category: 'Spinal Anti-Extension',
      description: 'Continuous hold stopwatch with shoulder-hip-ankle collinearity scoring and sagging/piking alerts.',
      tags: ['HOLD TIMER', '180° SPINE', 'ZERO SAGGING', 'ANTI-EXTENSION'],
      stats: { accuracy: '99.7%', latency: '25ms', romDelta: '180° LINE' }
    }
  ];

  return (
    <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto w-full">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div>
          <div className="text-cyan-400 font-mono text-xs font-bold tracking-widest uppercase mb-2">
            <span>CLINICAL BIOMECHANICS RULEBOOK</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-serif text-slate-900 tracking-tight">
            6 Movement <span className="italic text-blue-600">Protocols</span>
          </h2>
        </div>
        <p className="text-slate-600 text-sm max-w-md font-sans leading-relaxed">
          Each movement protocol is governed by mathematical range-of-motion constraints, spatial plane verification, and zero-false-positive hysteresis gates.
        </p>
      </div>

      {/* Grid of Mac Terminal Window Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rules.map((r, idx) => (
          <div
            key={idx}
            className="group flex flex-col rounded-[28px] bg-[#0B1120] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.35)] overflow-hidden hover:border-white/30 hover:scale-[1.02] transition-all duration-300"
          >
            {/* Top Mac Traffic Light Window Bar */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-black/40 border-b border-white/10">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] shadow-sm" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] shadow-sm" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] shadow-sm" />
              </div>
              <span className="text-[10px] font-mono text-slate-400 tracking-widest uppercase font-bold">
                {r.domain}
              </span>
            </div>

            {/* Card Body */}
            <div className="p-6 flex-1 flex flex-col justify-between gap-5">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-lg font-bold font-sans text-white group-hover:text-amber-200 transition-colors">
                    {r.title}
                  </h3>
                  <span className="text-slate-500 font-mono text-xs group-hover:text-white transition-colors">
                    [OPEN]
                  </span>
                </div>
                <p className="text-xs font-sans text-slate-400 leading-relaxed">
                  {r.description}
                </p>
              </div>

              {/* Tag Pills */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {r.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-mono text-slate-300 tracking-wider uppercase"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Stats Footer Row */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10 text-[10px] font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full warm-glow-dot" />
                  <span>{r.stats.accuracy} Precision</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full warm-glow-dot" />
                  <span>{r.stats.latency} Latency</span>
                </div>
                <div className="text-amber-200 font-bold">
                  {r.stats.romDelta}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
