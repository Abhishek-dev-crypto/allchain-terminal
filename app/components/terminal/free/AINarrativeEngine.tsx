"use client";

import { motion } from "framer-motion";

import { useMarket } from "@/lib/providers/MarketProvider";
import type { FreeNarrative } from "@/lib/intel/freeNarrativeEngine";


export default function AINarrativeEngine() {
 const {
    narratives,
    engine,
} = useMarket();

  // =========================
  // SAFE UI HELPERS
  // =========================

  const getStateColor = (state: FreeNarrative["state"]) => {
    switch (state) {
      case "EARLY":
        return "text-cyan-300";
      case "BUILDING":
        return "text-blue-300";
      case "ACTIVE":
        return "text-emerald-300";
      case "HOT":
        return "text-yellow-300";
      case "COOLING":
        return "text-red-300";
      default:
        return "text-xs text-white";
    }
  };

  const getSentimentColor = (sentiment: FreeNarrative["sentiment"]) => {
    if (sentiment === "BULLISH") return "text-emerald-300";
    if (sentiment === "BEARISH") return "text-red-300";
    return "text-xs text-white/50";
  };

  const getVolatilityColor = () => {
  if (engine.volatility > 2.5) return "text-red-300";
  if (engine.volatility > 1.2) return "text-yellow-300";
  return "text-emerald-300";
};

  // =========================
  // RENDER
  // =========================

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-lg border border-white/10 bg-white/[0.03] p-3 space-y-3"
    >
      {/* HEADER */}
      <div>
  <div className="text-[10px] uppercase tracking-[0.35em] text-cyan-300/90">
    LIVE MARKET INTELLIGENCE
  </div>

  <h2 className="mt-1 text-sm font-semibold text-xs text-white">
    AI Narrative Engine
  </h2>

 {/* MARKET SIGNAL LAYER */}
<div className="mt-4">
  <div className="mb-3 text-[10px] uppercase tracking-widest text-white/40">
    Market Signal Layer
  </div>

  <div className="flex flex-wrap gap-3">

    {/* Mood */}
    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 min-w-[120px]">
      <div className="text-[10px] uppercase text-white/40">
        Market Mood
      </div>

      <div className="mt-1 text-sm font-semibold text-white">
        {engine.regime.replace("_", " ")}
      </div>
    </div>

    {/* Breadth */}
    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 min-w-[90px]">
      <div className="text-[10px] uppercase text-white/40">
        Breadth
      </div>

      <div className="mt-1 text-sm font-semibold text-white">
        {engine.positiveBreadth}%
      </div>
    </div>

    {/* Flow */}
    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 min-w-[130px]">
      <div className="text-[10px] uppercase text-white/40">
        Capital Flow
      </div>

      <div className="mt-1 text-sm font-semibold text-white">
        {engine.signals.flow.state}
      </div>
    </div>

    {/* Momentum */}
    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 min-w-[130px]">
      <div className="text-[10px] uppercase text-white/40">
        Momentum
      </div>

      <div className="mt-1 text-sm font-semibold text-cyan-300">
        {engine.signals.momentum.direction}
      </div>
    </div>

    {/* Volatility */}
    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 min-w-[110px]">
      <div className="text-[10px] uppercase text-white/40">
        Volatility
      </div>

      <div className={`mt-1 text-sm font-semibold ${getVolatilityColor()}`}>
        {engine.volatilityState}
      </div>
    </div>

  </div>
</div>
</div>

      {/* NARRATIVES */}
      <div className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-widest text-xs text-white/40">
            Narrative Intelligence Layer
          </div>

          <div className="text-xs text-white/40">
            {narratives.length} Active Narratives
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {narratives.map((item: FreeNarrative, i: number) => (
            <motion.div
             key={item.title}
              whileHover={{ scale: 1.01 }}
              className="rounded-lg border border-white/10 bg-white/[0.03] p-3 space-y-2"
            >
              <div className="flex justify-between">
                <div>
                  <div className="text-xs text-white">{item.title}</div>
                  <div className={`text-xs ${getStateColor(item.state)}`}>
                    {item.state}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-white/40 text-emerald-300">
                    {item.momentum.score.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-xs text-white/40">
                    {item.momentum.direction}
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm  text-xs text-white/70">
                    {item.insight}
                </p>

            {item.reasoning?.length > 0 && (
                <div className="mt-3 space-y-1 text-xs text-white/50">
                <div className="text-xs text-white/40 text-[10px] uppercase">
                    Why it’s happening
                </div>

                {item.reasoning.slice(0, 2).map((r, idx) => (
                    <div key={idx}>• {r}</div>
                ))}
                    </div>
                )}

              <div className="mt-4 flex justify-between text-sm">
                <div className="text-xs text-white/60">
                  {item.flow.type} ({item.flow.score})
                </div>

                <div className={getSentimentColor(item.sentiment)}>
                  {item.sentiment}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {item.assets.map((a) => (
                  <div
                    key={a}
                    className="rounded-lg border border-white/10 bg-black/20 px-2 py-1 text-xs text-white/70"
                  >
                    {a}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* LEADERS */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="text-[10px] uppercase tracking-widest text-xs text-white/40">
          Momentum Leaders
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {(engine.leaders ?? []).map((coin) => (
            <div
              key={coin.id}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
            >
              <div className="text-xs text-white">{coin.symbol}</div>
              <div className="text-emerald-300">
                +{coin.change24h.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}