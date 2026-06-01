'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

import type { Coin } from '@/lib/types/coin';

import {
  buildMarketEngine,
} from '@/lib/intel/marketEngine';

import { useMarket } from "@/lib/providers/MarketProvider";


export default function VolatilityRadar() {

  const { coins,  engine } = useMarket();

  /**
   * 🧠 MARKET ENGINE
   */
  const market = useMemo(() => {
    return buildMarketEngine(coins);
  }, [coins]);

  /**
   * 🎨 REGIME COLORS
   */
  const volatilityStyles = {
    LOW: {
      text: 'text-cyan-300',
      border: 'border-cyan-400/20',
      glow:
        'shadow-[0_0_35px_rgba(34,211,238,0.10)]',
      pulse: 'bg-cyan-400',
    },

    NORMAL: {
      text: 'text-emerald-300',
      border: 'border-emerald-400/20',
      glow:
        'shadow-[0_0_35px_rgba(52,211,153,0.10)]',
      pulse: 'bg-emerald-400',
    },

    ELEVATED: {
      text: 'text-yellow-300',
      border: 'border-yellow-300/20',
      glow:
        'shadow-[0_0_35px_rgba(253,224,71,0.12)]',
      pulse: 'bg-yellow-300',
    },

    EXTREME: {
      text: 'text-red-300',
      border: 'border-red-400/20',
      glow:
        'shadow-[0_0_35px_rgba(248,113,113,0.15)]',
      pulse: 'bg-red-400',
    },
  };

  const styles =
    volatilityStyles[
      market.volatilityState
    ];

  /**
   * 🧠 AI INTERPRETATION
   */
  const interpretation =
    market.volatilityState ===
    'EXTREME'
      ? 'Instability remains elevated as directional pressure accelerates across high-beta sectors.'
      : market.volatilityState ===
        'ELEVATED'
      ? 'Volatility expansion continues building amid broad participation imbalance.'
      : market.volatilityState ===
        'NORMAL'
      ? 'Market volatility remains controlled while participation trends continue evolving.'
      : 'Compression conditions suggest reduced market stress and lower directional aggression.';

  /**
   * 📊 VOLATILITY LEADERS
   */
  const volatilityLeaders =
    [...coins]
      .sort(
        (a, b) =>
          Math.abs(
            b.change24h
          ) -
          Math.abs(
            a.change24h
          )
      )
      .slice(0, 3);

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
        p-3
        ${styles.border}
        ${styles.glow}
      `}
    >

      {/* HEADER */}
      <div className="mb-6 flex items-start justify-between">

        <div>

          <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-300">
            VOLATILITY RADAR
          </div>

          <div
            className={`mt-1 text-sm font-semibold ${styles.text}`}
          >
            {market.volatilityState}
          </div>

        </div>

        {/* LIVE PULSE */}
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5">

          <div
            className={`h-1.5 w-1.5 animate-pulse rounded-full ${styles.pulse}`}
          />

          <span className="text-[10px] uppercase tracking-wide text-white/50">
            LIVE
          </span>

        </div>

      </div>

      {/* GRID */}
      <div className="grid grid-cols-4 gap-2 mt-3">

  <div>
    <div className="text-[10px] text-white/40">
      VOL
    </div>
    <div className="text-xs font-semibold text-white">
      {market.volatility}%
    </div>
  </div>

  <div>
    <div className="text-[10px] text-white/40">
      STRESS
    </div>
    <div className={`text-xs font-semibold ${styles.text}`}>
      {market.volatilityState}
    </div>
  </div>

  <div>
    <div className="text-[10px] text-white/40">
      FLOW
    </div>
    <div className="text-xs font-semibold text-white">
      {market.participation}%
    </div>
  </div>

  <div>
    <div className="text-[10px] text-white/40">
      STABLE
    </div>
    <div className="text-xs font-semibold text-white">
      {market.stability}
    </div>
  </div>

</div>

      {/* AI INTERPRETATION */}
      <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.02] p-3">

        <div className="text-[11px] uppercase tracking-wide text-white/40">
          AI Interpretation
        </div>

        <p className="mt-1 text-xs text-white/60">
          {interpretation}
        </p>

      </div>

      {/* VOL LEADERS */}
      <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.02] p-3">

        <div className="mb-4 flex items-center justify-between">

          <div>

            <div className="text-[11px] uppercase tracking-wide text-white/40">
              Volatility Leaders
            </div>

            <div className="mt-1 text-sm text-white/60">
              Assets driving current market stress
            </div>

          </div>

        </div>

        <div className="space-y-2">

          {volatilityLeaders.map(
            (coin, idx) => (

              <div
                key={coin.symbol}
                className="flex items-center justify-between"
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-xs font-bold text-white">
                    #{idx + 1}
                  </div>

                  <div>

                    <div className="text-xs font-medium text-white">
                      {coin.symbol}
                    </div>

                  </div>

                </div>

                <div
                  className={`text-sm font-semibold ${
                    coin.change24h >= 0
                      ? 'text-emerald-300'
                      : 'text-red-300'
                  }`}
                >
                  {coin.change24h >= 0
                    ? '+'
                    : ''}
                  {coin.change24h.toFixed(2)}%
                </div>

              </div>
            )
          )}

        </div>

      </div>

    </motion.section>
  );
}