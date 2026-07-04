import type { Coin } from "@/lib/types/coin";
import {
  buildMarketEngine,
} from "@/lib/intel/marketEngine";

export type WhaleBias =
  | "ACCUMULATION"
  | "DISTRIBUTION"
  | "NEUTRAL";

export type WhaleActivity =
  | "AGGRESSIVE"
  | "ACTIVE"
  | "QUIET";

export type WhaleLeader = {
  symbol: string;

  pressure:
    | "BUYING"
    | "SELLING";

  intensity: number;

  change24h: number;

  marketCap: number;
};

export type WhaleInsights = {
  bias: WhaleBias;

  activity: WhaleActivity;

  confidence: number;

  pressureZone: string;

  interpretation: string;

  leaders: WhaleLeader[];
};

export function buildWhaleInsights(
  coins: Coin[]
): WhaleInsights {

  /**
   * 🛡 SAFE FALLBACK
   */
  if (!coins.length) {
    return {
      bias: "NEUTRAL",

      activity: "QUIET",

      confidence: 0,

      pressureZone:
        "No dominant whale activity",

      interpretation:
        "Waiting for sufficient market activity.",

      leaders: [],
    };
  }

  /**
   * 🧠 MARKET ENGINE
   */
  const engine =
    buildMarketEngine(coins);

  /**
   * 📊 LARGE CAP WEIGHT
   */
  const sortedByCap =
    [...coins].sort(
      (a, b) =>
        (b.marketCap ?? 0) -
      (a.marketCap ?? 0)
    );

  const topCaps =
    sortedByCap.slice(0, 5);

  /**
   * 📈 FLOW STRENGTH
   */
  const avgTopFlow =
    topCaps.reduce(
      (s, c) => s + c.change24h,
      0
    ) / (topCaps.length || 1);

  /**
   * 🧠 BIAS DETECTION
   */
  let bias: WhaleBias =
    "NEUTRAL";

  if (
    avgTopFlow > 1.5 &&
    engine.positiveBreadth > 55
  ) {
    bias = "ACCUMULATION";
  }
  else if (
    avgTopFlow < -1.5 &&
    engine.negativeBreadth > 55
  ) {
    bias = "DISTRIBUTION";
  }

  /**
   * ⚡ ACTIVITY STATE
   */
  let activity: WhaleActivity =
    "QUIET";

  if (
    engine.volatility > 7 ||
    engine.participation > 70
  ) {
    activity = "AGGRESSIVE";
  }
  else if (
    engine.volatility > 4 ||
    engine.participation > 40
  ) {
    activity = "ACTIVE";
  }

  /**
   * 🎯 CONFIDENCE
   */
  const confidence =
    Math.min(
      100,
      Math.abs(avgTopFlow) * 18 +
        engine.participation * 0.5 +
        engine.volatility * 4
    );

  /**
   * 🧠 PRESSURE ZONE
   */
  const strongest =
    [...coins].sort(
      (a, b) =>
        Math.abs(
          b.change24h
        ) -
        Math.abs(a.change24h)
    )[0];

  const pressureZone =
    strongest
      ? strongest.change24h >= 0
        ? `${strongest.symbol} accumulation`
        : `${strongest.symbol} distribution`
      : "Neutral flow";

  /**
   * 🧠 INTERPRETATION
   */
  let interpretation =
    "Whale positioning remains neutral across major crypto sectors.";

  if (
    bias === "ACCUMULATION"
  ) {
    interpretation =
      "Large-cap wallets are increasing exposure as participation and momentum continue expanding across the market.";
  }

  if (
    bias === "DISTRIBUTION"
  ) {
    interpretation =
      "Large-cap wallets continue reducing exposure while defensive positioning dominates overall market structure.";
  }

  if (
    activity === "AGGRESSIVE" &&
    bias === "DISTRIBUTION"
  ) {
    interpretation =
      "Aggressive institutional-scale distribution pressure is spreading across high-beta crypto sectors.";
  }

  /**
   * 🐋 WHALE LEADERS
   */
  const leaders: WhaleLeader[] =
    sortedByCap
      .slice(0, 5)
      .map((coin) => ({
        symbol: coin.symbol,

        pressure:
          coin.change24h >= 0
            ? "BUYING"
            : "SELLING",

        intensity: Number(
          Math.min(
            100,
            Math.abs(
              coin.change24h
            ) * 12
          ).toFixed(0)
        ),

        change24h:
          coin.change24h,

         marketCap: coin.marketCap ?? 0,
      }));

  return {
    bias,

    activity,

    confidence: Number(
      confidence.toFixed(1)
    ),

    pressureZone,

    interpretation,

    leaders,
  };
}