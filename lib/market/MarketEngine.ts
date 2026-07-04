import "server-only";

import type { Ticker, Candle, MarketSnapshot } from "./types";

import { getTickerPrice, getKlines } from "./binanceClient";
import { getCoinGeckoPrice } from "./coinGeckoClient";

import { buildMarketContextFromCandles } from "./cache/marketContext";
import { cacheOrchestrator } from "./cache/cacheOrchestrator";

class MarketEngine {
  private static instance: MarketEngine;

  // ONLY dedupe layer (NOT cache)
  private inflightTicker = new Map<string, Promise<Ticker>>();
  private inflightCandles = new Map<string, Promise<Candle[]>>();
  private inflightSnapshot = new Map<string, Promise<MarketSnapshot>>();

  static getInstance() {
    if (!MarketEngine.instance) {
      MarketEngine.instance = new MarketEngine();
    }
    return MarketEngine.instance;
  }

  // =========================
  // TICKER
  // =========================
 
async getTicker(symbol: string): Promise<Ticker> {
  const key = `ticker:${symbol}`;

  if (this.inflightTicker.has(key)) {
    return this.inflightTicker.get(key)!;
  }

  const promise = cacheOrchestrator<Ticker>({
    key,
    type: "ticker",

    fetcher: () => this.fetchTicker(symbol),

    getContext: () => ({
      symbol,
      volatility: 3,
      momentum: 0,
      regime: "TRENDING",
    }),
  });

  this.inflightTicker.set(key, promise);

  try {
    return await promise;
  } finally {
    this.inflightTicker.delete(key);
  }
}

  private async fetchTicker(symbol: string): Promise<Ticker> {
    try {
      const start = performance.now();

      const d = await getTickerPrice(symbol);

      console.log(
         `⚡ Binance Ticker ${symbol}: ${(performance.now() - start).toFixed(0)}ms`
        );

      return {
        symbol,
        price: Number(d.price || 0),
        change24h: Number(d.change24h || 0),
        high24h: Number(d.high24h || 0),
        low24h: Number(d.low24h || 0),
        volume24h: Number(d.volume24h || 0),
        source: "binance",
        timestamp: Date.now(),
      };
    } catch {
      const cg = await getCoinGeckoPrice(symbol);

      return {
        symbol,
        price: Number(cg.price || 0),
        change24h: Number(cg.change24h || 0),
        high24h: 0,
        low24h: 0,
        volume24h: 0,
        source: "coingecko",
        timestamp: Date.now(),
      };
    }
  }
  // =========================
// CANDLES
// =========================
async getCandles(
  symbol: string,
  interval = "1m"
): Promise<Candle[]> {
  const key = `candles:${symbol}:${interval}`;

  if (this.inflightCandles.has(key)) {
    return this.inflightCandles.get(key)!;
  }

  const promise = cacheOrchestrator<Candle[]>({
    key,
    type: "candles",

    fetcher: async () => {
      const start = performance.now();

      const result = await getKlines(symbol, interval);

      console.log(
       `📈 ${symbol} ${interval}: ${(performance.now() - start).toFixed(0)}ms`
      );

      return (result || [])
        .filter(
          (c: any) =>
            c &&
            typeof c.time === "number" &&
            typeof c.close === "number"
        )
        .map((c: any) => ({
          time: Number(c.time),
          open: Number(c.open),
          high: Number(c.high),
          low: Number(c.low),
          close: Number(c.close),
          volume: Number(c.volume || 0),
        }));
    },

    getContext: (candles) =>
      buildMarketContextFromCandles([candles], symbol, interval),
  });

  this.inflightCandles.set(key, promise);

  try {
    return await promise;
  } finally {
    this.inflightCandles.delete(key);
  }
}

// =========================
// SNAPSHOT
// =========================
async getSnapshot(symbol: string): Promise<MarketSnapshot> {
  const key = `snapshot:${symbol}`;

  if (this.inflightSnapshot.has(key)) {
    return this.inflightSnapshot.get(key)!;
  }

  const promise = cacheOrchestrator<MarketSnapshot>({
    key,
    type: "snapshot",

    fetcher: () => this.buildSnapshot(symbol),

    getContext: (snapshot) =>
      buildMarketContextFromCandles(
        [
          snapshot.candles["1m"],
          snapshot.candles["5m"],
          snapshot.candles["15m"],
          snapshot.candles["30m"],
          snapshot.candles["1h"],
          snapshot.candles["4h"],
          snapshot.candles["1d"],
        ],
        symbol
      ),
  });

  this.inflightSnapshot.set(key, promise);

  try {
    return await promise;
  } finally {
    this.inflightSnapshot.delete(key);
  }
}
  // =========================
  // SNAPSHOT BUILDER
  // =========================
 private async buildSnapshot(symbol: string): Promise<MarketSnapshot> {
  const start = performance.now();
  const [
    ticker,
    c1,
    c5,
    c15,
    c30,
    c1h,
    c4h,
    c1d,
  ] = await Promise.all([
    this.getTicker(symbol),
    this.getCandles(symbol, "1m"),
    this.getCandles(symbol, "5m"),
    this.getCandles(symbol, "15m"),
    this.getCandles(symbol, "30m"),
    this.getCandles(symbol, "1h"),
    this.getCandles(symbol, "4h"),
    this.getCandles(symbol, "1d"),
  ]);

  const safeCandles = (arr: any[] = []): Candle[] =>
    (arr || [])
      .filter(
        (c) =>
          c &&
          typeof c.time === "number" &&
          typeof c.close === "number"
      )
      .map((c) => ({
        time: Number(c.time),
        open: Number(c.open || 0),
        high: Number(c.high || 0),
        low: Number(c.low || 0),
        close: Number(c.close || 0),
        volume: Number(c.volume || 0),
      }));

      console.log(
  `📦 Snapshot ${symbol}: ${(performance.now() - start).toFixed(0)}ms`
);

  return {
    ticker,
    candles: {
      "1m": safeCandles(c1),
      "5m": safeCandles(c5),
      "15m": safeCandles(c15),
      "30m": safeCandles(c30),
      "1h": safeCandles(c1h),
      "4h": safeCandles(c4h),
      "1d": safeCandles(c1d),
    },
  };
}
}

export const marketEngine = MarketEngine.getInstance();

import { startMarketWorker } from "./backgroundMarketWorker";

startMarketWorker();