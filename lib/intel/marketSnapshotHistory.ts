import "server-only";

import { redis } from "@/lib/redis";
import type { Coin } from "@/lib/types/coin";

export type HistoricalMarketSnapshot = {
  timestamp: number;
  coins: Coin[];
};

/*
 * We collect one snapshot every 5 minutes.
 *
 * 24 hours = 288 snapshots
 * We keep 48 hours = 576 snapshots
 *
 * Keeping extra history gives us some room for
 * delayed/missed collection intervals.
 */
const SNAPSHOT_INTERVAL = 5 * 60 * 1000;
const MAX_SNAPSHOTS = 576;

const HISTORY_KEY = "market:history:snapshots";

/**
 * Store a market snapshot if a new 5-minute interval
 * has actually started.
 *
 * This prevents duplicate snapshots from being stored
 * when multiple requests hit the application.
 */
export async function recordMarketSnapshot(
  coins: Coin[],
  timestamp = Date.now()
): Promise<boolean> {
  if (!coins?.length) {
    return false;
  }

  const latest =
    await redis.lindex(
      HISTORY_KEY,
      0
    );

  /*
   * Do not create another historical observation
   * inside the same 5-minute interval.
   */
  if (
    latest &&
    timestamp - latest.timestamp < SNAPSHOT_INTERVAL
  ) {
    return false;
  }

  const snapshot: HistoricalMarketSnapshot = {
    timestamp,
    coins,
  };

  /*
   * Newest snapshot goes to the beginning.
   */
  await redis.lpush(
    HISTORY_KEY,
    snapshot
  );

  /*
   * Keep only the most recent 576 observations.
   */
  await redis.ltrim(
    HISTORY_KEY,
    0,
    MAX_SNAPSHOTS - 1
  );

  return true;
}

/**
 * Return all currently available historical snapshots.
 *
 * Newest snapshot comes first.
 */
export async function getHistoricalMarketSnapshots(): Promise<
  HistoricalMarketSnapshot[]
> {
  const snapshots =
    await redis.lrange<HistoricalMarketSnapshot>(
      HISTORY_KEY,
      0,
      MAX_SNAPSHOTS - 1
    );

  return snapshots ?? [];
}

/**
 * Find the historical snapshot closest to
 * the requested target time.
 *
 * We never manufacture a snapshot.
 *
 * If there is no sufficiently close observation,
 * return null.
 */
export async function getHistoricalMarketSnapshot(
  targetTimestamp: number,
  toleranceMs = 3 * 60 * 1000
): Promise<HistoricalMarketSnapshot | null> {
  const snapshots =
    await getHistoricalMarketSnapshots();

  if (!snapshots.length) {
    return null;
  }

  let closest: HistoricalMarketSnapshot | null = null;
  let closestDistance = Infinity;

  for (const snapshot of snapshots) {
    const distance = Math.abs(
      snapshot.timestamp - targetTimestamp
    );

    if (distance < closestDistance) {
      closestDistance = distance;
      closest = snapshot;
    }
  }

  /*
   * Do not silently use an observation that is
   * too far away from the requested timeframe.
   */
  if (
    !closest ||
    closestDistance > toleranceMs
  ) {
    return null;
  }

  return closest;
}