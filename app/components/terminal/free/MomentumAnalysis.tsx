"use client";

import { motion } from "framer-motion";

import { useMemo, useEffect, useRef, useState } from "react";

import {
  useMarketSnapshot,
  type MarketSnapshot,
} from "@/lib/intel/useMarketSnapshot";

import { buildMomentumTimeline } from "@/lib/intel/buildMomentumTimeline";
import { buildTradeSignals } from "@/lib/intel/buildTradeSignals";
import { useMarket } from "@/lib/providers/MarketProvider";


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

export default function MomentumAnalysis() {

  const { coins } = useMarket();
  /**
   * 📊 Snapshot Layer
   */
  const snapshot = useMarketSnapshot(coins);

  const [isFullscreen, setIsFullscreen] = useState(false);

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

    /**
 * 🧠 Previous Snapshot Memory
 */
const previousSnapshot = useRef<MarketSnapshot | null>(null);

const previous =
  previousSnapshot.current;

  const tradeSignals = useMemo(
  () => buildTradeSignals(snapshot),
  [snapshot]
);

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


 const {
    momentum,
    breadth,
    flow,
    volatility,
  } = snapshot;

 
 /**
   * 🚀 Momentum Regime
   */
  const regime = useMemo(() => {
    if (
      momentum.direction === "ACCELERATING" &&
      breadth.greenPercent > 70
    ) {
      return {
        label: "EXPANSION",
        color: "text-emerald-300",
      };
    }

    if (
      momentum.direction === "DECELERATING"
    ) {
      return {
        label: "COOLING",
        color: "text-red-300",
      };
    }

    return {
      label: "TRANSITION",
      color: "text-yellow-300",
    };
  }, [momentum, breadth]);

  /**
   * 🚀 Accelerating Assets
   */


const acceleratingAssets = useMemo(() => {
  return [...snapshot.coins]
    .map((coin) => ({
      ...coin,
      score:
        coin.change24h * 1.2 +
        (coin.volume24h || 0) * 0.000001,
    }))
    .sort((a, b) => b.score - a.score)
    .filter((c) => c.change24h > 0)
    .slice(0, 4);
}, [snapshot.coins]);

const coolingAssets = useMemo(() => {
  return [...snapshot.coins]
    .map((coin) => ({
      ...coin,
      score: coin.change24h,
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 4);
}, [snapshot.coins]);

    const timeline = useMemo(
  () => buildMomentumTimeline(snapshot),
  [snapshot]
);

    /**
 * 🚀 Sector Rotation Engine
 */
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
      sectorMap[coin.symbol.toUpperCase()] ||
      "OTHER";

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
      average:
        data.total / data.count,
    }))
    .sort((a, b) => b.average - a.average);
}, [snapshot.coins]);


/**
 * 🚀 Market Transition Engine
 */
const transitionState = useMemo(() => {
  if (!previous) {
    return {
      label: "INITIALIZING",
      insight:
        "Building live market structure baseline.",
      color: "text-cyan-300",
    };
  }

  /**
   * Momentum acceleration
   */
  if (
    momentum.direction === "ACCELERATING" &&
    previous.momentum.direction === "NEUTRAL"
  ) {
    return {
      label: "EXPANSION EMERGING",
      insight:
        "Momentum participation is expanding across leading sectors.",
      color: "text-emerald-300",
    };
  }

  /**
   * Sustained trend
   */
  if (
    momentum.direction === "ACCELERATING" &&
    previous.momentum.direction ===
      "ACCELERATING"
  ) {
    return {
      label: "TREND PERSISTENCE",
      insight:
        "Existing market leaders continue attracting sustained participation.",
      color: "text-cyan-300",
    };
  }

  /**
   * Cooling trend
   */
  if (
    momentum.direction === "DECELERATING"
  ) {
    return {
      label: "MOMENTUM COOLING",
      insight:
        "Trend participation is weakening as rotational strength fades.",
      color: "text-red-300",
    };
  }

  /**
   * Volatility expansion
   */
  if (
    volatility.level === "HIGH"
  ) {
    return {
      label: "VOLATILITY EXPANSION",
      insight:
        "Market volatility is increasing alongside aggressive positioning.",
      color: "text-yellow-300",
    };
  }

  return {
    label: "ROTATIONAL TRANSITION",
    insight:
      "Market participation remains mixed across sectors.",
    color: "text-yellow-300",
  };
}, [
  previous,
  momentum.direction,
  volatility.level,
]);


 /**
   * 🎨 Helpers
   */

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

  /**
 * 🧠 Dynamic Asset Insight Engine
 */

useEffect(() => {
  previousSnapshot.current = snapshot;
}, [snapshot]);

 if (!coins?.length) {
  return (
    <div className="animate-pulse rounded-3xl border border-white/10 bg-white/[0.03] p-4 space-y-4">

      <div className="h-5 w-48 rounded bg-white/10" />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="h-20 rounded-xl bg-white/5" />
        <div className="h-20 rounded-xl bg-white/5" />
        <div className="h-20 rounded-xl bg-white/5" />
        <div className="h-20 rounded-xl bg-white/5" />
      </div>

      <div className="h-40 rounded-xl bg-white/5" />
      <div className="h-40 rounded-xl bg-white/5" />

    </div>
  );
}

 
 

 return (
  <>
    {/* BACKDROP (only in fullscreen) */}
    {isFullscreen && (
      <div
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md"
        onClick={() => setIsFullscreen(false)}
      />
    )}

    {/* OUTER LAYOUT CONTROLLER */}
    <div
      className={isFullscreen
        ? "fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-6"
        : ""
      }
    >
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`
          w-full
          ${isFullscreen
            ? "max-w-6xl rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-4"
            : "rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-2.5"
          }
          backdrop-blur-2xl
          overflow-hidden
        `}
      >

     {/* ====================================================== */}
{/* HEADER */}
{/* ====================================================== */}

<div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">

 

  {/* CENTER */}
  <div>

    <div className="text-[10px] uppercase tracking-[0.35em] text-cyan-300/90">
      MOMENTUM INTELLIGENCE
    </div>

    <h2 className="mt-1 text-xs font-semibold text-white">
      Momentum Analysis
    </h2>

    <p className="mt-1 text-xs text-white/50">
      Trend acceleration and participation tracking
    </p>

  </div>

  {/* RIGHT */}
  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">

    <div className="text-[10px] uppercase tracking-widest text-white/40">
      Momentum Regime
    </div>

    <div
      className={`mt-2 text-xs font-semibold ${regime.color}`}
    >
      {regime.label}
    </div>

    <div className="mt-1 text-[10px] text-white/40">
      {momentum?.direction ?? "—"}
    </div>

  </div>

</div>

      {/* ====================================================== */}
      {/* TOP STRIP */}
      {/* ====================================================== */}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">

        {/* MOMENTUM */}
        <div className="rounded-2xl border border-white/10 bg-black/20 p-2.5">

          <div className="text-[10px] uppercase text-white/40">
              Momentum
          </div>

          <div className="mt-1 text-base font-semibold text-white">
              {momentum.strength}
          </div>

          <div className="text-[10px] text-cyan-300">
              {momentum?.direction ?? "—"}
            </div>

        </div>

        {/* PARTICIPATION */}
        <div className="rounded-2xl border border-white/10 bg-black/20 p-2.5">

          <div className="text-[10px] uppercase tracking-widest text-white/40">
            Participation
          </div>

          <div className="mt-3 text-base font-bold text-white">
            {breadth.greenPercent}%
          </div>

          <div className="mt-1 text-[10px] text-emerald-300">
            Positive Breadth
          </div>

        </div>

        {/* FLOW */}
        <div className="rounded-2xl border border-white/10 bg-black/20 p-2.5">

          <div className="text-[10px] uppercase tracking-widest text-white/40">
            Capital Flow
          </div>

          <div className="mt-3 text-base font-bold text-white">
            {flow.score}%
          </div>

          <div className="mt-1 text-[10px] text-cyan-300">
            {flow?.state ?? "—"}
          </div>

        </div>

        {/* VOLATILITY */}
        <div className="rounded-2xl border border-white/10 bg-black/20 p-2.5">

          <div className="text-[10px] uppercase tracking-widest text-white/40">
            Volatility
          </div>

          <div className="mt-3 text-base font-bold text-white">
            {volatility.average}%
          </div>

          <div
            className={`mt-1 text-[10px] ${getVolatilityColor()}`}
          >
            {volatility.level}
          </div>

        </div>

      </div>

      {/* ====================================================== */}
      {/* ACCELERATING + COOLING */}
      {/* ====================================================== */}

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-2.5">

  <div className="flex items-center justify-between">
    <div>
      <div className="text-[10px] uppercase tracking-widest text-white/40">
        Momentum Leaders
      </div>

      <div className="mt-1 text-[10px] text-white/50">
        Strongest and weakest market momentum
      </div>
    </div>
  </div>

  <div className="mt-4 grid gap-3 xl:grid-cols-2">

    {/* LEADERS */}
    <div>
      <div className="mb-2 text-[11px] uppercase tracking-wide text-emerald-300">
          Accelerating
      </div>

      <div className="space-y-2">
        {acceleratingAssets.slice(0,3).map((coin) => (
          <div
            key={coin.symbol}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"
          >
            <span className="text-[10px] text-white">
              {coin.symbol.toUpperCase()}
            </span>

            <span className="text-[10px] text-emerald-300">
              +{coin.change24h.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>


    {/* WEAKNESS */}
    <div>

      <div className="mb-2 text-[11px] uppercase tracking-wide text-emerald-300">
         🔻 Cooling
        </div>

      <div className="space-y-2">
        {coolingAssets.slice(0,3).map((coin) => (
          <div
            key={coin.symbol}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"
          >
            <span className="text-[10px] text-white">
              {coin.symbol.toUpperCase()}
            </span>

            <span className="text-[10px] text-red-300">
              {coin.change24h.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>

  </div>

</div>


 {/* ========================================================= */}
{/* MOMENTUM TIMELINE */}
{/* ========================================================= */}

<div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-2.5">

  <div className="flex items-center justify-between">

    <div>
      <div className="text-[10px] uppercase tracking-widest text-white/40">
        Momentum Timeline
      </div>

      <div className="mt-1 text-[10px] text-white/50">
        Multi-timeframe trend structure
      </div>
    </div>

    <div className="text-xs text-white/40">
      AI Trend Model
    </div>

  </div>

  <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-2.5">


  <div className="mt-3 space-y-2">

    {timeline.map((item) => (

      <div
        key={item.timeframe}
        className="flex items-center justify-between"
      >
        

  <div className="text-xs text-white">
    {item.timeframe}
  </div>

  <div className="text-[11px] text-white/50">
    {item.state}
  </div>

  <div className="text-[11px] text-cyan-300">
    {item.confidence}%
  </div>



      </div>

    ))}

  </div>

</div>

</div>

 

      {/* ====================================================== */}
      {/* MARKET TRANSITIONS */}
      {/* ====================================================== */}

<div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-2.5">

  <div className="flex items-center justify-between">

    <div>
      <div className="text-[10px] uppercase tracking-widest text-white/40">
        Market Transition State
      </div>

      <div className="mt-1 text-[10px] text-white/50">
        Detecting structural momentum shifts
      </div>
    </div>

    <div
      className={`text-xs font-medium ${transitionState.color}`}
    >
      {transitionState.label}
    </div>

  </div>

  <p className="mt-4 text-[10px] leading-relaxed text-white/70">
    {transitionState.insight}
  </p>

</div>

   {/* ========================================================= */}
{/* SECTOR ROTATION INTELLIGENCE */}
{/* ========================================================= */}

<div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-2.5">

  <div className="flex items-center justify-between">

    <div>
      <div className="text-[10px] uppercase tracking-widest text-white/40">
        Sector Rotation
      </div>

      <div className="mt-1 text-[10px] text-white/50">
        Capital concentration
      </div>
    </div>

    <div className="text-xs text-cyan-300">
      {sectorStrength[0]?.sector}
    </div>

  </div>

  <div className="mt-4 space-y-2">

    {sectorStrength.slice(0,3).map((sector) => (

      <div
        key={sector.sector}
        className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
      >
        <span className="text-[10px] text-white">
          {sector.sector}
        </span>

        <span className="text-[10px] text-cyan-300">
          {sector.average.toFixed(1)}%
        </span>

      </div>

    ))}

  </div>

</div>

    
   {/* ========================================================= */}
{/* AI SIGNAL ENGINE */}
{/* ========================================================= */}

<div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-2.5">

  <div className="flex items-center justify-between">

    <div>
      <div className="text-[10px] uppercase tracking-widest text-white/40">
        AI Signal Engine
      </div>

      <div className="mt-1 text-[10px] text-white/50">
        Ranked structural market intelligence
      </div>
    </div>

    <div className="text-xs text-white/40">
      {tradeSignals.length} Signals
    </div>

  </div>

  <div className="mt-4 space-y-3">

    {tradeSignals.map((signal) => (
      <div
        key={signal.title}
        className="
          rounded-2xl
          border border-white/10
          bg-white/[0.03]
          p-2.5
        "
      >

        {/* TOP */}
        <div className="flex items-start justify-between gap-3">

          <div>

            <div className="flex items-center gap-2 flex-wrap">

              <div
                className={`
                  rounded-lg border px-2 py-1 text-[10px] uppercase tracking-wider
                  ${getSignalColor(signal.type)}
                `}
              >
                {signal.type}
              </div>

              <div className="text-xs font-semibold text-white">
                {signal.title}
              </div>

            </div>

            <div className="mt-3 text-[10px] leading-relaxed text-white/70">
              {signal.message}
            </div>

          </div>

          <div className="text-right">

            <div className="text-xs font-semibold text-white">
              {signal.strength}
            </div>

            <div className="text-[10px] text-white/40">
              Strength
            </div>

          </div>

        </div>

        {/* META */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">

          <div className="rounded-lg border border-white/10 px-2 py-1 text-white/60">
            {signal.category}
          </div>

          <div className="rounded-lg border border-white/10 px-2 py-1 text-white/60">
            {signal.timeframe}
          </div>

          <div
            className={`rounded-lg border border-white/10 px-2 py-1 ${getConvictionColor(signal.conviction)}`}
          >
            {signal.conviction} CONVICTION
          </div>

        </div>

        {/* STRENGTH BAR */}
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">

          <div
            className="h-full rounded-full bg-white"
            style={{
              width: `${signal.strength * 10}%`,
            }}
          />

        </div>

      </div>
    ))}

  </div>

</div>

      {/* ====================================================== */}
      {/* AI INTERPRETATION */}
      {/* ====================================================== */}

      <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-2.5">

  <div className="flex items-center justify-between">

    <div className="text-xs font-semibold text-cyan-300">
      🧠 AI Market Read
    </div>

    <div className={`text-xs font-semibold ${transitionState.color}`}>
  {transitionState.label}
</div>

  </div>

  <p className="mt-2 text-xs leading-relaxed text-white/60">
  {transitionState.insight}
</p>

</div>

<div className="flex items-center justify-center mt-4 mb-3">

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
      hover:text-white
      hover:border-cyan-400/30
      hover:bg-white/[0.06]
      transition-all
      shadow-sm shadow-black/20
    "
  >
    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/80" />

    <span className="uppercase">
      {isFullscreen ? "✕ Close" : "View Full Momentum Intelligence"}
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