'use client';

import React, { useMemo, useState } from 'react';

export default function PositionsPanel({
  portfolio,
  trades,
  currentPriceMap,
}: any) {

  const [tab, setTab] = useState<
    'positions' | 'orders' | 'history'
  >('positions');

  /* ---------------- OPEN POSITIONS ---------------- */
  const positions = useMemo(() => {
    return Object.entries(portfolio || {})
      .filter(([_, p]: any) => p.qty > 0)
      .map(([coin, p]: any) => {

        const currentPrice =
          (currentPriceMap?.[coin] || 0) * 83;

        const pnl =
          (currentPrice - p.avgPrice) * p.qty;

        const pnlPercent =
          p.avgPrice > 0
            ? (pnl / (p.avgPrice * p.qty)) * 100
            : 0;

        return {
          coin: coin.toUpperCase(),
          qty: p.qty,
          avgPrice: p.avgPrice,
          currentPrice,
          pnl,
          pnlPercent,
        };
      });
  }, [portfolio, currentPriceMap]);

  return (
    <div className="rounded-xl border border-white/5 bg-[#0B1220]/80 backdrop-blur overflow-hidden">

      {/* HEADER */}
      <div className="flex border-b border-white/5 hover:bg-white/5 transition">

        {[
          {
            key: 'positions',
            label: `OPEN POSITIONS (${positions.length})`,
          },
          {
            key: 'orders',
            label: 'ACTIVE ORDERS (0)',
          },
          {
            key: 'history',
            label: `TRADE HISTORY (${trades.length})`,
          },
        ].map((item: any) => (

          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`px-3 py-1.5 text-[10px] font-medium tracking-wide transition-all
              ${
                tab === item.key
                  ? 'text-white border-b border-blue-500 bg-white/5'
                  : 'text-gray-500 hover:text-gray-300 font-mono tabular-nums'
              }
            `}
          >
            {item.label}
          </button>

        ))}

      </div>

      {/* CONTENT */}
      <div className="h-[165px] overflow-y-auto">

        {/* OPEN POSITIONS */}
        {tab === 'positions' && (

          <table className="w-full text-[11px]">

            <thead className="text-gray-500 border-b border-white/5 hover:bg-white/5 transition">
              <tr>
                <th className="text-left px-3 py-2">PAIR</th>
                <th className="text-left px-3 py-2">SIZE</th>
                <th className="text-left px-3 py-2">ENTRY PRICE</th>
                <th className="text-left px-3 py-2">MARK PRICE</th>
                <th className="text-left px-3 py-2">PNL</th>
              </tr>
            </thead>

            <tbody>

              {positions.length === 0 ? (

                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-10 text-gray-500"
                  >
                    No open positions
                  </td>
                </tr>

              ) : (

                positions.map((p: any) => (

                  <tr
                    key={p.coin}
                    className="border-b border-white/5 hover:bg-white/5 transition"
                  >

                    <td className="px-2 py-1.5 font-semibold text-white">
                      {p.coin}
                    </td>

                    <td className="px-2 py-1.5 text-gray-300 font-mono tabular-nums">
                      {p.qty.toFixed(6)}
                    </td>

                    <td className="px-2 py-1.5 text-gray-300 font-mono tabular-nums">
                      ₹{p.avgPrice.toFixed(2)}
                    </td>

                    <td className="px-2 py-1.5 text-gray-300 font-mono tabular-nums">
                      ₹{p.currentPrice.toFixed(2)}
                    </td>

                    <td
                      className={`px-2 py-1.5 font-semibold
                        ${
                          p.pnl >= 0
                            ? 'text-green-400'
                            : 'text-red-400'
                        }
                      `}
                    >
                      ₹{p.pnl.toFixed(2)}
                      {' '}
                      ({p.pnlPercent.toFixed(2)}%)
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        )}

        {/* ACTIVE ORDERS */}
        {tab === 'orders' && (

          <div className="h-full flex items-center justify-center text-gray-500 text-sm">
            No active orders
          </div>

        )}

        {/* TRADE HISTORY */}
        {tab === 'history' && (

         <table className="w-full text-[11px]">

            <thead className="text-gray-500 border-b border-white/5 hover:bg-white/5 transition hover:bg-white/5 transition">
              <tr>
                <th className="text-left px-3 py-2">TYPE</th>
                <th className="text-left px-3 py-2">PAIR</th>
                <th className="text-left px-3 py-2">PRICE</th>
                <th className="text-left px-3 py-2">QTY</th>
                <th className="text-left px-3 py-2">TIME</th>
              </tr>
            </thead>

            <tbody>

              {[...trades]
                .reverse()
                .map((t: any, i: number) => (

                <tr
                  key={i}
                  className="border-b border-white/5 hover:bg-white/5 transition"
                >

                  <td
                    className={`px-2 py-1.5 font-semibold
                      ${
                        t.type === 'buy'
                          ? 'text-green-400'
                          : 'text-red-400'
                      }
                    `}
                  >
                    {t.type.toUpperCase()}
                  </td>

                  <td className="px-2 py-1.5 text-white">
                    {t.coin.toUpperCase()}
                  </td>

                  <td className="px-2 py-1.5 text-gray-300 font-mono tabular-nums">
                    ₹{t.price.toFixed(2)}
                  </td>

                  <td className="px-2 py-1.5 text-gray-300 font-mono tabular-nums">
                    {t.qty.toFixed(6)}
                  </td>

                  <td className="px-2 py-1.5 text-gray-500">
                    {new Date(t.timestamp).toLocaleTimeString()}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

    </div>
  );
}