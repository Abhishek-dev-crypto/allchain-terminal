import { MarketCacheClient } from "./marketCacheClient";
import { getAdaptiveTTL } from "./adaptiveTtl";
import type { MarketContext } from "./marketContext";

type CacheType = "ticker" | "candles" | "snapshot";

type CacheOptions<T> = {
  key: string;
  type: CacheType;

  fetcher: () => Promise<T>;

  getContext?: (data: T) => MarketContext;

  enableHotCache?: boolean;
};

const HOT_CACHE_TTL = 10; // seconds

const hotCache = new Map<string, { data: any; expires: number }>();

function getHot<T>(key: string): T | null {
  const entry = hotCache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expires) {
    hotCache.delete(key);
    return null;
  }

  return entry.data;
}

function setHot<T>(key: string, data: T, ttl: number) {
  hotCache.set(key, {
    data,
    expires: Date.now() + ttl * 1000,
  });
}

export async function cacheOrchestrator<T>({
  key,
  type,
  fetcher,
  getContext,
  enableHotCache = true,
}: CacheOptions<T>): Promise<T> {

  // 🔥 L1: hot cache
  if (enableHotCache) {
    const hot = getHot<T>(key);
    if (hot) {
      console.log("🔥 HOT:", key);
      return hot;
    }
  }

  // 🟢 L2: Redis FIRST (IMPORTANT FIX)
  

const redisStart = performance.now();

const redis = await MarketCacheClient.get<T>(key);

if (redis) {
  console.log(
    `🟢 REDIS: ${key} (${(performance.now() - redisStart).toFixed(0)}ms)`
  );

  if (enableHotCache) {
    setHot(key, redis, HOT_CACHE_TTL);
  }

  return redis;
}

 console.log("🌐 FETCH:", key);

const start = performance.now();

const data = await fetcher();

console.log(
  `⏱ FETCH ${key}: ${(performance.now() - start).toFixed(0)}ms`
);

  let ttl = 10;

  if (getContext) {
    const ctx = getContext(data);
    ttl = getAdaptiveTTL(type, ctx);
  }

  console.log("💾 WRITE:", key, "TTL:", ttl);

  await MarketCacheClient.set(key, data, ttl);

  if (enableHotCache) {
    setHot(key, data, Math.min(ttl, HOT_CACHE_TTL));
  }

  return data;
}