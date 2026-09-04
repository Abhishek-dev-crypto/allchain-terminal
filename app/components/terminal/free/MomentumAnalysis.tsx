"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  useMarketSnapshot,
  type MarketSnapshot,
} from "@/lib/intel/useMarketSnapshot";


import { buildTradeSignals } from "@/lib/intel/buildTradeSignals";
import { useMarket } from "@/lib/providers/MarketProvider";

/* =========================================================
   SECTOR MAP
========================================================= */

const sectorMap: Record<string, string> = {
  BTC: "LARGE_CAP",

  ETH: "L1",
  SOL: "L1",
  AVAX: "L1",
  SUI: "L1",

  LINK: "INFRA",
  NEAR: "INFRA",

  UNI: "DEFI",
  AAVE: "DEFI",

  DOGE: "MEME",
  SHIB: "MEME",

  XRP: "PAYMENTS",
  XLM: "PAYMENTS",
};

/* =========================================================
   COMPONENT
========================================================= */

export default function MomentumAnalysis() {
  const { coins } = useMarket();

  /* =======================================================
     MARKET SNAPSHOT
  ======================================================= */

  const snapshot = useMarketSnapshot(coins);

  const [isFullscreen, setIsFullscreen] = useState(false);

  /* =======================================================
     FULLSCREEN SCROLL CONTROL
  ======================================================= */

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isFullscreen]);

  /* =======================================================
     PREVIOUS SNAPSHOT
  ======================================================= */

  const previousSnapshot = useRef<MarketSnapshot | null>(null);

  const previous = previousSnapshot.current;

  /* =======================================================
     TRADE SIGNALS
  ======================================================= */

  const tradeSignals = useMemo(
    () => buildTradeSignals(snapshot),
    [snapshot]
  );

  /* =======================================================
     SNAPSHOT DATA
  ======================================================= */

  const {
    momentum,
    breadth,
    flow,
    volatility,
  } = snapshot;

  /* =======================================================
     MOMENTUM REGIME
  ======================================================= */

  const regime = useMemo(() => {
    if (
      momentum.direction === "ACCELERATING" &&
      breadth.greenPercent > 70
    ) {
      return {
        label: "EXPANSION",
        color: "text-emerald-300",
        explanation:
          "Momentum is strengthening and participation is broadening across the market.",
      };
    }

    if (momentum.direction === "DECELERATING") {
      return {
        label: "COOLING",
        color: "text-red-300",
        explanation:
          "Momentum is weakening as fewer assets maintain positive price movement.",
      };
    }

    return {
      label: "TRANSITION",
      color: "text-yellow-300",
      explanation:
        "Momentum is mixed and the market has not established a clear directional trend.",
    };
  }, [momentum, breadth]);

  /* =======================================================
     MOMENTUM LEADERS
  ======================================================= */

  const momentumLeaders = useMemo(() => {
    return [...snapshot.coins]
      .map((coin) => ({
        ...coin,
        score:
          coin.change24h * 1.2 +
          (coin.volume24h || 0) * 0.000001,
      }))
      .sort((a, b) => b.score - a.score)
      .filter((coin) => coin.change24h > 0)
      .slice(0, 5);
  }, [snapshot.coins]);

  /* =======================================================
     MOMENTUM LAGGARDS
  ======================================================= */

 const momentumLaggards = useMemo(() => {
    return [...snapshot.coins]
      .map((coin) => ({
        ...coin,
        score: coin.change24h,
      }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 5);
  }, [snapshot.coins]);

  /* =======================================================
     MOMENTUM TIMELINE
  ======================================================= */


type MomentumTimelineItem = {
  timeframe: "15M" | "1H" | "4H" | "24H";
  state:
    | "WEAKENING"
    | "NEUTRAL"
    | "EXPANDING"
    | "ACCELERATING"
    | "STRONG TREND"
    | "INSUFFICIENT HISTORY";
  confidence: number | null;
  change: number | null;
  available: boolean;
  historicalTimestamp: number | null;
};

const [timeline, setTimeline] = useState<MomentumTimelineItem[]>([]);
const [timelineLoading, setTimelineLoading] = useState(true);

useEffect(() => {
  let cancelled = false;

  async function loadTimeline() {
    try {
      const response = await fetch(
        "/api/momentum-timeline",
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch momentum timeline"
        );
      }

      const result =
        (await response.json()) as MomentumTimelineItem[];

      if (!cancelled) {
        setTimeline(result);
      }
    } catch (error) {
      console.error(
        "Momentum timeline fetch failed:",
        error
      );
    } finally {
      if (!cancelled) {
        setTimelineLoading(false);
      }
    }
  }

  loadTimeline();

  const interval = setInterval(
    loadTimeline,
    5 * 60 * 1000
  );

  return () => {
    cancelled = true;
    clearInterval(interval);
  };
}, []);

  /* =======================================================
     MOMENTUM BY SECTOR
     
     NOTE:
     This is intentionally called "Momentum by Sector".
     Detailed Sector Rotation belongs to the dedicated
     Sector Rotation intelligence page.
  ======================================================= */

  const sectorStrength = useMemo(() => {
    const sectors: Record<
      string,
      {
        total: number;
        count: number;
      }
    > = {};

    snapshot.coins.forEach((coin) => {
      const sector =
        sectorMap[coin.symbol.toUpperCase()] || "OTHER";

      if (!sectors[sector]) {
        sectors[sector] = {
          total: 0,
          count: 0,
        };
      }

      sectors[sector].total += coin.change24h;
      sectors[sector].count += 1;
    });

    return Object.entries(sectors)
      .map(([sector, data]) => ({
        sector,
        average: data.total / data.count,
      }))
      .sort((a, b) => b.average - a.average);
  }, [snapshot.coins]);

  /* =======================================================
     MARKET TRANSITION
  ======================================================= */

  const transitionState = useMemo(() => {
    if (!previous) {
      return {
        label: "INITIALIZING",
        insight:
          "AllChain is building a live market momentum baseline.",
        color: "text-cyan-300",
      };
    }

    if (
      momentum.direction === "ACCELERATING" &&
      previous.momentum.direction === "NEUTRAL"
    ) {
      return {
        label: "EXPANSION EMERGING",
        insight:
          "Momentum participation is expanding across leading assets. This may indicate the early stages of a broader market move.",
        color: "text-emerald-300",
      };
    }

    if (
      momentum.direction === "ACCELERATING" &&
      previous.momentum.direction === "ACCELERATING"
    ) {
      return {
        label: "TREND PERSISTENCE",
        insight:
          "Existing market leaders continue attracting participation, suggesting that the current momentum regime is persisting.",
        color: "text-cyan-300",
      };
    }

    if (momentum.direction === "DECELERATING") {
      return {
        label: "MOMENTUM COOLING",
        insight:
          "Market momentum is weakening and participation is becoming less supportive of the current trend.",
        color: "text-red-300",
      };
    }

    if (volatility.level === "HIGH") {
      return {
        label: "VOLATILITY EXPANSION",
        insight:
          "Price movement is becoming more aggressive. Elevated volatility can signal a major transition, but does not establish direction by itself.",
        color: "text-yellow-300",
      };
    }

    return {
      label: "ROTATIONAL TRANSITION",
      insight:
        "Market participation remains mixed. Strength is present in some assets while others are losing momentum.",
      color: "text-yellow-300",
    };
  }, [
    previous,
    momentum.direction,
    volatility.level,
  ]);

  /* =======================================================
     SAVE CURRENT SNAPSHOT
  ======================================================= */

  useEffect(() => {
    previousSnapshot.current = snapshot;
  }, [snapshot]);

  /* =======================================================
     HELPERS
  ======================================================= */

  const getVolatilityColor = () => {
    switch (volatility.level) {
      case "HIGH":
        return "text-red-300";

      case "MEDIUM":
        return "text-yellow-300";

      default:
        return "text-emerald-300";
    }
  };

  const getSignalColor = (
    type: "BULLISH" | "BEARISH" | "NEUTRAL"
  ) => {
    switch (type) {
      case "BULLISH":
        return "text-emerald-300 border-emerald-500/20 bg-emerald-500/10";

      case "BEARISH":
        return "text-red-300 border-red-500/20 bg-red-500/10";

      default:
        return "text-yellow-300 border-yellow-500/20 bg-yellow-500/10";
    }
  };

  const getConvictionColor = (
    conviction: "LOW" | "MEDIUM" | "HIGH"
  ) => {
    switch (conviction) {
      case "HIGH":
        return "text-emerald-300";

      case "MEDIUM":
        return "text-yellow-300";

      default:
        return "text-white/50";
    }
  };

  /* =======================================================
     LOADING STATE
  ======================================================= */

  if (!coins?.length) {
    return (
      <div className="animate-pulse rounded-3xl border border-white/10 bg-white/[0.03] p-4 space-y-4">
        <div className="h-5 w-48 rounded bg-white/10" />

        <div className="h-10 w-96 max-w-full rounded bg-white/5" />

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <div className="h-24 rounded-xl bg-white/5" />
          <div className="h-24 rounded-xl bg-white/5" />
          <div className="h-24 rounded-xl bg-white/5" />
          <div className="h-24 rounded-xl bg-white/5" />
        </div>

        <div className="h-48 rounded-xl bg-white/5" />
        <div className="h-48 rounded-xl bg-white/5" />
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      {/* ===================================================
          FULLSCREEN BACKDROP
      =================================================== */}

      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md"
          onClick={() => setIsFullscreen(false)}
        />
      )}

      {/* ===================================================
          FULLSCREEN CONTAINER
      =================================================== */}

      <div
        className={
          isFullscreen
            ? "fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-6"
            : ""
        }
      >
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`
            w-full
            ${
              isFullscreen
                ? "max-w-6xl rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-4 sm:p-6"
                : "rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-3"
            }
            backdrop-blur-2xl
            overflow-hidden
          `}
        >

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

            <div className="max-w-2xl">

              <div className="text-[10px] uppercase tracking-[0.35em] text-cyan-300/90">
                MOMENTUM INTELLIGENCE
              </div>

              <h2 className="mt-2 text-base font-semibold text-white">
                Momentum Analysis
              </h2>

              <p className="mt-2 text-xs leading-relaxed text-white/50">
                Analyzes whether market price movement is
                strengthening, weakening, or transitioning
                across the tracked market.
              </p>

            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 lg:min-w-[180px]">

              <div className="text-[10px] uppercase tracking-widest text-white/40">
                Current Momentum State
              </div>

              <div
                className={`mt-2 text-sm font-semibold ${regime.color}`}
              >
                {regime.label}
              </div>

              <div className="mt-1 text-[10px] text-white/40">
                {momentum.direction}
              </div>

            </div>

          </div>

          {/* =================================================
              01 — MOMENTUM STATE
          ================================================= */}

          <div className="mt-6">

            <div className="mb-3">

              <div className="text-[10px] uppercase tracking-[0.25em] text-cyan-300/80">
                01 — MOMENTUM STATE
              </div>

              <h3 className="mt-2 text-sm font-semibold text-white">
                What is the market&apos;s momentum doing?
              </h3>

              <p className="mt-1 text-xs leading-relaxed text-white/45">
                Momentum measures whether price movement is
                becoming stronger, weaker, or remaining neutral
                across the tracked market.
              </p>

            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

              {/* MOMENTUM */}

              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">

                <div className="text-[10px] uppercase tracking-widest text-white/40">
                  Momentum
                </div>

                <div className="mt-3 text-lg font-semibold text-white">
                  {momentum.strength}
                </div>

                <div className="mt-1 text-[10px] text-cyan-300">
                  {momentum.direction}
                </div>

              </div>

              {/* PARTICIPATION */}

              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">

                <div className="text-[10px] uppercase tracking-widest text-white/40">
                  Participation
                </div>

                <div className="mt-3 text-lg font-semibold text-white">
                  {breadth.greenPercent}%
                </div>

                <div className="mt-1 text-[10px] text-emerald-300">
                  Positive market breadth
                </div>

              </div>

              {/* STRENGTH */}

              {/* DIRECTION */}

<div className="rounded-2xl border border-white/10 bg-black/20 p-3">

  <div className="text-[10px] uppercase tracking-widest text-white/40">
    Direction
  </div>

  <div className="mt-3 text-lg font-semibold text-white">
    {momentum.direction}
  </div>

  <div className="mt-1 text-[10px] text-cyan-300">
    Momentum direction
  </div>

</div>

              {/* VOLATILITY */}

              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">

                <div className="text-[10px] uppercase tracking-widest text-white/40">
                  Volatility
                </div>

                <div className="mt-3 text-base font-bold text-white">
                  {Number(volatility.average ?? 0).toFixed(2)}
                </div>

                <div
                  className={`mt-1 text-[10px] ${getVolatilityColor()}`}
                >
                  {volatility.level}
                </div>

              </div>

            </div>

            <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.02] p-3">

              <div className="text-[10px] uppercase tracking-widest text-white/30">
                Current Interpretation
              </div>

              <p className="mt-2 text-xs leading-relaxed text-white/60">
                {regime.explanation}
              </p>

            </div>

          </div>

          {/* =================================================
              02 — WHAT'S MOVING RIGHT NOW?
          ================================================= */}

          <div className="mt-7">

            <div className="mb-3">

              <div className="text-[10px] uppercase tracking-[0.25em] text-cyan-300/80">
                02 — WHAT&apos;S MOVING RIGHT NOW?
              </div>

              <h3 className="mt-2 text-sm font-semibold text-white">
                Which assets are currently leading or lagging in momentum?
              </h3>

              <p className="mt-1 text-xs leading-relaxed text-white/45">
                This compares recent price performance to identify
where momentum is strongest and where it is weakest.
              </p>

            </div>

            <div className="grid gap-3 lg:grid-cols-2">

              {/* ACCELERATING */}

              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">

                <div className="mb-3">

                  <div className="text-[10px] uppercase tracking-widest text-emerald-300">
  Momentum Leaders
</div>

<div className="mt-1 text-[10px] text-white/40">
  Strongest positive momentum
</div>

                </div>

                <div className="space-y-2">

                 {momentumLeaders.map((coin, index) => (

                    <div
                      key={coin.symbol}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
                    >

                      <div className="flex items-center gap-3">

                        <span className="text-[10px] text-white/30">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span className="text-xs font-medium text-white">
                          {coin.symbol.toUpperCase()}
                        </span>

                      </div>

                      <span className="text-xs font-medium text-emerald-300">
                        {coin.change24h >= 0 ? "+" : ""}
                        {coin.change24h.toFixed(2)}%
                      </span>

                    </div>

                  ))}

                </div>

              </div>

              {/* COOLING */}

              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">

                <div className="mb-3">

                  <div className="mb-2 text-[11px] uppercase tracking-wide text-red-300">
  Momentum Laggards
</div>

<div className="mt-1 text-[10px] text-white/40">
  Weakest current momentum
</div>

                </div>

                <div className="space-y-2">

                 {momentumLaggards.map((coin, index) => (

                    <div
                      key={coin.symbol}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
                    >

                      <div className="flex items-center gap-3">

                        <span className="text-[10px] text-white/30">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span className="text-xs font-medium text-white">
                          {coin.symbol.toUpperCase()}
                        </span>

                      </div>

                      <span
                        className={`text-xs font-medium ${
                          coin.change24h < 0
                            ? "text-red-300"
                            : "text-white/50"
                        }`}
                      >
                        {coin.change24h >= 0 ? "+" : ""}
                        {coin.change24h.toFixed(2)}%
                      </span>

                    </div>

                  ))}

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              03 — MOMENTUM TIMELINE
          ================================================= */}

          <div className="mt-7">

            <div className="mb-3">

              <div className="text-[10px] uppercase tracking-[0.25em] text-cyan-300/80">
                03 — MOMENTUM TIMELINE
              </div>

              <h3 className="mt-2 text-sm font-semibold text-white">
                Is the trend strengthening or weakening?
              </h3>

              <p className="mt-1 text-xs leading-relaxed text-white/45">
                Different timeframes show whether momentum is limited to
the short term or remains present across the broader market trend.
              </p>

            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">

              <div className="flex items-center justify-between">

                <div className="text-[10px] uppercase tracking-widest text-white/30">
                  Multi-timeframe trend structure
                </div>

                <div className="text-[10px] text-cyan-300/60">
                  Momentum Model
                </div>

              </div>

              <div className="mt-4 space-y-2">

                {timeline.map((item) => (

                  <div
                    key={item.timeframe}
                    className="grid grid-cols-[60px_1fr_60px] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-3"
                  >

                    <div className="text-xs font-medium text-white">
                      {item.timeframe}
                    </div>

                    <div className="text-[11px] text-white/50">
                      {item.state}
                    </div>

                    <div className="text-right text-[11px] text-cyan-300">
                     {item.available && item.confidence !== null
  ? `${item.confidence}%`
  : "—"}
                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* =================================================
              04 — MARKET TRANSITION
          ================================================= */}

          <div className="mt-7">

            <div className="mb-3">

              <div className="text-[10px] uppercase tracking-[0.25em] text-cyan-300/80">
                04 — MARKET TRANSITION
              </div>

              <h3 className="mt-2 text-sm font-semibold text-white">
                Is the market changing direction?
              </h3>

              <p className="mt-1 text-xs leading-relaxed text-white/45">
                This detects changes in momentum conditions that
                may indicate an emerging trend or weakening
                market participation.
              </p>

            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div className="text-[10px] uppercase tracking-widest text-white/30">
                  Detected Transition
                </div>

                <div
                  className={`text-sm font-semibold ${transitionState.color}`}
                >
                  {transitionState.label}
                </div>

              </div>

              <p className="mt-4 max-w-3xl text-xs leading-relaxed text-white/65">
                {transitionState.insight}
              </p>

            </div>

          </div>

          {/* =================================================
              05 — WHERE IS MOMENTUM CONCENTRATED?
          ================================================= */}

          <div className="mt-7">

            <div className="mb-3">

              <div className="text-[10px] uppercase tracking-[0.25em] text-cyan-300/80">
                05 — WHERE IS MOMENTUM CONCENTRATED?
              </div>

              <h3 className="mt-2 text-sm font-semibold text-white">
                Which sectors are currently showing the strongest momentum?
              </h3>

              <p className="mt-1 text-xs leading-relaxed text-white/45">
                This helps identify whether market strength is
                broad or concentrated in a small number of sectors.
              </p>

            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">

              <div className="space-y-2">

                {sectorStrength.map((sector, index) => (

                  <div
                    key={sector.sector}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
                  >

                    <div className="flex items-center gap-3">

                      <span className="text-[10px] text-white/30">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="text-xs text-white">
                        {sector.sector}
                      </span>

                    </div>

                    <span
                      className={`text-xs font-medium ${
                        sector.average > 0
                          ? "text-emerald-300"
                          : sector.average < 0
                          ? "text-red-300"
                          : "text-white/50"
                      }`}
                    >
                      {sector.average >= 0 ? "+" : ""}
                      {sector.average.toFixed(2)}%
                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* =================================================
              06 — AI MOMENTUM SIGNALS
          ================================================= */}

          <div className="mt-7">

            <div className="mb-3">

              <div className="text-[10px] uppercase tracking-[0.25em] text-cyan-300/80">
                06 — AI MOMENTUM SIGNALS
              </div>

              <h3 className="mt-2 text-sm font-semibold text-white">
                What signals is AllChain detecting?
              </h3>

              <p className="mt-1 text-xs leading-relaxed text-white/45">
                The intelligence engine combines momentum,
                participation, volatility and market structure
                to identify meaningful market conditions.
              </p>

            </div>

            <div className="space-y-3">

              {tradeSignals.length === 0 ? (

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/40">
                  No significant momentum signals detected.
                </div>

              ) : (

                tradeSignals.map((signal) => (

                  <div
                    key={signal.title}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <div
                            className={`rounded-lg border px-2 py-1 text-[10px] uppercase tracking-wider ${getSignalColor(
                              signal.type
                            )}`}
                          >
                            {signal.type}
                          </div>

                          <div className="text-xs font-semibold text-white">
                            {signal.title}
                          </div>

                        </div>

                        <p className="mt-3 text-xs leading-relaxed text-white/65">
                          {signal.message}
                        </p>

                      </div>

                      <div className="shrink-0 text-left sm:text-right">

                        <div className="text-sm font-semibold text-white">
                          {signal.strength}
                        </div>

                        <div className="text-[10px] text-white/35">
                          Strength
                        </div>

                      </div>

                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">

                      <div className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-white/50">
                        {signal.category}
                      </div>

                      <div className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-white/50">
                        {signal.timeframe}
                      </div>

                      <div
                        className={`rounded-lg border border-white/10 px-2 py-1 text-[10px] ${getConvictionColor(
                          signal.conviction
                        )}`}
                      >
                        {signal.conviction} CONVICTION
                      </div>

                    </div>

                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">

                      <div
                        className="h-full rounded-full bg-white"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(0, signal.strength * 10)
                          )}%`,
                        }}
                      />

                    </div>

                  </div>

                ))

              )}

            </div>

          </div>

          {/* =================================================
              07 — AI MARKET READ
          ================================================= */}

          <div className="mt-7">

            <div className="mb-3">

              <div className="text-[10px] uppercase tracking-[0.25em] text-cyan-300/80">
                07 — AI MARKET READ
              </div>

              <h3 className="mt-2 text-sm font-semibold text-white">
                What does all of this mean?
              </h3>

              <p className="mt-1 text-xs leading-relaxed text-white/45">
                AllChain&apos;s final interpretation of the current
                momentum conditions.
              </p>

            </div>

            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div className="text-xs font-semibold text-cyan-300">
                  AI Momentum Read
                </div>

                <div
                  className={`text-xs font-semibold ${transitionState.color}`}
                >
                  {transitionState.label}
                </div>

              </div>

              <p className="mt-3 max-w-4xl text-xs leading-relaxed text-white/65">
                {transitionState.insight}
              </p>

              <div className="mt-4 grid gap-2 sm:grid-cols-3">

                <div className="rounded-xl border border-white/10 bg-black/20 p-3">

                  <div className="text-[10px] uppercase tracking-widest text-white/30">
                    Momentum
                  </div>

                  <div className="mt-1 text-xs font-medium text-white">
                    {momentum.direction}
                  </div>

                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-3">

                  <div className="text-[10px] uppercase tracking-widest text-white/30">
                    Participation
                  </div>

                  <div className="mt-1 text-xs font-medium text-white">
                    {breadth.greenPercent}%
                  </div>

                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-3">

                  <div className="text-[10px] uppercase tracking-widest text-white/30">
                    Volatility
                  </div>

                  <div className="mt-1 text-xs font-medium text-white">
                    {volatility.level}
                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              FULLSCREEN BUTTON
          ================================================= */}

          <div className="mt-6 flex justify-center">

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="
                flex items-center gap-2
                rounded-xl
                border border-white/10
                bg-white/[0.03]
                px-4 py-2
                text-xs
                font-medium
                tracking-wide
                text-white/80
                transition-all
                hover:border-cyan-400/30
                hover:bg-white/[0.06]
                hover:text-white
              "
            >

              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/80" />

              <span className="uppercase">
                {isFullscreen
                  ? "Close"
                  : "View Full Momentum Intelligence"}
              </span>

              <span className="text-cyan-300/60">
                →
              </span>

            </button>

          </div>

        </motion.section>
      </div>
    </>
  );
}