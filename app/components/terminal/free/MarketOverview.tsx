
"use client";

import { motion } from "framer-motion";
import { useMarket } from "@/lib/providers/MarketProvider";

/* =========================================================
   HELPERS
========================================================= */

function getRegimeLabel(regime: string) {
  switch (regime) {
    case "RISK_ON":
      return "BUYERS IN CONTROL";
    case "RISK_OFF":
      return "SELLERS IN CONTROL";
    case "ROTATION":
      return "MONEY IS MOVING";
    case "CHOPPY":
      return "MARKET IS MIXED";
    default:
      return "MARKET IS UNCLEAR";
  }
}

function getRegimeDescription(regime: string) {
  switch (regime) {
    case "RISK_ON":
      return "More of the market is moving higher, creating a constructive environment.";
    case "RISK_OFF":
      return "More of the market is moving lower, suggesting a defensive environment.";
    case "ROTATION":
      return "Money is moving between different parts of the crypto market rather than moving everywhere together.";
    case "CHOPPY":
      return "The market does not have a clear direction right now. Different assets are moving in different ways.";
    default:
      return "The market is still gathering enough information for a clear read.";
  }
}

function getSentimentLabel(sentiment: string) {
  switch (sentiment) {
    case "BULLISH":
      return "BULLISH";
    case "BEARISH":
      return "BEARISH";
    default:
      return "NEUTRAL";
  }
}

function getMomentumLabel(momentum: string) {
  switch (momentum) {
    case "ACCELERATING":
      return "GETTING STRONGER";
    case "DECELERATING":
      return "LOSING STRENGTH";
    default:
      return "STEADY";
  }
}

function getFlowLabel(state: string) {
  switch (state) {
    case "ACCUMULATION":
      return "BUYING";
    case "DISTRIBUTION":
      return "SELLING";
    default:
      return "BALANCED";
  }
}

function getRiskLabel(state: string) {
  switch (state) {
    case "LOW":
      return "LOW";
    case "NORMAL":
      return "NORMAL";
    case "ELEVATED":
      return "ELEVATED";
    case "EXTREME":
      return "VERY HIGH";
    default:
      return "UNKNOWN";
  }
}

function getStateClass(value: string) {
  const normalized = value.toUpperCase();

  if (
    normalized.includes("BUY") ||
    normalized.includes("BULL") ||
    normalized.includes("STRONG") ||
    normalized.includes("CONTROL")
  ) {
    return "text-emerald-400";
  }

  if (
    normalized.includes("SELL") ||
    normalized.includes("BEAR") ||
    normalized.includes("WEAK") ||
    normalized.includes("LOSING")
  ) {
    return "text-red-400";
  }

  if (
    normalized.includes("MOVING") ||
    normalized.includes("ELEVATED") ||
    normalized.includes("HIGH") ||
    normalized.includes("MIXED")
  ) {
    return "text-amber-300";
  }

  return "text-white/70";
}

function formatPercent(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) {
    return "—";
  }

  return `${value.toFixed(0)}%`;
}

/* =========================================================
   BEGINNER CARD
========================================================= */

function InsightCard({
  label,
  value,
  explanation,
}: {
  label: string;
  value: string;
  explanation: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.025] p-3.5">
      <div className="text-[8px] font-medium uppercase tracking-[0.18em] text-white/35">
        {label}
      </div>

      <div
        className={`mt-1.5 text-sm font-semibold tracking-tight ${getStateClass(
          value
        )}`}
      >
        {value}
      </div>

      <div className="mt-1 text-[9px] leading-relaxed text-white/35">
        {explanation}
      </div>
    </div>
  );
}

/* =========================================================
   OVERVIEW
========================================================= */

export default function MarketOverview() {
  const {
    engine,
    intelligence,
    narratives,
    rotation,
    loading,
    lastUpdated,
  } = useMarket();

  if (loading && !engine) {
    return (
      <div className="space-y-3 p-3">
        <div className="h-36 animate-pulse rounded-lg border border-white/10 bg-white/[0.025]" />

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-lg border border-white/10 bg-white/[0.025]"
            />
          ))}
        </div>

        <div className="h-28 animate-pulse rounded-lg border border-white/10 bg-white/[0.025]" />
      </div>
    );
  }

  if (!engine || !intelligence) {
    return (
      <div className="flex min-h-[300px] items-center justify-center p-6">
        <div className="rounded-lg border border-white/10 bg-white/[0.025] px-6 py-5 text-center">
          <div className="text-xs font-medium text-white/70">
            Waiting for the market
          </div>

          <div className="mt-1.5 text-[9px] leading-relaxed text-white/30">
            We do not have enough confirmed market information yet.
          </div>
        </div>
      </div>
    );
  }

  const regime = getRegimeLabel(engine.regime);
  const regimeDescription = getRegimeDescription(engine.regime);

  const sentiment = getSentimentLabel(engine.signals.sentiment);
  const momentum = getMomentumLabel(engine.momentum);
  const flow = getFlowLabel(engine.signals.flow.state);
  const risk = getRiskLabel(engine.volatilityState);

  const topNarrative = narratives?.[0] ?? null;

  const dominantSector = rotation?.dominantSector ?? null;
  const emergingSector = rotation?.emergingSector ?? null;
  const weakeningSector = rotation?.weakeningSector ?? null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3 p-3"
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-[8px] font-medium uppercase tracking-[0.22em] text-cyan-300/70">
            Your Market Briefing
          </div>

          <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">
            Market Overview
          </h2>

          <p className="mt-1 text-[10px] text-white/35">
            A simple read of what is happening across crypto.
          </p>
        </div>

        <div className="hidden text-right sm:block">
          <div className="text-[8px] uppercase tracking-[0.16em] text-white/25">
            Confidence
          </div>

          <div
            className={`mt-1 text-[10px] font-semibold ${getStateClass(
              intelligence.conviction
            )}`}
          >
            {intelligence.conviction}
          </div>
        </div>
      </div>

      {/* =====================================================
          CURRENT MARKET READ
      ===================================================== */}

      <section className="rounded-lg border border-cyan-500/15 bg-cyan-500/[0.025] p-4">
        <div className="text-[8px] font-medium uppercase tracking-[0.2em] text-cyan-300/60">
          What is happening?
        </div>

        <div className="mt-2.5">
          <div
            className={`text-2xl font-semibold tracking-tight ${getStateClass(
              regime
            )}`}
          >
            {regime}
          </div>

          <p className="mt-1.5 max-w-2xl text-[11px] leading-relaxed text-white/55">
            {regimeDescription}
          </p>
        </div>
      </section>

      {/* =====================================================
          WHAT THE MARKET IS SAYING
      ===================================================== */}

      <section>
        <div className="mb-2 text-[8px] font-medium uppercase tracking-[0.2em] text-white/30">
          What the Market Is Saying
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <InsightCard
            label="Market Mood"
            value={sentiment}
            explanation={
              sentiment === "BULLISH"
                ? "Buyers have the stronger side of the market."
                : sentiment === "BEARISH"
                  ? "Sellers have the stronger side of the market."
                  : "Neither buyers nor sellers clearly dominate."
            }
          />

          <InsightCard
            label="Price Momentum"
            value={momentum}
            explanation={
              momentum === "GETTING STRONGER"
                ? "Recent market movement is gaining strength."
                : momentum === "LOSING STRENGTH"
                  ? "Recent market movement is losing strength."
                  : "Price movement is relatively steady."
            }
          />

          <InsightCard
            label="Money Flow"
            value={flow}
            explanation={
              flow === "BUYING"
                ? "The market is showing stronger buying activity."
                : flow === "SELLING"
                  ? "The market is showing stronger selling activity."
                  : "Buying and selling pressure are relatively balanced."
            }
          />

          <InsightCard
            label="Market Risk"
            value={risk}
            explanation={
              risk === "LOW"
                ? "Price movements are relatively calm."
                : risk === "NORMAL"
                  ? "Market movement is within a normal range."
                : risk === "ELEVATED"
                  ? "Price movements are becoming more aggressive."
                  : "The market is experiencing unusually large movements."
            }
          />
        </div>
      </section>

      {/* =====================================================
          MARKET PARTICIPATION
      ===================================================== */}

      <section className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <div className="mb-3">
          <div className="text-[8px] font-medium uppercase tracking-[0.2em] text-white/30">
            How Broad Is The Move?
          </div>

          <div className="mt-1 text-[10px] text-white/45">
            This shows whether the market move is happening across many
            coins or only a small group.
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <div className="text-[8px] uppercase tracking-[0.15em] text-white/25">
              Coins Going Up
            </div>

            <div className="mt-1.5 text-xl font-semibold text-white">
              {formatPercent(engine.positiveBreadth)}
            </div>

            <div className="mt-1 text-[9px] text-white/30">
              of tracked coins
            </div>
          </div>

          <div>
            <div className="text-[8px] uppercase tracking-[0.15em] text-white/25">
              Coins Going Down
            </div>

            <div className="mt-1.5 text-xl font-semibold text-white">
              {formatPercent(engine.negativeBreadth)}
            </div>

            <div className="mt-1 text-[9px] text-white/30">
              of tracked coins
            </div>
          </div>

          <div>
            <div className="text-[8px] uppercase tracking-[0.15em] text-white/25">
              Market Activity
            </div>

            <div
              className={`mt-1.5 text-xl font-semibold ${getStateClass(
                engine.participation > 60
                  ? "HIGH"
                  : engine.participation > 30
                    ? "NORMAL"
                    : "LOW"
              )}`}
            >
              {engine.participation > 60
                ? "HIGH"
                : engine.participation > 30
                  ? "NORMAL"
                  : "LOW"}
            </div>

            <div className="mt-1 text-[9px] text-white/30">
              how active the market is
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          WHERE MONEY IS MOVING
      ===================================================== */}

      <section className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <div className="mb-3">
          <div className="text-[8px] font-medium uppercase tracking-[0.2em] text-white/30">
            Where Is Money Moving?
          </div>

          <div className="mt-1 text-[10px] text-white/45">
            Sector rotation shows which parts of crypto are currently
            attracting or losing attention.
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="text-[8px] uppercase tracking-[0.15em] text-white/25">
              Leading
            </div>

            <div className="mt-1.5 text-sm font-semibold text-emerald-400">
              {dominantSector ?? "Awaiting signal"}
            </div>
          </div>

          <div>
            <div className="text-[8px] uppercase tracking-[0.15em] text-white/25">
              Gaining Attention
            </div>

            <div className="mt-1.5 text-sm font-semibold text-cyan-300">
              {emergingSector ?? "Awaiting signal"}
            </div>
          </div>

          <div>
            <div className="text-[8px] uppercase tracking-[0.15em] text-white/25">
              Losing Strength
            </div>

            <div className="mt-1.5 text-sm font-semibold text-red-400">
              {weakeningSector ?? "Awaiting signal"}
            </div>
          </div>
        </div>

        {rotation?.narrative?.headline && (
          <div className="mt-3 border-t border-white/5 pt-3">
            <div className="text-[10px] font-medium text-white/60">
              {rotation.narrative.headline}
            </div>

            {rotation.narrative.subtext && (
              <div className="mt-1 text-[9px] leading-relaxed text-white/30">
                {rotation.narrative.subtext}
              </div>
            )}
          </div>
        )}
      </section>

      {/* =====================================================
          BITCOIN / ETH / ALTCOINS
      ===================================================== */}

      <section>
        <div className="mb-2 text-[8px] font-medium uppercase tracking-[0.2em] text-white/30">
          Market Structure
        </div>

        <div className="grid grid-cols-3 gap-2">
          <InsightCard
            label="Bitcoin"
            value={formatPercent(engine.btcDominance)}
            explanation="Bitcoin's share of the tracked market."
          />

          <InsightCard
            label="Ethereum"
            value={formatPercent(engine.ethDominance)}
            explanation="Ethereum's share of the tracked market."
          />

          <InsightCard
            label="Altcoins"
            value={formatPercent(engine.altStrength)}
            explanation="The remaining share across other tracked assets."
          />
        </div>
      </section>

      {/* =====================================================
          MARKET STORY
      ===================================================== */}

      <section className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <div className="text-[8px] font-medium uppercase tracking-[0.2em] text-white/30">
          The Market Story
        </div>

        {topNarrative ? (
          <div className="mt-2">
            <div className="text-sm font-semibold text-white">
              {topNarrative.title}
            </div>

            {topNarrative.insight && (
              <p className="mt-1.5 text-[10px] leading-relaxed text-white/50">
                {topNarrative.insight}
              </p>
            )}

            {topNarrative.reasoning && (
              <p className="mt-2 text-[9px] leading-relaxed text-white/30">
                {topNarrative.reasoning}
              </p>
            )}
          </div>
        ) : (
          <div className="mt-2 text-[10px] text-white/35">
            No confirmed market story is available yet.
          </div>
        )}
      </section>

      {/* =====================================================
          WHAT TO WATCH
      ===================================================== */}

      <section className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <div className="mb-3 text-[8px] font-medium uppercase tracking-[0.2em] text-white/30">
          What To Watch
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />

            <div className="text-[10px] leading-relaxed text-white/55">
              Momentum is{" "}
              <span className="font-medium text-white">
                {engine.momentum === "ACCELERATING"
                  ? "getting stronger"
                  : engine.momentum === "DECELERATING"
                    ? "losing strength"
                    : "steady"}
              </span>
              .
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />

            <div className="text-[10px] leading-relaxed text-white/55">
              <span className="font-medium text-white">
                {formatPercent(engine.positiveBreadth)}
              </span>{" "}
              of tracked coins are currently rising.
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />

            <div className="text-[10px] leading-relaxed text-white/55">
              Market risk is currently{" "}
              <span className="font-medium text-white">
                {risk.toLowerCase()}
              </span>
              .
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="flex items-center justify-between border-t border-white/5 pt-2">
        <div className="text-[8px] text-white/20">
          Based on live market intelligence
        </div>

        <div className="text-[8px] text-white/20">
          {lastUpdated
            ? new Date(lastUpdated).toLocaleTimeString()
            : "Awaiting update"}
        </div>
      </div>
    </motion.div>
  );
}
