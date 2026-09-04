"use client";

import { motion } from "framer-motion";

import { useMarket } from "@/lib/providers/MarketProvider";

function getMarketBiasLabel(bias: string) {
  switch (bias) {
    case "RISK_ON_STRUCTURE":
      return {
        title: "Risk-On Market",
        description:
          "Traders are generally favoring higher-risk assets.",
        icon: "🟢",
      };

    case "EARLY_ROTATION":
      return {
        title: "Early Rotation",
        description:
          "Market strength is beginning to move toward new sectors.",
        icon: "🔄",
      };

    case "BALANCED_FLOW":
      return {
        title: "Mixed Market",
        description:
          "Strength is spread across sectors without a clear leader.",
        icon: "⚖️",
      };

    case "DEFENSIVE_STRUCTURE":
      return {
        title: "Defensive Market",
        description:
          "Traders are showing less appetite for higher-risk sectors.",
        icon: "🛡️",
      };

    default:
      return {
        title: "Market Structure",
        description:
          "Sector conditions are developing.",
        icon: "📊",
      };
  }
}

function getRotationLabel(state: string) {
  switch (state) {
    case "LEADING_ROTATION":
      return "Leading";

    case "EXPANDING":
      return "Gaining Strength";

    case "BUILDING":
      return "Starting to Gain";

    case "ROTATION_EXIT":
      return "Losing Strength";

    case "DORMANT":
      return "Inactive";

    default:
      return state;
  }
}

function getSectorExplanation(
  state: string,
  change: number,
  relativeStrength: number
) {
  if (state === "LEADING_ROTATION") {
    return "This sector is currently leading the market.";
  }

  if (state === "EXPANDING") {
    return "This sector is gaining strength and outperforming weaker areas.";
  }

  if (state === "BUILDING") {
    return "This sector is beginning to show positive momentum.";
  }

  if (state === "ROTATION_EXIT") {
    return "This sector is losing strength compared with other sectors.";
  }

  if (relativeStrength > 0) {
    return "This sector is outperforming the broader market.";
  }

  if (change > 0) {
    return "This sector is rising, but not leading the market.";
  }

  return "This sector is currently showing weak performance.";
}

export default function SectorPerformance() {
  const { rotation } = useMarket();

  const topSectors = rotation.sectors.slice(0, 3);

  const marketBias = getMarketBiasLabel(
    rotation.marketBias
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="
        overflow-hidden
        rounded-3xl
        border border-white/10
        bg-gradient-to-br
        from-white/[0.04]
        to-white/[0.02]
        p-5
        backdrop-blur-2xl
      "
    >
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-cyan-300">
            SECTOR ROTATION
          </div>

          <h2 className="mt-1 text-sm font-semibold text-white">
            Where market strength is moving
          </h2>

          <p className="mt-1 text-[11px] text-white/40">
            Shows which sectors are leading, gaining strength,
            or losing momentum.
          </p>
        </div>

        <div className="shrink-0 rounded-lg border border-white/10 px-2 py-1 text-[11px] text-cyan-300">
          {marketBias.icon} {marketBias.title}
        </div>
      </div>

      {/* MARKET STRUCTURE */}
      <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">
            {marketBias.icon}
          </span>

          <div className="text-[11px] font-medium uppercase tracking-wide text-cyan-300">
            Market Structure
          </div>
        </div>

        <div className="mt-2 text-sm font-medium text-white">
          {marketBias.title}
        </div>

        <div className="mt-1 text-xs leading-relaxed text-white/50">
          {marketBias.description}
        </div>
      </div>

      {/* ROTATION SUMMARY */}
      <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
        <div className="text-[11px] font-medium uppercase tracking-wide text-white/40">
          What is happening?
        </div>

        <div className="mt-2 text-sm font-medium text-white">
          {rotation.narrative.headline}
        </div>

        <div className="mt-1 text-xs leading-relaxed text-white/50">
          {rotation.narrative.subtext}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] text-white/40">
            Confidence
          </span>

          <span className="text-sm font-semibold text-white">
            {rotation.rotationConfidence.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* TOP SECTORS */}
      <div className="mt-5">
        <div className="text-[11px] font-medium uppercase tracking-wide text-white/40">
          Where is the strength?
        </div>

        <div className="mt-3 space-y-3">
          {topSectors.map((sector) => (
            <div
              key={sector.name}
              className="
                rounded-xl
                border border-white/10
                bg-black/20
                p-4
              "
            >
              {/* TOP ROW */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">
                    {sector.name}
                  </div>

                  <div className="mt-1 text-[11px] text-cyan-300">
                    {getRotationLabel(
                      sector.rotationState
                    )}
                  </div>
                </div>

                <div
                  className={`text-lg font-semibold ${
                    sector.change >= 0
                      ? "text-emerald-300"
                      : "text-red-300"
                  }`}
                >
                  {sector.change >= 0 ? "+" : ""}
                  {sector.change.toFixed(2)}%
                </div>
              </div>

              {/* EXPLANATION */}
              <div className="mt-3 text-xs leading-relaxed text-white/50">
                {getSectorExplanation(
                  sector.rotationState,
                  sector.change,
                  sector.relativeStrength
                )}
              </div>

              {/* METRICS */}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 border-t border-white/5 pt-3">
                <div>
                  <div className="text-[10px] text-white/30">
                    Momentum
                  </div>

                  <div className="mt-0.5 text-xs text-white/70">
                    {sector.momentum.toFixed(0)}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-white/30">
                    Participation
                  </div>

                  <div className="mt-0.5 text-xs text-white/70">
                    {sector.participation.toFixed(0)}%
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-white/30">
                    vs Market
                  </div>

                  <div className="mt-0.5 text-xs text-white/70">
                    {sector.relativeStrength >= 0
                      ? "+"
                      : ""}
                    {sector.relativeStrength.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LEADING ASSETS */}
      <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
        <div className="text-[11px] font-medium uppercase tracking-wide text-white/40">
          Leading Assets
        </div>

        <div className="mt-3 space-y-2">
          {rotation.leaders.map((coin) => (
            <div
              key={coin.id}
              className="flex items-center justify-between"
            >
              <span className="text-sm text-white/70">
                {coin.symbol}
              </span>

              <span
                className={
                  coin.change24h >= 0
                    ? "text-sm text-emerald-300"
                    : "text-sm text-red-300"
                }
              >
                {coin.change24h >= 0 ? "+" : ""}
                {coin.change24h.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ROTATION STRUCTURE */}
      <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
        <div className="text-[11px] font-medium uppercase tracking-wide text-white/40">
          Rotation Signals
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <div className="text-[10px] text-white/30">
              Current Leader
            </div>

            <div className="mt-1 text-sm font-medium text-white">
              {rotation.dominantSector ??
                "No clear leader"}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-white/30">
              Emerging
            </div>

            <div className="mt-1 text-sm font-medium text-white">
              {rotation.emergingSector ??
                "No clear new leader yet"}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-white/30">
              Losing Strength
            </div>

            <div className="mt-1 text-sm font-medium text-white">
              {rotation.weakeningSector ??
                "No major sector weakening"}
            </div>
          </div>
        </div>
      </div>

      {/* AI INTERPRETATION */}
      <div className="mt-5 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">💡</span>

          <div className="text-[11px] font-medium uppercase tracking-wide text-cyan-300">
            What this means
          </div>
        </div>

        <div className="mt-2 text-sm leading-relaxed text-white/70">
          {rotation.narrative.subtext}
        </div>
      </div>
    </motion.section>
  );
}