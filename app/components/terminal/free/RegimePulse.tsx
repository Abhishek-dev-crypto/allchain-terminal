"use client";

import { motion } from "framer-motion";

import { useMarket } from "@/lib/providers/MarketProvider";

export default function RegimePulse() {
  const { engine } = useMarket();

  const regime = engine?.regime ?? "CHOPPY";
  const confidence = engine?.regimeConfidence ?? 0;
  const volatility = engine?.volatility ?? 0;
  const volatilityState = engine?.volatilityState ?? "LOW";
  const breadthState = engine?.breadthState ?? "NARROW";
  const positiveBreadth = engine?.positiveBreadth ?? 0;
  const stability = engine?.stability ?? "FRAGILE";
  const momentum = engine?.momentum ?? "NEUTRAL";
  const participation = engine?.participation ?? 0;

  const btcDominance = engine?.btcDominance ?? 0;
  const ethDominance = engine?.ethDominance ?? 0;
  const altStrength = engine?.altStrength ?? 0;

  /**
   * MARKET REGIME
   *
   * Convert internal engine terminology
   * into beginner-friendly language.
   */
  const regimeInfo = {
    RISK_ON: {
      label: "Bullish Conditions",
      description:
        "Buyers are in control and strength is spreading across the market.",
      text: "text-emerald-300",
      border: "border-emerald-400/20",
      glow:
        "shadow-[0_0_30px_rgba(52,211,153,0.15)]",
      badge:
        "bg-emerald-400/10 text-emerald-300",
      icon: "↑",
    },

    RISK_OFF: {
      label: "Defensive Conditions",
      description:
        "Selling pressure is elevated and investors are becoming more cautious.",
      text: "text-red-300",
      border: "border-red-400/20",
      glow:
        "shadow-[0_0_30px_rgba(248,113,113,0.15)]",
      badge:
        "bg-red-400/10 text-red-300",
      icon: "↓",
    },

    ROTATION: {
      label: "Money Is Rotating",
      description:
        "Money is moving between sectors instead of lifting the entire market.",
      text: "text-yellow-300",
      border: "border-yellow-300/20",
      glow:
        "shadow-[0_0_30px_rgba(253,224,71,0.12)]",
      badge:
        "bg-yellow-300/10 text-yellow-300",
      icon: "↔",
    },

    CHOPPY: {
      label: "Mixed Conditions",
      description:
        "The market lacks a clear direction and conditions remain uncertain.",
      text: "text-cyan-300",
      border: "border-cyan-300/20",
      glow:
        "shadow-[0_0_30px_rgba(34,211,238,0.12)]",
      badge:
        "bg-cyan-300/10 text-cyan-300",
      icon: "→",
    },
  }[regime];

  /**
   * VOLATILITY
   */
  const volatilityInfo =
    volatilityState === "LOW"
      ? {
          label: "Low",
          description: "Price moves are relatively calm.",
          color: "text-emerald-300",
        }
      : volatilityState === "NORMAL"
      ? {
          label: "Normal",
          description: "Price movement is within a typical range.",
          color: "text-cyan-300",
        }
      : volatilityState === "ELEVATED"
      ? {
          label: "Elevated",
          description: "Price swings are becoming larger.",
          color: "text-yellow-300",
        }
      : {
          label: "Very High",
          description: "Large price swings mean higher risk.",
          color: "text-red-300",
        };

  /**
   * BREADTH
   */
  const breadthInfo =
    positiveBreadth >= 70
      ? {
          label: "Broad",
          description:
            "Most tracked assets are moving higher.",
          color: "text-emerald-300",
        }
      : positiveBreadth >= 50
      ? {
          label: "Moderate",
          description:
            "More assets are rising than falling.",
          color: "text-cyan-300",
        }
      : {
          label: "Narrow",
          description:
            "Only a smaller group of assets is driving gains.",
          color: "text-yellow-300",
        };

  /**
   * MOMENTUM
   */
  const momentumInfo =
    momentum === "ACCELERATING"
      ? {
          label: "Building",
          description:
            "Market momentum is getting stronger.",
          color: "text-emerald-300",
        }
      : momentum === "DECELERATING"
      ? {
          label: "Weakening",
          description:
            "Market momentum is losing strength.",
          color: "text-red-300",
        }
      : {
          label: "Neutral",
          description:
            "Momentum is not showing a strong change.",
          color: "text-white/80",
        };

  /**
   * STABILITY
   */
  const stabilityInfo =
    stability === "STABLE"
      ? {
          label: "Stable",
          description:
            "Market structure is relatively healthy.",
          color: "text-emerald-300",
        }
      : stability === "FRAGILE"
      ? {
          label: "Fragile",
          description:
            "Conditions could change quickly.",
          color: "text-yellow-300",
        }
      : {
          label: "Unstable",
          description:
            "Market conditions are changing rapidly.",
          color: "text-red-300",
        };

  /**
   * OVERALL AI INTERPRETATION
   */
  const interpretation =
    regime === "RISK_ON"
      ? volatilityState === "LOW" || volatilityState === "NORMAL"
        ? "The market is showing broad strength with buyers active across multiple assets. Momentum is supportive and volatility remains manageable."
        : "The market is bullish, but elevated volatility means the current move carries more risk."
      : regime === "RISK_OFF"
      ? "The market is under defensive pressure. Selling is broadening, so weaker assets may remain vulnerable until conditions stabilize."
      : regime === "ROTATION"
      ? "The market is not moving as one group. Money is shifting between sectors, creating opportunities in stronger areas while weaker themes lose attention."
      : "The market currently lacks a strong directional signal. Conditions are mixed, so confirmation from breadth and momentum may be more useful than chasing individual moves.";

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
      transition={{
        duration: 0.3,
      }}
      className={`
        rounded-3xl
        border
        bg-white/[0.02]
        p-3
        ${regimeInfo.border}
        ${regimeInfo.glow}
      `}
    >
      {/* HEADER */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-cyan-300">
            MARKET REGIME
          </div>

          <div
            className={`mt-1 flex items-center gap-2 text-sm font-semibold ${regimeInfo.text}`}
          >
            <span>{regimeInfo.icon}</span>
            <span>{regimeInfo.label}</span>
          </div>

          <p className="mt-1 max-w-xl text-xs leading-relaxed text-white/50">
            {regimeInfo.description}
          </p>
        </div>

        {/* CONFIDENCE */}
        <div
          className={`
            rounded-xl
            px-3
            py-2
            text-center
            ${regimeInfo.badge}
          `}
        >
          <div className="text-[9px] uppercase tracking-wide">
            Confidence
          </div>

          <div className="mt-0.5 text-sm font-semibold">
            {confidence.toFixed(0)}%
          </div>
        </div>
      </div>

      {/* MARKET CONDITIONS */}
      <div>
        <div className="mb-2 text-[10px] uppercase tracking-wide text-white/40">
          Market Conditions
        </div>

        <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
          {/* VOLATILITY */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <div className="text-[10px] uppercase tracking-wide text-white/40">
              Risk
            </div>

            <div
              className={`mt-1 text-sm font-semibold ${volatilityInfo.color}`}
            >
              {volatilityInfo.label}
            </div>

            <div className="mt-1 text-[10px] text-white/40">
              {volatility.toFixed(2)}% typical move
            </div>
          </div>

          {/* BREADTH */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <div className="text-[10px] uppercase tracking-wide text-white/40">
              Participation
            </div>

            <div
              className={`mt-1 text-sm font-semibold ${breadthInfo.color}`}
            >
              {breadthInfo.label}
            </div>

            <div className="mt-1 text-[10px] text-white/40">
              {positiveBreadth.toFixed(0)}% assets rising
            </div>
          </div>

          {/* MOMENTUM */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <div className="text-[10px] uppercase tracking-wide text-white/40">
              Momentum
            </div>

            <div
              className={`mt-1 text-sm font-semibold ${momentumInfo.color}`}
            >
              {momentumInfo.label}
            </div>

            <div className="mt-1 text-[10px] text-white/40">
              {participation.toFixed(0)}% showing meaningful movement
            </div>
          </div>

          {/* STABILITY */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <div className="text-[10px] uppercase tracking-wide text-white/40">
              Stability
            </div>

            <div
              className={`mt-1 text-sm font-semibold ${stabilityInfo.color}`}
            >
              {stabilityInfo.label}
            </div>

            <div className="mt-1 text-[10px] text-white/40">
              {stabilityInfo.description}
            </div>
          </div>
        </div>
      </div>

      {/* MARKET STRUCTURE */}
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-3">
        <div className="mb-3">
          <div className="text-[10px] uppercase tracking-wide text-white/40">
            Market Structure
          </div>

          <div className="mt-1 text-xs text-white/50">
            How the market's value is distributed
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* BTC */}
          <div>
            <div className="text-[10px] text-white/40">
              Bitcoin
            </div>

            <div className="mt-1 text-lg font-bold text-orange-300">
              {btcDominance.toFixed(1)}%
            </div>

            <div className="mt-1 text-[9px] text-white/30">
              Market share
            </div>
          </div>

          {/* ETH */}
          <div>
            <div className="text-[10px] text-white/40">
              Ethereum
            </div>

            <div className="mt-1 text-lg font-bold text-cyan-300">
              {ethDominance.toFixed(1)}%
            </div>

            <div className="mt-1 text-[9px] text-white/30">
              Market share
            </div>
          </div>

          {/* ALT */}
          <div>
            <div className="text-[10px] text-white/40">
              Other Crypto
            </div>

            <div className="mt-1 text-lg font-bold text-yellow-300">
              {altStrength.toFixed(1)}%
            </div>

            <div className="mt-1 text-[9px] text-white/30">
              Market share
            </div>
          </div>
        </div>
      </div>

      {/* AI INTERPRETATION */}
      <div className="mt-4 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-3">
        <div className="text-[10px] uppercase tracking-wide text-cyan-300">
          AI Interpretation
        </div>

        <p className="mt-2 text-xs leading-relaxed text-white/65">
          {interpretation}
        </p>
      </div>
    </motion.section>
  );
}