"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

import {
  buildFreeNarrativeEngine,
  type FreeNarrative,
} from "@/lib/intel/freeNarrativeEngine";

import { useMarket } from "@/lib/providers/MarketProvider";

export default function AINarrativeEngine() {
  const { engine, loading } = useMarket();

  const narratives: FreeNarrative[] = useMemo(() => {
    if (!engine) return [];
    return buildFreeNarrativeEngine(engine);
  }, [engine]);

  // =========================
  // HELPERS
  // =========================

  const getStateColor = (state: string) => {
    switch (state) {
      case "RISK_ON":
      case "HOT":
      case "ACTIVE":
        return "text-emerald-300";

      case "RISK_OFF":
      case "COOLING":
        return "text-red-300";

      case "ROTATION":
      case "BUILDING":
        return "text-cyan-300";

      default:
        return "text-yellow-300";
    }
  };

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === "BULLISH") return "text-emerald-300";
    if (sentiment === "BEARISH") return "text-red-300";
    return "text-yellow-300";
  };

  const getVolatilityColor = () => {
    switch (engine.volatilityState) {
      case "EXTREME":
      case "ELEVATED":
        return "text-red-300";

      case "NORMAL":
        return "text-yellow-300";

      default:
        return "text-emerald-300";
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="animate-pulse text-xs text-white/50">
          Loading narrative intelligence...
        </div>
      </section>
    );
  }

  // =========================
  // RENDER
  // =========================

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* ===================================================== */}
      {/* HEADER                                                 */}
      {/* ===================================================== */}

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />

          <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-300/80">
            Live Market Intelligence
          </span>
        </div>

        <h1 className="text-lg font-semibold text-white">
          Narrative Intelligence
        </h1>

        <p className="max-w-2xl text-xs leading-relaxed text-white/50">
          What is driving crypto markets right now?
        </p>

        <p className="max-w-3xl text-xs leading-relaxed text-white/40">
          Interprets market data to identify the dominant themes,
          structures, and forces shaping the market.
        </p>
      </div>

      {/* ===================================================== */}
      {/* 01 — MARKET SIGNAL LAYER                              */}
      {/* ===================================================== */}

      <section className="space-y-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-white/30">
            01 — Market Signal Layer
          </div>

          <h2 className="mt-1 text-sm font-semibold text-white">
            What the market is doing
          </h2>

          <p className="mt-1 text-xs text-white/40">
            Quantitative signals showing the current market regime,
            momentum, breadth, capital flow, and volatility.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          {/* REGIME */}
          <SignalCard
            label="Market Regime"
            value={engine.regime}
            secondary={`${engine.regimeConfidence.toFixed(1)}% confidence`}
            valueClass={getStateColor(engine.regime)}
          />

          {/* MOMENTUM */}
          <SignalCard
            label="Momentum"
            value={engine.momentum}
            secondary={`Strength ${engine.signals.momentum.strength.toFixed(
              1
            )}`}
            valueClass="text-cyan-300"
          />

          {/* BREADTH */}
          <SignalCard
            label="Market Breadth"
            value={`${engine.positiveBreadth.toFixed(1)}%`}
            secondary={`${engine.negativeBreadth.toFixed(1)}% negative`}
            valueClass={
              engine.positiveBreadth >= 60
                ? "text-emerald-300"
                : engine.positiveBreadth <= 40
                ? "text-red-300"
                : "text-yellow-300"
            }
          />

          {/* FLOW */}
          <SignalCard
            label="Capital Flow"
            value={engine.signals.flow.state}
            secondary={`Score ${engine.signals.flow.score.toFixed(1)}`}
            valueClass={
              engine.signals.flow.state === "ACCUMULATION"
                ? "text-emerald-300"
                : engine.signals.flow.state === "DISTRIBUTION"
                ? "text-red-300"
                : "text-yellow-300"
            }
          />

          {/* VOLATILITY */}
          <SignalCard
            label="Volatility"
            value={engine.volatilityState}
            secondary={`Movement ${engine.volatility.toFixed(2)}`}
            valueClass={getVolatilityColor()}
          />
        </div>
      </section>

      {/* ===================================================== */}
      {/* 02 — TOP NARRATIVES                                   */}
      {/* ===================================================== */}

      <section className="space-y-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-white/30">
            02 — Top Narratives
          </div>

          <h2 className="mt-1 text-sm font-semibold text-white">
            What is driving the market?
          </h2>

          <p className="mt-1 text-xs text-white/40">
            AI-generated interpretations of the market conditions
            currently influencing crypto.
          </p>
        </div>

        {narratives.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-xs text-white/40">
            No active narratives detected.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {narratives.map((item, index) => (
              <NarrativeCard
                key={item.title}
                item={item}
                index={index}
                getStateColor={getStateColor}
                getSentimentColor={getSentimentColor}
              />
            ))}
          </div>
        )}
      </section>

      {/* ===================================================== */}
      {/* 03 — MARKET CONTEXT                                   */}
      {/* ===================================================== */}

      <section className="space-y-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-white/30">
            03 — Market Context
          </div>

          <h2 className="mt-1 text-sm font-semibold text-white">
            How the market is positioned
          </h2>

          <p className="mt-1 text-xs text-white/40">
            Provides the broader context behind the narratives,
            including market health, confidence, participation,
            stability, and sentiment.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          <ContextCard
            label="Market Health"
            value={engine.marketHealth.toFixed(1)}
          />

          <ContextCard
            label="Regime Confidence"
            value={`${engine.regimeConfidence.toFixed(1)}%`}
          />

          <ContextCard
            label="Participation"
            value={`${engine.participation.toFixed(1)}%`}
          />

          <ContextCard
            label="Market Stability"
            value={engine.stability}
          />

          <ContextCard
            label="Market Sentiment"
            value={engine.signals.sentiment}
            valueClass={getSentimentColor(engine.signals.sentiment)}
          />
        </div>
      </section>

      {/* ===================================================== */}
      {/* 04 — MARKET STRUCTURE                                 */}
      {/* ===================================================== */}

      <section className="space-y-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-white/30">
            04 — Market Structure
          </div>

          <h2 className="mt-1 text-sm font-semibold text-white">
            Where market weight is concentrated
          </h2>

          <p className="mt-1 text-xs text-white/40">
            Analyzes the relative positioning of Bitcoin, Ethereum,
            and the broader altcoin market.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <StructureCard
            label="Bitcoin"
            value={engine.btcDominance}
            description="BTC dominance"
          />

          <StructureCard
            label="Ethereum"
            value={engine.ethDominance}
            description="ETH dominance"
          />

          <StructureCard
            label="Altcoins"
            value={engine.altStrength}
            description="Relative alt strength"
          />
        </div>

        {/* STRUCTURE INTERPRETATION */}

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/30">
            Structure Interpretation
          </div>

          <p className="mt-2 text-xs leading-relaxed text-white/60">
            {engine.btcDominance > 60
              ? "Bitcoin currently represents the dominant share of the tracked market universe, indicating that large-cap leadership is shaping broader market structure."
              : engine.altStrength > 50
              ? "The broader altcoin market represents the majority of tracked market weight, indicating stronger relative participation outside Bitcoin and Ethereum."
              : "Market weight is distributed across Bitcoin, Ethereum, and altcoins without a single dominant structural concentration."}
          </p>
        </div>
      </section>
    </motion.section>
  );
}

/* ========================================================= */
/* SIGNAL CARD                                                */
/* ========================================================= */

function SignalCard({
  label,
  value,
  secondary,
  valueClass = "text-white",
}: {
  label: string;
  value: string;
  secondary: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="text-[9px] uppercase tracking-wide text-white/35">
        {label}
      </div>

      <div className={`mt-2 text-sm font-semibold ${valueClass}`}>
        {value}
      </div>

      <div className="mt-1 text-[10px] text-white/35">
        {secondary}
      </div>
    </div>
  );
}

/* ========================================================= */
/* CONTEXT CARD                                               */
/* ========================================================= */

function ContextCard({
  label,
  value,
  valueClass = "text-white",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="text-[9px] uppercase tracking-wide text-white/35">
        {label}
      </div>

      <div className={`mt-2 text-sm font-semibold ${valueClass}`}>
        {value}
      </div>
    </div>
  );
}

/* ========================================================= */
/* STRUCTURE CARD                                             */
/* ========================================================= */

function StructureCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-[10px] uppercase tracking-wide text-white/35">
        {label}
      </div>

      <div className="mt-2 text-xl font-semibold text-white">
        {value.toFixed(1)}%
      </div>

      <div className="mt-1 text-[10px] text-white/35">
        {description}
      </div>
    </div>
  );
}

/* ========================================================= */
/* NARRATIVE CARD                                             */
/* ========================================================= */

function NarrativeCard({
  item,
  index,
  getStateColor,
  getSentimentColor,
}: {
  item: FreeNarrative;
  index: number;
  getStateColor: (state: string) => string;
  getSentimentColor: (sentiment: string) => string;
}) {
  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
    >
      {/* HEADER */}

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[10px] font-semibold text-white/40">
            {String(index + 1).padStart(2, "0")}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">
              {item.title}
            </h3>

            <div
              className={`mt-1 text-[10px] font-medium uppercase tracking-wide ${getStateColor(
                item.state
              )}`}
            >
              {item.state}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[9px] uppercase tracking-wide text-white/30">
            Momentum
          </div>

          <div className="mt-1 text-sm font-semibold text-white">
            {item.momentum.score.toFixed(1)}
          </div>

          <div className="text-[9px] text-white/35">
            {item.momentum.direction}
          </div>
        </div>
      </div>

      {/* INTERPRETATION */}

      <div className="mt-4">
        <div className="text-[9px] uppercase tracking-[0.2em] text-white/30">
          Market Interpretation
        </div>

        <p className="mt-2 text-xs leading-relaxed text-white/70">
          {item.insight}
        </p>
      </div>

      {/* WHY */}

      {item.reasoning?.length > 0 && (
        <div className="mt-4 rounded-lg border border-white/5 bg-black/20 p-3">
          <div className="text-[9px] uppercase tracking-[0.2em] text-white/30">
            Why it's happening
          </div>

          <div className="mt-2 space-y-1.5">
            {item.reasoning.slice(0, 4).map((reason, idx) => (
              <div
                key={idx}
                className="text-[10px] leading-relaxed text-white/50"
              >
                <span className="mr-2 text-white/25">•</span>
                {reason}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FOOTER SIGNALS */}

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/5 pt-3">
        <div>
          <div className="text-[9px] uppercase tracking-wide text-white/30">
            Flow
          </div>

          <div className="mt-1 text-[10px] font-medium text-white/70">
            {item.flow.type}
          </div>

          <div className="text-[9px] text-white/30">
            Score {item.flow.score.toFixed(1)}
          </div>
        </div>

        <div>
          <div className="text-[9px] uppercase tracking-wide text-white/30">
            Sentiment
          </div>

          <div
            className={`mt-1 text-[10px] font-medium ${getSentimentColor(
              item.sentiment
            )}`}
          >
            {item.sentiment}
          </div>
        </div>
      </div>

      {/* ASSETS */}

      {item.assets?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.assets.map((asset) => (
            <span
              key={asset}
              className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-[9px] text-white/50"
            >
              {asset}
            </span>
          ))}
        </div>
      )}
    </motion.article>
  );
}