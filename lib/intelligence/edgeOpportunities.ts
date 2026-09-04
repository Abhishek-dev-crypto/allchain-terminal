import type { Candle } from "@/lib/market/types";
import {
  getMarketUniverse,
  type MarketUniverseAsset,
} from "@/lib/market/MarketUniverse";
import { marketEngine } from "@/lib/market/MarketEngine";
import {
  computeSignalAdvanced,
  type SignalResult,
} from "./computeSignalAdvanced";
import {
  forecastMarketRegime,
  type MarketRegimeForecastResult,
} from "./marketRegimeForecast";

/* =========================================================
   TYPES
========================================================= */

export type EdgeDirection = "LONG" | "SHORT";

export type EdgeSetup =
  | "MOMENTUM_CONTINUATION"
  | "STRUCTURE_BREAKOUT"
  | "TREND_PULLBACK"
  | "REVERSAL";

export type EdgeRejectionReason =
  | "INSUFFICIENT_DATA"
  | "HOLD_1H"
  | "HOLD_4H"
  | "TIMEFRAME_DISAGREEMENT"
  | "INVALID_TRADE_LEVELS"
  | "LOW_RISK_REWARD";

export type EdgeOpportunity = {
  symbol: string;
  asset: string;

  direction: EdgeDirection;
  setup: EdgeSetup;

  edgeScore: number;
  confidence: number;

  entry: {
    low: number;
    high: number;
  };

  target: number;
  invalidation: number;

  riskReward: number;

  evidence: {
    signal1h: "BUY" | "SELL";
    signal4h: "BUY" | "SELL";

    ema: "BULLISH" | "BEARISH";

    rsi:
      | "OVERBOUGHT"
      | "BULLISH"
      | "NEUTRAL"
      | "BEARISH"
      | "OVERSOLD";

    macd: "BULLISH" | "BEARISH";

    volume: "CONFIRMING" | "NORMAL";

    structure:
      | "HIGHER_HIGHS"
      | "LOWER_LOWS"
      | "RANGE";
  };

  reasons: string[];

  updatedAt: string;
};

/*
 * Candidates that passed directional and
 * structural validation but were rejected
 * because their actual structural R:R
 * was below the minimum threshold.
 *
 * These are diagnostics only.
 * They are NOT presented as trade opportunities.
 */
export type EdgeRejectedCandidate = {
  symbol: string;
  asset: string;

  direction: EdgeDirection;
  setup: EdgeSetup;

  entry: {
    low: number;
    high: number;
  };

  target: number;
  invalidation: number;

  riskReward: number;

  confidence: number;

  signal1h: "BUY" | "SELL";
  signal4h: "BUY" | "SELL";

  reason: "LOW_RISK_REWARD";
};

export type EdgeDiagnostics = {
  insufficientData: number;
  hold1h: number;
  hold4h: number;
  timeframeDisagreement: number;
  invalidTradeLevels: number;
  lowRiskReward: number;
  validOpportunities: number;
};

export type EdgeOpportunitiesResult = {
  opportunities: EdgeOpportunity[];

  /*
   * Diagnostic candidates only.
   *
   * These are the strongest rejected setups
   * by actual risk/reward.
   */
  rejectedCandidates: EdgeRejectedCandidate[];

  marketContext: {
    currentRegime:
      MarketRegimeForecastResult["currentRegime"];

    forecastRegime:
      MarketRegimeForecastResult["forecastRegime"];

    confidence: number;
    transitionRisk: number;
  };

  assetsAnalyzed: number;
  opportunitiesFound: number;

  diagnostics: EdgeDiagnostics;

  updatedAt: string;
};

/* =========================================================
   CONSTANTS
========================================================= */

const MIN_RISK_REWARD = 1.5;

const MAX_REJECTED_CANDIDATES = 10;

/* =========================================================
   HELPERS
========================================================= */

function clamp(
  value: number,
  min = 0,
  max = 100
) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

function average(values: number[]) {
  if (!values.length) return 0;

  return (
    values.reduce(
      (sum, value) => sum + value,
      0
    ) / values.length
  );
}

/* =========================================================
   ATR
========================================================= */

function calculateATR(
  candles: Candle[],
  period = 14
) {
  if (
    candles.length <
    period + 1
  ) {
    return 0;
  }

  const trueRanges: number[] = [];

  for (
    let i = 1;
    i < candles.length;
    i++
  ) {
    const current = candles[i];
    const previous = candles[i - 1];

    const trueRange =
      Math.max(
        current.high -
          current.low,

        Math.abs(
          current.high -
            previous.close
        ),

        Math.abs(
          current.low -
            previous.close
        )
      );

    trueRanges.push(
      trueRange
    );
  }

  return average(
    trueRanges.slice(-period)
  );
}

/* =========================================================
   STRUCTURAL LEVELS
========================================================= */

function getRecentHigh(
  candles: Candle[],
  periods = 20
) {
  const recent =
    candles.slice(-periods);

  if (!recent.length) {
    return 0;
  }

  return Math.max(
    ...recent.map(
      (c) => c.high
    )
  );
}

function getRecentLow(
  candles: Candle[],
  periods = 20
) {
  const recent =
    candles.slice(-periods);

  if (!recent.length) {
    return 0;
  }

  return Math.min(
    ...recent.map(
      (c) => c.low
    )
  );
}

/* =========================================================
   ENTRY / TARGET / INVALIDATION
========================================================= */

function findRecentSwingLow(
  candles: Candle[],
  lookback = 20
) {
  const start =
    Math.max(
      2,
      candles.length - lookback
    );

  /*
   * Only inspect completed candles
   * before the latest candle.
   */
  for (
    let i = candles.length - 2;
    i >= start;
    i--
  ) {
    const current =
      candles[i];

    const left1 =
      candles[i - 1];

    const left2 =
      candles[i - 2];

    const right1 =
      candles[i + 1];

    const right2 =
      candles[i + 2];

    if (
      current.low < left1.low &&
      current.low < left2.low &&
      current.low <= right1.low &&
      current.low <= right2.low
    ) {
      return current.low;
    }
  }

  return 0;
}

function findRecentSwingHigh(
  candles: Candle[],
  lookback = 20
) {
  const start =
    Math.max(
      2,
      candles.length - lookback
    );

  /*
   * Only inspect completed candles
   * before the latest candle.
   */
  for (
    let i = candles.length - 2;
    i >= start;
    i--
  ) {
    const current =
      candles[i];

    const left1 =
      candles[i - 1];

    const left2 =
      candles[i - 2];

    const right1 =
      candles[i + 1];

    const right2 =
      candles[i + 2];

    if (
      current.high > left1.high &&
      current.high > left2.high &&
      current.high >= right1.high &&
      current.high >= right2.high
    ) {
      return current.high;
    }
  }

  return 0;
}

function buildTradeLevels(
  direction: EdgeDirection,
  candles: Candle[]
) {
  const latest =
    candles.at(-1);

  if (!latest) {
    return null;
  }

  const price =
    latest.close;

  const atr =
    calculateATR(candles);

  if (
    !Number.isFinite(price) ||
    price <= 0 ||
    !Number.isFinite(atr) ||
    atr <= 0
  ) {
    return null;
  }

  /*
   * Broader structural range.
   *
   * This remains the target source.
   */
  const structuralHigh =
    getRecentHigh(
      candles,
      50
    );

  const structuralLow =
    getRecentLow(
      candles,
      50
    );

  if (
    !structuralHigh ||
    !structuralLow
  ) {
    return null;
  }

  /*
   * Entry remains anchored to
   * the actual latest market price.
   */
  const entryBuffer =
    atr * 0.15;

  const entryLow =
    direction === "LONG"
      ? price - entryBuffer
      : price;

  const entryHigh =
    direction === "LONG"
      ? price
      : price + entryBuffer;

  /*
   * Find the nearest confirmed
   * structural swing around price.
   *
   * This is more responsive than
   * using the absolute 20-candle
   * extreme.
   */
  const swingLow =
    findRecentSwingLow(
      candles,
      20
    );

  const swingHigh =
    findRecentSwingHigh(
      candles,
      20
    );

  /*
   * If no confirmed swing exists,
   * fall back to the recent structural
   * extreme rather than inventing a level.
   */
  const baseInvalidation =
    direction === "LONG"
      ? swingLow || getRecentLow(candles, 20)
      : swingHigh || getRecentHigh(candles, 20);

  if (
    !Number.isFinite(
      baseInvalidation
    ) ||
    baseInvalidation <= 0
  ) {
    return null;
  }

  /*
   * Small ATR buffer protects the
   * invalidation from ordinary market
   * noise around the swing.
   */
  const invalidation =
    direction === "LONG"
      ? baseInvalidation -
        atr * 0.15
      : baseInvalidation +
        atr * 0.15;

  /*
   * Broader structural target.
   */
  const target =
    direction === "LONG"
      ? structuralHigh
      : structuralLow;

  /*
   * Validate directional geometry.
   */
  if (
    direction === "LONG" &&
    (
      invalidation >= entryLow ||
      target <= entryHigh
    )
  ) {
    return null;
  }

  if (
    direction === "SHORT" &&
    (
      invalidation <= entryHigh ||
      target >= entryLow
    )
  ) {
    return null;
  }

  const entry =
    price;

  const risk =
    direction === "LONG"
      ? entry - invalidation
      : invalidation - entry;

  const reward =
    direction === "LONG"
      ? target - entry
      : entry - target;

  if (
    !Number.isFinite(risk) ||
    !Number.isFinite(reward) ||
    risk <= 0 ||
    reward <= 0
  ) {
    return null;
  }

  const riskReward =
    reward / risk;

  return {
    entryLow,
    entryHigh,
    target,
    invalidation,
    riskReward,
  };
}

/* =========================================================
   SETUP CLASSIFICATION
========================================================= */

function classifySetup(
  signal: SignalResult,
  candles: Candle[],
  direction: EdgeDirection
): EdgeSetup {
  const technical =
    signal.technicalEvidence;

  const structure =
    technical.structure.state;

  const volumeSpike =
    technical.volume.spike;

  const emaTrend =
    technical.ema.trend;

  const macdState =
    technical.macd.state;

  const rsiState =
    technical.rsi.state;

  const trendAligned =
    (
      direction === "LONG" &&
      emaTrend === "BULLISH"
    ) ||
    (
      direction === "SHORT" &&
      emaTrend === "BEARISH"
    );

  const momentumAligned =
    (
      direction === "LONG" &&
      macdState === "BULLISH"
    ) ||
    (
      direction === "SHORT" &&
      macdState === "BEARISH"
    );

  const structureAligned =
    (
      direction === "LONG" &&
      structure === "HIGHER_HIGHS"
    ) ||
    (
      direction === "SHORT" &&
      structure === "LOWER_LOWS"
    );

  /*
   * 1. STRUCTURE BREAKOUT
   *
   * Requires:
   * - directional market structure
   * - elevated volume
   *
   * This is intentionally strict.
   */
  if (
    volumeSpike &&
    structureAligned
  ) {
    return "STRUCTURE_BREAKOUT";
  }

  /*
   * 2. REVERSAL
   *
   * Only classify as reversal when RSI
   * shows an extreme condition against
   * the prevailing move.
   *
   * LONG + oversold
   * SHORT + overbought
   */
  if (
    (
      direction === "LONG" &&
      rsiState === "OVERSOLD"
    ) ||
    (
      direction === "SHORT" &&
      rsiState === "OVERBOUGHT"
    )
  ) {
    return "REVERSAL";
  }

  /*
   * 3. MOMENTUM CONTINUATION
   *
   * Requires both trend and momentum
   * to agree with the trade direction.
   *
   * This prevents a neutral RSI from
   * changing the setup classification.
   */
  if (
    trendAligned &&
    momentumAligned
  ) {
    return "MOMENTUM_CONTINUATION";
  }

  /*
   * 4. TREND PULLBACK
   *
   * The broader trend agrees with the
   * trade direction, but momentum is not
   * fully aligned.
   *
   * This represents a potentially better
   * entry within an existing trend rather
   * than pure momentum continuation.
   */
  if (
    trendAligned &&
    candles.length >= 30
  ) {
    return "TREND_PULLBACK";
  }

  /*
   * 5. REVERSAL FALLBACK
   *
   * If trend and momentum are not aligned,
   * the setup is no longer a clean
   * continuation/pullback structure.
   *
   * Keep the existing four-category model
   * without inventing another setup type.
   */
  return "REVERSAL";
}

/* =========================================================
   EDGE SCORE
========================================================= */

function calculateEdgeScore({
  signal1h,
  signal4h,
  riskReward,
  marketRegime,
}: {
  signal1h: SignalResult;
  signal4h: SignalResult;
  riskReward: number;

  marketRegime:
    | "BULLISH"
    | "BEARISH"
    | "NEUTRAL"
    | "TRANSITION";
}) {
  const technicalScore =
    average([
      signal1h.confidence,
      signal4h.confidence,
    ]);

  const alignmentScore =
    signal1h.signal ===
    signal4h.signal
      ? 100
      : 0;

  const rrScore =
    clamp(
      riskReward * 25
    );

  const structureScore =
    signal4h
      .technicalEvidence
      .structure.state ===
    "RANGE"
      ? 50
      : 100;

  const direction =
    signal4h.signal ===
    "BUY"
      ? "LONG"
      : "SHORT";

  let regimeAlignment = 50;

  if (
    marketRegime ===
      "BULLISH" &&
    direction === "LONG"
  ) {
    regimeAlignment = 100;
  }

  if (
    marketRegime ===
      "BEARISH" &&
    direction === "SHORT"
  ) {
    regimeAlignment = 100;
  }

  if (
    marketRegime ===
    "TRANSITION"
  ) {
    regimeAlignment = 45;
  }

  if (
    marketRegime ===
    "NEUTRAL"
  ) {
    regimeAlignment = 60;
  }

  return Math.round(
    clamp(
      technicalScore * 0.30 +
        alignmentScore * 0.20 +
        rrScore * 0.25 +
        structureScore * 0.10 +
        regimeAlignment * 0.15
    )
  );
}

/* =========================================================
   OPPORTUNITY RESULT
========================================================= */

type AssetAnalysisResult =
  | {
      opportunity: EdgeOpportunity;
      rejectedCandidate: null;
      rejection: null;
    }
  | {
      opportunity: null;
      rejectedCandidate: EdgeRejectedCandidate;
      rejection: "LOW_RISK_REWARD";
    }
  | {
      opportunity: null;
      rejectedCandidate: null;
      rejection: EdgeRejectionReason;
    };

/* =========================================================
   OPPORTUNITY BUILDER
========================================================= */

function buildOpportunity({
  asset,
  candles1h,
  candles4h,
  signal1h,
  signal4h,
  marketRegime,
}: {
  asset: MarketUniverseAsset;

  candles1h: Candle[];
  candles4h: Candle[];

  signal1h: SignalResult;
  signal4h: SignalResult;

  marketRegime:
    | "BULLISH"
    | "BEARISH"
    | "NEUTRAL"
    | "TRANSITION";
}): AssetAnalysisResult {
  if (
    signal1h.signal ===
    "HOLD"
  ) {
    return {
      opportunity: null,
      rejectedCandidate: null,
      rejection: "HOLD_1H",
    };
  }

  if (
    signal4h.signal ===
    "HOLD"
  ) {
    return {
      opportunity: null,
      rejectedCandidate: null,
      rejection: "HOLD_4H",
    };
  }

  if (
    signal1h.signal !==
    signal4h.signal
  ) {
    return {
      opportunity: null,
      rejectedCandidate: null,
      rejection:
        "TIMEFRAME_DISAGREEMENT",
    };
  }

  const direction: EdgeDirection =
    signal4h.signal ===
    "BUY"
      ? "LONG"
      : "SHORT";

  const setup =
    classifySetup(
      signal4h,
      candles4h,
      direction
    );

  const levels =
    buildTradeLevels(
      direction,
      candles4h
    );

  if (!levels) {
    return {
      opportunity: null,
      rejectedCandidate: null,
      rejection:
        "INVALID_TRADE_LEVELS",
    };
  }

  /*
   * Capture the actual low-R:R
   * candidate before rejecting it.
   */
  if (
    levels.riskReward <
    MIN_RISK_REWARD
  ) {
    const confidence =
      Math.round(
        clamp(
          average([
            signal1h.confidence,
            signal4h.confidence,
          ]),
          40,
          95
        )
      );

    return {
      opportunity: null,

      rejectedCandidate: {
        symbol:
          asset.symbol,

        asset:
          asset.baseAsset,

        direction,

        setup,

        entry: {
          low:
            Number(
              levels.entryLow.toFixed(8)
            ),

          high:
            Number(
              levels.entryHigh.toFixed(8)
            ),
        },

        target:
          Number(
            levels.target.toFixed(8)
          ),

        invalidation:
          Number(
            levels.invalidation.toFixed(8)
          ),

        riskReward:
          Number(
            levels.riskReward.toFixed(2)
          ),

        confidence,

        signal1h:
          signal1h.signal,

        signal4h:
          signal4h.signal,

        reason:
          "LOW_RISK_REWARD",
      },

      rejection:
        "LOW_RISK_REWARD",
    };
  }

  const technical =
    signal4h
      .technicalEvidence;

  const edgeScore =
    calculateEdgeScore({
      signal1h,
      signal4h,
      riskReward:
        levels.riskReward,
      marketRegime,
    });

  let confidence =
    average([
      signal1h.confidence,
      signal4h.confidence,
    ]);

  if (
    marketRegime ===
    "TRANSITION"
  ) {
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

  const reasons: string[] = [];

  reasons.push(
    "1H and 4H signals agree"
  );

  if (
    technical.ema.aligned
  ) {
    reasons.push(
      `${technical.ema.trend} EMA alignment`
    );
  }

  if (
    technical.macd.state ===
    (
      direction === "LONG"
        ? "BULLISH"
        : "BEARISH"
    )
  ) {
    reasons.push(
      `${technical.macd.state.toLowerCase()} MACD confirmation`
    );
  }

  if (
    technical.volume.spike
  ) {
    reasons.push(
      "Volume participation is elevated"
    );
  }

  if (
    technical.structure.state ===
    (
      direction === "LONG"
        ? "HIGHER_HIGHS"
        : "LOWER_LOWS"
    )
  ) {
    reasons.push(
      direction === "LONG"
        ? "Higher-high structure"
        : "Lower-low structure"
    );
  }

  reasons.push(
    `Risk/reward ${levels.riskReward.toFixed(1)}:1`
  );

  return {
    opportunity: {
      symbol:
        asset.symbol,

      asset:
        asset.baseAsset,

      direction,

      setup,

      edgeScore,

      confidence,

      entry: {
        low:
          Number(
            levels.entryLow.toFixed(8)
          ),

        high:
          Number(
            levels.entryHigh.toFixed(8)
          ),
      },

      target:
        Number(
          levels.target.toFixed(8)
        ),

      invalidation:
        Number(
          levels.invalidation.toFixed(8)
        ),

      riskReward:
        Number(
          levels.riskReward.toFixed(2)
        ),

      evidence: {
        signal1h:
          signal1h.signal,

        signal4h:
          signal4h.signal,

        ema:
          technical.ema.trend,

        rsi:
          technical.rsi.state,

        macd:
          technical.macd.state,

        volume:
          technical.volume.spike
            ? "CONFIRMING"
            : "NORMAL",

        structure:
          technical.structure.state,
      },

      reasons,

      updatedAt:
        new Date().toISOString(),
    },

    rejectedCandidate: null,

    rejection: null,
  };
}

/* =========================================================
   ASSET ANALYSIS
========================================================= */

async function analyzeAsset(
  asset: MarketUniverseAsset,
  marketRegime:
    | "BULLISH"
    | "BEARISH"
    | "NEUTRAL"
    | "TRANSITION"
): Promise<AssetAnalysisResult> {
  try {
    const [
      candles1h,
      candles4h,
    ] = await Promise.all([
      marketEngine.getCandles(
        asset.symbol,
        "1h"
      ),

      marketEngine.getCandles(
        asset.symbol,
        "4h"
      ),
    ]);

    if (
      candles1h.length < 30 ||
      candles4h.length < 30
    ) {
      return {
        opportunity: null,
        rejectedCandidate: null,
        rejection:
          "INSUFFICIENT_DATA",
      };
    }

    const signal1h =
      computeSignalAdvanced(
        candles1h
      );

    const signal4h =
      computeSignalAdvanced(
        candles4h
      );

    return buildOpportunity({
      asset,
      candles1h,
      candles4h,
      signal1h,
      signal4h,
      marketRegime,
    });
  } catch (error) {
    console.error(
      `Edge analysis failed for ${asset.symbol}`,
      error
    );

    return {
      opportunity: null,
      rejectedCandidate: null,
      rejection:
        "INSUFFICIENT_DATA",
    };
  }
}

/* =========================================================
   DIAGNOSTICS
========================================================= */

function createEmptyDiagnostics(): EdgeDiagnostics {
  return {
    insufficientData: 0,
    hold1h: 0,
    hold4h: 0,
    timeframeDisagreement: 0,
    invalidTradeLevels: 0,
    lowRiskReward: 0,
    validOpportunities: 0,
  };
}

function recordRejection(
  diagnostics: EdgeDiagnostics,
  rejection: EdgeRejectionReason
) {
  switch (rejection) {
    case "INSUFFICIENT_DATA":
      diagnostics.insufficientData++;
      break;

    case "HOLD_1H":
      diagnostics.hold1h++;
      break;

    case "HOLD_4H":
      diagnostics.hold4h++;
      break;

    case "TIMEFRAME_DISAGREEMENT":
      diagnostics.timeframeDisagreement++;
      break;

    case "INVALID_TRADE_LEVELS":
      diagnostics.invalidTradeLevels++;
      break;

    case "LOW_RISK_REWARD":
      diagnostics.lowRiskReward++;
      break;
  }
}

/* =========================================================
   MAIN ENGINE
========================================================= */

export async function getEdgeOpportunities(): Promise<EdgeOpportunitiesResult> {
  /*
   * Existing market-regime engine
   * provides market context.
   */
  const marketRegime =
    await forecastMarketRegime();

  const universe =
    await getMarketUniverse();

  const diagnostics =
    createEmptyDiagnostics();

  const results =
    await Promise.all(
      universe.assets.map(
        (asset) =>
          analyzeAsset(
            asset,
            marketRegime.forecastRegime
          )
      )
    );

  const opportunities: EdgeOpportunity[] = [];

  const rejectedCandidates: EdgeRejectedCandidate[] = [];

  for (const result of results) {
    if (
      result.opportunity
    ) {
      opportunities.push(
        result.opportunity
      );

      diagnostics.validOpportunities++;

    } else if (
      result.rejectedCandidate
    ) {
      rejectedCandidates.push(
        result.rejectedCandidate
      );

      recordRejection(
        diagnostics,
        result.rejection
      );

    } else if (
      result.rejection
    ) {
      recordRejection(
        diagnostics,
        result.rejection
      );
    }
  }

  /*
   * Rank genuine opportunities by
   * Edge Score.
   */
  opportunities.sort(
    (a, b) =>
      b.edgeScore -
      a.edgeScore
  );

  /*
   * Rank rejected candidates by
   * actual structural R:R.
   *
   * This is diagnostic information only.
   */
  rejectedCandidates.sort(
    (a, b) =>
      b.riskReward -
      a.riskReward
  );

  const topOpportunities =
    opportunities.slice(0, 10);

  const topRejectedCandidates =
    rejectedCandidates.slice(
      0,
      MAX_REJECTED_CANDIDATES
    );

  return {
    opportunities:
      topOpportunities,

    rejectedCandidates:
      topRejectedCandidates,

    marketContext: {
      currentRegime:
        marketRegime.currentRegime,

      forecastRegime:
        marketRegime.forecastRegime,

      confidence:
        marketRegime.confidence,

      transitionRisk:
        marketRegime.transitionRisk,
    },

    assetsAnalyzed:
      universe.assets.length,

    opportunitiesFound:
      topOpportunities.length,

    diagnostics,

    updatedAt:
      new Date().toISOString(),
  };
}