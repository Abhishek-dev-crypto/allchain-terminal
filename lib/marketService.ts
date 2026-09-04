// lib/marketService.ts

import { cacheOrchestrator } from "@/lib/market/cache/cacheOrchestrator";

const BINANCE_BASE = "https://api.binance.com/api/v3";

/* =========================================================
   TYPES
========================================================= */

export type TickerPrice = {
  symbol: string;
  price: number;
};

export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

/* =========================================================
   TICKER PRICE
========================================================= */

export async function getTickerPrice(
  symbol: string
): Promise<TickerPrice> {
  const normalizedSymbol = symbol.toUpperCase();

  const key = `price:${normalizedSymbol}`;

  return cacheOrchestrator<TickerPrice>({
    key,

    type: "ticker",

    fetcher: async () => {
      const res = await fetch(
        `${BINANCE_BASE}/ticker/price?symbol=${normalizedSymbol}`
      );

      if (!res.ok) {
        throw new Error(
          `Binance ticker error: ${res.status}`
        );
      }

      const data = await res.json();

      if (
        !data ||
        typeof data.symbol !== "string" ||
        typeof data.price !== "string"
      ) {
        throw new Error(
          "Invalid Binance ticker response"
        );
      }

      return {
        symbol: data.symbol,
        price: Number(data.price),
      };
    },

    getContext: () => ({
      symbol: normalizedSymbol,
      volatility: 3,
      momentum: 0,
      regime: "TRENDING",
    }),
  });
}

/* =========================================================
   MULTIPLE PRICES
========================================================= */

export async function getMultiplePrices(
  symbols: string[]
): Promise<TickerPrice[]> {
  const normalizedSymbols = [
    ...new Set(
      symbols.map((symbol) =>
        symbol.toUpperCase()
      )
    ),
  ].sort();

  if (normalizedSymbols.length === 0) {
    return [];
  }

  const key = `multi:${normalizedSymbols.join(",")}`;

  return cacheOrchestrator<TickerPrice[]>({
    key,

    type: "ticker",

    fetcher: async () => {
      const res = await fetch(
        `${BINANCE_BASE}/ticker/price`
      );

      if (!res.ok) {
        throw new Error(
          `Binance multiple ticker error: ${res.status}`
        );
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error(
          "Invalid Binance ticker response"
        );
      }

      const symbolSet =
        new Set(normalizedSymbols);

      return data
        .filter(
          (coin: any) =>
            typeof coin?.symbol === "string" &&
            symbolSet.has(
              coin.symbol.toUpperCase()
            )
        )
        .map((coin: any) => ({
          symbol: coin.symbol,
          price: Number(coin.price || 0),
        }));
    },

    getContext: () => ({
      symbol: "MULTIPLE",
      volatility: 3,
      momentum: 0,
      regime: "TRENDING",
    }),
  });
}

/* =========================================================
   KLINES
========================================================= */

export async function getKlines(
  symbol: string,
  interval = "1m"
): Promise<Candle[]> {
  const normalizedSymbol =
    symbol.toUpperCase();

  const key =
    `klines:${normalizedSymbol}:${interval}`;

  return cacheOrchestrator<Candle[]>({
    key,

    type: "candles",

    fetcher: async () => {
      const res = await fetch(
        `${BINANCE_BASE}/klines?symbol=${normalizedSymbol}&interval=${interval}&limit=100`
      );

      if (!res.ok) {
        throw new Error(
          `Binance klines error: ${res.status}`
        );
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error(
          "Invalid Binance klines response"
        );
      }

      const map =
        new Map<number, Candle>();

      for (const c of data) {
        if (!Array.isArray(c) || c.length < 6) {
          continue;
        }

        const time =
          Math.floor(Number(c[0]) / 1000);

        map.set(time, {
          time,

          open: Number(c[1]),

          high: Number(c[2]),

          low: Number(c[3]),

          close: Number(c[4]),

          volume: Number(c[5]),
        });
      }

      return Array.from(
        map.values()
      ).sort(
        (a, b) =>
          a.time - b.time
      );
    },

    getContext: (candles) => {
      const closes = candles.map(
        (c) => c.close
      );

      const ranges = candles.map(
        (c) => c.high - c.low
      );

      const avg = (values: number[]) =>
        values.length
          ? values.reduce(
              (sum, value) =>
                sum + value,
              0
            ) / values.length
          : 0;

      const averageClose =
        avg(closes);

      const averageRange =
        avg(ranges);

      const volatility =
        averageClose > 0
          ? (averageRange /
              averageClose) *
            100
          : 0;

      const momentum =
        closes.length >= 2 &&
        closes[0] !== 0
          ? ((closes[closes.length - 1] -
              closes[0]) /
              closes[0]) *
            100
          : 0;

      const regime =
        volatility > 6
          ? "BREAKOUT"
          : volatility > 3
            ? "TRENDING"
            : "RANGING";

      return {
        symbol: normalizedSymbol,
        volatility,
        momentum,
        regime,
        timeframe: interval,
      };
    },
  });
}