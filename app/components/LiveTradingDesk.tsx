"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

type TradeSetup = {
  coin: string;
  direction: "BUY" | "SELL";
  entry: number;
  target: number;
  stop: number;
  confidence: number;
};

type Coin = {
  symbol: string;
  price: number;
  prev: number;
};

type Props = {
  selectedCoin: string;
  setSelectedCoin: (coin: string) => void;
  coins: Coin[];
  activeCoin: Coin;
  marketMode: string;
  terminalStatus: string;
  aiPhase: "idle" | "analyzing" | "suggestion" | "trade";
  visibleReasoning: string[];
  reasoning: string[];
  displaySignal: "BUY" | "SELL";
  displayConfidence: number;
  tradeSetup: TradeSetup | null;
  history: number[];
  pnl: number;
};

export default function LiveTradingDesk({
  selectedCoin,
  setSelectedCoin,
  coins,
  activeCoin,
  marketMode,
  aiPhase,
  visibleReasoning,
  reasoning,
  displaySignal,
  displayConfidence,
  tradeSetup,
  history,
  pnl,
}: Props) {
  const activeSteps =
    aiPhase === "analyzing"
      ? visibleReasoning
      : reasoning;

  const isBuy = displaySignal === "BUY";

  const maxHistory = useMemo(() => {
    return Math.max(...history, 1);
  }, [history]);

  const priceChange =
    activeCoin.prev > 0
      ? ((activeCoin.price - activeCoin.prev) /
          activeCoin.prev) *
        100
      : 0;

  const steps = useMemo(() => {
    return activeSteps.slice(0, 4);
  }, [activeSteps]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-12"
    >
      <motion.div
        className="relative max-w-[1450px] mx-auto overflow-hidden rounded-[24px] border border-white/10 bg-[#070b11] shadow-[0_0_80px_rgba(37,99,235,0.10)]"
        animate={{
          boxShadow: [
            "0px 0px 0px rgba(0,0,0,0)",
            "0px 0px 80px rgba(59,130,246,0.10)",
            "0px 0px 0px rgba(0,0,0,0)",
          ],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
        }}
      >
        {/* BACKGROUND */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_28%)]" />

        {/* ================================================= */}
        {/* TOP BAR */}
        {/* ================================================= */}

        <div className="relative border-b border-white/5 bg-black/20 px-4 py-2.5">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">

            {/* LEFT */}
            <div className="flex items-center flex-wrap gap-2">

              <div className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-white font-medium">
                {selectedCoin}/USDT
              </div>

              <div
                className={`px-2 py-1 rounded-md border text-[9px] font-medium ${
                  marketMode
                    .toLowerCase()
                    .includes("extreme")
                    ? "bg-red-500/10 border-red-500/20 text-red-400"
                    : marketMode
                        .toLowerCase()
                        .includes("bull")
                    ? "bg-green-500/10 border-green-500/20 text-green-400"
                    : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                }`}
              >
                {marketMode}
              </div>

              <div className="hidden md:flex items-center gap-2 text-[9px] text-gray-500">
                <span className="w-1 h-1 rounded-full bg-gray-600" />
                Neural execution active
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-2">

              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedCoin}
                  initial={{
                    opacity: 0,
                    y: 5,
                    scale: 0.96,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: -5,
                    scale: 0.96,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                  className="px-2.5 py-1 rounded-md bg-gradient-to-r from-blue-400 to-cyan-300 text-black text-[9px] font-semibold"
                >
                  {selectedCoin}
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center gap-1">

                {coins
                  .filter(
                    (coin) =>
                      coin.symbol !== selectedCoin
                  )
                  .slice(0, 3)
                  .map((coin) => (
                    <button
                      key={coin.symbol}
                      onClick={() =>
                        setSelectedCoin(
                          coin.symbol
                        )
                      }
                      className="px-2 py-1 rounded-md border border-white/10 bg-white/5 text-[9px] text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                      {coin.symbol}
                    </button>
                  ))}
              </div>

              <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/10 border border-green-500/20">

                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-green-400"
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.2,
                  }}
                />

                <span className="text-[9px] text-green-400 font-medium">
                  LIVE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* MAIN GRID */}
        {/* ================================================= */}

        <div className="relative grid lg:grid-cols-[190px_1fr_240px] gap-2 p-2">

          {/* ================================================= */}
          {/* LEFT RAIL */}
          {/* ================================================= */}

          <div className="space-y-2">

            {/* DIRECTION */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2">

              <div className="text-[9px] uppercase tracking-[0.14em] text-gray-500 mb-2">
                Directional Bias
              </div>

              <div
                className={`text-2xl font-bold ${
                  isBuy
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {displaySignal}
              </div>

              <div className="text-[10px] text-gray-400 mt-1">
                Confidence {displayConfidence}%
              </div>

              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-2">

                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${displayConfidence}%`,
                  }}
                  transition={{
                    duration: 0.5,
                  }}
                  className={`h-full ${
                    isBuy
                      ? "bg-gradient-to-r from-green-400 to-emerald-300"
                      : "bg-gradient-to-r from-red-400 to-orange-300"
                  }`}
                />
              </div>
            </div>

            {/* TELEMETRY */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2 space-y-2">

              <div className="text-[9px] uppercase tracking-[0.14em] text-gray-500">
                Market Telemetry
              </div>

              {[
                [
                  "Volatility",
                  marketMode,
                  "text-yellow-400",
                ],
                [
                  "Latency",
                  "128ms",
                  "text-green-400",
                ],
                [
                  "Liquidity",
                  "Stable",
                  "text-blue-400",
                ],
                [
                  "Spread",
                  "0.04%",
                  "text-white",
                ],
                [
                  "AI Drift",
                  "+2.1",
                  "text-cyan-400",
                ],
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between text-[10px]"
                >
                  <span className="text-gray-500">
                    {item[0]}
                  </span>

                  <span
                    className={`font-medium ${item[2]}`}
                  >
                    {item[1]}
                  </span>
                </div>
              ))}
            </div>

            {/* PNL */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2">

              <div className="text-[9px] uppercase tracking-[0.14em] text-gray-500 mb-2">
                Live PnL
              </div>

              <div
                className={`text-xl font-bold ${
                  pnl >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                ₹{pnl >= 0 ? "+" : ""}
                {pnl.toFixed(2)}
              </div>

              <div className="text-[10px] text-gray-500 mt-1">
                Simulated performance
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* CENTER ENGINE */}
          {/* ================================================= */}

          <div className="rounded-2xl border border-white/10 bg-[#0b1119] overflow-hidden">

            {/* TOP */}
            <div className="border-b border-white/5 px-4 py-3 flex items-start justify-between">

              <div>

                <div className="text-[9px] uppercase tracking-[0.16em] text-gray-500 mb-2">
                  Neural Decision Engine
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedCoin}
                    initial={{
                      opacity: 0,
                      y: 5,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -5,
                    }}
                  >
                    <div className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                      $
                      {activeCoin.price.toFixed(
                        2
                      )}
                    </div>

                    <div
                      className={`mt-1 text-xs font-medium ${
                        priceChange >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {priceChange >= 0
                        ? "▲"
                        : "▼"}{" "}
                      {Math.abs(
                        priceChange
                      ).toFixed(2)}
                      %
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="text-right">

                <div className="text-[9px] uppercase tracking-[0.14em] text-gray-500 mb-1">
                  AI State
                </div>

                <div className="text-xs text-green-400 font-medium">
                  {aiPhase === "analyzing"
                    ? "Analyzing"
                    : "Operational"}
                </div>
              </div>
            </div>

            {/* CHART */}
            <div className="relative h-[320px] md:h-[420px] px-3 py-4 overflow-hidden">

              <div className="absolute inset-0 bg-blue-500/[0.03] blur-3xl" />

              {/* GRID */}
              <div className="absolute inset-0 opacity-[0.05]">

                <div className="h-full w-full bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:40px_40px]" />
              </div>

              {/* METRICS */}
              <div className="absolute top-3 left-3 z-20">

                <div className="grid grid-cols-3 gap-1.5 max-w-[280px]">

                  {[
                    [
                      "Momentum",
                      "84",
                      "text-green-400",
                    ],
                    [
                      "Risk",
                      "31",
                      "text-yellow-400",
                    ],
                    [
                      "Liquidity",
                      "72",
                      "text-blue-400",
                    ],
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-white/10 bg-black/40 backdrop-blur-xl px-2 py-1.5"
                    >
                      <div className="text-[7px] uppercase tracking-[0.12em] text-gray-500">
                        {item[0]}
                      </div>

                      <div
                        className={`text-xs font-semibold mt-1 ${item[2]}`}
                      >
                        {item[1]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CHART */}
              <div className="relative h-full flex items-end gap-[2px]">

                {history.map((p, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      height: 0,
                    }}
                    animate={{
                      height: `${
                        history.length
                          ? Math.max(
                              8,
                              (p /
                                maxHistory) *
                                82
                            )
                          : 8
                      }%`,
                    }}
                    transition={{
                      duration: 0.25,
                    }}
                    className={`flex-1 rounded-t-sm ${
                      isBuy
                        ? "bg-gradient-to-t from-green-500 to-emerald-300"
                        : "bg-gradient-to-t from-red-500 to-orange-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* EXECUTION BAR */}
            <div className="border-t border-white/5 px-3 py-2 grid grid-cols-2 md:grid-cols-5 gap-2">

              {[
                [
                  "Direction",
                  tradeSetup?.direction ||
                    "--",
                  tradeSetup?.direction ===
                  "BUY"
                    ? "text-green-400"
                    : tradeSetup?.direction ===
                      "SELL"
                    ? "text-red-400"
                    : "text-gray-400",
                ],
                [
                  "Entry",
                  tradeSetup
                    ? `$${tradeSetup.entry.toFixed(
                        2
                      )}`
                    : "--",
                  "text-blue-400",
                ],
                [
                  "Target",
                  tradeSetup
                    ? `$${tradeSetup.target.toFixed(
                        2
                      )}`
                    : "--",
                  "text-yellow-400",
                ],
                [
                  "Risk",
                  displayConfidence > 75
                    ? "LOW"
                    : displayConfidence > 50
                    ? "MEDIUM"
                    : "HIGH",
                  displayConfidence > 75
                    ? "text-green-400"
                    : displayConfidence > 50
                    ? "text-yellow-400"
                    : "text-red-400",
                ],
                [
                  "Exec",
                  "128ms",
                  "text-cyan-400",
                ],
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-white/5 bg-white/[0.03] px-2 py-2"
                >
                  <div className="text-[8px] uppercase tracking-[0.12em] text-gray-500">
                    {item[0]}
                  </div>

                  <div
                    className={`text-xs font-semibold mt-1 ${item[2]}`}
                  >
                    {item[1]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ================================================= */}
          {/* RIGHT RAIL */}
          {/* ================================================= */}

          <div className="space-y-2">

            {/* MARKET STRUCTURE */}
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.05] p-2">

              <div className="flex items-center justify-between mb-3">

                <div className="text-[9px] uppercase tracking-[0.14em] text-blue-300">
                  Structure Analysis
                </div>

                <div className="text-[8px] text-gray-500">
                  AI CORE
                </div>
              </div>

              <div className="space-y-2">

                {steps.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      opacity: 0,
                      x: -4,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    className="flex gap-2 text-[10px] text-gray-300"
                  >
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400" />

                    <div className="leading-relaxed">
                      {r}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* LIVE FEED */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2">

              <div className="text-[9px] uppercase tracking-[0.14em] text-gray-500 mb-3">
                Live Activity Feed
              </div>

              <div className="space-y-2 text-[10px]">

                {[
                  "Momentum breakout detected",
                  "Liquidity sweep confirmed",
                  "Directional bias recalculated",
                  "Neural confidence updated",
                  "Execution model stabilized",
                ].map((log, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2 + i,
                    }}
                    className="flex items-start gap-2"
                  >
                    <span className="text-cyan-400">
                      [{`09:4${i}`}]
                    </span>

                    <span className="text-gray-300">
                      {log}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* INFRA */}
            <div className="rounded-xl border border-white/10 bg-gradient-to-r from-white/[0.03] to-transparent p-2">

              <div className="text-[9px] uppercase tracking-[0.14em] text-gray-500 mb-2">
                Infrastructure
              </div>

              <div className="space-y-2 text-[10px] text-gray-300">

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Market Feed
                  </span>

                  <span className="text-green-400">
                    CONNECTED
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    AI Engine
                  </span>

                  <span className="text-green-400">
                    ACTIVE
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Simulation
                  </span>

                  <span className="text-blue-400">
                    REAL-TIME
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Risk Layer
                  </span>

                  <span className="text-yellow-400">
                    MONITORING
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}