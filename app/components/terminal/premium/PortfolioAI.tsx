'use client';

import { useMemo } from 'react';

export default function PortfolioAI() {
  const portfolio = useMemo(() => {
    return {
      totalValue: 124580,
      pnl: 8.42,
      riskScore: 62,
      diversification: 74,
    };
  }, []);

  const holdings = [
    { asset: 'BTC', allocation: 42, pnl: 11.2, insight: 'Core strength holding' },
    { asset: 'ETH', allocation: 28, pnl: 6.8, insight: 'Stable accumulation zone' },
    { asset: 'SOL', allocation: 14, pnl: -2.1, insight: 'Short-term correction risk' },
    { asset: 'USDT', allocation: 10, pnl: 0, insight: 'Liquidity reserve' },
    { asset: 'OTHERS', allocation: 6, pnl: 3.4, insight: 'High volatility basket' },
  ];

  const getRiskColor = (score: number) => {
    if (score > 70) return 'text-red-400';
    if (score > 40) return 'text-yellow-400';
    return 'text-emerald-400';
  };

  return (
    <div className="rounded-3xl border border-violet-500/10 bg-white/[0.03] p-6 relative overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">AI Portfolio Intelligence</h3>

        <span className="text-xs px-3 py-1 rounded-xl bg-violet-500/10 text-violet-300">
          PRIVATE ANALYTICS
        </span>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-gray-400">Portfolio Value</p>
          <p className="text-xl font-semibold mt-1">
            ${portfolio.totalValue.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-gray-400">Total PnL</p>
          <p className="text-xl font-semibold text-emerald-400 mt-1">
            +{portfolio.pnl}%
          </p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-gray-400">Risk Score</p>
          <p className={`text-xl font-semibold mt-1 ${getRiskColor(portfolio.riskScore)}`}>
            {portfolio.riskScore}/100
          </p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-gray-400">Diversification</p>
          <p className="text-xl font-semibold mt-1">
            {portfolio.diversification}%
          </p>
        </div>
      </div>

      {/* Holdings */}
      <div className="space-y-4">
        {holdings.map((h) => (
          <div
            key={h.asset}
            className="rounded-2xl border border-white/5 bg-white/[0.02] p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">{h.asset}</p>

              <div className="text-right">
                <p className="text-sm">{h.allocation}%</p>
                <p
                  className={`text-xs ${
                    h.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {h.pnl >= 0 ? '+' : ''}
                  {h.pnl}%
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-400">{h.insight}</p>

            <div className="h-2 mt-3 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-violet-500"
                style={{ width: `${h.allocation}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Glow */}
      <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-violet-500/10 blur-3xl rounded-full" />
    </div>
  );
}