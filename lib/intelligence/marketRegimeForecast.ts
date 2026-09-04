import type { Candle } from "@/lib/market/types";
import {
  getMarketUniverse,
  type MarketUniverseAsset,
} from "@/lib/market/MarketUniverse";
import { marketEngine } from "@/lib/market/MarketEngine";

export type MarketForecastRegime =
  | "BULLISH"
  | "BEARISH"
  | "NEUTRAL"
  | "TRANSITION";

export type MarketRegimeForecastResult = {
  currentRegime: MarketForecastRegime;
  forecastRegime: MarketForecastRegime;

  confidence: number;
  transitionRisk: number;

  horizon: "7D";

  momentum: number;
  breadth: number;
  liquidity: number;
  marketStructure: number;
  volatility: number;
  trendStability: number;
  participation: number;

  factors: {
    momentum: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
    breadth: "BULLISH" | "BEARISH" | "MIXED";
    liquidity: "RISING" | "FALLING" | "STABLE";
    structure: "BULLISH" | "BEARISH" | "RANGE";
    volatility: "EXPANDING" | "CONTRACTING" | "STABLE";
    stability: "STABLE" | "UNSTABLE" | "TRANSITIONING";
  };

  assetsAnalyzed: number;
  updatedAt: string;
};

type AssetAnalysis = {
  asset: MarketUniverseAsset;

  candles1h: Candle[];
  candles4h: Candle[];
  candles1d: Candle[];

  momentum: number;
  structure: number;
  trendStability: number;

  volatilityLevel: number;
  volatilityChange: number;

  liquidity: number;

  directionScore: number;
  direction:
    | "BULLISH"
    | "BEARISH"
    | "NEUTRAL";
};

function clamp(
  value: number,
  min = 0,
  max = 100
) {
  return Math.max(min, Math.min(max, value));
}

function average(values: number[]) {
  if (!values.length) return 50;

  return (
    values.reduce(
      (sum, value) => sum + value,
      0
    ) / values.length
  );
}

/* -------------------------------------------------- */
/* RETURN */
/* -------------------------------------------------- */

function calculateReturn(
  candles: Candle[],
  periods: number
) {
  if (candles.length <= periods) return 0;

  const current =
    candles[candles.length - 1]?.close;

  const previous =
    candles[candles.length - 1 - periods]?.close;

  if (
    !Number.isFinite(current) ||
    !Number.isFinite(previous) ||
    previous <= 0
  ) {
    return 0;
  }

  return (
    ((current - previous) / previous) *
    100
  );
}

/* -------------------------------------------------- */
/* MOMENTUM */
/* -------------------------------------------------- */

function calculateMomentum(
  candles1h: Candle[],
  candles4h: Candle[],
  candles1d: Candle[]
) {
  const short1h = calculateReturn(
    candles1h,
    5
  );

  const medium1h = calculateReturn(
    candles1h,
    20
  );

  const short4h = calculateReturn(
    candles4h,
    5
  );

  const medium4h = calculateReturn(
    candles4h,
    20
  );

  const short1d = calculateReturn(
    candles1d,
    3
  );

  const medium1d = calculateReturn(
    candles1d,
    10
  );

  const score1h =
    50 +
    short1h * 8 +
    medium1h * 4;

  const score4h =
    50 +
    short4h * 8 +
    medium4h * 4;

  const score1d =
    50 +
    short1d * 8 +
    medium1d * 4;

  return clamp(
    score1h * 0.30 +
      score4h * 0.45 +
      score1d * 0.25
  );
}

/* -------------------------------------------------- */
/* REALIZED VOLATILITY */
/* -------------------------------------------------- */

function realizedVolatility(
  candles: Candle[],
  periods: number
) {
  if (candles.length < periods + 1) {
    return null;
  }

  const returns: number[] = [];

  const start =
    candles.length - periods;

  for (
    let i = start;
    i < candles.length;
    i++
  ) {
    const previous =
      candles[i - 1]?.close;

    const current =
      candles[i]?.close;

    if (
      !Number.isFinite(previous) ||
      !Number.isFinite(current) ||
      previous <= 0
    ) {
      continue;
    }

    returns.push(
      (current - previous) /
        previous
    );
  }

  if (!returns.length) return null;

  const mean = average(returns);

  const variance =
    returns.reduce(
      (sum, value) =>
        sum +
        Math.pow(
          value - mean,
          2
        ),
      0
    ) / returns.length;

  return Math.sqrt(variance);
}

/* -------------------------------------------------- */
/* VOLATILITY LEVEL + CHANGE */
/* -------------------------------------------------- */

function calculateVolatility(
  candles: Candle[]
) {
  if (candles.length < 40) {
    return {
      level: 50,
      change: 0,
    };
  }

  const recent =
    realizedVolatility(
      candles,
      20
    );

  const baseline =
    realizedVolatility(
      candles.slice(0, -20),
      20
    );

  if (
    recent === null ||
    baseline === null ||
    baseline <= 0
  ) {
    return {
      level: 50,
      change: 0,
    };
  }

  /*
   * Volatility level:
   *
   * This represents the current realized
   * volatility environment.
   */
  const level = clamp(
    recent * 10000
  );

  /*
   * Volatility change:
   *
   * Positive = volatility expanding
   * Negative = volatility contracting
   */
  const change =
    ((recent - baseline) /
      baseline) *
    100;

  return {
    level,
    change,
  };
}

/* -------------------------------------------------- */
/* LIQUIDITY */
/* -------------------------------------------------- */

function calculateLiquidity(
  candles: Candle[]
) {
  if (candles.length < 20) {
    return 50;
  }

  const recent =
    candles.slice(-5);

  const baseline =
    candles.slice(-20, -5);

  const recentVolume =
    average(
      recent.map(
        (c) => c.volume
      )
    );

  const baselineVolume =
    average(
      baseline.map(
        (c) => c.volume
      )
    );

  if (
    !Number.isFinite(
      recentVolume
    ) ||
    !Number.isFinite(
      baselineVolume
    ) ||
    baselineVolume <= 0
  ) {
    return 50;
  }

  const ratio =
    recentVolume /
    baselineVolume;

  return clamp(
    50 +
      (ratio - 1) * 100
  );
}

/* -------------------------------------------------- */
/* MARKET STRUCTURE */
/* -------------------------------------------------- */

function calculateStructure(
  candles: Candle[]
) {
  if (candles.length < 12) {
    return 50;
  }

  const recent =
    candles.slice(-12);

  const firstHalf =
    recent.slice(0, 6);

  const secondHalf =
    recent.slice(6);

  const firstHigh =
    Math.max(
      ...firstHalf.map(
        (c) => c.high
      )
    );

  const secondHigh =
    Math.max(
      ...secondHalf.map(
        (c) => c.high
      )
    );

  const firstLow =
    Math.min(
      ...firstHalf.map(
        (c) => c.low
      )
    );

  const secondLow =
    Math.min(
      ...secondHalf.map(
        (c) => c.low
      )
    );

  if (
    secondHigh > firstHigh &&
    secondLow > firstLow
  ) {
    return 85;
  }

  if (
    secondHigh < firstHigh &&
    secondLow < firstLow
  ) {
    return 15;
  }

  return 50;
}

/* -------------------------------------------------- */
/* TREND STABILITY */
/* -------------------------------------------------- */

function calculateTrendStability(
  candles: Candle[]
) {
  if (candles.length < 50) {
    return 50;
  }

  const closes =
    candles
      .slice(-50)
      .map(
        (c) => c.close
      )
      .filter(
        (value) =>
          Number.isFinite(value)
      );

  if (closes.length < 50) {
    return 50;
  }

  function ema(period: number) {
    const multiplier =
      2 / (period + 1);

    let value =
      closes[0];

    for (
      let i = 1;
      i < closes.length;
      i++
    ) {
      value =
        (closes[i] - value) *
          multiplier +
        value;
    }

    return value;
  }

  const ema20 =
    ema(20);

  const ema50 =
    ema(50);

  const price =
    closes[closes.length - 1];

  if (price <= 0) {
    return 50;
  }

  const distance =
    Math.abs(
      ema20 - ema50
    ) / price;

  return clamp(
    50 +
      distance * 2000
  );
}

/* -------------------------------------------------- */
/* ASSET DIRECTION */
/* -------------------------------------------------- */

function calculateDirection(
  momentum: number,
  structure: number,
  trendStability: number
) {
  const score = clamp(
    momentum * 0.45 +
      structure * 0.35 +
      trendStability * 0.20
  );

  if (score >= 60) {
    return {
      score,
      direction: "BULLISH" as const,
    };
  }

  if (score <= 40) {
    return {
      score,
      direction: "BEARISH" as const,
    };
  }

  return {
    score,
    direction: "NEUTRAL" as const,
  };
}

/* -------------------------------------------------- */
/* ASSET ANALYSIS */
/* -------------------------------------------------- */

async function analyzeAsset(
  asset: MarketUniverseAsset
): Promise<AssetAnalysis | null> {
  try {
    const [
      candles1h,
      candles4h,
      candles1d,
    ] = await Promise.all([
      marketEngine.getCandles(
        asset.symbol,
        "1h"
      ),

      marketEngine.getCandles(
        asset.symbol,
        "4h"
      ),

      marketEngine.getCandles(
        asset.symbol,
        "1d"
      ),
    ]);

    if (
      candles1h.length < 25 ||
      candles4h.length < 50 ||
      candles1d.length < 20
    ) {
      return null;
    }

    const momentum =
      calculateMomentum(
        candles1h,
        candles4h,
        candles1d
      );

    const structure =
      calculateStructure(
        candles4h
      );

    const trendStability =
      calculateTrendStability(
        candles4h
      );

    const volatility =
      calculateVolatility(
        candles4h
      );

    const liquidity =
      calculateLiquidity(
        candles1h
      );

    const direction =
      calculateDirection(
        momentum,
        structure,
        trendStability
      );

    return {
      asset,

      candles1h,
      candles4h,
      candles1d,

      momentum,
      structure,
      trendStability,

      volatilityLevel:
        volatility.level,

      volatilityChange:
        volatility.change,

      liquidity,

      directionScore:
        direction.score,

      direction:
        direction.direction,
    };
  } catch (error) {
    console.error(
      `Market analysis failed for ${asset.symbol}`,
      error
    );

    return null;
  }
}

/* -------------------------------------------------- */
/* MARKET FORECAST */
/* -------------------------------------------------- */

export async function forecastMarketRegime(): Promise<MarketRegimeForecastResult> {
  const universe =
    await getMarketUniverse();

  const analyses = (
    await Promise.all(
      universe.assets.map(
        analyzeAsset
      )
    )
  ).filter(
    (
      analysis
    ): analysis is AssetAnalysis =>
      analysis !== null
  );

  if (!analyses.length) {
    throw new Error(
      "No market assets available for regime analysis"
    );
  }

  /* ---------------------------------------------- */
  /* MOMENTUM */
  /* ---------------------------------------------- */

  const momentum =
    average(
      analyses.map(
        (a) => a.momentum
      )
    );

  /* ---------------------------------------------- */
  /* STRUCTURE */
  /* ---------------------------------------------- */

  const marketStructure =
    average(
      analyses.map(
        (a) => a.structure
      )
    );

  /* ---------------------------------------------- */
  /* STABILITY */
  /* ---------------------------------------------- */

  const trendStability =
    average(
      analyses.map(
        (a) =>
          a.trendStability
      )
    );

  /* ---------------------------------------------- */
  /* VOLATILITY */
  /* ---------------------------------------------- */

  const volatility =
    average(
      analyses.map(
        (a) =>
          a.volatilityLevel
      )
    );

  const volatilityChange =
    average(
      analyses.map(
        (a) =>
          a.volatilityChange
      )
    );

  /* ---------------------------------------------- */
  /* LIQUIDITY */
  /* ---------------------------------------------- */

  const liquidity =
    average(
      analyses.map(
        (a) => a.liquidity
      )
    );

  /* ---------------------------------------------- */
  /* BREADTH */
  /* ---------------------------------------------- */

  const bullishCount =
    analyses.filter(
      (a) =>
        a.direction ===
        "BULLISH"
    ).length;

  const bearishCount =
    analyses.filter(
      (a) =>
        a.direction ===
        "BEARISH"
    ).length;

  const neutralCount =
    analyses.length -
    bullishCount -
    bearishCount;

  const breadth =
    (bullishCount /
      analyses.length) *
    100;

  /* ---------------------------------------------- */
  /* PARTICIPATION */
  /* ---------------------------------------------- */

  const participation =
    (
      (
        bullishCount -
        bearishCount
      ) /
      analyses.length
    ) *
      50 +
    50;

  /* ---------------------------------------------- */
  /* MARKET DIRECTION */
  /* ---------------------------------------------- */

  const directionalScore =
    clamp(
      momentum * 0.30 +
        breadth * 0.25 +
        marketStructure *
          0.20 +
        trendStability *
          0.15 +
        liquidity * 0.10
    );

  let currentRegime: MarketForecastRegime;

  if (
    directionalScore >= 62
  ) {
    currentRegime =
      "BULLISH";
  } else if (
    directionalScore <= 38
  ) {
    currentRegime =
      "BEARISH";
  } else {
    currentRegime =
      "NEUTRAL";
  }

  /* ---------------------------------------------- */
  /* MARKET CONFLICT */
  /* ---------------------------------------------- */

  const bullishPressure =
    bullishCount /
    analyses.length;

  const bearishPressure =
    bearishCount /
    analyses.length;

  const directionConflict =
    Math.min(
      bullishPressure,
      bearishPressure
    ) * 100;

  /* ---------------------------------------------- */
  /* TRANSITION RISK */
  /* ---------------------------------------------- */

  let transitionRisk = 10;

  /*
   * Weak directional conviction.
   */
  if (
    Math.abs(
      directionalScore - 50
    ) < 8
  ) {
    transitionRisk += 15;
  }

  /*
   * Strong disagreement between
   * bullish and bearish assets.
   */
  if (
    directionConflict >= 20
  ) {
    transitionRisk += 10;
  }

  /*
   * Volatility expanding rapidly.
   */
  if (
    volatilityChange >= 20
  ) {
    transitionRisk += 15;
  }

  /*
   * Liquidity deterioration.
   */
  if (
    liquidity < 40
  ) {
    transitionRisk += 10;
  }

  /*
   * Weak trend stability.
   */
  if (
    trendStability < 45
  ) {
    transitionRisk += 10;
  }

  /*
   * Very high volatility.
   */
  if (
    volatility >= 80
  ) {
    transitionRisk += 5;
  }

  transitionRisk =
    clamp(
      transitionRisk
    );

  /* ---------------------------------------------- */
  /* FORECAST */
  /* ---------------------------------------------- */

  let forecastRegime: MarketForecastRegime;

  if (
    transitionRisk >= 60
  ) {
    forecastRegime =
      "TRANSITION";
  } else if (
    directionalScore >= 62
  ) {
    forecastRegime =
      "BULLISH";
  } else if (
    directionalScore <= 38
  ) {
    forecastRegime =
      "BEARISH";
  } else {
    forecastRegime =
      "NEUTRAL";
  }

  /* ---------------------------------------------- */
  /* CONFIDENCE */
  /* ---------------------------------------------- */

  const directionalStrength =
    Math.abs(
      directionalScore - 50
    );

  let confidence =
    45 +
    directionalStrength *
      0.55 +
    trendStability *
      0.15 +
    breadth *
      0.10;

  if (
    volatility >= 70
  ) {
    confidence -= 10;
  }

  confidence =
    clamp(
      confidence,
      40,
      95
    );

  /* ---------------------------------------------- */
  /* FACTORS */
  /* ---------------------------------------------- */

  const momentumFactor =
    momentum >= 60
      ? "POSITIVE"
      : momentum <= 40
      ? "NEGATIVE"
      : "NEUTRAL";

  const breadthFactor =
    breadth >= 60
      ? "BULLISH"
      : breadth <= 40
      ? "BEARISH"
      : "MIXED";

  const liquidityFactor =
    liquidity >= 60
      ? "RISING"
      : liquidity <= 40
      ? "FALLING"
      : "STABLE";

  const structureFactor =
    marketStructure >= 60
      ? "BULLISH"
      : marketStructure <= 40
      ? "BEARISH"
      : "RANGE";

  const volatilityFactor =
    volatilityChange >= 20
      ? "EXPANDING"
      : volatilityChange <= -20
      ? "CONTRACTING"
      : "STABLE";

  const stabilityFactor =
    trendStability >= 60
      ? "STABLE"
      : trendStability <= 40
      ? "UNSTABLE"
      : "TRANSITIONING";

  return {
    currentRegime,
    forecastRegime,

    confidence:
      Math.round(
        confidence
      ),

    transitionRisk:
      Math.round(
        transitionRisk
      ),

    horizon: "7D",

    momentum:
      Math.round(momentum),

    breadth:
      Math.round(breadth),

    liquidity:
      Math.round(liquidity),

    marketStructure:
      Math.round(
        marketStructure
      ),

    volatility:
      Math.round(
        volatility
      ),

    trendStability:
      Math.round(
        trendStability
      ),

    participation:
      Math.round(
        participation
      ),

    factors: {
      momentum:
        momentumFactor,

      breadth:
        breadthFactor,

      liquidity:
        liquidityFactor,

      structure:
        structureFactor,

      volatility:
        volatilityFactor,

      stability:
        stabilityFactor,
    },

    assetsAnalyzed:
      analyses.length,

    updatedAt:
      new Date().toISOString(),
  };
}