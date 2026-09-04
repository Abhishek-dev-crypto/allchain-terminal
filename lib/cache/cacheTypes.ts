export type CacheState =
  | "FRESH"
  | "STALE"
  | "MISS";

export type CacheResult<T> = {
  data: T;
  state: CacheState;
  age: number;
};

export type CacheOptions<T> = {
  key: string;

  ttl: number;

  /**
   * Maximum amount of time stale data
   * may remain available in Redis.
   */
  staleTtl?: number;

  /**
   * Function used when cache cannot provide
   * fresh data.
   */
  fetcher: () => Promise<T>;

  /**
   * Enable L1 process memory cache.
   */
  enableMemoryCache?: boolean;

  /**
   * Enable stale-while-revalidate.
   */
  staleWhileRevalidate?: boolean;
};