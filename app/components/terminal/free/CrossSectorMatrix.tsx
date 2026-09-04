"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

import { buildMarketEngine } from "@/lib/intel/marketEngine";
import { useMarket } from "@/lib/providers/MarketProvider";

export default function CrossSectorMatrix() {
  const { coins } = useMarket();

  /**
   * MARKET ENGINE
   */
  const market = useMemo(() => {
    return buildMarketEngine(coins);
  }, [coins]);

  /**
   * SORT SECTORS BY PERFORMANCE
   */
  const rankedFlows = [...market.flows].sort(
    (a, b) => b.avg - a.avg
  );

  /**
   * BEGINNER-FRIENDLY MARKET SUMMARY
   */
  const marketSummary =
    market.regime === "RISK_ON"
      ? {
          label: "Bullish Market",
          description:
            "Most sectors are moving higher, showing broad buying interest.",
        }
      : market.regime === "RISK_OFF"
      ? {
          label: "Defensive Market",
          description:
            "Investors are becoming cautious and moving away from riskier areas.",
        }
      : market.regime === "ROTATION"
      ? {
          label: "Money Is Rotating",
          description:
            "Different sectors are taking turns leading the market.",
        }
      : {
          label: "Mixed Market",
          description:
            "The market is moving without a clear sector leader.",
        };

  /**
   * BEGINNER-FRIENDLY SECTOR INTERPRETATION
   */
  function getSectorState(avg: number) {
    if (avg > 5) {
      return {
        label: "Strong buying",
        description: "Money is flowing strongly into this area.",
        symbol: "↑",
        className:
          "text-emerald-300 border-emerald-400/20 bg-emerald-400/5",
      };
    }

    if (avg > 2) {
      return {
        label: "Buying interest",
        description: "This sector is attracting buyers.",
        symbol: "↗",
        className:
          "text-emerald-300 border-emerald-400/20 bg-emerald-400/5",
      };
    }

    if (avg < -5) {
      return {
        label: "Strong selling",
        description: "Selling pressure is strong in this area.",
        symbol: "↓",
        className:
          "text-red-300 border-red-400/20 bg-red-400/5",
      };
    }

    if (avg < -2) {
      return {
        label: "Selling pressure",
        description: "This sector is facing selling pressure.",
        symbol: "↘",
        className:
          "text-red-300 border-red-400/20 bg-red-400/5",
      };
    }

    return {
      label: "Neutral",
      description: "There is no strong buying or selling signal.",
      symbol: "→",
      className:
        "text-cyan-300 border-cyan-400/20 bg-cyan-400/5",
    };
  }

  /**
   * SIMPLE AI INTERPRETATION
   */
  const interpretation =
    market.regime === "RISK_ON"
      ? "Buyers are active across the market. Stronger sectors may continue to attract attention, but chasing the biggest move can increase risk."
      : market.regime === "RISK_OFF"
      ? "The market is becoming defensive. Stronger sectors may hold up better while weaker sectors face additional selling pressure."
      : market.regime === "ROTATION"
      ? "Money is moving between sectors rather than lifting the entire market. Watch which sectors are gaining strength."
      : "The market does not have a clear leader yet. Waiting for stronger confirmation may be more useful than chasing individual moves.";

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.3,
      }}
      className="
        rounded-3xl
        border
        border-white/10
        bg-white/[0.02]
        p-3
      "
    >
      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-cyan-300">
            MARKET FLOW
          </div>

          <div className="mt-1 text-sm font-semibold text-white">
            Where Is the Money Moving?
          </div>
        </div>

        <div className="rounded-lg border border-white/10 px-2 py-1 text-[11px] text-cyan-300">
          {marketSummary.label}
        </div>
      </div>

      {/* MARKET SUMMARY */}
      <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-3">
        <div className="text-[11px] uppercase tracking-wide text-cyan-300">
          What the market is doing
        </div>

        <div className="mt-1 text-sm font-medium text-white">
          {marketSummary.label}
        </div>

        <p className="mt-1 text-xs leading-relaxed text-white/50">
          {marketSummary.description}
        </p>
      </div>

      {/* SECTOR MATRIX */}
      <div className="mt-5">
        <div className="mb-2 text-[11px] uppercase tracking-wide text-white/40">
          Sector Strength
        </div>

        <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
          {rankedFlows.map((flow, idx) => {
            const state = getSectorState(flow.avg);

            return (
              <motion.div
                key={flow.name}
                whileHover={{
                  y: -2,
                }}
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.02]
                  p-3
                  transition-all
                  duration-300
                "
              >
                {/* TOP ROW */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-white">
                      {flow.name}
                    </div>

                    {idx === 0 && flow.avg > 2 && (
                      <div className="rounded border border-emerald-400/20 bg-emerald-400/5 px-1.5 py-0.5 text-[9px] text-emerald-300">
                        TOP SECTOR
                      </div>
                    )}
                  </div>

                  <div
                    className={`text-sm font-semibold ${
                      flow.avg >= 0
                        ? "text-emerald-300"
                        : "text-red-300"
                    }`}
                  >
                    {flow.avg >= 0 ? "+" : ""}
                    {flow.avg.toFixed(2)}%
                  </div>
                </div>

                {/* INTERPRETATION */}
                <div className="mt-2 flex items-center gap-2">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-lg border text-sm ${state.className}`}
                  >
                    {state.symbol}
                  </div>

                  <div>
                    <div className="text-[11px] font-medium text-white/80">
                      {state.label}
                    </div>

                    <div className="text-[10px] text-white/40">
                      {state.description}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* SIMPLE EXPLANATION */}
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-3">
        <div className="text-[11px] uppercase tracking-wide text-white/40">
          AI Interpretation
        </div>

        <p className="mt-2 text-xs leading-relaxed text-white/65">
          {interpretation}
        </p>
      </div>
    </motion.section>
  );
}