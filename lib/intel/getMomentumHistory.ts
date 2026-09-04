import "server-only";

import {
  getHistoricalMarketSnapshot,
  type HistoricalMarketSnapshot,
} from "./marketSnapshotHistory";

export type MomentumTimeframe =
  | "15M"
  | "1H"
  | "4H"
  | "24H";

const TIMEFRAME_MS: Record<
  MomentumTimeframe,
  number
> = {
  "15M": 15 * 60 * 1000,
  "1H": 60 * 60 * 1000,
  "4H": 4 * 60 * 60 * 1000,
  "24H": 24 * 60 * 60 * 1000,
};

export async function getHistoricalSnapshotForTimeframe(
  timeframe: MomentumTimeframe,
  currentTimestamp: number = Date.now()
): Promise<HistoricalMarketSnapshot | null> {
  const targetTimestamp =
    currentTimestamp -
    TIMEFRAME_MS[timeframe];

  console.log(
    "Historical lookup:",
    timeframe,
    {
      current: new Date(currentTimestamp).toISOString(),
      target: new Date(targetTimestamp).toISOString(),
    }
  );

  return getHistoricalMarketSnapshot(
    targetTimestamp,
    5 * 60 * 1000
  );
}