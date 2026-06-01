'use client';

import { useMemo } from 'react';

export default function BehavioralAnalytics() {
  const behaviorScore = useMemo(() => {
    return {
      emotionalStability: 71,
      fomoIndex: 64,
      panicRisk: 38,
      disciplineScore: 76,
    };
  }, []);

  const behaviors = [
    {
      label: 'FOMO Detection',
      value: 'Moderate',
      score: behaviorScore.fomoIndex,
      insight: 'Increased chasing during green candles',
    },
    {
      label: 'Panic Selling Risk',
      value: 'Low',
      score: behaviorScore.panicRisk,
      insight: 'Strong holding behavior observed',
    },
    {
      label: 'Emotional Stability',
      value: 'Stable',
      score: behaviorScore.emotionalStability,
      insight: 'Controlled reaction to volatility',
    },
    {
      label: 'Trading Discipline',
      value: 'High',
      score: behaviorScore.disciplineScore,
      insight: 'Consistent execution patterns detected',
    },
  ];

  const getColor = (score: number) => {
    if (score > 70) return 'bg-emerald-400';
    if (score > 40) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  const getTextColor = (score: number) => {
    if (score > 70) return 'text-emerald-400';
    if (score > 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="rounded-3xl border border-violet-500/10 bg-white/[0.03] p-6 relative overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Behavioral Analytics</h3>

        <span className="text-xs px-3 py-1 rounded-xl bg-violet-500/10 text-violet-300">
          PSYCHOLOGY AI
        </span>
      </div>

      {/* Overall Summary */}
      <div className="mb-6 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
        <p className="text-xs text-gray-400">Market Behavior Profile</p>

        <div className="mt-2 flex items-end justify-between">
          <p className="text-lg font-semibold text-white">
            Rational-Bullish Profile
          </p>

          <p className="text-sm text-emerald-400">
            Stable Trader
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-4">
        {behaviors.map((b) => (
          <div
            key={b.label}
            className="rounded-2xl border border-white/5 bg-white/[0.02] p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-300">{b.label}</p>

              <span className={`text-sm font-medium ${getTextColor(b.score)}`}>
                {b.value}
              </span>
            </div>

            <p className="text-xs text-gray-400 mb-3">{b.insight}</p>

            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className={`h-full ${getColor(b.score)}`}
                style={{ width: `${b.score}%` }}
              />
            </div>

            <p className="text-[11px] text-gray-500 mt-2">
              Score: {b.score}/100
            </p>
          </div>
        ))}
      </div>

      {/* AI Footer Insight */}
      <div className="mt-6 rounded-2xl border border-violet-500/10 bg-violet-500/5 p-4">
        <p className="text-xs text-gray-300">
          AI Insight: Your trading behavior shows strong discipline during volatility,
          with minor FOMO tendencies during breakout cycles.
        </p>
      </div>

      {/* Glow */}
      <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-violet-500/10 blur-3xl rounded-full" />
    </div>
  );
}