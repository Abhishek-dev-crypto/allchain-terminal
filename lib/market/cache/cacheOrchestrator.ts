import { MarketCacheClient } from "./marketCacheClient";
import { getAdaptiveTTL } from "./adaptiveTtl";
import type { MarketContext } from "./marketContext";

import {
  acquireLock,
  releaseLock,
} from "./distributedLock";

type CacheType = "ticker" | "candles" | "snapshot";

type CacheOptions<T> = {
  key: string;
  type: CacheType;

  fetcher: () => Promise<T>;

  getContext?: (data: T) => MarketContext;

  enableHotCache?: boolean;
};

/* =========================================================
   CONFIG
========================================================= */

const HOT_CACHE_TTL = 10;

// How long a request waits for the lock owner
// to populate Redis.
const LOCK_WAIT_MS = 3000;

// Poll interval while waiting for Redis.
const LOCK_POLL_MS = 100;

// Distributed lock lifetime.
const LOCK_TTL_SECONDS = 15;

/* =========================================================
   L1 MEMORY CACHE
========================================================= */

type HotCacheEntry<T> = {
  data: T;
  expiresAt: number;
};

const hotCache = new Map<
  string,
  HotCacheEntry<unknown>
>();

function getHot<T>(key: string): T | null {
  const entry = hotCache.get(key);

  if (!entry) {
    return null;
  }

  if (Date.now() >= entry.expiresAt) {
    hotCache.delete(key);
    return null;
  }

  return entry.data as T;
}

function setHot<T>(
  key: string,
  data: T,
  ttlSeconds: number
) {
  if (ttlSeconds <= 0) {
    return;
  }

  hotCache.set(key, {
    data,
    expiresAt:
      Date.now() + ttlSeconds * 1000,
  });
}

/* =========================================================
   L3 LOCAL IN-FLIGHT DEDUPLICATION
========================================================= */

const inFlight = new Map<
  string,
  Promise<unknown>
>();

function getInFlight<T>(
  key: string
): Promise<T> | null {
  return (
    (inFlight.get(key) as
      | Promise<T>
      | undefined) ?? null
  );
}

/* =========================================================
   WAIT FOR REDIS
========================================================= */

async function waitForRedis<T>(
  key: string
): Promise<T | null> {

  const start = Date.now();

  while (
    Date.now() - start < LOCK_WAIT_MS
  ) {

    await new Promise((resolve) =>
      setTimeout(
        resolve,
        LOCK_POLL_MS
      )
    );

    const cached =
      await MarketCacheClient.get<T>(
        key
      );

    if (cached !== null) {

      console.log(
        `🟢 LOCK REFRESH HIT: ${key}`
      );

      return cached;
    }
  }

  return null;
}

/* =========================================================
   CACHE ORCHESTRATOR
========================================================= */

export async function cacheOrchestrator<T>({
  key,
  type,
  fetcher,
  getContext,
  enableHotCache = true,
}: CacheOptions<T>): Promise<T> {

  /* -------------------------------------------------------
     L1 — LOCAL MEMORY
  ------------------------------------------------------- */

  if (enableHotCache) {

    const hot =
      getHot<T>(key);

    if (hot !== null) {

      console.log(
        `🔥 L1 HIT: ${key}`
      );

      return hot;
    }
  }

  /* -------------------------------------------------------
     L2 — REDIS
  ------------------------------------------------------- */

  const redisStart =
    performance.now();

  const cached =
    await MarketCacheClient.get<T>(
      key
    );

  if (cached !== null) {

    console.log(
      `🟢 L2 REDIS HIT: ${key} (${(
        performance.now() -
        redisStart
      ).toFixed(0)}ms)`
    );

    if (enableHotCache) {

      setHot(
        key,
        cached,
        HOT_CACHE_TTL
      );
    }

    return cached;
  }

  console.log(
    `⚠️ CACHE MISS: ${key}`
  );

  /* -------------------------------------------------------
     L3 — LOCAL IN-FLIGHT
  ------------------------------------------------------- */

  const existing =
    getInFlight<T>(key);

  if (existing) {

    console.log(
      `🟡 IN-FLIGHT WAIT: ${key}`
    );

    return existing;
  }

  /* -------------------------------------------------------
     L4 — DISTRIBUTED LOCK
  ------------------------------------------------------- */

  const lock =
    await acquireLock(
      key,
      LOCK_TTL_SECONDS
    );

  /*
   * Another instance owns the lock.
   */
  if (!lock.acquired) {

    console.log(
      `🔒 LOCK BUSY: ${key}`
    );

    const refreshed =
      await waitForRedis<T>(
        key
      );

    if (refreshed !== null) {

      if (enableHotCache) {

        setHot(
          key,
          refreshed,
          HOT_CACHE_TTL
        );
      }

      return refreshed;
    }

    /*
     * Important:
     *
     * Do NOT immediately fetch upstream here.
     *
     * The other instance may still be
     * fetching, or the lock may have expired.
     *
     * Re-check Redis once more before
     * allowing a fallback fetch.
     */

    const finalCheck =
      await MarketCacheClient.get<T>(
        key
      );

    if (finalCheck !== null) {

      if (enableHotCache) {

        setHot(
          key,
          finalCheck,
          HOT_CACHE_TTL
        );
      }

      console.log(
        `🟢 FINAL LOCK CHECK HIT: ${key}`
      );

      return finalCheck;
    }

    /*
     * At this point the original lock owner
     * did not populate Redis.
     *
     * We allow a controlled fallback fetch.
     *
     * This is preferable to blocking indefinitely.
     */
    console.log(
      `⚠️ LOCK TIMEOUT FALLBACK: ${key}`
    );
  }

  /* -------------------------------------------------------
     UPSTREAM FETCH
  ------------------------------------------------------- */

  const promise =
    (async () => {

      try {

        /*
         * Always check Redis again before
         * touching the upstream API.
         */
        const doubleCheck =
          await MarketCacheClient.get<T>(
            key
          );

        if (
          doubleCheck !== null
        ) {

          console.log(
            `🟢 DOUBLE-CHECK HIT: ${key}`
          );

          if (
            enableHotCache
          ) {

            setHot(
              key,
              doubleCheck,
              HOT_CACHE_TTL
            );
          }

          return doubleCheck;
        }

        const start =
          performance.now();

        console.log(
          `🌐 UPSTREAM FETCH: ${key}`
        );

        const data =
          await fetcher();

        console.log(
          `⏱ UPSTREAM ${key}: ${(
            performance.now() -
            start
          ).toFixed(0)}ms`
        );

        /* ---------------------------------------------------
           ADAPTIVE TTL
        --------------------------------------------------- */

        let ttl = 10;

        if (getContext) {

          const context =
            getContext(data);

          ttl =
            getAdaptiveTTL(
              type,
              context
            );
        }

        /* ---------------------------------------------------
           L2 — REDIS WRITE
        --------------------------------------------------- */

        await MarketCacheClient.set(
          key,
          data,
          ttl
        );

        console.log(
          `💾 REDIS WRITE: ${key} TTL=${ttl}s`
        );

        /* ---------------------------------------------------
           L1 — MEMORY WRITE
        --------------------------------------------------- */

        if (
          enableHotCache
        ) {

          setHot(
            key,
            data,
            Math.min(
              ttl,
              HOT_CACHE_TTL
            )
          );
        }

        return data;

      } finally {

        /*
         * Only the request that actually
         * acquired the lock may release it.
         */
        if (
          lock.acquired
        ) {

          await releaseLock(
            key,
            lock.token
          );
        }

        inFlight.delete(
          key
        );
      }

    })();

  /* -------------------------------------------------------
     REGISTER LOCAL IN-FLIGHT
  ------------------------------------------------------- */

  inFlight.set(
    key,
    promise
  );

  return promise;
}