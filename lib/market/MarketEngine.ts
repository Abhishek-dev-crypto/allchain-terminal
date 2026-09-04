import "server-only";

import type {
  Ticker,
  Candle,
  MarketSnapshot,
} from "./types";

import {
  getTickerPrice,
  getKlines,
} from "./binanceClient";

import { getCoinGeckoPrice } from "./coinGeckoClient";

import {
  buildMarketContextFromCandles,
} from "./cache/marketContext";

import {
  cacheOrchestrator,
} from "./cache/cacheOrchestrator";

import { startMarketWorker } from "./backgroundMarketWorker";

class MarketEngine {
  private static instance: MarketEngine;

  /* =========================================================
     SINGLETON
  ========================================================= */

  static getInstance() {
    if (!MarketEngine.instance) {
      MarketEngine.instance =
        new MarketEngine();
    }

    return MarketEngine.instance;
  }

  /* =========================================================
     TICKER
  ========================================================= */

  async getTicker(
    symbol: string
  ): Promise<Ticker> {
    const normalizedSymbol =
      symbol.toUpperCase();

    const key =
      `ticker:${normalizedSymbol}`;

    return cacheOrchestrator<Ticker>({
      key,

      type: "ticker",

      fetcher: () =>
        this.fetchTicker(
          normalizedSymbol
        ),

      getContext: () => ({
        symbol: normalizedSymbol,
        volatility: 3,
        momentum: 0,
        regime: "TRENDING",
      }),
    });
  }

  /* =========================================================
     TICKER FETCHER
  ========================================================= */

  private async fetchTicker(
    symbol: string
  ): Promise<Ticker> {
    try {
      const start =
        performance.now();

      const d =
        await getTickerPrice(symbol);

      console.log(
        `⚡ Binance Ticker ${symbol}: ${(
          performance.now() - start
        ).toFixed(0)}ms`
      );

      return {
        symbol,

        price:
          Number(d.price || 0),

        change24h:
          Number(d.change24h || 0),

        high24h:
          Number(d.high24h || 0),

        low24h:
          Number(d.low24h || 0),

        volume24h:
          Number(d.volume24h || 0),

        source: "binance",

        timestamp:
          Date.now(),
      };

    } catch {
      /*
       * Binance fallback
       */
      const cg =
        await getCoinGeckoPrice(
          symbol
        );

      return {
        symbol,

        price:
          Number(cg.price || 0),

        change24h:
          Number(cg.change24h || 0),

        high24h: 0,

        low24h: 0,

        volume24h: 0,

        source: "coingecko",

        timestamp:
          Date.now(),
      };
    }
  }

  /* =========================================================
     CANDLES
  ========================================================= */

  async getCandles(
    symbol: string,
    interval = "1m"
  ): Promise<Candle[]> {
    const normalizedSymbol =
      symbol.toUpperCase();

    const key =
      `candles:${normalizedSymbol}:${interval}`;

    return cacheOrchestrator<Candle[]>({
      key,

      type: "candles",

      fetcher: async () => {
        const start =
          performance.now();

        const result =
          await getKlines(
            normalizedSymbol,
            interval
          );

        console.log(
          `📈 ${normalizedSymbol} ${interval}: ${(
            performance.now() - start
          ).toFixed(0)}ms`
        );

        return (result || [])
          .filter(
            (c: any) =>
              c &&
              typeof c.time ===
                "number" &&
              typeof c.close ===
                "number"
          )
          .map((c: any) => ({
            time:
              Number(c.time),

            open:
              Number(c.open),

            high:
              Number(c.high),

            low:
              Number(c.low),

            close:
              Number(c.close),

            volume:
              Number(c.volume || 0),
          }));
      },

      getContext: (candles) =>
        buildMarketContextFromCandles(
          [candles],
          normalizedSymbol,
          interval
        ),
    });
  }

  /* =========================================================
     SNAPSHOT
  ========================================================= */

  async getSnapshot(
    symbol: string
  ): Promise<MarketSnapshot> {
    const normalizedSymbol =
      symbol.toUpperCase();

    const key =
      `snapshot:${normalizedSymbol}`;

    return cacheOrchestrator<MarketSnapshot>({
      key,

      type: "snapshot",

      fetcher: () =>
        this.buildSnapshot(
          normalizedSymbol
        ),

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
          normalizedSymbol
        ),
    });
  }

  /* =========================================================
     SNAPSHOT BUILDER
  ========================================================= */

  private async buildSnapshot(
    symbol: string
  ): Promise<MarketSnapshot> {
    const start =
      performance.now();

    /*
     * All independent market requests
     * execute concurrently.
     *
     * Each request is independently
     * protected by cacheOrchestrator.
     */
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

      this.getCandles(
        symbol,
        "1m"
      ),

      this.getCandles(
        symbol,
        "5m"
      ),

      this.getCandles(
        symbol,
        "15m"
      ),

      this.getCandles(
        symbol,
        "30m"
      ),

      this.getCandles(
        symbol,
        "1h"
      ),

      this.getCandles(
        symbol,
        "4h"
      ),

      this.getCandles(
        symbol,
        "1d"
      ),
    ]);

    /* =======================================================
       SAFETY NORMALIZATION
    ======================================================= */

    const safeCandles = (
      arr: Candle[] = []
    ): Candle[] =>
      arr
        .filter(
          (c) =>
            c &&
            typeof c.time ===
              "number" &&
            typeof c.close ===
              "number"
        )
        .map((c) => ({
          time:
            Number(c.time),

          open:
            Number(c.open || 0),

          high:
            Number(c.high || 0),

          low:
            Number(c.low || 0),

          close:
            Number(c.close || 0),

          volume:
            Number(c.volume || 0),
        }));

    console.log(
      `📦 Snapshot ${symbol}: ${(
        performance.now() - start
      ).toFixed(0)}ms`
    );

    return {
      ticker,

      candles: {
        "1m":
          safeCandles(c1),

        "5m":
          safeCandles(c5),

        "15m":
          safeCandles(c15),

        "30m":
          safeCandles(c30),

        "1h":
          safeCandles(c1h),

        "4h":
          safeCandles(c4h),

        "1d":
          safeCandles(c1d),
      },
    };
  }
}

/* =========================================================
   SINGLETON INSTANCE
========================================================= */

export const marketEngine =
  MarketEngine.getInstance();

/* =========================================================
   DEVELOPMENT WORKER
========================================================= */

if (
  process.env.NODE_ENV !==
  "production"
) {
  startMarketWorker();
}