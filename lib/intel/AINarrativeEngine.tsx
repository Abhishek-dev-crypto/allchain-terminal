"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

import { buildFreeNarrativeEngine } from "@/lib/intel/freeNarrativeEngine";
import { useMarketSnapshot } from "@/lib/intel/useMarketSnapshot";

import type { Coin } from "@/lib/types/coin";
import type { FreeNarrative } from "@/lib/intel/freeNarrativeEngine";
import { useMarketData } from "@/app/hooks/useMarketData";

import { useMarket } from "@/lib/providers/MarketProvider";

export default function AINarrativeEngine() {

 const { data, isLoading, error } = useMarketData();

 const { engine } = useMarket();

const coins = data ?? [];
  /**
   * 📊 Snapshot Layer
   */
  const snapshot = useMarketSnapshot(coins);


  /**
   * 🧠 Narrative Intelligence Layer
   */
 const narratives: FreeNarrative[] = useMemo(() => {
  return buildFreeNarrativeEngine(engine);
}, [snapshot]);

  /**
   * 🎨 State Colors
   */
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
        return "text-white";
    }
  };

  /**
   * 🎯 Sentiment Colors
   */
  const getSentimentColor = (
    sentiment: FreeNarrative["sentiment"]
  ) => {
    switch (sentiment) {
      case "BULLISH":
        return "text-emerald-300";

      case "BEARISH":
        return "text-red-300";

      default:
        return "text-white/50";
    }
  };

  /**
   * 🌊 Flow Colors
   */
  const getFlowColor = (
    flow: FreeNarrative["flow"]["type"]
  ) => {
    switch (flow) {
      case "ACCUMULATION":
        return "text-emerald-300";

      case "DISTRIBUTION":
        return "text-red-300";

      default:
        return "text-white/50";
    }
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-2xl overflow-hidden">
      {/* HEADER */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-emerald-300">
            LIVE DESCRIPTIVE INTELLIGENCE
          </div>

          <h2 className="mt-1 text-lg font-semibold text-white">
            AI Narrative Engine
          </h2>

          <p className="mt-2 max-w-xl text-sm text-white/50">
            Real-time market intelligence generated from
            momentum structure, flow behavior, volatility,
            and large-cap participation.
          </p>
        </div>

        <div className="text-right">
          <div className="text-sm text-white">
            {narratives.length} Narratives
          </div>

          <div className="mt-1 text-[10px] text-white/40">
            Free Intelligence Layer
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {narratives.map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.01 }}
            transition={{
              duration: 0.2,
            }}
            className="rounded-xl border border-white/10 bg-black/20 p-4"
          >
            {/* TOP */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">
                  {item.title}
                </h3>

                <div
                  className={`mt-1 text-[10px] font-medium ${getStateColor(
                    item.state
                  )}`}
                >
                  {item.state}
                </div>
              </div>

              {/* MOMENTUM */}
              <div className="text-right">
                <div className="text-sm font-semibold text-emerald-300">
                  {item.momentum.score}
                </div>

                <div className="text-[10px] uppercase tracking-wide text-white/40">
                  {item.momentum.direction}
                </div>
              </div>
            </div>

            {/* INSIGHT */}
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              {item.insight}
            </p>

            {/* REASONING */}
            {item.reasoning?.length > 0 && (
              <div className="mt-4 space-y-2">
                {item.reasoning.map((reason, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-[10px] text-white/45"
                  >
                    <span className="mt-[3px] h-1 w-1 rounded-full bg-white/40" />

                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            )}

            {/* FLOW + SENTIMENT */}
            <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-white/40">
                  Market Flow
                </div>

                <div
                  className={`mt-1 text-sm font-medium ${getFlowColor(
                    item.flow.type
                  )}`}
                >
                  {item.flow.type}
                  <span className="ml-2 text-white/40">
                    ({item.flow.score})
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-white/40">
                  Sentiment
                </div>

                <div
                  className={`mt-1 text-sm font-medium ${getSentimentColor(
                    item.sentiment
                  )}`}
                >
                  {item.sentiment}
                </div>
              </div>
            </div>

            {/* ASSETS */}
            <div className="mt-5 flex flex-wrap gap-2">
              {item.assets.map((asset) => (
                <div
                  key={asset}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-white/65"
                >
                  {asset.toUpperCase()}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}