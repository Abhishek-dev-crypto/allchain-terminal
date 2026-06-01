'use client';

import { useMemo } from 'react';

export default function RegimeDetection() {
  const regime = useMemo(() => {
    return {
      state: 'Bull Expansion',
      confidence: 78,
      volatility: 'Medium',
      liquidity: 'Rising',
    };
  }, []);

  const signals = [
    { label: 'Trend Structure', value: 'Uptrend', score: 82 },
    { label: 'Liquidity Flow', value: 'Positive', score: 74 },
    { label: 'Volatility Regime', value: 'Stable Expansion', score: 69 },
    { label: 'Risk Appetite', value: 'High', score: 81 },
  ];

  return (
    <div className="rounded-3xl border border-violet-500/10 bg-white/[0.03] p-6 relative overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">
          Regime Detection
        </h3>

        <span className="text-xs px-3 py-1 rounded-xl bg-violet-500/10 text-violet-300">
          LIVE AI
        </span>
      </div>

      {/* Main State */}
      <div className="mb-6">
        <p className="text-sm text-gray-400">Current Market Regime</p>

        <div className="mt-2 flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-white">
            {regime.state}
          </h2>

          <span className="text-emerald-400 text-sm font-medium">
            {regime.confidence}% confidence
          </span>
        </div>

        <div className="h-2 mt-3 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full bg-violet-500"
            style={{ width: `${regime.confidence}%` }}
          />
        </div>
      </div>

      {/* Signal Breakdown */}
      <div className="space-y-4">
        {signals.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-white/5 bg-white/[0.02] p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-300">{s.label}</p>
              <p className="text-sm text-white">{s.value}</p>
            </div>

            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-emerald-400"
                style={{ width: `${s.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Glow effect */}
      <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-violet-500/10 blur-3xl rounded-full" />
    </div>
  );
}