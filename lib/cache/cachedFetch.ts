import "server-only";

import { redis } from "@/lib/redis";
import { withJitter } from "@/lib/market/cache/cacheTTL";

type CachedFetchOptions<T> = {
  key: string;
  ttl: number;
  fetcher: () => Promise<T>;
};

const inFlight = new Map<string, Promise<any>>();

export async function cachedFetch<T>({
  key,
  ttl,
  fetcher,
}: CachedFetchOptions<T>): Promise<T> {
  // 1. Redis
  const cached = await redis.get<T>(key);

  if (cached) {
    console.log(`🟢 Redis HIT: ${key}`);
    return cached;
  }

  // 2. Prevent cache stampede
  const existing = inFlight.get(key);

  if (existing) {
    console.log(`🟡 Waiting for existing fetch: ${key}`);
    return existing;
  }

  console.log(`🌐 Redis MISS: ${key}`);

  const promise = (async () => {
    try {
      const data = await fetcher();

      await redis.set(key, data, {
        ex: withJitter(ttl),
      });

      return data;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise);

  return promise;
}