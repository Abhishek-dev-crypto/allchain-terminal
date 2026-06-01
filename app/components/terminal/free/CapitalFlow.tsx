'use client';

import { useMemo } from "react";
import { motion } from "framer-motion";
import { buildTieredIntel } from "@/lib/intel/tieredEngine";

import { useMarket } from "@/lib/providers/MarketProvider";



type FlowState = "HOT" | "WARM" | "COOL" | "EXIT";

type Flow = {
  name: string;
  avg: number;
  intensity: number;
  state: FlowState;
  arrow: string;
  label: string;
};

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

export default function CapitalFlow() {

  const { coins } = useMarket();

   /**
   * 📊 FLOW ENGINE
   */
  const flows = useMemo<Flow[]>(() => {
    const grouped: Record<
      string,
      { total: number; count: number }
    > = {};

    coins.forEach((coin) => {
      const sector =
        sectorMap[coin.symbol.toUpperCase()] || "OTHER";

      if (!grouped[sector]) {
        grouped[sector] = {
          total: 0,
          count: 0,
        };
      }

      grouped[sector].total += coin.change24h;
      grouped[sector].count += 1;
    });

    return Object.entries(grouped)
      .map(([name, data]) => {
        const avg = data.total / data.count;

        const intensity = Math.min(
          Math.abs(avg) * 10,
          100
        );

        const state: FlowState =
          avg > 4
            ? "HOT"
            : avg > 1
            ? "WARM"
            : avg > -1
            ? "COOL"
            : "EXIT";

        const arrow =
          avg > 2
            ? "↗"
            : avg < -2
            ? "↘"
            : "→";

        const label =
          avg > 4
            ? "Strong inflow"
            : avg > 1
            ? "Moderate inflow"
            : avg > -1
            ? "Neutral flow"
            : avg > -3
            ? "Capital outflow"
            : "Heavy distribution";

        return {
          name,
          avg,
          intensity,
          state,
          arrow,
          label,
        };
      })
      .sort(
        (a, b) =>
          Math.abs(b.avg) - Math.abs(a.avg)
      );
  }, [coins]);

  /**
   * 🧠 FREE INTELLIGENCE
   */
  const intel = useMemo(() => {
    return buildTieredIntel(flows);
  }, [flows]);



  if (!coins?.length) {
  return (
    <div className="animate-pulse rounded-xl border border-cyan-400/20 bg-white/[0.02] p-4 space-y-4">

      <div className="h-4 w-32 rounded bg-white/10" />

      <div className="h-6 w-56 rounded bg-white/10" />

      <div className="space-y-3">
        <div className="h-12 rounded bg-white/5" />
        <div className="h-12 rounded bg-white/5" />
        <div className="h-12 rounded bg-white/5" />
      </div>

    </div>
  );
}

 
  const primaryDriver =
    flows.length > 0 ? flows[0] : null;

  const toneColor =
    intel.free.tone === "bullish"
      ? "text-emerald-300"
      : intel.free.tone === "bearish"
      ? "text-red-300"
      : intel.free.tone === "mixed"
      ? "text-yellow-300"
      : "text-white";

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
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

      {/* HEADER */}
      <div className="mb-4">

        <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-300">
          CAPITAL FLOW
        </div>

       <div className={`mt-1 text-sm font-semibold ${toneColor}`}>
          {intel.free.title}
        </div>

        

        <div className="mt-1 text-[11px] text-white/40">
          Structure: {intel.pro.structure}
        </div>

      </div>

      {/* FLOW MAP */}
      <div className="space-y-1">

        {flows.map((f, idx) => (
          <div
            key={f.name}
            className="space-y-1"
          >

            <div className="flex items-center justify-between text-sm">

              <div className="flex items-center gap-2">

                <span className="text-xs font-medium text-white">
                  {f.name}
                </span>

                <span className="
  px-1.5 py-0.5
  rounded
  bg-white/5
  text-[10px]
  text-white/40
">
  #{idx + 1}
</span>

              </div>

              <span className="text-[11px] font-medium">
                {f.arrow}{" "}
                {f.avg > 0 ? "+" : ""}
                {f.avg.toFixed(2)}%
              </span>

            </div>

            <div className="text-white/40">
              {f.label}
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-white/5">

              <div
                className={`h-full ${
                  f.state === "HOT"
                    ? "bg-emerald-400"
                    : f.state === "WARM"
                    ? "bg-yellow-300"
                    : f.state === "COOL"
                    ? "bg-cyan-300"
                    : "bg-red-400"
                }`}
                style={{
                  width: `${f.intensity}%`,
                }}
              />

            </div>

          </div>
        ))}

      </div>

      {/* PRIMARY DRIVER */}
      <div className="mt-4 border-t border-white/10 pt-4 text-[11px] font-medium">

        Primary pressure:{" "}

        {primaryDriver ? (
          <span className="font-semibold text-red-300">
            {primaryDriver.name} (
            {primaryDriver.avg.toFixed(2)}%)
          </span>
        ) : (
          <span className="text-white/40">
            Analyzing capital flow...
          </span>
        )}

      </div>

    </motion.section>
  );
}