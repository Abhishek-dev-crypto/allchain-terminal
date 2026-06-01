'use client';

import { useEffect, useState } from 'react';

type Trade = {
  id: string;
  coin: string;
  price: number;
  qty: number;
  timestamp: number;
};

export default function LiveTradeFeed({ trades }: { trades: Trade[] }) {
  const [feed, setFeed] = useState<Trade[]>([]);

  useEffect(() => {
    if (!trades?.length) return;

    // Keep last 20 trades
    const latest = [...trades].slice(-20).reverse();
    setFeed(latest);
  }, [trades]);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 h-[200px] overflow-hidden">
      <h3 className="text-sm text-gray-400 mb-2">Live Trades</h3>

      <div className="space-y-1 text-xs">
        {feed.map((t, index) => (
          <div
           key={`${t.id}-${index}`}
            className="flex justify-between animate-fadeIn"
          >
            <span className="text-gray-300">
              {t.coin.toUpperCase()}
            </span>

            <span className="text-white">
              ${t.price.toFixed(2)}
            </span>

            <span className="text-blue-400">
              {t.qty.toFixed(4)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}