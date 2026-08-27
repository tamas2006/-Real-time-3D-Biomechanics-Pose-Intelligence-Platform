'use client';

import React from 'react';

export const ModelArchitectureShowcase: React.FC = () => {
  return (
    <section id="dataset" className="py-20 px-6 md:px-12 max-w-7xl mx-auto w-full">
      {/* Mac Terminal Window Card Container */}
      <div className="rounded-[36px] bg-[#0B1120] border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.4)] overflow-hidden">
        {/* Top Mac Window Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-black/50 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
          </div>
          <span className="text-xs font-mono text-slate-400 tracking-widest uppercase font-bold">
            MODEL.ARCHITECTURE // 175K ENSEMBLE
          </span>
          <div className="flex items-center gap-2 text-[11px] font-mono text-amber-200">
            <span className="w-2 h-2 rounded-full warm-glow-dot animate-pulse" />
            <span>TRAINED ACCURACY: 97.9%</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-8 md:p-14 flex flex-col lg:flex-row items-start justify-between gap-12 text-white">
          {/* Left Column */}
          <div className="max-w-xl">
            <div className="text-cyan-400 font-mono text-xs font-bold tracking-widest uppercase mb-3">
              <span>PRODUCTION MACHINE LEARNING PIPELINE</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-white tracking-tight leading-tight mb-6">
              175,000 Samples. <br />
              <span className="italic text-amber-200">Zero Guesswork.</span>
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-6 font-sans">
              Unlike generic vision models that flicker under occlusions, our model combines a <strong>5-Layer Deep Neural Network</strong> and a <strong>500-Tree XGBoost Stacking Ensemble</strong> trained on scale-invariant 3D vectors with extreme spatial angle augmentations (±35°).
            </p>

            <div className="space-y-3 font-mono text-xs text-slate-300">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="w-2 h-2 rounded-full warm-glow-dot" />
                <span>5-Layer Deep MLP Neural Network (512 → 256 → 128 → 64)</span>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="w-2 h-2 rounded-full warm-glow-dot" />
                <span>Extreme Gradient Boosting (400 Trees, Depth 10)</span>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="w-2 h-2 rounded-full warm-glow-dot" />
                <span>Soft-Voting Stacking Ensemble Calibration</span>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="w-2 h-2 rounded-full warm-glow-dot" />
                <span>Sub-40ms Inference Latency (Local Edge Processing)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
            <div className="p-6 rounded-3xl bg-black/40 border border-white/15 flex flex-col justify-between">
              <div>
                <span className="text-4xl font-black font-mono text-white block">175K</span>
                <span className="text-[11px] font-mono uppercase text-slate-400">3D Vector Samples</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-black/40 border border-white/15 flex flex-col justify-between">
              <div>
                <span className="text-4xl font-black font-mono text-white block">97.9%</span>
                <span className="text-[11px] font-mono uppercase text-slate-400">Test Accuracy</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-black/40 border border-white/15 flex flex-col justify-between">
              <div>
                <span className="text-4xl font-black font-mono text-white block">7</span>
                <span className="text-[11px] font-mono uppercase text-slate-400">Target Classes</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-black/40 border border-white/15 flex flex-col justify-between">
              <div>
                <span className="text-4xl font-black font-mono text-white block">60 FPS</span>
                <span className="text-[11px] font-mono uppercase text-slate-400">Edge Streaming</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
