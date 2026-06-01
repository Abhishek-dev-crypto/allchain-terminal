"use client";

import React, { useEffect, useRef, useMemo } from "react";

type Coin = {
  symbol: string;
  price: number;
};

type Props = {
  coins: Coin[];
};

/* ===== COIN META ===== */
const coinMeta: Record<
  string,
  { icon: string; color: string }
> = {
  BTC: { icon: "₿", color: "text-yellow-400" },
  ETH: { icon: "Ξ", color: "text-blue-400" },
  SOL: { icon: "◎", color: "text-purple-400" },
  BNB: { icon: "🟡", color: "text-yellow-300" },
  XRP: { icon: "✕", color: "text-blue-300" },
  DOGE: { icon: "🐶", color: "text-yellow-500" },
};

export default function LiveTicker({ coins }: Props) {
  const prevPricesRef = useRef<Record<string, number>>({});

  const THRESHOLD = 0.02;

  const loopedCoins = useMemo(() => [...coins, ...coins], [coins]);

  /* ===== INIT + UPDATE PREV PRICES ===== */
  useEffect(() => {
    coins.forEach((coin) => {
      if (!prevPricesRef.current[coin.symbol]) {
        prevPricesRef.current[coin.symbol] = coin.price;
      }
    });

    // Update after render for continuous % change
    const t = setTimeout(() => {
      coins.forEach((coin) => {
        prevPricesRef.current[coin.symbol] = coin.price;
      });
    }, 200);

    return () => clearTimeout(t);
  }, [coins]);

  return (
    <div className="fixed top-[72px] left-0 w-full z-40 bg-[#020617] border-b border-white/10 h-10 flex items-center overflow-hidden">

      <div className="ticker w-full overflow-hidden group">
        <div className="ticker__track flex whitespace-nowrap">

          {loopedCoins.map((coin, i) => {
            const prev = prevPricesRef.current[coin.symbol] ?? coin.price;

            const diff = coin.price - prev;
            const isUp = diff > THRESHOLD;
            const isDown = diff < -THRESHOLD;

            const percent =
              prev === 0
                ? 0
                : ((coin.price - prev) / prev) * 100;

            const meta = coinMeta[coin.symbol];

            return (
              <div
                key={`${coin.symbol}-${i}`}
                className="flex items-center gap-2 px-5"
              >
                {/* ICON */}
                <span
                  className={`w-5 h-5 flex items-center justify-center text-xs rounded-full bg-white/5 ${
                    meta?.color || "text-gray-400"
                  }`}
                >
                  {meta?.icon || "•"}
                </span>

                {/* SYMBOL */}
                <span className="text-gray-300 text-sm font-medium">
                  {coin.symbol}
                </span>

                {/* PRICE */}
                <span className="text-white text-sm font-semibold tracking-tight tabular-nums">
                  ${coin.price.toFixed(2)}
                </span>

                {/* % CHANGE */}
                <span
                  className={`text-[11px] tabular-nums px-1.5 py-[2px] rounded ${
                    isUp
                      ? "bg-green-500/10 text-green-400"
                      : isDown
                      ? "bg-red-500/10 text-red-400"
                      : "bg-white/5 text-gray-400"
                  }`}
                >
                  {percent === 0
                    ? "0.00%"
                    : `${percent > 0 ? "+" : ""}${percent.toFixed(2)}%`}
                </span>
              </div>
            );
          })}

        </div>
      </div>

      {/* ===== ANIMATION ===== */}
      <style jsx>{`
        .ticker__track {
          display: flex;
          min-width: 200%;
          animation: scroll 28s linear infinite;
        }

        /* Pause on hover */
        .ticker:hover .ticker__track {
          animation-play-state: paused;
        }

        @keyframes scroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}