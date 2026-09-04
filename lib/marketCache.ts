import "server-only";

import { redis } from "@/lib/redis";

/* =========================================================
   REDIS CACHE ADAPTER
   ---------------------------------------------------------
   This file is intentionally dumb.

   Responsibilities:
   - GET from Redis
   - SET to Redis
   - DELETE from Redis

   It does NOT:
   - manage L1 cache
   - calculate TTL
   - deduplicate requests
   - perform upstream fetches
   - implement business logic
========================================================= */

/* =========================================================
   GET
========================================================= */

export async function getCache<T>(
  key: string
): Promise<T | null> {
  try {
    const value = await redis.get<T>(key);

    if (
      value === null ||
      value === undefined
    ) {
      return null;
    }

    return value;

  } catch (error) {
    console.error(
      `Redis GET failed: ${key}`,
      error
    );

    return null;
  }
}

/* =========================================================
   SET
========================================================= */

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds = 60
): Promise<void> {
  try {
    const ttl = Math.max(
      1,
      Math.round(ttlSeconds)
    );

    await redis.set(
      key,
      value,
      {
        ex: ttl,
      }
    );

  } catch (error) {
    console.error(
      `Redis SET failed: ${key}`,
      error
    );
  }
}

/* =========================================================
   DELETE
========================================================= */

export async function deleteCache(
  key: string
): Promise<void> {
  try {
    await redis.del(key);

  } catch (error) {
    console.error(
      `Redis DELETE failed: ${key}`,
      error
    );
  }
}