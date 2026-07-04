import {
  getCache,
  getCacheWithMetadata,
  setCache,
} from "@/lib/marketCache";

export class MarketCacheClient {
  static async get<T>(key: string): Promise<T | null> {
    return getCache<T>(key);
  }

  static async getWithMetadata<T>(key: string) {
    return getCacheWithMetadata<T>(key);
  }

  static async set<T>(
    key: string,
    value: T,
    ttl: number
  ) {
    return setCache(key, value, ttl);
  }
}