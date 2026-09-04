import "server-only";

import type { MarketSnapshot } from "./buildMarketSnapshot";
import {
  buildHistoricalMomentum,
  type HistoricalMomentumResult,
} from "./buildHistoricalMomentum";

export type TimelineState =
  | "WEAKENING"
  | "NEUTRAL"
  | "EXPANDING"
  | "ACCELERATING"
  | "STRONG TREND"
  | "INSUFFICIENT HISTORY";

export type TimelineNode = {
  timeframe: "15M" | "1H" | "4H" | "24H";
  state: TimelineState;
  confidence: number | null;
  change: number | null;
  available: boolean;
  historicalTimestamp: number | null;
};

function mapState(
  result: HistoricalMomentumResult
): TimelineState {
  if (!result.available) {
    return "INSUFFICIENT HISTORY";
  }

  switch (result.state) {
    case "ACCELERATING":
      return "ACCELERATING";

    case "DECELERATING":
      return "WEAKENING";

    case "NEUTRAL":
    default:
      return "NEUTRAL";
  }
}

export async function buildMomentumTimeline(
  snapshot: MarketSnapshot,
  currentTimestamp: number = Date.now()
): Promise<TimelineNode[]> {
  const timeframes = [
    "15M",
    "1H",
    "4H",
    "24H",
  ] as const;

  const results = await Promise.all(
    timeframes.map((timeframe) =>
      buildHistoricalMomentum(
        snapshot,
        timeframe,
        currentTimestamp
      )
    )
  );

  return results.map((result) => ({
    timeframe: result.timeframe,

    state: mapState(result),

    confidence: result.confidence,

    change: result.change,

    available: result.available,

    historicalTimestamp:
      result.timestamp,
  }));
}