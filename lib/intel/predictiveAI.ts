import "server-only";

import type { Coin } from "@/lib/types/coin";

import type {
  MarketEngineOutput,
} from "@/lib/intel/marketEngine";

import type {
  AlphaSignalsOutput,
  AlphaSignal,
} from "@/lib/intel/alphaSignals";

import {
  getHistoricalMarketSnapshots,
  type HistoricalMarketSnapshot,
} from "@/lib/intel/marketSnapshotHistory";

/* =========================================================
   TYPES
========================================================= */

export type PredictiveDirection =
  | "BULLISH"
  | "NEUTRAL"
  | "BEARISH";

export type PredictiveHorizon =
  | "15-30M"
  | "1H"
  | "4H";

export type PredictiveForecast = {
  horizon: PredictiveHorizon;

  direction: PredictiveDirection;

  bullishProbability: number;
  neutralProbability: number;
  bearishProbability: number;

  confidence: number;

  score: number;

  drivers: string[];

  risk: string;
};

export type PredictiveAIOutput = {
  symbol: string;

  forecasts: PredictiveForecast[];

  overallDirection: PredictiveDirection;

  overallConfidence: number;

  generatedAt: number;
};

/* =========================================================
   CONSTANTS
========================================================= */

const LOOKBACK_15M = 15 * 60 * 1000;
const LOOKBACK_30M = 30 * 60 * 1000;
const LOOKBACK_1H = 60 * 60 * 1000;
const LOOKBACK_4H = 4 * 60 * 60 * 1000;

const SNAPSHOT_TOLERANCE = 7 * 60 * 1000;

const BULLISH_THRESHOLD = 57;
const BEARISH_THRESHOLD = 43;

const MIN_DIRECTIONAL_PROBABILITY = 34;
const MAX_DIRECTIONAL_PROBABILITY = 82;

/* =========================================================
   HELPERS
========================================================= */

function clamp(
  value: number,
  min = 0,
  max = 100
): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.max(
    min,
    Math.min(max, value)
  );
}

function round(
  value: number,
  decimals = 1
): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Number(
    value.toFixed(decimals)
  );
}

function findHistoricalSnapshot(
  snapshots: HistoricalMarketSnapshot[],
  targetTimestamp: number
): HistoricalMarketSnapshot | null {
  let closest:
    | HistoricalMarketSnapshot
    | null = null;

  let closestDistance = Infinity;

  for (const snapshot of snapshots) {
    if (
      !Number.isFinite(
        snapshot.timestamp
      )
    ) {
      continue;
    }

    const distance =
      Math.abs(
        snapshot.timestamp -
          targetTimestamp
      );

    if (
      distance <
      closestDistance
    ) {
      closestDistance =
        distance;

      closest =
        snapshot;
    }
  }

  if (
    !closest ||
    closestDistance >
      SNAPSHOT_TOLERANCE
  ) {
    return null;
  }

  return closest;
}

function findCoin(
  snapshot:
    | HistoricalMarketSnapshot
    | null,
  symbol: string
): Coin | null {
  if (!snapshot) {
    return null;
  }

  return (
    snapshot.coins.find(
      (coin) =>
        coin.symbol.toUpperCase() ===
        symbol.toUpperCase()
    ) ?? null
  );
}

/* =========================================================
   PRICE RETURN
========================================================= */

function calculateReturn(
  currentPrice: number,
  historicalPrice?: number
): number {
  if (
    !Number.isFinite(
      currentPrice
    ) ||
    !Number.isFinite(
      historicalPrice
    ) ||
    !historicalPrice ||
    historicalPrice <= 0
  ) {
    return 0;
  }

  return (
    ((currentPrice -
      historicalPrice) /
      historicalPrice) *
    100
  );
}

/* =========================================================
   MOMENTUM
========================================================= */

type MomentumData = {
  return15m: number;
  return30m: number;
  return1h: number;
  return4h: number;

  acceleration: number;

  shortTermScore: number;
  mediumTermScore: number;
  longTermScore: number;

  available15m: boolean;
  available30m: boolean;
  available1h: boolean;
  available4h: boolean;
};

function calculateMomentum(
  current: Coin,
  historical15m: Coin | null,
  historical30m: Coin | null,
  historical1h: Coin | null,
  historical4h: Coin | null
): MomentumData {
  const available15m =
    !!historical15m;

  const available30m =
    !!historical30m;

  const available1h =
    !!historical1h;

  const available4h =
    !!historical4h;

  const return15m =
    calculateReturn(
      current.price,
      historical15m?.price
    );

  const return30m =
    calculateReturn(
      current.price,
      historical30m?.price
    );

  const return1h =
    calculateReturn(
      current.price,
      historical1h?.price
    );

  const return4h =
    calculateReturn(
      current.price,
      historical4h?.price
    );

  const shortAcceleration =
    return15m -
    return30m * 0.5;

  const mediumAcceleration =
    return30m -
    return1h * 0.5;

  const acceleration =
    shortAcceleration * 0.55 +
    mediumAcceleration * 0.45;

  const shortTermScore =
    clamp(
      50 +
        return15m * 10
    );

  const mediumTermScore =
    clamp(
      50 +
        return1h * 7
    );

  const longTermScore =
    clamp(
      50 +
        return4h * 4
    );

  return {
    return15m,
    return30m,
    return1h,
    return4h,

    acceleration,

    shortTermScore,
    mediumTermScore,
    longTermScore,

    available15m,
    available30m,
    available1h,
    available4h,
  };
}

/* =========================================================
   ALPHA
========================================================= */

function getAlphaSignal(
  alphaSignals: AlphaSignalsOutput,
  symbol: string
): AlphaSignal | null {
  return (
    alphaSignals.signals.find(
      (signal) =>
        signal.symbol.toUpperCase() ===
        symbol.toUpperCase()
    ) ?? null
  );
}

function getDirectionalAlphaScore(
  alpha: AlphaSignal | null
): number {
  if (!alpha) {
    return 50;
  }

  return clamp(
    alpha.direction ===
      "BULLISH"
      ? alpha.score
      : 100 -
        alpha.score
  );
}

/* =========================================================
   RELATIVE STRENGTH
========================================================= */

function calculateRelativeStrength(
  current: Coin,
  coins: Coin[]
) {
  const validCoins =
    coins.filter(
      (coin) =>
        Number.isFinite(
          coin.change24h
        )
    );

  const btc =
    validCoins.find(
      (coin) =>
        coin.symbol.toUpperCase() ===
        "BTC"
    );

  const marketAverage =
    validCoins.length
      ? validCoins.reduce(
          (sum, coin) =>
            sum +
            coin.change24h,
          0
        ) /
        validCoins.length
      : 0;

  const btcChange =
    btc?.change24h ?? 0;

  const vsBTC =
    current.change24h -
    btcChange;

  const vsMarket =
    current.change24h -
    marketAverage;

  const relativeStrength =
    vsBTC * 0.6 +
    vsMarket * 0.4;

  return {
    relativeStrength,

    score:
      clamp(
        50 +
          relativeStrength *
            10
      ),
  };
}

/* =========================================================
   MARKET REGIME
========================================================= */

function calculateRegimeScore(
  engine: MarketEngineOutput
): number {
  switch (
    engine.regime
  ) {
    case "RISK_ON":
      return 80;

    case "RISK_OFF":
      return 20;

    case "ROTATION":
      return 60;

    case "CHOPPY":
      return 45;

    default:
      return 50;
  }
}

/* =========================================================
   BREADTH
========================================================= */

function calculateBreadthScore(
  engine: MarketEngineOutput
): number {
  return clamp(
    engine.positiveBreadth
  );
}

/* =========================================================
   PERSISTENCE
========================================================= */

function calculatePersistence(
  current: Coin,
  snapshots: HistoricalMarketSnapshot[]
) {
  const observations =
    snapshots
      .slice(0, 8)
      .map(
        (snapshot) =>
          findCoin(
            snapshot,
            current.symbol
          )
      )
      .filter(
        (
          coin
        ): coin is Coin =>
          coin !== null
      );

  if (
    observations.length < 3
  ) {
    return {
      score: 50,
      persistence: 0.5,
      bullish: false,
      bearish: false,
    };
  }

  const positive =
    observations.filter(
      (coin) =>
        coin.change24h > 0
    ).length;

  const negative =
    observations.filter(
      (coin) =>
        coin.change24h < 0
    ).length;

  const positiveRatio =
    positive /
    observations.length;

  const negativeRatio =
    negative /
    observations.length;

  const persistence =
    Math.max(
      positiveRatio,
      negativeRatio
    );

  let score = 50;

  if (
    positiveRatio >
    negativeRatio
  ) {
    score =
      positiveRatio * 100;
  } else if (
    negativeRatio >
    positiveRatio
  ) {
    score =
      100 -
      negativeRatio * 100;
  }

  return {
    score,
    persistence,

    bullish:
      positiveRatio >= 0.625,

    bearish:
      negativeRatio >= 0.625,
  };
}

/* =========================================================
   HORIZON SCORE
========================================================= */

function calculateHorizonScore(
  horizon: PredictiveHorizon,
  momentum: MomentumData,
  alphaScore: number,
  relativeScore: number,
  sectorScore: number,
  breadthScore: number,
  regimeScore: number,
  persistenceScore: number
): number {
  if (
    horizon ===
    "15-30M"
  ) {
    return clamp(
      momentum.shortTermScore *
        0.30 +
        alphaScore *
          0.22 +
        relativeScore *
          0.16 +
        sectorScore *
          0.10 +
        breadthScore *
          0.08 +
        regimeScore *
          0.05 +
        persistenceScore *
          0.09
    );
  }

  if (
    horizon ===
    "1H"
  ) {
    return clamp(
      momentum.shortTermScore *
        0.14 +
        momentum.mediumTermScore *
        0.16 +
        alphaScore *
          0.24 +
        relativeScore *
          0.16 +
        sectorScore *
          0.10 +
        breadthScore *
          0.08 +
        regimeScore *
          0.04 +
        persistenceScore *
          0.08
    );
  }

  return clamp(
    momentum.mediumTermScore *
      0.13 +
      momentum.longTermScore *
        0.19 +
      alphaScore *
        0.24 +
      relativeScore *
        0.16 +
      sectorScore *
        0.10 +
      breadthScore *
        0.06 +
      regimeScore *
        0.04 +
      persistenceScore *
        0.08
  );
}

/* =========================================================
   DIRECTION
========================================================= */

function determineDirection(
  score: number
): PredictiveDirection {
  if (
    score >=
    BULLISH_THRESHOLD
  ) {
    return "BULLISH";
  }

  if (
    score <=
    BEARISH_THRESHOLD
  ) {
    return "BEARISH";
  }

  return "NEUTRAL";
}

/* =========================================================
   PROBABILITIES
========================================================= */

function buildProbabilities(
  score: number,
  confidence: number
) {
  const distance =
    Math.abs(
      score - 50
    );

  const normalized =
    clamp(
      distance / 20,
      0,
      1
    );

  const confidenceAdjustment =
    clamp(
      (confidence - 50) *
        0.05,
      -3,
      3
    );

  const directionalProbability =
    clamp(
      34 +
        normalized * 42 +
        confidenceAdjustment,
      MIN_DIRECTIONAL_PROBABILITY,
      MAX_DIRECTIONAL_PROBABILITY
    );

  const neutralProbability =
    clamp(
      34 -
        normalized * 22,
      8,
      34
    );

  const oppositeProbability =
    Math.max(
      0,
      100 -
        directionalProbability -
        neutralProbability
    );

  return {
    directional:
      round(
        directionalProbability
      ),

    neutral:
      round(
        neutralProbability
      ),

    opposite:
      round(
        oppositeProbability
      ),
  };
}

/* =========================================================
   CONFIDENCE
========================================================= */

function calculateConfidence(
  score: number,
  alpha: AlphaSignal | null,
  momentum: MomentumData,
  relativeStrength: number,
  persistence: {
    persistence: number;
  },
  engine: MarketEngineOutput
): number {
  let confidence = 40;

  if (alpha) {
    confidence += 7;

    confidence +=
      clamp(
        alpha.confidence -
          50,
        0,
        35
      ) *
      0.20;
  }

  const momentumValues = [
    momentum.return15m,
    momentum.return30m,
    momentum.return1h,
  ];

  const bullishMomentum =
    momentumValues.filter(
      (value) =>
        value > 0
    ).length;

  const bearishMomentum =
    momentumValues.filter(
      (value) =>
        value < 0
    ).length;

  const momentumAlignment =
    Math.max(
      bullishMomentum,
      bearishMomentum
    );

  if (
    momentumAlignment >= 2
  ) {
    confidence += 5;
  }

  if (
    momentumAlignment === 3
  ) {
    confidence += 3;
  }

  if (
    Math.abs(
      relativeStrength
    ) > 0.35
  ) {
    confidence += 4;
  }

  if (
    persistence.persistence >=
    0.625
  ) {
    confidence += 6;
  }

  const historicalCoverage = [
    momentum.available15m,
    momentum.available30m,
    momentum.available1h,
    momentum.available4h,
  ].filter(Boolean).length;

  confidence +=
    historicalCoverage * 2;

  if (
    engine.regime ===
    "CHOPPY"
  ) {
    confidence -= 10;
  } else if (
    engine.regime ===
      "RISK_ON" ||
    engine.regime ===
      "RISK_OFF"
  ) {
    confidence += 3;
  }

  confidence +=
    clamp(
      Math.abs(
        score - 50
      ) *
        0.20,
      0,
      6
    );

  return clamp(
    confidence,
    35,
    92
  );
}

/* =========================================================
   DRIVERS
========================================================= */

function buildDrivers(
  alpha: AlphaSignal | null,
  momentum: MomentumData,
  relativeStrength: number,
  sectorStrength: number,
  breadthScore: number,
  persistence: number,
  direction: PredictiveDirection
): string[] {
  const drivers: string[] =
    [];

  if (alpha) {
    if (
      alpha.direction ===
      "BULLISH"
    ) {
      drivers.push(
        alpha.strength ===
          "STRONG"
          ? "strong Alpha confirmation"
          : alpha.strength ===
            "DEVELOPING"
          ? "Alpha signal is developing"
          : "early Alpha conditions detected"
      );
    } else {
      drivers.push(
        alpha.strength ===
          "STRONG"
          ? "strong bearish Alpha confirmation"
          : alpha.strength ===
            "DEVELOPING"
          ? "bearish Alpha signal is developing"
          : "early downside Alpha conditions detected"
      );
    }
  }

  if (
    direction ===
    "BULLISH"
  ) {
    if (
      momentum.acceleration >
      0.15
    ) {
      drivers.push(
        "momentum is accelerating"
      );
    } else if (
      momentum.return15m >
      0.15
    ) {
      drivers.push(
        "short-term momentum is positive"
      );
    }
  }

  if (
    direction ===
    "BEARISH"
  ) {
    if (
      momentum.acceleration <
      -0.15
    ) {
      drivers.push(
        "momentum is losing strength"
      );
    } else if (
      momentum.return15m <
      -0.15
    ) {
      drivers.push(
        "short-term momentum is negative"
      );
    }
  }

  if (
    relativeStrength >
    0.35
  ) {
    drivers.push(
      "relative strength is improving"
    );
  } else if (
    relativeStrength <
    -0.35
  ) {
    drivers.push(
      "relative strength is weakening"
    );
  }

  if (
    sectorStrength >
    0.30
  ) {
    drivers.push(
      "sector strength is supportive"
    );
  } else if (
    sectorStrength <
    -0.30
  ) {
    drivers.push(
      "sector strength is creating downside pressure"
    );
  }

  if (
    breadthScore >
    60
  ) {
    drivers.push(
      "market breadth is supportive"
    );
  } else if (
    breadthScore <
    40
  ) {
    drivers.push(
      "market breadth is deteriorating"
    );
  }

  if (
    persistence >=
    62.5
  ) {
    drivers.push(
      "the move is showing persistence across observations"
    );
  }

  return [
    ...new Set(
      drivers
    ),
  ].slice(0, 5);
}

/* =========================================================
   RISK
========================================================= */

function buildRisk(
  horizon: PredictiveHorizon,
  engine: MarketEngineOutput,
  momentum: MomentumData,
  score: number
): string {
  if (
    engine.regime ===
    "CHOPPY"
  ) {
    if (
      horizon ===
      "15-30M"
    ) {
      return "Choppy conditions increase short-term reversal risk.";
    }

    return "Choppy conditions reduce forecast reliability.";
  }

  if (
    engine.volatilityState ===
      "ELEVATED" ||
    engine.volatilityState ===
      "EXTREME"
  ) {
    return "Elevated volatility increases forecast uncertainty.";
  }

  if (
    Math.abs(
      momentum.return15m
    ) > 2
  ) {
    return "Strong short-term movement may mean the move is becoming extended.";
  }

  if (
    Math.abs(
      score - 50
    ) < 5
  ) {
    return "Signals remain mixed and the forecast may change quickly.";
  }

  if (
    !momentum.available1h
  ) {
    return "Limited historical data reduces forecast reliability.";
  }

  return "Forecast can change as new market observations arrive.";
}

/* =========================================================
   FORECAST
========================================================= */

function buildForecast(
  horizon: PredictiveHorizon,
  current: Coin,
  marketCoins: Coin[],
  historical15m: Coin | null,
  historical30m: Coin | null,
  historical1h: Coin | null,
  historical4h: Coin | null,
  engine: MarketEngineOutput,
  alpha: AlphaSignal | null,
  historicalSnapshots: HistoricalMarketSnapshot[]
): PredictiveForecast {
  const momentum =
    calculateMomentum(
      current,
      historical15m,
      historical30m,
      historical1h,
      historical4h
    );

  const relative =
    calculateRelativeStrength(
      current,
      marketCoins
    );

  const alphaScore =
    getDirectionalAlphaScore(
      alpha
    );

  const relativeStrength =
    alpha?.metrics
      .relativeStrength ??
    relative.relativeStrength;

  const relativeScore =
    clamp(
      50 +
        relativeStrength *
          10
    );

  const sectorStrength =
    alpha?.metrics
      .sectorStrength ??
    0;

  const sectorScore =
    clamp(
      50 +
        sectorStrength *
          12
    );

  const breadthScore =
    alpha?.metrics
      .breadthConfirmation ??
    calculateBreadthScore(
      engine
    );

  const calculatedPersistence =
    calculatePersistence(
      current,
      historicalSnapshots
    );

  const persistenceScore =
    alpha?.metrics
      .persistence ??
    calculatedPersistence.score;

  const persistence =
    persistenceScore /
    100;

  const regimeScore =
    calculateRegimeScore(
      engine
    );

  const score =
    calculateHorizonScore(
      horizon,
      momentum,
      alphaScore,
      relativeScore,
      sectorScore,
      breadthScore,
      regimeScore,
      persistenceScore
    );

  const direction =
    determineDirection(
      score
    );

  const confidence =
    calculateConfidence(
      score,
      alpha,
      momentum,
      relativeStrength,
      {
        persistence,
      },
      engine
    );

  const probabilities =
    buildProbabilities(
      score,
      confidence
    );

  let bullishProbability: number;
  let bearishProbability: number;

  if (
    score >= 50
  ) {
    bullishProbability =
      probabilities.directional;

    bearishProbability =
      probabilities.opposite;
  } else {
    bearishProbability =
      probabilities.directional;

    bullishProbability =
      probabilities.opposite;
  }

  let neutralProbability =
    probabilities.neutral;

  let total =
    bullishProbability +
    neutralProbability +
    bearishProbability;

  if (
    total !== 100
  ) {
    const correction =
      round(
        100 - total
      );

    if (
      score >= 50
    ) {
      bullishProbability =
        round(
          bullishProbability +
            correction
        );
    } else {
      bearishProbability =
        round(
          bearishProbability +
            correction
        );
    }

    total =
      bullishProbability +
      neutralProbability +
      bearishProbability;

    if (
      total !== 100
    ) {
      neutralProbability =
        round(
          neutralProbability +
            (100 - total)
        );
    }
  }

  const drivers =
    buildDrivers(
      alpha,
      momentum,
      relativeStrength,
      sectorStrength,
      breadthScore,
      persistenceScore,
      direction
    );

  const risk =
    buildRisk(
      horizon,
      engine,
      momentum,
      score
    );

  return {
    horizon,

    direction,

    bullishProbability:
      bullishProbability,

    neutralProbability:
      neutralProbability,

    bearishProbability:
      bearishProbability,

    confidence:
      round(
        confidence
      ),

    score:
      round(
        score
      ),

    drivers,

    risk,
  };
}

/* =========================================================
   PUBLIC API
========================================================= */

export async function buildPredictiveAI(
  coins: Coin[],
  engine: MarketEngineOutput,
  alphaSignals: AlphaSignalsOutput
): Promise<PredictiveAIOutput[]> {
  const generatedAt =
    Date.now();

  if (
    !coins.length
  ) {
    return [];
  }

  const snapshots =
    await getHistoricalMarketSnapshots();

  if (
    !snapshots.length
  ) {
    return [];
  }

  const currentTimestamp =
    snapshots[0]?.timestamp ??
    generatedAt;

  const snapshot15m =
    findHistoricalSnapshot(
      snapshots,
      currentTimestamp -
        LOOKBACK_15M
    );

  const snapshot30m =
    findHistoricalSnapshot(
      snapshots,
      currentTimestamp -
        LOOKBACK_30M
    );

  const snapshot1h =
    findHistoricalSnapshot(
      snapshots,
      currentTimestamp -
        LOOKBACK_1H
    );

  const snapshot4h =
    findHistoricalSnapshot(
      snapshots,
      currentTimestamp -
        LOOKBACK_4H
    );

  const marketCoins =
    coins.filter(
      (coin) =>
        Number.isFinite(
          coin.change24h
        )
    );

  const results:
    PredictiveAIOutput[] =
    [];

  for (
    const coin of coins
  ) {
    const alpha =
      getAlphaSignal(
        alphaSignals,
        coin.symbol
      );

    const historical15m =
      findCoin(
        snapshot15m,
        coin.symbol
      );

    const historical30m =
      findCoin(
        snapshot30m,
        coin.symbol
      );

    const historical1h =
      findCoin(
        snapshot1h,
        coin.symbol
      );

    const historical4h =
      findCoin(
        snapshot4h,
        coin.symbol
      );

    const forecasts =
      [
        "15-30M",
        "1H",
        "4H",
      ].map(
        (
          horizon
        ) =>
          buildForecast(
            horizon as PredictiveHorizon,
            coin,
            marketCoins,
            historical15m,
            historical30m,
            historical1h,
            historical4h,
            engine,
            alpha,
            snapshots
          )
      );

    const weightedScore =
      forecasts[0].score *
        0.20 +
      forecasts[1].score *
        0.35 +
      forecasts[2].score *
        0.45;

    const overallDirection =
      determineDirection(
        weightedScore
      );

    let overallConfidence =
      forecasts[0].confidence *
        0.20 +
      forecasts[1].confidence *
        0.35 +
      forecasts[2].confidence *
        0.45;

    const allBullish =
      forecasts.every(
        (forecast) =>
          forecast.direction ===
          "BULLISH"
      );

    const allBearish =
      forecasts.every(
        (forecast) =>
          forecast.direction ===
          "BEARISH"
      );

    if (
      allBullish ||
      allBearish
    ) {
      overallConfidence += 3;
    }

    const bullishForecasts =
      forecasts.filter(
        (forecast) =>
          forecast.direction ===
          "BULLISH"
      ).length;

    const bearishForecasts =
      forecasts.filter(
        (forecast) =>
          forecast.direction ===
          "BEARISH"
      ).length;

    if (
      bullishForecasts > 0 &&
      bearishForecasts > 0
    ) {
      overallConfidence -= 4;
    }

    overallConfidence =
      clamp(
        overallConfidence,
        35,
        92
      );

    results.push({
      symbol:
        coin.symbol.toUpperCase(),

      forecasts,

      overallDirection,

      overallConfidence:
        round(
          overallConfidence
        ),

      generatedAt,
    });
  }

  return results;
}