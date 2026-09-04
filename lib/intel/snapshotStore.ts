import "server-only";

import { redis } from "@/lib/redis";
import type { MarketSnapshot } from "@/lib/intel/useMarketSnapshot";

export type HistoricalMarketSnapshot = {
  timestamp: number;
  snapshot: MarketSnapshot;
};

const SNAPSHOT_KEY = "market:intelligence:snapshots";

/*
 * Keep enough observations to support:
 * 15M / 1H / 4H / 24H comparisons.
 *
 * With a 1-minute observation interval:
 * 24 hours = 1440 observations.
 *
 * We keep 1500.
 */
const MAX_SNAPSHOTS = 1500;

/* =========================================================
   SAVE SNAPSHOT
========================================================= */

export async function saveMarketSnapshot(
  snapshot: MarketSnapshot
): Promise<void> {
  const observation: HistoricalMarketSnapshot = {
    timestamp: Date.now(),
    snapshot,
  };

  const existing =
    (await redis.get<HistoricalMarketSnapshot[]>(SNAPSHOT_KEY)) ?? [];

  const updated = [
    ...existing,
    observation,
  ].slice(-MAX_SNAPSHOTS);

  await redis.set(SNAPSHOT_KEY, updated);
}

/* =========================================================
   GET ALL HISTORICAL SNAPSHOTS
========================================================= */

export async function getHistoricalMarketSnapshots(): Promise<
  HistoricalMarketSnapshot[]
> {
  return (
    (await redis.get<HistoricalMarketSnapshot[]>(SNAPSHOT_KEY)) ?? []
  );
}

/* =========================================================
   GET SNAPSHOT AT OR BEFORE TARGET TIME
========================================================= */

export async function getSnapshotAtOrBefore(
  targetTimestamp: number
): Promise<HistoricalMarketSnapshot | null> {
  const snapshots = await getHistoricalMarketSnapshots();

  if (!snapshots.length) {
    return null;
  }

  /*
   * Find the most recent real observation
   * that existed at or before the requested time.
   */
  for (let i = snapshots.length - 1; i >= 0; i--) {
    if (snapshots[i].timestamp <= targetTimestamp) {
      return snapshots[i];
    }
  }

  return null;
}