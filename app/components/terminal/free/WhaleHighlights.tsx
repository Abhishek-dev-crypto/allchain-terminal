'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

import type { Coin } from '@/lib/types/coin';

import {
  buildWhaleInsights,
} from '@/lib/intel/buildWhaleInsights';
import { useMarket } from '@/lib/providers/MarketProvider';

type Props = {
  coins: Coin[];
};

export default function WhaleHighlights() {

  const {coins} = useMarket();

  /**
   * 🧠 WHALE ENGINE
   */
  const whale = useMemo(() => {
    return buildWhaleInsights(coins);
  }, [coins]);

  /**
   * 🎨 BIAS COLORS
   */
  const biasStyles = {
    ACCUMULATION: {
      text: 'text-emerald-300',

      badge:
        'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',

      glow:
        'shadow-[0_0_35px_rgba(52,211,153,0.12)]',
    },

    DISTRIBUTION: {
      text: 'text-red-300',

      badge:
        'bg-red-400/10 text-red-300 border-red-400/20',

      glow:
        'shadow-[0_0_35px_rgba(248,113,113,0.14)]',
    },

    NEUTRAL: {
      text: 'text-cyan-300',

      badge:
        'bg-cyan-400/10 text-cyan-300 border-cyan-400/20',

      glow:
        'shadow-[0_0_35px_rgba(34,211,238,0.10)]',
    },
  };

  const styles =
    biasStyles[whale.bias];

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
      className={`
        rounded-3xl
        border
        border-white/10
        bg-white/[0.02]
        p-4
        ${styles.glow}
      `}
    >

      {/* HEADER */}
      <div className="mb-3 flex items-center justify-between">

        <div>

          <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-300">
            WHALE INTELLIGENCE
          </div>

          <div
            className={`mt-1 text-sm font-semibold ${styles.text}`}
          >
            {whale.bias}
          </div>

          <p className="mt-1 max-w-xl text-sm leading-relaxed text-white/60">
            AI-tracked institutional positioning
            derived from large-cap participation,
            volatility expansion, liquidity pressure,
            and cross-market capital behavior.
          </p>

        </div>

        {/* CONFIDENCE */}
        <div
          className={`
            rounded-xl
            border
            px-4
            py-3
            text-center
            ${styles.badge}
          `}
        >

          <div className="text-[10px] uppercase tracking-wide">
            Confidence
          </div>

          <div className="text-sm font-semibold">
            {whale.confidence}%
          </div>

        </div>

      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">

        {/* ACTIVITY */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">

          <div className="text-[11px] uppercase tracking-wide text-white/40">
            Whale Activity
          </div>

          <div className="mt-1 text-sm font-semibold text-white">
            {whale.activity}
          </div>

          <div className="text-[10px] text-white/40">
            Institutional participation
          </div>

        </div>

        {/* BIAS */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">

          <div className="text-[11px] uppercase tracking-wide text-white/40">
            Bias
          </div>

          <div
            className={`mt-1 text-sm font-semibold ${styles.text}`}
          >
            {whale.bias}
          </div>

          <div className="text-[10px] text-white/40">
            Smart money positioning
          </div>

        </div>

        {/* PRESSURE */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">

          <div className="text-[11px] uppercase tracking-wide text-white/40">
            Pressure Zone
          </div>

          <div className="mt-1 text-sm font-semibold text-white">
            {whale.pressureZone}
          </div>

          <div className="text-[10px] text-white/40">
            Dominant capital behavior
          </div>

        </div>

        {/* SIGNAL */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">

          <div className="text-[11px] uppercase tracking-wide text-white/40">
            Smart Money Signal
          </div>

          <div className="mt-1 text-sm font-semibold text-white">
            {whale.activity}
          </div>

          <div className="text-[10px] text-white/40">
            Whale conviction intensity
          </div>

        </div>

      </div>

      {/* INTERPRETATION */}
      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-2">

        <div className="text-[11px] uppercase tracking-wide text-white/40">
          AI Interpretation
        </div>

       <p className="mt-1 text-xs text-white/60">
          {whale.interpretation}
        </p>

      </div>

      {/* LEADERS */}
      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-2">

        <div className="mb-4 flex items-center justify-between">

          <div>

            <div className="text-[11px] uppercase tracking-wide text-white/40">
              Whale Leaders
            </div>

            <div className="mt-1 text-sm text-white/60">
              Assets attracting institutional-scale positioning
            </div>

          </div>

          <div
            className={`text-xs font-medium ${styles.text}`}
          >
            LIVE
          </div>

        </div>

        <div className="space-y-3">

          {whale.leaders.map(
            (leader, idx) => (

              <div
                key={leader.symbol}
                className="flex items-center justify-between"
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-xs font-bold text-white">
                    #{idx + 1}
                  </div>

                  <div>

                    <div className="text-xs font-medium text-white">
                      {leader.symbol}
                    </div>

                    <div
                      className={`text-[11px] ${
                        leader.pressure ===
                        'BUYING'
                          ? 'text-emerald-300'
                          : 'text-red-300'
                      }`}
                    >
                      {leader.pressure}
                    </div>

                  </div>

                </div>

                <div className="text-right">

                  <div
                    className={`text-xs font-medium ${
                      leader.change24h >= 0
                        ? 'text-emerald-300'
                        : 'text-red-300'
                    }`}
                  >
                    {leader.change24h >= 0
                      ? '+'
                      : ''}
                    {leader.change24h.toFixed(2)}%
                  </div>

                  <div className="text-[11px] text-white/40">
                    Intensity {leader.intensity}
                  </div>

                </div>

              </div>
            )
          )}

        </div>

      </div>

    </motion.section>
  );
}