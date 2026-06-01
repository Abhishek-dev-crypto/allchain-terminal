'use client';

import { useMemo } from 'react';

export default function TradeJournalAI() {
  const trades = useMemo(() => {
    return [
      {
        asset: 'BTC',
        type: 'BUY',
        entry: 64200,
        exit: 67100,
        pnl: 4.52,
        reason: 'Breakout above resistance with volume confirmation',
        sentiment: 'Confident',
      },
      {
        asset: 'ETH',
        type: 'BUY',
        entry: 3150,
        exit: 3520,
        pnl: 11.74,
        reason: 'AI momentum signal + sector rotation',
        sentiment: 'Very Confident',
      },
      {
        asset: 'SOL',
        type: 'SELL',
        entry: 190,
        exit: 175,
        pnl: -7.89,
        reason: 'Overheated RSI + profit taking signal',
        sentiment: 'Cautious',
      },
      {
        asset: 'BNB',
        type: 'BUY',
        entry: 580,
        exit: 615,
        pnl: 6.03,
        reason: 'Institutional inflow detection',
        sentiment: 'Confident',
      },
    ];
  }, []);

  const totalPnL = trades.reduce((acc, t) => acc + t.pnl, 0);

  const winRate =
    (trades.filter((t) => t.pnl > 0).length / trades.length) * 100;

  const getColor = (pnl: number) => {
    return pnl >= 0 ? 'text-emerald-400' : 'text-red-400';
  };

  const getBadge = (type: string) => {
    if (type === 'BUY') return 'bg-emerald-500/10 text-emerald-400';
    return 'bg-red-500/10 text-red-400';
  };

  return (
    <div className="rounded-3xl border border-violet-500/10 bg-white/[0.03] p-6 relative overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Trade Journal AI</h3>

        <span className="text-xs px-3 py-1 rounded-xl bg-violet-500/10 text-violet-300">
          MEMORY ENGINE
        </span>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-gray-400">Total PnL</p>
          <p className="text-xl font-semibold text-emerald-400 mt-1">
            +{totalPnL.toFixed(2)}%
          </p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-gray-400">Win Rate</p>
          <p className="text-xl font-semibold mt-1">
            {winRate.toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Trade List */}
      <div className="space-y-4">
        {trades.map((t, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-white/5 bg-white/[0.02] p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <p className="font-medium">{t.asset}</p>

                <span
                  className={`text-xs px-2 py-1 rounded-md ${getBadge(
                    t.type
                  )}`}
                >
                  {t.type}
                </span>
              </div>

              <p className={`text-sm font-semibold ${getColor(t.pnl)}`}>
                {t.pnl >= 0 ? '+' : ''}
                {t.pnl}%
              </p>
            </div>

            <div className="text-xs text-gray-400 mb-2">
              Entry: ${t.entry} → Exit: ${t.exit}
            </div>

            <p className="text-xs text-gray-300 mb-2">{t.reason}</p>

            <p className="text-[11px] text-gray-500">
              Sentiment: {t.sentiment}
            </p>
          </div>
        ))}
      </div>

      {/* AI Insight */}
      <div className="mt-6 rounded-2xl border border-violet-500/10 bg-violet-500/5 p-4">
        <p className="text-xs text-gray-300">
          AI Insight: Your strongest performance comes from momentum-based entries
          aligned with liquidity inflow signals. Losses occur during early reversal attempts.
        </p>
      </div>

      {/* Glow */}
      <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-violet-500/10 blur-3xl rounded-full" />
    </div>
  );
}