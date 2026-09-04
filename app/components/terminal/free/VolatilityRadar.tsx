'use client';

import { motion } from 'framer-motion';

import { useMarket } from '@/lib/providers/MarketProvider';

export default function VolatilityRadar() {
  const { coins, engine } = useMarket();

  const volatilityStyles = {
    LOW: {
      text: 'text-cyan-300',
      border: 'border-cyan-400/20',
      glow: 'shadow-[0_0_35px_rgba(34,211,238,0.10)]',
      pulse: 'bg-cyan-400',
    },

    NORMAL: {
      text: 'text-emerald-300',
      border: 'border-emerald-400/20',
      glow: 'shadow-[0_0_35px_rgba(52,211,153,0.10)]',
      pulse: 'bg-emerald-400',
    },

    ELEVATED: {
      text: 'text-yellow-300',
      border: 'border-yellow-300/20',
      glow: 'shadow-[0_0_35px_rgba(253,224,71,0.12)]',
      pulse: 'bg-yellow-300',
    },

    EXTREME: {
      text: 'text-red-300',
      border: 'border-red-400/20',
      glow: 'shadow-[0_0_35px_rgba(248,113,113,0.15)]',
      pulse: 'bg-red-400',
    },
  };

  const styles =
    volatilityStyles[engine.volatilityState];

  /*
   * BEGINNER-FRIENDLY STATE
   */
  const stateInfo = {
    LOW: {
      title: 'Market is calm',
      description:
        'Price movements are relatively small and overall market stress is low.',
    },

    NORMAL: {
      title: 'Market is moving normally',
      description:
        'Prices are moving at a healthy pace without unusual stress.',
    },

    ELEVATED: {
      title: 'Market is becoming more volatile',
      description:
        'Price swings are getting larger, so short-term risk is increasing.',
    },

    EXTREME: {
      title: 'Market is highly volatile',
      description:
        'Large price swings are creating unusually high short-term risk.',
    },
  };

  const currentState =
    stateInfo[engine.volatilityState];

  /*
   * AI INTERPRETATION
   */
  const interpretation =
    engine.volatilityState === 'EXTREME'
      ? 'The market is experiencing unusually large price swings. Risk is high, so sudden moves in either direction are more likely.'
      : engine.volatilityState === 'ELEVATED'
      ? 'The market is becoming more active and price swings are increasing. Conditions are less stable than normal.'
      : engine.volatilityState === 'NORMAL'
      ? 'Market activity is within a normal range. Price movement is active but not showing unusual stress.'
      : 'The market is relatively quiet. Smaller price swings suggest lower short-term stress, although breakouts can still happen.';

  /*
   * VOLATILITY LEADERS
   *
   * These are the assets currently making
   * the largest percentage moves.
   */
  const volatilityLeaders = [...coins]
    .sort(
      (a, b) =>
        Math.abs(b.change24h) -
        Math.abs(a.change24h)
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
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-300">
            VOLATILITY RADAR
          </div>

          <div
            className={`mt-1 text-sm font-semibold ${styles.text}`}
          >
            {engine.volatilityState}
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5">
          <div
            className={`h-1.5 w-1.5 animate-pulse rounded-full ${styles.pulse}`}
          />

          <span className="text-[10px] uppercase tracking-wide text-white/50">
            LIVE
          </span>
        </div>
      </div>

      {/* MAIN EXPLANATION */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
        <div
          className={`text-base font-semibold ${styles.text}`}
        >
          {currentState.title}
        </div>

        <p className="mt-1 text-xs leading-relaxed text-white/60">
          {currentState.description}
        </p>
      </div>

      {/* SIMPLE MARKET STATS */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {/* VOLATILITY */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
          <div className="text-[10px] uppercase tracking-wide text-white/40">
            Price Movement
          </div>

          <div className="mt-1 text-sm font-semibold text-white">
            {engine.volatility}%
          </div>

          <div className="mt-1 text-[10px] text-white/40">
            Average market move
          </div>
        </div>

        {/* PARTICIPATION */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
          <div className="text-[10px] uppercase tracking-wide text-white/40">
            Market Activity
          </div>

          <div className="mt-1 text-sm font-semibold text-white">
            {engine.participation}%
          </div>

          <div className="mt-1 text-[10px] text-white/40">
            Assets making large moves
          </div>
        </div>

        {/* STABILITY */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
          <div className="text-[10px] uppercase tracking-wide text-white/40">
            Stability
          </div>

          <div
            className={`
              mt-1 text-sm font-semibold
              ${
                engine.stability === 'STABLE'
                  ? 'text-emerald-300'
                  : engine.stability === 'FRAGILE'
                  ? 'text-yellow-300'
                  : 'text-red-300'
              }
            `}
          >
            {engine.stability}
          </div>

          <div className="mt-1 text-[10px] text-white/40">
            Overall market condition
          </div>
        </div>

        {/* RISK */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
          <div className="text-[10px] uppercase tracking-wide text-white/40">
            What It Means
          </div>

          <div
            className={`mt-1 text-sm font-semibold ${styles.text}`}
          >
            {engine.volatilityState === 'LOW'
              ? 'Lower Risk'
              : engine.volatilityState === 'NORMAL'
              ? 'Normal Risk'
              : engine.volatilityState === 'ELEVATED'
              ? 'Higher Risk'
              : 'Very High Risk'}
          </div>

          <div className="mt-1 text-[10px] text-white/40">
            Short-term price risk
          </div>
        </div>
      </div>

      {/* AI INTERPRETATION */}
      <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.02] p-3">
        <div className="text-[11px] uppercase tracking-wide text-white/40">
          AI Interpretation
        </div>

        <p className="mt-1 text-xs leading-relaxed text-white/60">
          {interpretation}
        </p>
      </div>

      {/* VOLATILITY LEADERS */}
      <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.02] p-3">
        <div className="mb-3">
          <div className="text-[11px] uppercase tracking-wide text-white/40">
            Biggest Movers
          </div>

          <div className="mt-1 text-xs text-white/50">
            Assets currently showing the largest price moves
          </div>
        </div>

        <div className="space-y-2">
          {volatilityLeaders.map((coin, idx) => (
            <div
              key={coin.symbol}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[10px] font-bold text-white/60">
                  #{idx + 1}
                </div>

                <div className="text-xs font-medium text-white">
                  {coin.symbol}
                </div>
              </div>

              <div
                className={`text-sm font-semibold ${
                  coin.change24h >= 0
                    ? 'text-emerald-300'
                    : 'text-red-300'
                }`}
              >
                {coin.change24h >= 0 ? '+' : ''}
                {coin.change24h.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}