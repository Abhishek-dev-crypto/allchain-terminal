import "server-only";

import {
  getCache,
  setCache,
} from "@/lib/marketCache";

export class MarketCacheClient {

  /* =======================================================
     GET
  ======================================================= */

  static async get<T>(
    key: string
  ): Promise<T | null> {
    return getCache<T>(key);
  }

  /* =======================================================
     SET
  ======================================================= */

  static async set<T>(
    key: string,
    value: T,
    ttl: number
  ): Promise<void> {
    return setCache(
      key,
      value,
      ttl
    );
  }
}