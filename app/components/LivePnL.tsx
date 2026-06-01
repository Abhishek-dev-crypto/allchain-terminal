'use client';

import { useEffect, useState } from 'react';

export default function LivePnL({
  portfolio,
  priceMap,
}: {
  portfolio: any;
  priceMap: Record<string, number>;
}) {
  const [pnl, setPnl] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      let total = 0;

      for (const coin in portfolio) {
        const pos = portfolio[coin];
        const current = priceMap[coin] || pos.avgPrice;

        total += (current - pos.avgPrice) * pos.qty;
      }

      setPnl(total);
    }, 1000);

    return () => clearInterval(interval);
  }, [portfolio, priceMap]);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
      <p className="text-xs text-gray-400">Live PnL</p>

      <p
        className={`text-lg font-bold ${
          pnl >= 0 ? 'text-green-400' : 'text-red-400'
        }`}
      >
        {pnl >= 0 ? '+' : ''}₹{pnl.toFixed(2)}
      </p>
    </div>
  );
}