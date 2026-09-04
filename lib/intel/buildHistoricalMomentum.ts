import "server-only";

import {
  buildMarketSnapshot,
  type MarketSnapshot,
} from "./buildMarketSnapshot";

import {
  getHistoricalSnapshotForTimeframe,
  type MomentumTimeframe,
} from "./getMomentumHistory";

export type HistoricalMomentumResult = {
  timeframe: MomentumTimeframe;

  available: boolean;

  currentMomentum: number | null;

  historicalMomentum: number | null;

  change: number | null;

  state:
    | "ACCELERATING"
    | "DECELERATING"
    | "NEUTRAL"
    | "INSUFFICIENT_HISTORY";

  confidence: number | null;

  timestamp: number | null;
};

function getState(
  change: number
):
  | "ACCELERATING"
  | "DECELERATING"
  | "NEUTRAL" {
  /*
   * Small changes are treated as neutral.
   *
   * This prevents tiny market movements from
   * being presented as meaningful acceleration.
   */
  if (change >= 0.25) {
    return "ACCELERATING";
  }

  if (change <= -0.25) {
    return "DECELERATING";
  }

  return "NEUTRAL";
}

function getConfidence(
  change: number,
  breadth: number
): number {
  const magnitude = Math.abs(change);

  /*
   * Momentum magnitude contributes up to 70 points.
   */
  const momentumScore =
    Math.min(70, magnitude * 20);

  /*
   * Breadth contributes up to 30 points.
   *
   * 50% breadth = neutral participation.
   * Higher breadth increases confidence.
   */
  const breadthScore =
    Math.min(
      30,
      Math.max(0, (breadth - 50) * 0.6)
    );

  return Math.min(
    95,
    Math.max(
      50,
      Math.round(
        50 +
        momentumScore * 0.5 +
        breadthScore * 0.5
      )
    )
  );
}

export async function buildHistoricalMomentum(
  currentSnapshot: MarketSnapshot,
  timeframe: MomentumTimeframe,
  currentTimestamp: number = Date.now()
): Promise<HistoricalMomentumResult> {
  const historical =
    await getHistoricalSnapshotForTimeframe(
      timeframe,
      currentTimestamp
    );

  /*
   * We do not have enough real history.
   */
  if (!historical) {
    return {
      timeframe,
      available: false,
      currentMomentum: null,
      historicalMomentum: null,
      change: null,
      state: "INSUFFICIENT_HISTORY",
      confidence: null,
      timestamp: null,
    };
  }

  /*
   * Run the historical coins through the
   * EXACT SAME market intelligence engine.
   */
  const historicalSnapshot =
    buildMarketSnapshot(
      historical.coins
    );

  const currentMomentum =
    currentSnapshot.momentum.average;

  const historicalMomentum =
    historicalSnapshot.momentum.average;

  const change =
    currentMomentum -
    historicalMomentum;

  return {
    timeframe,

    available: true,

    currentMomentum,

    historicalMomentum,

    change: Number(
      change.toFixed(2)
    ),

    state: getState(change),

    confidence: getConfidence(
  change,
  currentSnapshot.breadth.greenPercent
),

    timestamp: historical.timestamp,
  };
}