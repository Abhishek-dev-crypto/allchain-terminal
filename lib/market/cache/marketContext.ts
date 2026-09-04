import type { Candle } from "../types";

export type MarketContext = {
  volatility: number;
  momentum: number;

  regime:
    | "TRENDING"
    | "RANGING"
    | "BREAKOUT";

  symbol: string;
  timeframe?: string;
};

/* =========================================================
   HELPERS
========================================================= */

function avg(values: number[]): number {
  if (!values.length) return 0;

  return (
    values.reduce((sum, value) => sum + value, 0) /
    values.length
  );
}

function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.max(min, Math.min(max, value));
}

/* =========================================================
   MARKET CONTEXT
========================================================= */

export function buildMarketContextFromCandles(
  candles: Candle[][],
  symbol: string,
  timeframe?: string
): MarketContext {
  const flat = candles
    .flat()
    .filter(
      (c) =>
        c &&
        Number.isFinite(c.open) &&
        Number.isFinite(c.high) &&
        Number.isFinite(c.low) &&
        Number.isFinite(c.close) &&
        c.open > 0
    );

  /* -------------------------------------------------------
     EMPTY DATA
  ------------------------------------------------------- */

  if (!flat.length) {
    return {
      volatility: 0,
      momentum: 0,
      regime: "RANGING",
      symbol,
      timeframe,
    };
  }

  /* -------------------------------------------------------
     MOMENTUM
     
     Percentage change from open → close.

     This makes BTC, ETH and smaller assets comparable.
  ------------------------------------------------------- */

  const percentageChanges = flat.map((c) => {
    return ((c.close - c.open) / c.open) * 100;
  });

  const momentum = avg(percentageChanges);

  /* -------------------------------------------------------
     VOLATILITY

     Candle range expressed as percentage of price.
  ------------------------------------------------------- */

  const percentageRanges = flat.map((c) => {
    return ((c.high - c.low) / c.open) * 100;
  });

  const volatility = avg(percentageRanges);

  /* -------------------------------------------------------
     REGIME

     Keep thresholds aligned with adaptive TTL.
  ------------------------------------------------------- */

  let regime: MarketContext["regime"];

  if (volatility >= 6) {
    regime = "BREAKOUT";
  } else if (volatility >= 3) {
    regime = "TRENDING";
  } else {
    regime = "RANGING";
  }

  return {
    volatility: Number(
      clamp(volatility, 0, 100).toFixed(2)
    ),

    momentum: Number(
      clamp(momentum, -100, 100).toFixed(2)
    ),

    regime,

    symbol,
    timeframe,
  };
}