'use client';

export default function PortfolioAnalytics({ trades, portfolio }: any) {
  const totalTrades = trades.length;

  const wins = trades.filter((t: any) => t.type === 'sell').length;
  const winRate = totalTrades ? (wins / totalTrades) * 100 : 0;

  const risk =
    Object.values(portfolio).length > 3 ? 'High' : 'Low';

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="p-3 bg-neutral-900 rounded">
        <p className="text-xs text-gray-400">Trades</p>
        <p className="text-lg">{totalTrades}</p>
      </div>

      <div className="p-3 bg-neutral-900 rounded">
        <p className="text-xs text-gray-400">Win Rate</p>
        <p className="text-lg">{winRate.toFixed(1)}%</p>
      </div>

      <div className="p-3 bg-neutral-900 rounded">
        <p className="text-xs text-gray-400">Risk</p>
        <p className="text-lg">{risk}</p>
      </div>
    </div>
  );
}