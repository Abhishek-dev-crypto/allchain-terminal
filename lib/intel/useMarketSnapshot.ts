"use client";

import { useMemo } from "react";
import type { Coin } from "@/lib/types/coin";

export type MarketSnapshot = {
  coins: Coin[];

  breadth: {
    greenPercent: number;
    redPercent: number;
    neutralPercent: number;
  };

  momentum: {
    average: number;
    strength: number;
    direction: "ACCELERATING" | "DECELERATING" | "NEUTRAL";
    leaders: Coin[];
    laggards: Coin[];
  };

  volatility: {
    average: number;
    level: "LOW" | "MEDIUM" | "HIGH";
  };

  flow: {
    state: "ACCUMULATION" | "DISTRIBUTION" | "NEUTRAL";
    score: number;
  };

  dominance: {
    btc: number;
    eth: number;
    altStrength: number;
  };

  marketState: {
    mood: "RISK_ON" | "RISK_OFF" | "BALANCED";
    conviction: "LOW" | "MEDIUM" | "HIGH";
  };
};

/* ================= HELPERS ================= */

function avg(arr: number[]) {
  return arr.length
    ? arr.reduce((a, b) => a + b, 0) / arr.length
    : 0;
}

function clamp(n: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, n));
}

function getMomentumDirection(
  value: number
): "ACCELERATING" | "DECELERATING" | "NEUTRAL" {
  if (value > 4) return "ACCELERATING";
  if (value < -2) return "DECELERATING";
  return "NEUTRAL";
}

function isBTC(symbol: string) {
  return symbol?.toUpperCase().includes("BTC");
}

function isETH(symbol: string) {
  return symbol?.toUpperCase().includes("ETH");
}

/* ================= ENGINE ================= */

export function useMarketSnapshot(coins: Coin[]): MarketSnapshot {
  return useMemo(() => {
    if (!coins?.length) {
      return {
        coins: [],
        breadth: { greenPercent: 0, redPercent: 0, neutralPercent: 0 },
        momentum: {
          average: 0,
          strength: 0,
          direction: "NEUTRAL",
          leaders: [],
          laggards: [],
        },
        volatility: { average: 0, level: "LOW" },
        flow: { state: "NEUTRAL", score: 0 },
        dominance: { btc: 0, eth: 0, altStrength: 0 },
        marketState: { mood: "BALANCED", conviction: "LOW" },
      };
    }

    const sorted = [...coins].sort(
      (a, b) => b.change24h - a.change24h
    );

    const green = coins.filter((c) => c.change24h > 0);
    const red = coins.filter((c) => c.change24h < 0);
    const neutral = coins.filter((c) => c.change24h === 0);

    const greenPercent = (green.length / coins.length) * 100;
    const redPercent = (red.length / coins.length) * 100;
    const neutralPercent = clamp(
      100 - greenPercent - redPercent
    );

    const averageMomentum = avg(coins.map((c) => c.change24h));

    const leaders = sorted.slice(0, 5);
    const laggards = sorted.slice(-5).reverse();

    const momentumStrength = avg(
      leaders.map((c) => Math.abs(c.change24h))
    );

    const direction = getMomentumDirection(averageMomentum);

    /* ================= VOLATILITY (FIXED LOGIC) ================= */
    const volatilityAvg = avg(
      coins.map((c) => {
        const range =
          (c.high24h ?? 0) - (c.low24h ?? 0);
        return Math.abs(range);
      })
    );

    const volatilityLevel =
      volatilityAvg > 6
        ? "HIGH"
        : volatilityAvg > 3
        ? "MEDIUM"
        : "LOW";

    /* ================= FLOW ================= */

    const flowState: MarketSnapshot["flow"]["state"] =
      greenPercent > redPercent + 10
        ? "ACCUMULATION"
        : redPercent > greenPercent + 10
        ? "DISTRIBUTION"
        : "NEUTRAL";

    /* ================= DOMINANCE (FIXED) ================= */

    const totalCap =
      coins.reduce((s, c) => s + (c.marketCap || 0), 0) || 1;

    const btcCap =
      coins.find((c) => isBTC(c.symbol))?.marketCap || 0;

    const ethCap =
      coins.find((c) => isETH(c.symbol))?.marketCap || 0;

    const btcDominance = (btcCap / totalCap) * 100;
    const ethDominance = (ethCap / totalCap) * 100;

    const altStrength = clamp(
      100 - btcDominance - ethDominance
    );

    /* ================= MARKET STATE ================= */

    const marketMood =
      greenPercent > 65
        ? "RISK_ON"
        : redPercent > 65
        ? "RISK_OFF"
        : "BALANCED";

    const conviction =
      volatilityAvg > 6
        ? "HIGH"
        : volatilityAvg > 3
        ? "MEDIUM"
        : "LOW";

    return {
      coins: sorted,

      breadth: {
        greenPercent: clamp(greenPercent),
        redPercent: clamp(redPercent),
        neutralPercent,
      },

      momentum: {
        average: Number(averageMomentum.toFixed(2)),
        strength: Number(momentumStrength.toFixed(2)),
        direction,
        leaders,
        laggards,
      },

      volatility: {
        average: Number(volatilityAvg.toFixed(2)),
        level: volatilityLevel,
      },

      flow: {
        state: flowState,
        score: greenPercent,
      },

      dominance: {
        btc: btcDominance,
        eth: ethDominance,
        altStrength,
      },

      marketState: {
        mood: marketMood,
        conviction,
      },
    };
  }, [coins]);
}