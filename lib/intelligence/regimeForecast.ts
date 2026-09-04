// lib/intelligence/regimeForecast.ts

import type { Candle } from "@/lib/market/types";
import {
  detectRegime,
  type MarketRegime,
} from "./detectRegime";

/* =========================================================
   TYPES
========================================================= */

export type ForecastRegime =
  | "BULLISH"
  | "BEARISH"
  | "NEUTRAL"
  | "TRANSITION";

export type RegimeForecastResult = {
  symbol: string;

  currentRegime: ForecastRegime;
  previousRegime?: ForecastRegime;

  forecastRegime: ForecastRegime;

  confidence: number;
  shiftProbability: number;

  horizon: "7D";

  momentum: number;
  volatility: number;
  liquidity: number;
  marketStructure: number;
  trendStability: number;

  transitionDirection:
    | "BULLISH"
    | "BEARISH"
    | "UNCERTAIN";

  factors: {
    momentum: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
    volatility: "EXPANDING" | "CONTRACTING" | "STABLE";
    liquidity: "RISING" | "FALLING" | "STABLE";
    structure: "BULLISH" | "BEARISH" | "RANGE";
    stability: "STABLE" | "UNSTABLE" | "TRANSITIONING";
  };

  updatedAt: string;
};

/* =========================================================
   HELPERS
========================================================= */

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, decimals = 0) {
  const multiplier = Math.pow(10, decimals);

  return Math.round(value * multiplier) / multiplier;
}

function average(values: number[]) {
  if (!values.length) return 0;

  return (
    values.reduce((sum, value) => sum + value, 0) /
    values.length
  );
}

function percentageChange(
  current: number,
  previous: number
) {
  if (!previous) return 0;

  return ((current - previous) / previous) * 100;
}

/* =========================================================
   EMA
========================================================= */

function ema(values: number[], period: number) {
  if (!values.length) return 0;

  const actualPeriod = Math.min(period, values.length);

  const seedValues = values.slice(0, actualPeriod);

  let value = average(seedValues);

  const k = 2 / (actualPeriod + 1);

  for (
    let i = actualPeriod;
    i < values.length;
    i++
  ) {
    value =
      values[i] * k +
      value * (1 - k);
  }

  return value;
}

/* =========================================================
   MOMENTUM
========================================================= */

function calculateMomentum(candles: Candle[]) {
  if (candles.length < 20) return 50;

  const closes = candles.map((c) => c.close);

  const latest = closes.at(-1)!;

  const shortReference =
    closes.at(-6) ?? latest;

  const mediumReference =
    closes.at(-21) ?? latest;

  const shortReturn = percentageChange(
    latest,
    shortReference
  );

  const mediumReturn = percentageChange(
    latest,
    mediumReference
  );

  /*
    Momentum is intentionally normalized rather than
    directly using raw percentage returns.

    Short-term movement = 60%
    Medium-term movement = 40%
  */

  const rawMomentum =
    50 +
    shortReturn * 8 +
    mediumReturn * 4;

  return clamp(rawMomentum);
}

/* =========================================================
   VOLATILITY
========================================================= */

function calculateVolatility(
  candles: Candle[]
) {
  if (candles.length < 20) return 50;

  const returns: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const previous =
      candles[i - 1].close;

    const current =
      candles[i].close;

    if (!previous) continue;

    returns.push(
      (current - previous) / previous
    );
  }

  const recent = returns.slice(-20);

  if (!recent.length) return 50;

  const mean = average(recent);

  const variance = average(
    recent.map(
      (value) =>
        Math.pow(value - mean, 2)
    )
  );

  const standardDeviation =
    Math.sqrt(variance);

  /*
    This is a relative volatility score.

    Higher score = more unstable market conditions.
  */

  return clamp(
    standardDeviation * 10000
  );
}

/* =========================================================
   LIQUIDITY
========================================================= */

function calculateLiquidity(
  candles: Candle[]
) {
  if (candles.length < 20) return 50;

  const volumes = candles.map(
    (c) => c.volume
  );

  const recent = average(
    volumes.slice(-5)
  );

  const baseline = average(
    volumes.slice(-20)
  );

  if (!baseline) return 50;

  const ratio =
    recent / baseline;

  /*
    1.0 = normal
    >1 = rising participation
    <1 = declining participation
  */

  const score =
    50 + (ratio - 1) * 100;

  return clamp(score);
}

/* =========================================================
   MARKET STRUCTURE
========================================================= */

function calculateMarketStructure(
  candles: Candle[]
) {
  if (candles.length < 12) {
    return {
      score: 50,
      state: "RANGE" as const,
    };
  }

  const recent = candles.slice(-12);

  const firstHalf =
    recent.slice(0, 6);

  const secondHalf =
    recent.slice(6);

  const firstHigh = Math.max(
    ...firstHalf.map((c) => c.high)
  );

  const secondHigh = Math.max(
    ...secondHalf.map((c) => c.high)
  );

  const firstLow = Math.min(
    ...firstHalf.map((c) => c.low)
  );

  const secondLow = Math.min(
    ...secondHalf.map((c) => c.low)
  );

  const higherHigh =
    secondHigh > firstHigh;

  const higherLow =
    secondLow > firstLow;

  const lowerHigh =
    secondHigh < firstHigh;

  const lowerLow =
    secondLow < firstLow;

  if (higherHigh && higherLow) {
    return {
      score: 85,
      state: "BULLISH" as const,
    };
  }

  if (lowerHigh && lowerLow) {
    return {
      score: 15,
      state: "BEARISH" as const,
    };
  }

  return {
    score: 50,
    state: "RANGE" as const,
  };
}

/* =========================================================
   TREND STABILITY
========================================================= */

function calculateTrendStability(
  candles: Candle[]
) {
  if (candles.length < 30) return 50;

  const closes = candles.map(
    (c) => c.close
  );

  const ema20 =
    ema(closes.slice(-60), 20);

  const ema50 =
    ema(closes.slice(-60), 50);

  const latest =
    closes.at(-1)!;

  const distance =
    latest !== 0
      ? Math.abs(
          (ema20 - ema50) /
            latest
        ) * 100
      : 0;

  /*
    Strong separation between EMA20 and EMA50
    indicates a more established trend.
  */

  return clamp(
    50 + distance * 20
  );
}

/* =========================================================
   REGIME NORMALIZATION
========================================================= */

function normalizeRegime(
  regime: MarketRegime
): ForecastRegime {
  switch (regime) {
    case "BULL":
      return "BULLISH";

    case "BEAR":
      return "BEARISH";

    default:
      return "NEUTRAL";
  }
}

/* =========================================================
   REGIME SCORE
========================================================= */

function calculateDirectionalScore(
  momentum: number,
  structure: number,
  trendStability: number,
  volatility: number
) {
  /*
    Directional score:

    Momentum       35%
    Structure      30%
    Stability      20%
    Volatility     15%

    Volatility is inverted because excessive volatility
    reduces confidence in directional persistence.
  */

  const stabilityComponent =
    trendStability;

  const volatilityComponent =
    100 - volatility;

  return (
    momentum * 0.35 +
    structure * 0.30 +
    stabilityComponent * 0.20 +
    volatilityComponent * 0.15
  );
}

/* =========================================================
   FORECAST ENGINE
========================================================= */

export function forecastRegime({
  symbol,
  candles1h,
  candles4h,
  candles1d,
}: {
  symbol: string;
  candles1h: Candle[];
  candles4h: Candle[];
  candles1d: Candle[];
}): RegimeForecastResult {
  /*
    Current regime is primarily determined from the
    4h timeframe.

    This avoids allowing noisy 1h candles to dominate
    the market-state classification.
  */

  const currentDetection =
    detectRegime(candles4h);

  const currentRegime =
    normalizeRegime(
      currentDetection.regime
    );

  /*
    Previous regime is estimated from an earlier
    portion of the 4h observation window.
  */

  const previousWindow =
    candles4h.length > 70
      ? candles4h.slice(
          0,
          candles4h.length - 20
        )
      : candles4h.slice(
          0,
          Math.max(
            0,
            candles4h.length - 10
          )
        );

  const previousDetection =
    previousWindow.length >= 50
      ? detectRegime(previousWindow)
      : currentDetection;

  const previousRegime =
    normalizeRegime(
      previousDetection.regime
    );

  /*
    -------------------------------------------------------
    MULTI-TIMEFRAME FEATURES
    -------------------------------------------------------
  */

  const momentum1h =
    calculateMomentum(candles1h);

  const momentum4h =
    calculateMomentum(candles4h);

  const momentum1d =
    calculateMomentum(candles1d);

  const momentum = clamp(
    momentum1h * 0.30 +
      momentum4h * 0.45 +
      momentum1d * 0.25
  );

  const volatility1h =
    calculateVolatility(candles1h);

  const volatility4h =
    calculateVolatility(candles4h);

  const volatility =
    clamp(
      volatility1h * 0.30 +
        volatility4h * 0.70
    );

  const liquidity =
    calculateLiquidity(candles1h);

  const structure =
    calculateMarketStructure(
      candles4h
    );

  const trendStability =
    calculateTrendStability(
      candles4h
    );

  /*
    -------------------------------------------------------
    DIRECTIONAL FORECAST
    -------------------------------------------------------
  */

  const directionalScore =
    calculateDirectionalScore(
      momentum,
      structure.score,
      trendStability,
      volatility
    );

  let directionalForecast:
    | "BULLISH"
    | "BEARISH"
    | "UNCERTAIN";

  if (directionalScore >= 62) {
    directionalForecast = "BULLISH";
  } else if (directionalScore <= 38) {
    directionalForecast = "BEARISH";
  } else {
    directionalForecast = "UNCERTAIN";
  }

  /*
    -------------------------------------------------------
    SHIFT PROBABILITY
    -------------------------------------------------------
  */

  let shiftProbability = 0;

  /*
    Existing regime versus projected direction.
  */

  if (
    currentRegime === "BULLISH" &&
    directionalForecast === "BEARISH"
  ) {
    shiftProbability += 45;
  }

  if (
    currentRegime === "BEARISH" &&
    directionalForecast === "BULLISH"
  ) {
    shiftProbability += 45;
  }

  /*
    Transition conditions.
  */

  if (
    Math.abs(momentum - 50) < 10
  ) {
    shiftProbability += 10;
  }

  if (
    volatility >= 60
  ) {
    shiftProbability += 10;
  }

  if (
    trendStability < 50
  ) {
    shiftProbability += 15;
  }

  if (
    liquidity < 40
  ) {
    shiftProbability += 5;
  }

  /*
    Current regime changing relative to previous regime
    is itself evidence of transition.
  */

  if (
    previousRegime !== currentRegime
  ) {
    shiftProbability += 15;
  }

  shiftProbability =
    Math.round(
      clamp(
        shiftProbability,
        5,
        95
      )
    );

  /*
    -------------------------------------------------------
    FORECAST REGIME
    -------------------------------------------------------
  */

  let forecastRegime:
    ForecastRegime;

  if (
    shiftProbability >= 60
  ) {
    forecastRegime =
      "TRANSITION";
  } else if (
    directionalForecast === "BULLISH"
  ) {
    forecastRegime =
      "BULLISH";
  } else if (
    directionalForecast === "BEARISH"
  ) {
    forecastRegime =
      "BEARISH";
  } else {
    forecastRegime =
      "NEUTRAL";
  }

  /*
    -------------------------------------------------------
    CONFIDENCE
    -------------------------------------------------------
  */

  const directionalStrength =
    Math.abs(
      directionalScore - 50
    ) * 2;

  let confidence =
    45 +
    directionalStrength * 0.45 +
    trendStability * 0.20 +
    liquidity * 0.10;

  /*
    Excessive volatility reduces confidence.
  */

  if (volatility > 70) {
    confidence -= 10;
  }

  if (volatility > 85) {
    confidence -= 10;
  }

  confidence =
    Math.round(
      clamp(
        confidence,
        40,
        95
      )
    );

  /*
    -------------------------------------------------------
    FACTOR STATES
    -------------------------------------------------------
  */

  let momentumState:
    | "POSITIVE"
    | "NEGATIVE"
    | "NEUTRAL";

  if (momentum >= 60) {
    momentumState = "POSITIVE";
  } else if (momentum <= 40) {
    momentumState = "NEGATIVE";
  } else {
    momentumState = "NEUTRAL";
  }

  let volatilityState:
    | "EXPANDING"
    | "CONTRACTING"
    | "STABLE";

  if (volatility >= 65) {
    volatilityState = "EXPANDING";
  } else if (volatility <= 35) {
    volatilityState = "CONTRACTING";
  } else {
    volatilityState = "STABLE";
  }

  let liquidityState:
    | "RISING"
    | "FALLING"
    | "STABLE";

  if (liquidity >= 60) {
    liquidityState = "RISING";
  } else if (liquidity <= 40) {
    liquidityState = "FALLING";
  } else {
    liquidityState = "STABLE";
  }

  let stabilityState:
    | "STABLE"
    | "UNSTABLE"
    | "TRANSITIONING";

  if (trendStability >= 65) {
    stabilityState = "STABLE";
  } else if (trendStability <= 40) {
    stabilityState = "UNSTABLE";
  } else {
    stabilityState = "TRANSITIONING";
  }

  return {
    symbol,

    currentRegime,

    previousRegime,

    forecastRegime,

    confidence,

    shiftProbability,

    horizon: "7D",

    momentum: round(momentum),

    volatility: round(volatility),

    liquidity: round(liquidity),

    marketStructure:
      round(structure.score),

    trendStability:
      round(trendStability),

    transitionDirection:
      directionalForecast,

    factors: {
      momentum: momentumState,
      volatility: volatilityState,
      liquidity: liquidityState,
      structure: structure.state,
      stability: stabilityState,
    },

    updatedAt:
      new Date().toISOString(),
  };
}