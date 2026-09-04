import "server-only";

import {
  getMemoryCache,
  setMemoryCache,
} from "./memoryCache";

import {
  getRedisCache,
  setRedisCache,
} from "./redisCache";

import {
  acquireCacheLock,
  releaseCacheLock,
} from "./cacheLock";

import {
  getInFlight,
  setInFlight,
} from "./inFlight";

import type {
  CacheOptions,
  CacheResult,
} from "./cacheTypes";

const MEMORY_TTL = 10;

const WAIT_INTERVAL = 100;

const MAX_WAIT = 5000;

async function waitForCache<T>(
  key: string
): Promise<T | null> {
  const started = Date.now();

  while (
    Date.now() - started <
    MAX_WAIT
  ) {
    await new Promise((resolve) =>
      setTimeout(resolve, WAIT_INTERVAL)
    );

    const cached =
      await getRedisCache<T>(key);

    if (
      cached &&
      Date.now() < cached.expiresAt
    ) {
      return cached.data;
    }
  }

  return null;
}

export async function getCached<T>({
  key,
  ttl,
  staleTtl = ttl * 10,
  fetcher,
  enableMemoryCache = true,
  staleWhileRevalidate = true,
}: CacheOptions<T>): Promise<T> {

  /* =====================================
     L1 — MEMORY
  ===================================== */

  if (enableMemoryCache) {
    const memory =
      getMemoryCache<T>(key);

    if (memory !== null) {
      return memory;
    }
  }

  /* =====================================
     L2 — REDIS
  ===================================== */

  const redisRecord =
    await getRedisCache<T>(key);

  if (redisRecord) {
    const fresh =
      Date.now() <
      redisRecord.expiresAt;

    if (fresh) {
      if (enableMemoryCache) {
        setMemoryCache(
          key,
          redisRecord.data,
          Math.min(ttl, MEMORY_TTL)
        );
      }

      return redisRecord.data;
    }

    /* =================================
       STALE
    ================================= */

    if (staleWhileRevalidate) {
      refreshInBackground({
        key,
        ttl,
        staleTtl,
        fetcher,
        staleData: redisRecord.data,
        enableMemoryCache,
      });

      if (enableMemoryCache) {
        setMemoryCache(
          key,
          redisRecord.data,
          Math.min(2, MEMORY_TTL)
        );
      }

      return redisRecord.data;
    }
  }

  /* =====================================
     LOCAL DEDUPE
  ===================================== */

  const existing =
    getInFlight<T>(key);

  if (existing) {
    return existing;
  }

  /* =====================================
     FETCH
  ===================================== */

  const promise = fetchFresh({
    key,
    ttl,
    staleTtl,
    fetcher,
    enableMemoryCache,
  });

  setInFlight(key, promise);

  return promise;
}

async function fetchFresh<T>({
  key,
  ttl,
  staleTtl,
  fetcher,
  enableMemoryCache,
}: {
  key: string;
  ttl: number;
  staleTtl: number;
  fetcher: () => Promise<T>;
  enableMemoryCache: boolean;
}): Promise<T> {

  /* =====================================
     DISTRIBUTED LOCK
  ===================================== */

  const acquired =
    await acquireCacheLock(key);

  if (!acquired) {
    const existing =
      await waitForCache<T>(key);

    if (existing !== null) {
      if (enableMemoryCache) {
        setMemoryCache(
          key,
          existing,
          Math.min(ttl, MEMORY_TTL)
        );
      }

      return existing;
    }

    /*
     * Lock holder may have failed.
     * We become the fallback fetcher.
     */
  }

  try {
    /*
     * Double-check Redis after
     * acquiring the lock.
     *
     * Another process may have populated
     * the cache immediately before us.
     */

    const existing =
      await getRedisCache<T>(key);

    if (
      existing &&
      Date.now() < existing.expiresAt
    ) {
      if (enableMemoryCache) {
        setMemoryCache(
          key,
          existing.data,
          Math.min(ttl, MEMORY_TTL)
        );
      }

      return existing.data;
    }

    const data =
      await fetcher();

    await setRedisCache(
      key,
      data,
      ttl,
      staleTtl
    );

    if (enableMemoryCache) {
      setMemoryCache(
        key,
        data,
        Math.min(ttl, MEMORY_TTL)
      );
    }

    return data;

  } finally {
    if (acquired) {
      await releaseCacheLock(key);
    }
  }
}

function refreshInBackground<T>({
  key,
  ttl,
  staleTtl,
  fetcher,
  enableMemoryCache,
}: {
  key: string;
  ttl: number;
  staleTtl: number;
  fetcher: () => Promise<T>;
  staleData: T;
  enableMemoryCache: boolean;
}) {

  const existing =
    getInFlight<T>(key);

  if (existing) {
    return;
  }

  const promise =
    fetchFresh({
      key,
      ttl,
      staleTtl,
      fetcher,
      enableMemoryCache,
    });

  setInFlight(key, promise);

  promise.catch((error) => {
    console.error(
      `Background cache refresh failed: ${key}`,
      error
    );
  });
}