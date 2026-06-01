"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

export default function TopMovers() {

  const isLoading = false;

const topMovers = useMemo(() => {
  return [
    {
      symbol: "FET",
      name: "Fetch.ai",
      price: 2.14,
      change24h: 18.42,
      volume: 482000000,
    },
    {
      symbol: "RNDR",
      name: "Render",
      price: 10.22,
      change24h: 12.18,
      volume: 391000000,
    },
    {
      symbol: "SOL",
      name: "Solana",
      price: 176.42,
      change24h: 8.31,
      volume: 2200000000,
    },
    {
      symbol: "INJ",
      name: "Injective",
      price: 31.48,
      change24h: 7.62,
      volume: 284000000,
    },
    {
      symbol: "TAO",
      name: "Bittensor",
      price: 462.33,
      change24h: 6.14,
      volume: 198000000,
    },
    {
      symbol: "LINK",
      name: "Chainlink",
      price: 18.72,
      change24h: 4.88,
      volume: 610000000,
    },
  ];
}, []);

  return (
    <section className="relative h-full overflow-hidden rounded-[22px] border border-white/10 bg-[#060816] p-4 min-h-[260px]">

      {/* GRID BG */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* GLOW */}
      <div className="absolute top-0 right-0 h-[140px] w-[140px] bg-violet-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col h-full">

        {/* HEADER */}
        <div className="mb-4 flex items-center justify-between">

          <div>
            <h3 className="text-base font-semibold text-white">
              Top Movers
            </h3>
            <p className="mt-0.5 text-[11px] text-gray-500">
              Strongest 24H momentum
            </p>
          </div>

          {!isLoading && (
            <button className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[9px] uppercase tracking-[0.15em] text-violet-300 hover:bg-white/[0.06]">
              Live
            </button>
          )}

        </div>

        {/* LOADING STATE */}
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-[52px] rounded-xl border border-white/10 bg-white/5 animate-pulse"
              />
            ))}
          </div>

        ) : topMovers.length === 0 ? (

          /* EMPTY STATE */
          <div className="text-xs text-gray-500 border border-white/10 rounded-xl p-3">
            No market data available
          </div>

        ) : (

          /* DATA */
          <div className="space-y-2">

            {topMovers.map((coin: any, i: number) => {
              const positive = (coin.change24h ?? 0) >= 0;

              return (
                <motion.div
                  key={coin.symbol}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ scale: 1.01 }}
                  className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 hover:bg-white/[0.04]"
                >

                  {/* LEFT */}
                  <div className="flex items-center gap-3 min-w-0">

                    <div className="h-8 w-8 flex items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-violet-500/10 to-emerald-500/10 text-[10px] font-semibold text-white">
                      {coin.symbol?.slice(0, 5).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-white">
                        {coin.name}
                      </p>

                      <p className="text-[10px] text-gray-500">
                        ${Number(coin.volume ?? 0).toLocaleString("en-US")}
                      </p>
                    </div>

                  </div>

                  {/* RIGHT */}
                  <div className="text-right">

                    <p className="text-[13px] font-medium text-white">
                     ${Number(coin.price ?? 0).toLocaleString("en-US")}
                    </p>

                    <p
                      className={`text-[11px] font-medium ${
                        positive ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {positive ? "+" : ""}
                      {Number(coin.change24h ?? 0).toFixed(2)}%
                    </p>

                  </div>

                </motion.div>
              );
            })}

          </div>
        )}

      </div>
    </section>
  );
}