
"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

import { useMarket } from "@/lib/providers/MarketProvider";
import { useMarketSnapshot } from "@/lib/intel/useMarketSnapshot";

/* =========================================================
   TYPES
========================================================= */

type FlowState =
  | "HOT"
  | "WARM"
  | "COOL"
  | "EXIT";

type MarketFlowState =
  | "ACCUMULATION"
  | "DISTRIBUTION"
  | "NEUTRAL";

type Flow = {
  name: string;
  avg: number;
  intensity: number;
  state: FlowState;
  arrow: string;
  label: string;
};

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
   MARKET FLOW STATE
========================================================= */

function getMarketFlowState(
  pressure: number
): MarketFlowState {
  if (pressure >= 20) {
    return "ACCUMULATION";
  }

  if (pressure <= -20) {
    return "DISTRIBUTION";
  }

  return "NEUTRAL";
}

/* =========================================================
   BEGINNER-FRIENDLY INTERPRETATION
========================================================= */

function getFlowHeadline(
  state: MarketFlowState
): string {
  if (state === "ACCUMULATION") {
    return "Money is flowing into crypto";
  }

  if (state === "DISTRIBUTION") {
    return "Money is flowing out of crypto";
  }

  return "Buying and selling are balanced";
}

function getFlowExplanation(
  state: MarketFlowState,
  pressure: number,
  participation: number
): string {
  if (state === "ACCUMULATION") {
    if (participation < 40) {
      return "Buying pressure is positive, but only a smaller part of the market is participating in the move.";
    }

    if (participation < 70) {
      return "Buying activity is stronger than selling activity, but the move is not yet broad across the entire market.";
    }

    return "Buying activity is stronger than selling activity, with broad participation across the market.";
  }

  if (state === "DISTRIBUTION") {
    if (participation < 40) {
      return "Selling pressure is increasing, but the move is currently concentrated in a smaller part of the market.";
    }

    if (participation < 70) {
      return "Selling activity is stronger than buying activity, but the move is not yet broad across the entire market.";
    }

    return "Selling activity is stronger than buying activity, with broad participation across the market.";
  }

  if (Math.abs(pressure) < 10) {
    return "Buying and selling activity are currently close to balanced.";
  }

  return "The market has a directional bias, but neither buyers nor sellers have clear control.";
}

/* =========================================================
   SECTOR HELPERS
========================================================= */

function getFlowArrow(avg: number): string {
  if (avg >= 0.75) {
    return "↗";
  }

  if (avg <= -0.75) {
    return "↘";
  }

  return "→";
}

function getSectorFlowState(
  avg: number
): FlowState {
  if (avg >= 4) {
    return "HOT";
  }

  if (avg >= 1) {
    return "WARM";
  }

  if (avg > -1) {
    return "COOL";
  }

  return "EXIT";
}

function getSectorFlowLabel(
  avg: number
): string {
  if (avg >= 4) {
    return "Strong inflow";
  }

  if (avg >= 1) {
    return "Moderate inflow";
  }

  if (avg >= 0.25) {
    return "Mild inflow";
  }

  if (avg > -0.25) {
    return "Neutral";
  }

  if (avg > -1) {
    return "Mild outflow";
  }

  if (avg > -3) {
    return "Capital outflow";
  }

  return "Heavy outflow";
}

/* =========================================================
   COMPONENT
========================================================= */

export default function CapitalFlow() {
  const { coins } = useMarket();

  const snapshot = useMarketSnapshot(coins);

  const { flow } = snapshot;

  /* =======================================================
     MARKET FLOW
  ======================================================= */

  const marketFlowState = useMemo(
    () =>
      getMarketFlowState(
        flow.pressure
      ),
    [flow.pressure]
  );

  const headline = useMemo(
    () =>
      getFlowHeadline(
        marketFlowState
      ),
    [marketFlowState]
  );

  const explanation = useMemo(
    () =>
      getFlowExplanation(
        marketFlowState,
        flow.pressure,
        flow.volumeParticipation
      ),
    [
      marketFlowState,
      flow.pressure,
      flow.volumeParticipation,
    ]
  );

  /* =======================================================
     SECTOR FLOW
  ======================================================= */

  const flows = useMemo<Flow[]>(() => {
    if (!coins?.length) {
      return [];
    }

    const grouped: Record<
      string,
      {
        totalChange: number;
        count: number;
      }
    > = {};

    coins.forEach((coin) => {
      const sector =
        sectorMap[
          coin.symbol.toUpperCase()
        ] || "OTHER";

      if (!grouped[sector]) {
        grouped[sector] = {
          totalChange: 0,
          count: 0,
        };
      }

      grouped[sector].totalChange +=
        coin.change24h;

      grouped[sector].count += 1;
    });

    return Object.entries(grouped)
      .map(([name, data]) => {
        const avg =
          data.count > 0
            ? data.totalChange /
              data.count
            : 0;

        const intensity = Math.min(
          Math.abs(avg) * 10,
          100
        );

        return {
          name,
          avg,
          intensity,
          state:
            getSectorFlowState(avg),
          arrow:
            getFlowArrow(avg),
          label:
            getSectorFlowLabel(avg),
        };
      })
      .sort(
        (a, b) =>
          Math.abs(b.avg) -
          Math.abs(a.avg)
      );
  }, [coins]);

  /* =======================================================
     STRONGEST INFLOW / OUTFLOW
  ======================================================= */

  const strongestInflow = useMemo(() => {
    return (
      flows
        .filter(
          (item) => item.avg > 0
        )
        .sort(
          (a, b) =>
            b.avg - a.avg
        )[0] || null
    );
  }, [flows]);

  const strongestOutflow = useMemo(() => {
    return (
      flows
        .filter(
          (item) => item.avg < 0
        )
        .sort(
          (a, b) =>
            a.avg - b.avg
        )[0] || null
    );
  }, [flows]);

  /* =======================================================
     TONE
  ======================================================= */

  const toneColor =
    marketFlowState === "ACCUMULATION"
      ? "text-emerald-300"
      : marketFlowState === "DISTRIBUTION"
      ? "text-red-300"
      : "text-yellow-300";

  const stateIcon =
    marketFlowState === "ACCUMULATION"
      ? "🟢"
      : marketFlowState === "DISTRIBUTION"
      ? "🔴"
      : "🟡";

  /* =======================================================
     LOADING
  ======================================================= */

  if (!coins?.length) {
    return (
      <div className="animate-pulse rounded-xl border border-cyan-400/20 bg-white/[0.02] p-4 space-y-4">
        <div className="h-4 w-32 rounded bg-white/10" />

        <div className="h-6 w-64 rounded bg-white/10" />

        <div className="h-12 rounded bg-white/5" />

        <div className="h-20 rounded bg-white/5" />

        <div className="h-12 rounded bg-white/5" />
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

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
      className="
        rounded-xl
        border border-cyan-400/20
        bg-white/[0.02]
        p-3
        shadow-[0_0_25px_rgba(34,211,238,0.08)]
        hover:shadow-[0_0_35px_rgba(34,211,238,0.16)]
        transition-all duration-500
      "
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-300">
          CAPITAL FLOW
        </div>

        <div
          className={`mt-2 flex items-center gap-2 text-sm font-semibold ${toneColor}`}
        >
          <span>{stateIcon}</span>
          <span>{headline}</span>
        </div>

        <div className="mt-2 text-[11px] leading-relaxed text-white/50">
          {explanation}
        </div>
      </div>

      {/* =================================================
          WHAT'S DRIVING THE MOVE
      ================================================= */}

      <div className="mb-4">
        <div className="mb-2 text-[10px] uppercase tracking-widest text-white/30">
          What&apos;s driving the move?
        </div>

        <div className="space-y-1.5">
          {flows.map((f) => (
            <div
              key={f.name}
              className="
                flex
                items-center
                justify-between
                rounded-lg
                border
                border-white/5
                bg-white/[0.015]
                px-2.5
                py-2
              "
            >
              <div className="flex items-center gap-2">
                <span
                  className={
                    f.avg > 0
                      ? "text-emerald-300"
                      : f.avg < 0
                      ? "text-red-300"
                      : "text-white/40"
                  }
                >
                  {f.arrow}
                </span>

                <div>
                  <div className="text-xs font-medium text-white">
                    {f.name}
                  </div>

                  <div className="text-[9px] text-white/35">
                    {f.label}
                  </div>
                </div>
              </div>

              <div
                className={`text-[11px] font-semibold ${
                  f.avg > 0
                    ? "text-emerald-300"
                    : f.avg < 0
                    ? "text-red-300"
                    : "text-white/50"
                }`}
              >
                {f.avg > 0
                  ? "+"
                  : ""}
                {f.avg.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =================================================
          INTERPRETATION
      ================================================= */}

      <div
        className="
          mb-4
          rounded-xl
          border
          border-cyan-400/10
          bg-cyan-400/[0.03]
          p-3
        "
      >
        <div className="text-[10px] uppercase tracking-widest text-cyan-300/70">
          What does this mean?
        </div>

        <div className="mt-1.5 text-[11px] leading-relaxed text-white/60">
          {strongestInflow ? (
            <>
              <span className="font-medium text-white">
                {strongestInflow.name}
              </span>{" "}
              is currently leading the inflow at{" "}
              <span className="font-medium text-emerald-300">
                +
                {strongestInflow.avg.toFixed(2)}%
              </span>
              .

              {strongestOutflow ? (
                <>
                  {" "}
                  The strongest outflow is coming from{" "}
                  <span className="font-medium text-red-300">
                    {strongestOutflow.name}
                  </span>
                  .
                </>
              ) : (
                <>
                  {" "}
                  There is currently no significant sector
                  outflow.
                </>
              )}
            </>
          ) : (
            <>
              There is currently no clear sector attracting
              capital.
            </>
          )}
        </div>
      </div>

      {/* =================================================
          ADVANCED METRICS
      ================================================= */}

      <div className="border-t border-white/10 pt-3">
        <div className="mb-2 text-[9px] uppercase tracking-widest text-white/25">
          Advanced metrics
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-white/10 bg-black/20 p-2">
            <div className="text-[8px] uppercase tracking-wider text-white/30">
              Flow Score
            </div>

            <div
              className={`mt-1 text-sm font-semibold ${toneColor}`}
            >
              {flow.score.toFixed(0)}
              <span className="text-[9px] text-white/30">
                /100
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/20 p-2">
            <div className="text-[8px] uppercase tracking-wider text-white/30">
              Buying Pressure
            </div>

            <div
              className={`mt-1 text-sm font-semibold ${
                flow.pressure > 0
                  ? "text-emerald-300"
                  : flow.pressure < 0
                  ? "text-red-300"
                  : "text-yellow-300"
              }`}
            >
              {flow.pressure > 0
                ? "+"
                : ""}
              {flow.pressure.toFixed(1)}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/20 p-2">
            <div className="text-[8px] uppercase tracking-wider text-white/30">
              Participation
            </div>

            <div className="mt-1 text-sm font-semibold text-white">
              {flow.volumeParticipation.toFixed(0)}%
            </div>
          </div>
        </div>

        <div className="mt-2 text-[9px] leading-relaxed text-white/25">
          Flow Score shows the overall directional bias.
          Buying Pressure shows the strength of that bias.
          Participation shows how much of the tracked market
          is contributing to the move.
        </div>
      </div>
    </motion.section>
  );
}

