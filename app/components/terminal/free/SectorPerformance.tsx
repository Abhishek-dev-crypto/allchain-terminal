'use client';

import { motion } from "framer-motion";
import { useMemo, useRef } from "react";

import type { Coin } from "@/lib/types/coin";

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

type SectorData = {
  name: string;
  change: number;
  participation: number;
  momentum: number;
  acceleration: number;
  btcDelta: number;
  earlyRotation: boolean;
  rotationState: string;
  leaders: Coin[];
};

const weightMap: Record<string, number> = {
  LARGE_CAP: 2.5,
  L1: 2,
  INFRA: 1.8,
  DEFI: 1.5,
  MEME: 1.2,
  PAYMENTS: 1,
  OTHER: 1,
};


export default function SectorPerformance() {

  const { coins, engine } = useMarket();
  /**
   * 🧠 Previous snapshot memory (for acceleration)
   */
  const prevRef = useRef<Record<string, number>>({});
  

  /**
   * 🧠 Sector Engine v3 (REAL + STABLE + CORRECT)
   */
  const sectors: SectorData[] = useMemo(() => {
    const btc = coins.find((c) => c.symbol === "BTC");
    const btcChange = btc?.change24h || 0;

    

    const grouped: Record<
      string,
      {
        total: number;
        count: number;
        positive: number;
        leaders: Coin[];
      }
    > = {};

    coins.forEach((coin) => {
      const sector =
        sectorMap[coin.symbol.toUpperCase()] || "OTHER";

      if (!grouped[sector]) {
        grouped[sector] = {
          total: 0,
          count: 0,
          positive: 0,
          leaders: [],
        };
      }

      grouped[sector].total += coin.change24h;
      grouped[sector].count += 1;

      if (Math.abs(coin.change24h) > 0.25) {
        grouped[sector].positive += 1;
      }

      grouped[sector].leaders.push(coin);
    });

    return Object.entries(grouped).map(([name, data]) => {
      const avg = data.total / data.count;
      const participation = (data.positive / data.count) * 100;

      /**
       * 🔥 FIXED: proper acceleration (NOW VALID)
       */
      const prev = prevRef.current[name] ?? avg;
      const acceleration = avg - prev;
      prevRef.current[name] = avg;

      /**
       * 📊 BTC-relative strength
       */
      const btcDelta = avg - btcChange;

      /**
       * 📊 flow strength (real volatility proxy)
       */
      const flowScore = data.leaders.reduce(
        (sum, c) => sum + Math.abs(c.change24h),
        0
      );

      /**
       * 🚀 Momentum Engine v3 (enhanced weighting)
       */
      const weight = weightMap[name] || 1;

const momentum = Math.min(
  (
    Math.abs(avg) * 4 +
    participation * 0.35 +
    Math.abs(acceleration) * 15 +
    flowScore * 0.12
  ) * weight,
  100
);

      /**
       * 🚨 Early Rotation Signal (FIXED LOGIC)
       */
      const earlyRotation =
  acceleration > 0.8 &&
  participation > 65 &&
  btcDelta > 0.3 &&
  avg < btcChange;
      /**
       * 🔥 Rotation state engine v3
       */
      const rotationState =
        avg > 8 && acceleration > 1.5
          ? "LEADING ROTATION"
          : avg > 3
          ? "EXPANDING"
          : avg > 0
          ? "BUILDING"
          : avg < 0
          ? "ROTATION EXIT"
          : "DORMANT";

      return {
        name,
        change: avg,
        participation,
        momentum,
        acceleration,
        btcDelta,
        earlyRotation,
        rotationState,

        leaders: data.leaders
          .sort((a, b) => b.change24h - a.change24h)
          .slice(0, 2),
      };
    });
  }, [coins]);

  const marketSignals = useMemo(() => {
  const total = sectors.length;

  const positive = sectors.filter((s) => s.change > 0).length;

  const marketBreadth = total ? positive / total : 0;

  const lcap = sectors.find((s) => s.name === "LARGE_CAP")?.change || 0;

  const topSectorStrength = sectors[0]?.momentum || 0;

  const infraDominance =
    sectors.find((s) => s.name === "INFRA")?.momentum || 0;

  const dominanceShift = infraDominance - Math.abs(lcap);

  return {
    marketBreadth,
    lcap,
    topSectorStrength,
    infraDominance,
    dominanceShift,
  };
}, [sectors]);

  const { marketBreadth, lcap, topSectorStrength, infraDominance, dominanceShift } = marketSignals;

  const rotationConfidence = useMemo(() => {
  const totalStrength = sectors.reduce(
    (sum, s) => sum + Math.abs(s.change),
    0
  );

  const avgStrength = totalStrength / (sectors.length || 1);

  return Math.min(
    avgStrength * 10 +
    marketBreadth * 40 +
    dominanceShift * 5,
    100
  );
}, [sectors, marketBreadth, dominanceShift]);

  const marketRegimeScore = useMemo(() => {
  const weighted = sectors.reduce((sum, s) => {
    const weight = weightMap[s.name] || 1;

    return sum + (s.change * weight);
  }, 0);

  return weighted;
}, [sectors]);

  /**
   * 📊 Global state engine
   */
const rotationState = useMemo(() => {
  if (rotationConfidence > 75 && marketBreadth > 0.6 && dominanceShift > 5) {
    return {
      label: "AGGRESSIVE RISK-ON",
      color: "text-emerald-300",
    };
  }

  if (rotationConfidence > 50) {
    return {
      label: "ROTATION EXPANSION",
      color: "text-cyan-300",
    };
  }

  if (rotationConfidence > 25) {
    return {
      label: "BALANCED FLOW",
      color: "text-yellow-300",
    };
  }

  return {
    label: "DEFENSIVE FLOW",
    color: "text-red-300",
  };
}, [rotationConfidence, marketBreadth, dominanceShift]);

const marketSummary = useMemo(() => {
  const infra = sectors.find(s => s.name === "INFRA")?.momentum || 0;
  const l1 = sectors.find(s => s.name === "L1")?.momentum || 0;

  if (infra > 80) {
    return "Strong infrastructure-led rally. Capital is flowing into early crypto growth projects.";
  }

  if (l1 > 60) {
    return "Layer 1 networks are leading. Market risk appetite is increasing.";
  }

  return "Mixed market conditions with no clear leadership.";
}, [sectors]);

const narrative = useMemo(() => {
  const infra = sectors.find(s => s.name === "INFRA");
  const lcap = sectors.find(s => s.name === "LARGE_CAP");

  if (!infra || !lcap) return null;

  if (infra.momentum > 80 && lcap.change < 0) {
    return {
      headline: "Infrastructure-led rally forming",
      subtext: "Capital is moving into early-stage growth sectors while large caps lag.",
    };
  }

  if (lcap.change > 0 && infra.momentum < 50) {
    return {
      headline: "Large-cap stability phase",
      subtext: "Market is consolidating in major assets with low risk appetite.",
    };
  }

  return {
    headline: "Mixed rotation environment",
    subtext: "Capital flow is balanced across sectors with no dominant trend.",
  };
}, [sectors]);


const marketBias =
  infraDominance > 70 && marketBreadth > 0.6
    ? "RISK-ON STRUCTURE"
    : infraDominance > 50
    ? "EARLY ROTATION"
    : "DEFENSIVE STRUCTURE";

    const topSectors = [...sectors]
  .sort((a, b) => b.change - a.change)
  .slice(0, 3);

  const leaders = sectors
  .flatMap((s) => s.leaders)
  .sort((a, b) => b.change24h - a.change24h)
  .slice(0, 3);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="
        overflow-hidden
        rounded-3xl
        border border-white/10
        bg-gradient-to-br from-white/[0.04] to-white/[0.02]
        p-5
        backdrop-blur-2xl
      "
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
  <div>
    <div className="text-[10px] uppercase tracking-[0.25em] text-cyan-300">
      SECTOR ROTATION
    </div>

    <h2 className="mt-1 text-sm font-semibold text-white">
      Sector Performance
    </h2>
  </div>

  <div
    className={`text-[11px] px-2 py-1 rounded-lg border border-white/10 ${rotationState.color}`}
  >
    {marketBias}
  </div>
</div>

      <div>
      <div className="mt-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3">
  <div className="text-[11px] uppercase text-cyan-300 mb-1">
    🧠 Rotation Summary
  </div>

  <div className="text-sm text-white/80">
    {narrative?.headline}
  </div>

  <div className="text-xs text-white/50 mt-1">
    {narrative?.subtext}
  </div>
</div>
        </div>

      {/* SECTORS */}
      <div className="mt-6 space-y-4">
        {topSectors.map((s) => (
  <div
    key={s.name}
    className="rounded-xl border border-white/10 bg-black/20 p-3"
  >
    <div className="flex justify-between items-center">

      <div>
        <div className="text-sm font-medium text-white">
          {s.name}
        </div>

        <div className="text-[11px] text-white/40">
          {s.rotationState}
        </div>
      </div>

      <div
        className={`font-semibold ${
          s.change > 0
            ? "text-emerald-300"
            : "text-red-300"
        }`}
      >
        {s.change > 0 ? "+" : ""}
        {s.change.toFixed(2)}%
      </div>

    </div>
  </div>
))}

    <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">

  <div className="text-[11px] uppercase text-white/40 mb-2">
    Leading Assets
  </div>

  <div className="space-y-2">
    {leaders.map((coin) => (
      <div
        key={coin.id}
        className="flex justify-between text-sm"
      >
        <span className="text-white/70">
          {coin.symbol}
        </span>

        <span className="text-emerald-300">
          +{coin.change24h.toFixed(2)}%
        </span>
      </div>
    ))}
  </div>

  <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">

  <div className="text-[11px] uppercase text-white/40 mb-2">
    AI Interpretation
  </div>

  <div className="text-sm text-white/70">
    {marketSummary}
  </div>

</div>

</div>
      </div>
    </motion.section>
  );
}