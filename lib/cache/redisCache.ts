import "server-only";

import { redis } from "@/lib/redis";
import { withJitter } from "./cacheJitter";

type RedisCacheRecord<T> = {
  data: T;
  createdAt: number;
  expiresAt: number;
};

export async function getRedisCache<T>(
  key: string
): Promise<{
  data: T;
  createdAt: number;
  expiresAt: number;
} | null> {
  try {
    const raw = await redis.get(key);

    if (!raw) {
      return null;
    }

    if (
      typeof raw === "object" &&
      raw !== null &&
      "data" in raw &&
      "expiresAt" in raw
    ) {
      return raw as RedisCacheRecord<T>;
    }

    // Backward compatibility with older
    // plain Redis values.
    return {
      data: raw as T,
      createdAt: Date.now(),
      expiresAt: Date.now(),
    };
  } catch (error) {
    console.error(
      `Redis GET failed: ${key}`,
      error
    );

    return null;
  }
}

export async function setRedisCache<T>(
  key: string,
  data: T,
  ttlSeconds: number,
  staleTtlSeconds = ttlSeconds * 10
) {
  const logicalTTL = withJitter(ttlSeconds);

  const record: RedisCacheRecord<T> = {
    data,
    createdAt: Date.now(),
    expiresAt:
      Date.now() + logicalTTL * 1000,
  };

  try {
    await redis.set(key, record, {
      ex: Math.max(
        logicalTTL + staleTtlSeconds,
        logicalTTL + 1
      ),
    });
  } catch (error) {
    console.error(
      `Redis SET failed: ${key}`,
      error
    );
  }
}