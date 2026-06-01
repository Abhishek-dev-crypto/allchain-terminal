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

/**
 * 📊 helper
 */
function avg(arr: number[]) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * ⚡ momentum classification
 */
function getMomentumDirection(
  value: number
): "ACCELERATING" | "DECELERATING" | "NEUTRAL" {
  if (value > 4) return "ACCELERATING";
  if (value < -2) return "DECELERATING";
  return "NEUTRAL";
}

/**
 * 🧠 SNAPSHOT ENGINE
 */
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

    const sorted = [...coins].sort((a, b) => b.change24h - a.change24h);

    const green = coins.filter((c) => c.change24h > 0);
    const red = coins.filter((c) => c.change24h < 0);
    const neutral = coins.filter((c) => c.change24h === 0);

    const greenPercent = Math.round((green.length / coins.length) * 100);
    const redPercent = Math.round((red.length / coins.length) * 100);
    const neutralPercent = 100 - greenPercent - redPercent;

    const averageMomentum = avg(coins.map((c) => c.change24h));

    const leaders = sorted.slice(0, 5);
    const laggards = sorted.slice(-5);

    const momentumStrength = avg(
      leaders.map((c) => Math.abs(c.change24h))
    );

    const direction = getMomentumDirection(averageMomentum);

    const volatilityAvg = avg(coins.map((c) => Math.abs(c.change24h)));

    const volatilityLevel =
      volatilityAvg > 6 ? "HIGH" : volatilityAvg > 3 ? "MEDIUM" : "LOW";

    const accumulationScore = greenPercent;
    const distributionScore = redPercent;

    const flowState: MarketSnapshot["flow"]["state"] =
      accumulationScore > distributionScore + 10
        ? "ACCUMULATION"
        : distributionScore > accumulationScore + 10
        ? "DISTRIBUTION"
        : "NEUTRAL";

    const btc = coins.find((c) => c.symbol.toLowerCase() === "btc");
    const eth = coins.find((c) => c.symbol.toLowerCase() === "eth");

    const totalCap = coins.reduce((s, c) => s + c.marketCap, 0) || 1;

    const btcDominance = btc ? (btc.marketCap / totalCap) * 100 : 0;
    const ethDominance = eth ? (eth.marketCap / totalCap) * 100 : 0;

    const altStrength = 100 - btcDominance - ethDominance;

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
        greenPercent,
        redPercent,
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
        score: accumulationScore,
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