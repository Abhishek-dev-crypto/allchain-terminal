'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

import {
  buildWhaleInsights,
} from '@/lib/intel/buildWhaleInsights';

import { useMarket } from '@/lib/providers/MarketProvider';

export default function WhaleHighlights() {
  const { coins } = useMarket();

  /**
   * 🧠 WHALE INTELLIGENCE ENGINE
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

  const styles = biasStyles[whale.bias];

  /**
   * 🎨 ACTIVITY COLOR
   */
  const activityColor =
    whale.activity === 'AGGRESSIVE'
      ? 'text-red-300'
      : whale.activity === 'ACTIVE'
      ? 'text-yellow-300'
      : 'text-cyan-300';

  /**
   * 🧠 BEGINNER-FRIENDLY ACTIVITY DESCRIPTION
   */
  const activityDescription =
    whale.activity === 'AGGRESSIVE'
      ? 'Major assets are showing unusually strong movement.'
      : whale.activity === 'ACTIVE'
      ? 'Major assets are showing elevated market activity.'
      : 'Major assets are showing relatively calm activity.';

  /**
   * 🧠 BEGINNER-FRIENDLY BIAS DESCRIPTION
   */
  const biasDescription =
    whale.bias === 'ACCUMULATION'
      ? 'Large-cap assets are showing stronger buying pressure.'
      : whale.bias === 'DISTRIBUTION'
      ? 'Large-cap assets are showing stronger selling pressure.'
      : 'Buying and selling pressure remain relatively balanced.';

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
      <div className="mb-4 flex items-start justify-between gap-4">

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
            AI-estimated large-cap buying and selling pressure
            based on market participation, price movement,
            and volatility.
          </p>

        </div>

        {/* CONFIDENCE */}
        <div
          className={`
            shrink-0
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

      {/* SUMMARY */}
      <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">

        <div className="text-[11px] uppercase tracking-wide text-white/40">
          What This Means
        </div>

        <p className="mt-1 text-xs leading-relaxed text-white/60">
          {biasDescription}
        </p>

      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">

        {/* ACTIVITY */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">

          <div className="text-[11px] uppercase tracking-wide text-white/40">
            Whale Activity
          </div>

          <div
            className={`mt-1 text-sm font-semibold ${activityColor}`}
          >
            {whale.activity}
          </div>

          <div className="mt-1 text-[10px] leading-relaxed text-white/40">
            {activityDescription}
          </div>

        </div>

        {/* BIAS */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">

          <div className="text-[11px] uppercase tracking-wide text-white/40">
            Market Bias
          </div>

          <div
            className={`mt-1 text-sm font-semibold ${styles.text}`}
          >
            {whale.bias}
          </div>

          <div className="mt-1 text-[10px] leading-relaxed text-white/40">
            Buying vs selling pressure
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

          <div className="mt-1 text-[10px] leading-relaxed text-white/40">
            Asset showing the strongest move
          </div>

        </div>

        {/* CONFIDENCE */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">

          <div className="text-[11px] uppercase tracking-wide text-white/40">
            Signal Confidence
          </div>

          <div
            className={`mt-1 text-sm font-semibold ${styles.text}`}
          >
            {whale.confidence}%
          </div>

          <div className="mt-1 text-[10px] leading-relaxed text-white/40">
            Strength of the current signal
          </div>

        </div>

      </div>

      {/* AI INTERPRETATION */}
      <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">

        <div className="text-[11px] uppercase tracking-wide text-white/40">
          AI Interpretation
        </div>

        <p className="mt-1 text-xs leading-relaxed text-white/60">
          {whale.interpretation}
        </p>

      </div>

      {/* LEADERS */}
      <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">

        <div className="mb-4 flex items-center justify-between">

          <div>

            <div className="text-[11px] uppercase tracking-wide text-white/40">
              Whale Leaders
            </div>

            <div className="mt-1 text-sm text-white/60">
              Large-cap assets showing the strongest pressure
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

                {/* ASSET */}
                <div className="flex items-center gap-3">

                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-xs font-bold text-white">
                    #{idx + 1}
                  </div>

                  <div>

                    <div className="text-xs font-medium text-white">
                      {leader.symbol}
                    </div>

                    <div
                      className={`
                        text-[11px]
                        ${
                          leader.pressure === 'BUYING'
                            ? 'text-emerald-300'
                            : 'text-red-300'
                        }
                      `}
                    >
                      {leader.pressure === 'BUYING'
                        ? 'Buying pressure'
                        : 'Selling pressure'}
                    </div>

                  </div>

                </div>

                {/* METRICS */}
                <div className="text-right">

                  <div
                    className={`
                      text-xs
                      font-medium
                      ${
                        leader.change24h >= 0
                          ? 'text-emerald-300'
                          : 'text-red-300'
                      }
                    `}
                  >
                    {leader.change24h >= 0
                      ? '+'
                      : ''}
                    {leader.change24h.toFixed(2)}%
                  </div>

                  <div className="text-[11px] text-white/40">
                    Pressure {leader.intensity}/100
                  </div>

                </div>

              </div>

            )
          )}

          {!whale.leaders.length && (
            <div className="py-4 text-center text-xs text-white/40">
              Waiting for sufficient market data.
            </div>
          )}

        </div>

      </div>

    </motion.section>
  );
}