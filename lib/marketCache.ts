import { redis } from "@/lib/redis";
import { withJitter } from "./market/cache/cacheTTL";

type CacheRecord<T> = {
  data: T;
  expiresAt: number;
};

const inFlight = new Map<string, Promise<any>>();

export async function getCache<T>(key: string): Promise<T | null> {
  const cached = await getCacheWithMetadata<T>(key);

  if (!cached) return null;

  if (cached.expired) return null;

  return cached.data;
}

export async function getCacheWithMetadata<T>(
  key: string
): Promise<{
  data: T;
  expired: boolean;
} | null> {
  try {
    const raw = await redis.get(key);

    if (!raw) return null;

    const record: CacheRecord<T> =
      typeof raw === "string"
        ? JSON.parse(raw)
        : (raw as CacheRecord<T>);

    // Backward compatibility
    if (
      !record ||
      typeof record !== "object" ||
      !("expiresAt" in record)
    ) {
      return {
        data: raw as T,
        expired: false,
      };
    }

    return {
      data: record.data,
      expired: Date.now() > record.expiresAt,
    };
  } catch (err) {
    console.error("Cache GET error:", err);
    return null;
  }
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds = 60
) {
  try {

const logicalTTL = withJitter(ttlSeconds);

const record: CacheRecord<T> = {
  data: value,
  expiresAt: Date.now() + logicalTTL * 1000,
};

await redis.set(
  key,
  JSON.stringify(record),
  {
    // Long storage window for SWR
    ex: ttlSeconds * 10,
  }
);

  } catch (err) {
    console.error("Cache SET error:", err);
  }
}

/**
 * prevents duplicate upstream calls
 */
export async function fetchWithLock<T>(
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  if (inFlight.has(key)) return inFlight.get(key)!;

  const promise = fn().finally(() => inFlight.delete(key));

  inFlight.set(key, promise);
  return promise;
}