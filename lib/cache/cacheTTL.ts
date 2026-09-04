export const CACHE_TTL = {
  market: {
    ticker: 5,
    snapshot: 10,

    candles: {
      "1m": 5,
      "5m": 10,
      "15m": 20,
      "30m": 30,
      "1h": 60,
      "4h": 180,
      "1d": 600,
    },
  },

  intelligence: {
    heatmap: 30,
    overview: 30,
    signals: 15,
    narratives: 60,
  },

  external: {
    global: 60,
    fearGreed: 300,
    news: 300,
    reddit: 300,
  },
} as const;

/**
 * Temporary compatibility export.
 *
 * Existing parts of the application still use
 * the old cacheTTL name.
 *
 * We will remove this after migrating
 * those consumers to CACHE_TTL.
 */
export const cacheTTL = {
  heatmap: CACHE_TTL.intelligence.heatmap,
  overview: CACHE_TTL.intelligence.overview,
  prices: CACHE_TTL.market.ticker,
  global: CACHE_TTL.external.global,
  fearGreed: CACHE_TTL.external.fearGreed,
  news: CACHE_TTL.external.news,
  reddit: CACHE_TTL.external.reddit,
  narratives: CACHE_TTL.intelligence.narratives,
  signals: CACHE_TTL.intelligence.signals,
} as const;