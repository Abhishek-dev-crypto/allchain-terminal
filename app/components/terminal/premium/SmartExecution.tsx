'use client';

import { useMemo, useState } from 'react';

export default function SmartExecution() {
  const [mode] = useState<'Aggressive' | 'Balanced' | 'Conservative'>('Balanced');

  const executionSignals = useMemo(() => {
    return [
      {
        asset: 'BTC',
        action: 'ACCUMULATE',
        confidence: 82,
        reason: 'Strong trend continuation + liquidity inflow',
      },
      {
        asset: 'ETH',
        action: 'HOLD',
        confidence: 74,
        reason: 'Neutral momentum, awaiting breakout confirmation',
      },
      {
        asset: 'SOL',
        action: 'TAKE PROFIT',
        confidence: 69,
        reason: 'Short-term overheating detected',
      },
      {
        asset: 'BNB',
        action: 'ACCUMULATE',
        confidence: 77,
        reason: 'Institutional inflow spike detected',
      },
    ];
  }, []);

  const getColor = (action: string) => {
    if (action === 'ACCUMULATE') return 'text-emerald-400';
    if (action === 'TAKE PROFIT') return 'text-red-400';
    return 'text-yellow-400';
  };

  return (
    <div className="rounded-3xl border border-violet-500/10 bg-white/[0.03] p-6 relative overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Smart Execution Engine</h3>

        <span className="text-xs px-3 py-1 rounded-xl bg-violet-500/10 text-violet-300">
          AI TRADING LOGIC
        </span>
      </div>

      {/* Mode Selector (UI only for now) */}
      <div className="flex gap-2 mb-6">
        {['Aggressive', 'Balanced', 'Conservative'].map((m) => (
          <button
            key={m}
            className={`px-3 py-1 rounded-xl text-xs border transition ${
              mode === m
                ? 'bg-violet-500/20 border-violet-500/30 text-violet-300'
                : 'border-white/10 text-gray-400'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Signals */}
      <div className="space-y-4">
        {executionSignals.map((s) => (
          <div
            key={s.asset}
            className="rounded-2xl border border-white/5 bg-white/[0.02] p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">{s.asset}</p>

              <span className={`text-sm font-semibold ${getColor(s.action)}`}>
                {s.action}
              </span>
            </div>

            <p className="text-xs text-gray-400 mb-3">{s.reason}</p>

            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-violet-500"
                style={{ width: `${s.confidence}%` }}
              />
            </div>

            <p className="text-[11px] text-gray-500 mt-2">
              Confidence: {s.confidence}%
            </p>
          </div>
        ))}
      </div>

      {/* Glow */}
      <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-violet-500/10 blur-3xl rounded-full" />
    </div>
  );
}