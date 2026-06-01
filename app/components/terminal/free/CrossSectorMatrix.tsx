'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

import {
  buildMarketEngine,
} from '@/lib/intel/marketEngine';

import { useMarket } from "@/lib/providers/MarketProvider";


export default function CrossSectorMatrix() {

  const { coins } = useMarket();

  /**
   * 🧠 MARKET ENGINE
   */
  const market = useMemo(() => {
    return buildMarketEngine(coins);
  }, [coins]);

  /**
   * 🧠 SORTED FLOWS
   */
  const rankedFlows =
    [...market.flows].sort(
      (a, b) =>
        b.avg - a.avg
    );

  /**
   * 🧠 INTERPRETATION
   */
  const interpretation =
    market.regime ===
    'RISK_OFF'
      ? 'Defensive large-cap positioning continues while speculative sectors remain under pressure.'
      : market.regime ===
        'ROTATION'
      ? 'Cross-sector dispersion is increasing as capital rotates selectively between themes.'
      : market.regime ===
        'RISK_ON'
      ? 'Broad participation expansion continues across growth-oriented sectors.'
      : 'Market structure remains fragmented without strong sector leadership.';

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
        rounded-3xl
        border
        border-white/10
        bg-white/[0.02]
        p-2.5
      "
    >

      {/* HEADER */}
     <div className="mb-3 flex items-center justify-between">

  <div>
    <div className="text-[10px] uppercase tracking-[0.25em] text-cyan-300">
      CROSS-SECTOR MATRIX
    </div>

    <div className="mt-1 text-xs font-semibold text-white">
      Relative Strength & Rotation
    </div>
  </div>

  <div className="rounded-lg border border-white/10 px-2 py-1 text-[11px]">
    {market.regime}
  </div>

</div>

      {/* MATRIX */}
      <div className="mt-3 grid grid-cols-1 gap-2 xl:grid-cols-2">

        {rankedFlows.map(
          (flow, idx) => {

            const state =
              flow.avg > 2
                ? 'LEADING'
                : flow.avg < -2
                ? 'WEAK'
                : Math.abs(
                    flow.avg
                  ) > 1
                ? 'ROTATING'
                : 'DEFENSIVE';

            const arrow =
              flow.avg > 1
                ? '↗'
                : flow.avg < -1
                ? '↘'
                : '→';

            const color =
              flow.avg > 1
                ? 'text-emerald-300 border-emerald-400/20'
                : flow.avg < -1
                ? 'text-red-300 border-red-400/20'
                : 'text-cyan-300 border-cyan-400/20';

            return (
              <motion.div
                key={flow.name}
                whileHover={{
                  y: -2,
                }}
                className={`
                  rounded-2xl
                  border
                  bg-white/[0.02]
                  p-2.5
                  transition-all
                  duration-300
                  ${color}
                `}
              >

                <div className="flex items-center justify-between">

  <div className="flex items-center gap-2">

    <div className="text-sm font-semibold text-white">
      {flow.name}
    </div>

    <div
      className={`text-[10px] px-1.5 py-0.5 rounded border ${color}`}
    >
      {state}
    </div>

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

              </motion.div>
            );
          }
        )}

      </div>

      {/* AI INTERPRETATION */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-2.5">

        <div className="text-[11px] uppercase tracking-wide text-white/40">
          AI Interpretation
        </div>

        <p className="mt-3 text-xs leading-relaxed text-white/65">
          {interpretation}
        </p>

      </div>

    </motion.section>
  );
}