'use client';

import { motion } from 'framer-motion';

import type { MarketEngineOutput } from '@/lib/intel/marketEngine';
import { useMarket } from "@/lib/providers/MarketProvider";



export default function RegimePulse() {

    const { engine } = useMarket();

    const safe = {
  regime: engine?.regime ?? "CHOPPY",
  confidence: engine?.regimeConfidence ?? 0,
  volatility: engine?.volatility ?? 0,
  volatilityState: engine?.volatilityState ?? "UNKNOWN",
  breadthState: engine?.breadthState ?? "UNKNOWN",
  positiveBreadth: engine?.positiveBreadth ?? 0,
  stability: engine?.stability ?? "FRAGILE",
  momentum: engine?.momentum ?? "NEUTRAL",
  participation: engine?.participation ?? 0,
  btcDominance: engine?.btcDominance ?? 0,
  ethDominance: engine?.ethDominance ?? 0,
  altStrength: engine?.altStrength ?? 0,
};


  /**
   * 🧠 MARKET ENGINE
   */
  
  /**
   * 🎨 REGIME COLORS
   */
  const regimeStyles = {
    RISK_ON: {
      text: 'text-emerald-300',
      border: 'border-emerald-400/20',
      glow:
        'shadow-[0_0_30px_rgba(52,211,153,0.15)]',
      badge:
        'bg-emerald-400/10 text-emerald-300',
    },

    RISK_OFF: {
      text: 'text-red-300',
      border: 'border-red-400/20',
      glow:
        'shadow-[0_0_30px_rgba(248,113,113,0.15)]',
      badge:
        'bg-red-400/10 text-red-300',
    },

    ROTATION: {
      text: 'text-yellow-300',
      border: 'border-yellow-300/20',
      glow:
        'shadow-[0_0_30px_rgba(253,224,71,0.12)]',
      badge:
        'bg-yellow-300/10 text-yellow-300',
    },

    CHOPPY: {
      text: 'text-cyan-300',
      border: 'border-cyan-300/20',
      glow:
        'shadow-[0_0_30px_rgba(34,211,238,0.12)]',
      badge:
        'bg-cyan-300/10 text-cyan-300',
    },
  };

  const styles =
    regimeStyles[engine.regime];

  /**
   * 🧠 STATE LABELS
   */
  const momentumColor =
    engine.momentum === 'ACCELERATING'
      ? 'text-emerald-300'
      : engine.momentum ===
        'DECELERATING'
      ? 'text-red-300'
      : 'text-white';

  const stabilityColor =
    engine.stability === 'STABLE'
      ? 'text-emerald-300'
      : engine.stability === 'FRAGILE'
      ? 'text-yellow-300'
      : 'text-red-300';

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
        bg-white/[0.02]
        p-2
        ${styles.border}
        ${styles.glow}
      `}
    >

      {/* HEADER */}
      <div className="mb-2 flex items-center justify-between">

        <div>

          <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">
            REGIME PULSE
          </div>

          
            <div
  className={`mt-1 text-sm font-semibold ${styles.text}`}
>
          
            {safe.regime.replaceAll(
              '_',
              ' '
            )}
          </div>

        </div>

        {/* CONFIDENCE */}
        <div
          className={`
            rounded-lg px-2 py-1
            text-center
            ${styles.badge}
          `}
        >

          <div className="text-[10px] uppercase tracking-wide">
            Confidence
          </div>

          <div className="text-sm font-semibold">
            {engine.regimeConfidence}%
          </div>

        </div>

      </div>

      {/* GRID */}
     <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">

        {/* VOLATILITY */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2">

          <div className="text-[10px] uppercase tracking-wide text-white/40">
            Volatility
          </div>

          <div className="mt-1 text-sm font-semibold text-white">
            {engine.volatilityState}
          </div>

          <div className="mt-1 text-xs text-white/50">
            {engine.volatility}%
          </div>

        </div>

        {/* BREADTH */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2">

          <div className="text-[10px] uppercase tracking-wide text-white/40">
            Breadth
          </div>

          <div className="mt-1 text-sm font-semibold text-white">
            {engine.breadthState}
          </div>

          <div className="mt-1 text-xs text-white/50">
            {engine.positiveBreadth}% positive
          </div>

        </div>

        {/* STABILITY */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2">

          <div className="text-[10px] uppercase tracking-wide text-white/40">
            Stability
          </div>

          <div
            className={`mt-1 text-sm font-semibold ${stabilityColor}`}
          >
            {engine.stability}
          </div>

          <div className="mt-1 text-xs text-white/50">
            Structural condition
          </div>

        </div>

        {/* MOMENTUM */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2">

          <div className="text-[10px] uppercase tracking-wide text-white/40">
            Momentum
          </div>

          <div
            className={`mt-1 text-sm font-semibold ${momentumColor}`}
          >
            {engine.momentum}
          </div>

          <div className="mt-1 text-xs text-white/50">
            {engine.participation}% participation
          </div>

        </div>

      </div>

      {/* DOMINANCE */}
      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-2">

        <div className="mb-4 text-[10px] uppercase tracking-wide text-white/40">
          Market Dominance Structure
        </div>

        <div className="grid grid-cols-3 gap-3">

          <div>
            <div className="text-xs text-white/40">
              BTC Dominance
            </div>

            <div className="mt-1 text-xl font-bold text-orange-300">
              {engine.btcDominance}%
            </div>
          </div>

          <div>
            <div className="text-xs text-white/40">
              ETH Dominance
            </div>

            <div className="mt-1 text-xl font-bold text-cyan-300">
              {engine.ethDominance}%
            </div>
          </div>

          <div>
            <div className="text-xs text-white/40">
              Alt Strength
            </div>

            <div className="mt-1 text-xl font-bold text-yellow-300">
              {engine.altStrength}%
            </div>
          </div>

        </div>

      </div>

    </motion.section>
  );
}