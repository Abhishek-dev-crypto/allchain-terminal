
import type { Coin } from "@/lib/types/coin";

import {
  getHistoricalMarketSnapshots,
  type HistoricalMarketSnapshot,
} from "@/lib/intel/marketSnapshotHistory";

import type { MarketEngineOutput } from "@/lib/intel/marketEngine";

import { getMarketSector } from "@/lib/intel/core/sectorMap";

/* =========================================================
   TYPES
========================================================= */

export type AlphaSignalType =
  | "MOMENTUM_ACCELERATION"
  | "RELATIVE_STRENGTH"
  | "VOLUME_EXPANSION"
  | "SECTOR_ROTATION"
  | "EXPANSION";

export type AlphaSignalStrength =
  | "WATCH"
  | "DEVELOPING"
  | "STRONG";

export type AlphaSignalDirection =
  | "BULLISH"
  | "BEARISH";

export type AlphaSignal = {
  symbol: string;
  name?: string;

  type: AlphaSignalType;

  score: number;
  strength: AlphaSignalStrength;

  direction: AlphaSignalDirection;
  confidence: number;

  triggeredAt: number;

  metrics: {
    momentumAcceleration: number;
    relativeStrength: number;
    volumeExpansion: number;
    sectorStrength: number;
    breadthConfirmation: number;
    persistence: number;
  };

  explanation: string;
};

export type AlphaSignalsOutput = {
  signals: AlphaSignal[];

  topOpportunity: AlphaSignal | null;

  marketOpportunityCount: number;

  bullishCount: number;
  bearishCount: number;

  generatedAt: number;
};

/* =========================================================
   CONSTANTS
========================================================= */

const MIN_HISTORY = 4;

const LOOKBACK_15M = 15 * 60 * 1000;
const LOOKBACK_30M = 30 * 60 * 1000;
const LOOKBACK_1H = 60 * 60 * 1000;

const SNAPSHOT_TOLERANCE = 5 * 60 * 1000;

/*
 * Alpha should identify meaningful opportunities,
 * not every small fluctuation.
 */
const MIN_ALPHA_SCORE = 62;
const MIN_EVIDENCE = 3;

/*
 * Momentum thresholds are expressed in percentage
 * return terms.
 */
const MOMENTUM_THRESHOLD = 0.15;

/*
 * Relative strength is measured in percentage-point
 * advantage versus BTC/market.
 */
const RELATIVE_STRENGTH_THRESHOLD = 0.35;

/*
 * Activity is only a confirmation factor.
 */
const ACTIVITY_THRESHOLD = 15;

/*
 * Sector strength threshold.
 */
const SECTOR_THRESHOLD = 0.30;

/*
 * Persistence threshold.
 */
const PERSISTENCE_THRESHOLD = 0.625;

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
  decimals = 2
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

    const distance = Math.abs(
      snapshot.timestamp -
        targetTimestamp
    );

    if (
      distance <
      closestDistance
    ) {
      closestDistance = distance;
      closest = snapshot;
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

function calculateMomentumAcceleration(
  current: Coin,
  historical15m: Coin | null,
  historical30m: Coin | null,
  historical1h: Coin | null
) {
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

  /*
   * We compare normalized pace instead of directly
   * comparing cumulative returns.
   *
   * 15m return is compared against 1/2 of the 30m
   * return and 30m against 1/2 of the 1h return.
   */
  const shortTermAcceleration =
    return15m -
    return30m * 0.5;

  const mediumTermAcceleration =
    return30m -
    return1h * 0.5;

  const acceleration =
    shortTermAcceleration * 0.55 +
    mediumTermAcceleration * 0.45;

  /*
   * Score is directional:
   *
   * 50 = neutral
   * >50 = bullish
   * <50 = bearish
   */
  const score = clamp(
    50 +
      acceleration * 18
  );

  return {
    return15m,
    return30m,
    return1h,

    acceleration,
    score,

    bullish:
      acceleration >
      MOMENTUM_THRESHOLD,

    bearish:
      acceleration <
      -MOMENTUM_THRESHOLD,
  };
}

/* =========================================================
   RELATIVE STRENGTH
========================================================= */

function calculateRelativeStrength(
  current: Coin,
  currentCoins: Coin[]
) {
  const validCoins =
    currentCoins.filter(
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

  const score = clamp(
    50 +
      relativeStrength * 10
  );

  return {
    relativeStrength,
    score,

    bullish:
      relativeStrength >
      RELATIVE_STRENGTH_THRESHOLD,

    bearish:
      relativeStrength <
      -RELATIVE_STRENGTH_THRESHOLD,
  };
}

/* =========================================================
   ACTIVITY
========================================================= */

/*
 * IMPORTANT:
 *
 * volume24h is a rolling 24-hour figure.
 *
 * Comparing it with previous snapshots does NOT create
 * true intraday volume expansion.
 *
 * Therefore this metric is explicitly called ACTIVITY.
 *
 * It is used as confirmation only.
 */

function calculateActivity(
  current: Coin,
  historical15m: Coin | null,
  historical30m: Coin | null,
  historical1h: Coin | null
) {
  /*
   * volume24h is optional on Coin.
   *
   * Normalize it immediately so TypeScript knows this
   * value is always a number from this point onward.
   */
  const currentVolume =
    current.volume24h ?? 0;

  if (
    !Number.isFinite(currentVolume) ||
    currentVolume <= 0
  ) {
    return {
      expansion: 0,
      score: 50,
      bullish: false,
      bearish: false,
    };
  }

  const historicalVolumes = [
    historical15m?.volume24h,
    historical30m?.volume24h,
    historical1h?.volume24h,
  ].filter(
    (
      value
    ): value is number =>
      typeof value === "number" &&
      Number.isFinite(value) &&
      value > 0
  );

  if (
    !historicalVolumes.length
  ) {
    return {
      expansion: 0,
      score: 50,
      bullish: false,
      bearish: false,
    };
  }

  const average =
    historicalVolumes.reduce(
      (sum, value) =>
        sum + value,
      0
    ) /
    historicalVolumes.length;

  if (
    !Number.isFinite(average) ||
    average <= 0
  ) {
    return {
      expansion: 0,
      score: 50,
      bullish: false,
      bearish: false,
    };
  }

  const expansion =
    ((currentVolume - average) /
      average) *
    100;

  /*
   * Activity is confirmation,
   * not a standalone trigger.
   */
  const score = clamp(
    50 +
      expansion * 0.15
  );

  return {
    expansion,
    score,
    bullish:
      expansion > 15,
    bearish:
      expansion < -15,
  };
}

/* =========================================================
   SECTOR STRENGTH
========================================================= */

function calculateSectorStrength(
  symbol: string,
  engine: MarketEngineOutput
) {
  const sectorName =
    getMarketSector(symbol);

  const sector =
    engine.sectorRotation.sectors.find(
      (item) =>
        item.name ===
        sectorName
    );

  if (!sector) {
    return {
      score: 50,
      strength: 0,
      bullish: false,
      bearish: false,
    };
  }

  const strength =
    sector.relativeStrength +
    sector.acceleration;

  const score = clamp(
    50 +
      strength * 12 +
      (sector.earlyRotation
        ? 8
        : 0)
  );

  return {
    score,
    strength,

    bullish:
      sector.earlyRotation ||
      strength >
        SECTOR_THRESHOLD,

    bearish:
      strength <
      -SECTOR_THRESHOLD,
  };
}

/* =========================================================
   BREADTH
========================================================= */

function calculateBreadthConfirmation(
  engine: MarketEngineOutput
) {
  const breadth =
    clamp(
      engine.positiveBreadth
    );

  return {
    bullishScore:
      breadth,

    bearishScore:
      100 - breadth,

    bullish:
      breadth > 55,

    bearish:
      breadth < 45,
  };
}

/* =========================================================
   PERSISTENCE
========================================================= */

function calculatePersistence(
  current: Coin,
  snapshots: HistoricalMarketSnapshot[]
) {
  /*
   * Use actual observations rather than assuming every
   * snapshot contains the coin.
   */
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

  /*
   * Directional persistence.
   *
   * This fixes the old bug where bearish persistence
   * could still generate a positive score.
   */
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

  const persistence =
    Math.max(
      positiveRatio,
      negativeRatio
    );

  return {
    score,

    persistence,

    bullish:
      positiveRatio >=
      PERSISTENCE_THRESHOLD,

    bearish:
      negativeRatio >=
      PERSISTENCE_THRESHOLD,
  };
}

/* =========================================================
   SIGNAL TYPE
========================================================= */

function determineSignalType(
  momentum: {
    score: number;
    acceleration: number;
  },
  relative: {
    score: number;
    relativeStrength: number;
  },
  activity: {
    score: number;
    expansion: number;
  },
  sector: {
    score: number;
    strength: number;
  },
  persistence: {
    score: number;
    persistence: number;
  }
): AlphaSignalType {
  const candidates: {
    type: AlphaSignalType;
    strength: number;
  }[] = [];

  if (
    Math.abs(
      momentum.acceleration
    ) >=
    MOMENTUM_THRESHOLD
  ) {
    candidates.push({
      type:
        "MOMENTUM_ACCELERATION",
      strength:
        Math.abs(
          momentum.acceleration
        ),
    });
  }

  if (
    Math.abs(
      relative.relativeStrength
    ) >=
    RELATIVE_STRENGTH_THRESHOLD
  ) {
    candidates.push({
      type:
        "RELATIVE_STRENGTH",
      strength:
        Math.abs(
          relative.relativeStrength
        ),
    });
  }

  if (
    Math.abs(
      activity.expansion
    ) >=
    ACTIVITY_THRESHOLD
  ) {
    candidates.push({
      type:
        "VOLUME_EXPANSION",
      strength:
        Math.abs(
          activity.expansion
        ),
    });
  }

  if (
    Math.abs(
      sector.strength
    ) >=
    SECTOR_THRESHOLD
  ) {
    candidates.push({
      type:
        "SECTOR_ROTATION",
      strength:
        Math.abs(
          sector.strength
        ),
    });
  }

  if (
    persistence.persistence >=
    PERSISTENCE_THRESHOLD
  ) {
    candidates.push({
      type: "EXPANSION",
      strength:
        persistence.persistence *
        100,
    });
  }

  candidates.sort(
    (a, b) =>
      b.strength -
      a.strength
  );

  return (
    candidates[0]?.type ??
    "MOMENTUM_ACCELERATION"
  );
}

/* =========================================================
   STRENGTH
========================================================= */

function classifyStrength(
  score: number
): AlphaSignalStrength {
  if (score >= 80) {
    return "STRONG";
  }

  if (score >= 67) {
    return "DEVELOPING";
  }

  return "WATCH";
}

/* =========================================================
   EXPLANATION
========================================================= */

function buildExplanation(
  metrics: {
    momentumAcceleration: number;
    relativeStrength: number;
    volumeExpansion: number;
    sectorStrength: number;
    persistence: number;
  },
  direction:
    | "BULLISH"
    | "BEARISH"
) {
  const parts: string[] =
    [];

  if (
    Math.abs(
      metrics.momentumAcceleration
    ) >
    MOMENTUM_THRESHOLD
  ) {
    parts.push(
      metrics.momentumAcceleration >
        0
        ? "short-term momentum is accelerating"
        : "short-term momentum is weakening"
    );
  }

  if (
    Math.abs(
      metrics.relativeStrength
    ) >
    RELATIVE_STRENGTH_THRESHOLD
  ) {
    parts.push(
      metrics.relativeStrength >
        0
        ? "relative strength is improving"
        : "relative strength is deteriorating"
    );
  }

  if (
    metrics.volumeExpansion >
    ACTIVITY_THRESHOLD
  ) {
    parts.push(
      "market activity is elevated"
    );
  } else if (
    metrics.volumeExpansion <
    -ACTIVITY_THRESHOLD
  ) {
    parts.push(
      "market activity is declining"
    );
  }

  if (
    metrics.sectorStrength >
    SECTOR_THRESHOLD
  ) {
    parts.push(
      "sector strength is supportive"
    );
  } else if (
    metrics.sectorStrength <
    -SECTOR_THRESHOLD
  ) {
    parts.push(
      "sector strength is creating downside pressure"
    );
  }

  if (
    metrics.persistence >=
    PERSISTENCE_THRESHOLD
  ) {
    parts.push(
      "the move is showing persistence"
    );
  }

  if (!parts.length) {
    parts.push(
      "multiple market conditions are beginning to align"
    );
  }

  const prefix =
    direction ===
    "BULLISH"
      ? "Early upside conditions detected:"
      : "Early downside conditions detected:";

  return `${prefix} ${parts.join(
    ", "
  )}.`;
}

/* =========================================================
   MAIN ENGINE
========================================================= */

export async function buildAlphaSignals(
  coins: Coin[],
  engine: MarketEngineOutput
): Promise<AlphaSignalsOutput> {
  const generatedAt =
    Date.now();

  if (!coins.length) {
    return {
      signals: [],
      topOpportunity: null,
      marketOpportunityCount: 0,
      bullishCount: 0,
      bearishCount: 0,
      generatedAt,
    };
  }

  const snapshots =
    await getHistoricalMarketSnapshots();

  if (
    snapshots.length <
    MIN_HISTORY
  ) {
    return {
      signals: [],
      topOpportunity: null,
      marketOpportunityCount: 0,
      bullishCount: 0,
      bearishCount: 0,
      generatedAt,
    };
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

  const signals: AlphaSignal[] =
    [];

  for (const coin of coins) {
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

    /*
     * We need at least one historical observation.
     *
     * Missing observations are handled by individual
     * metrics rather than manufacturing returns.
     */
    if (
      !historical15m &&
      !historical30m &&
      !historical1h
    ) {
      continue;
    }

    const momentum =
      calculateMomentumAcceleration(
        coin,
        historical15m,
        historical30m,
        historical1h
      );

    const relative =
      calculateRelativeStrength(
        coin,
        coins
      );

    const activity =
      calculateActivity(
        coin,
        historical15m,
        historical30m,
        historical1h
      );

    const sector =
      calculateSectorStrength(
        coin.symbol,
        engine
      );

    const breadth =
      calculateBreadthConfirmation(
        engine
      );

    const persistence =
      calculatePersistence(
        coin,
        snapshots
      );

    /* =====================================================
       EVIDENCE
    ===================================================== */

    const bullishEvidence = [
      momentum.bullish,
      relative.bullish,
      activity.bullish,
      sector.bullish,
      breadth.bullish,
      persistence.bullish,
    ].filter(Boolean).length;

    const bearishEvidence = [
      momentum.bearish,
      relative.bearish,
      activity.bearish,
      sector.bearish,
      breadth.bearish,
      persistence.bearish,
    ].filter(Boolean).length;

    const direction =
      bullishEvidence >
      bearishEvidence
        ? "BULLISH"
        : bearishEvidence >
          bullishEvidence
        ? "BEARISH"
        : null;

    /*
     * Never create a directional signal when evidence
     * is tied.
     */
    if (!direction) {
      continue;
    }

    /* =====================================================
       DIRECTIONAL SCORES
    ===================================================== */

    const momentumScore =
      direction === "BULLISH"
        ? momentum.score
        : 100 -
          momentum.score;

    const relativeScore =
      direction === "BULLISH"
        ? relative.score
        : 100 -
          relative.score;

    const activityScore =
      direction === "BULLISH"
        ? activity.score
        : 100 -
          activity.score;

    const sectorScore =
      direction === "BULLISH"
        ? sector.score
        : 100 -
          sector.score;

    const breadthScore =
      direction === "BULLISH"
        ? breadth.bullishScore
        : breadth.bearishScore;

    /*
     * Persistence is already directional.
     */
    const persistenceScore =
      direction === "BULLISH"
        ? persistence.score
        : 100 -
          persistence.score;

    /* =====================================================
       ALPHA SCORE
    ===================================================== */

    /*
     * Momentum             30%
     * Relative strength    25%
     * Sector                20%
     * Persistence           10%
     * Breadth                5%
     * Activity              10%
     */
    const score =
      momentumScore * 0.30 +
      relativeScore * 0.25 +
      sectorScore * 0.20 +
      persistenceScore * 0.10 +
      breadthScore * 0.05 +
      activityScore * 0.10;

    const evidenceCount =
      direction === "BULLISH"
        ? bullishEvidence
        : bearishEvidence;

    /*
     * Require genuine confirmation.
     */
    if (
      score <
        MIN_ALPHA_SCORE ||
      evidenceCount <
        MIN_EVIDENCE
    ) {
      continue;
    }

    /* =====================================================
       CONFIDENCE
    ===================================================== */

    /*
     * Score and confidence intentionally remain separate.
     *
     * Score:
     *   How attractive is the setup?
     *
     * Confidence:
     *   How much independent confirmation exists?
     */

    const evidenceConfidence =
      evidenceCount * 8;

    const agreementConfidence =
      Math.abs(
        bullishEvidence -
          bearishEvidence
      ) * 7;

    const persistenceConfidence =
      persistence.persistence *
      15;

    const historicalCoverage =
      [
        historical15m,
        historical30m,
        historical1h,
      ].filter(Boolean).length;

    const historyConfidence =
      historicalCoverage * 3;

    const signalQuality =
      clamp(
        Math.max(
          momentumScore,
          relativeScore,
          sectorScore,
          activityScore
        )
      ) * 0.12;

    let confidence =
      30 +
      evidenceConfidence +
      agreementConfidence +
      persistenceConfidence +
      historyConfidence +
      signalQuality;

    /*
     * Choppy markets reduce reliability.
     */
    if (
      engine.regime ===
      "CHOPPY"
    ) {
      confidence -= 8;
    } else if (
      engine.regime ===
        "RISK_ON" ||
      engine.regime ===
        "RISK_OFF"
    ) {
      confidence += 3;
    }

    confidence =
      clamp(
        confidence,
        35,
        95
      );

    /* =====================================================
       TYPE
    ===================================================== */

    const type =
      determineSignalType(
        {
          score:
            momentumScore,
          acceleration:
            momentum.acceleration,
        },
        {
          score:
            relativeScore,
          relativeStrength:
            relative.relativeStrength,
        },
        {
          score:
            activityScore,
          expansion:
            activity.expansion,
        },
        {
          score:
            sectorScore,
          strength:
            sector.strength,
        },
        {
          score:
            persistenceScore,
          persistence:
            persistence.persistence,
        }
      );

    /* =====================================================
       EXPLANATION
    ===================================================== */

    const explanation =
      buildExplanation(
        {
          momentumAcceleration:
            momentum.acceleration,

          relativeStrength:
            relative.relativeStrength,

          volumeExpansion:
            activity.expansion,

          sectorStrength:
            sector.strength,

          persistence:
            persistence.persistence,
        },
        direction
      );

    /* =====================================================
       SIGNAL
    ===================================================== */

    signals.push({
      symbol:
        coin.symbol.toUpperCase(),

      name: coin.name,

      type,

      score:
        round(score),

      strength:
        classifyStrength(
          score
        ),

      direction,

      confidence:
        round(confidence),

      triggeredAt:
        generatedAt,

      metrics: {
        momentumAcceleration:
          round(
            momentum.acceleration
          ),

        relativeStrength:
          round(
            relative.relativeStrength
          ),

        volumeExpansion:
          round(
            activity.expansion
          ),

        sectorStrength:
          round(
            sector.strength
          ),

        breadthConfirmation:
          round(
            breadthScore
          ),

        persistence:
          round(
            persistence.persistence *
              100
          ),
      },

      explanation,
    });
  }

  /*
   * Highest-quality opportunities first.
   *
   * Score remains primary, confidence breaks ties.
   */
  signals.sort(
    (a, b) =>
      b.score -
        a.score ||
      b.confidence -
        a.confidence
  );

  return {
    signals,

    topOpportunity:
      signals[0] ??
      null,

    marketOpportunityCount:
      signals.length,

    bullishCount:
      signals.filter(
        (signal) =>
          signal.direction ===
          "BULLISH"
      ).length,

    bearishCount:
      signals.filter(
        (signal) =>
          signal.direction ===
          "BEARISH"
      ).length,

    generatedAt,
  };
}

