import type { Ticker, Candle } from "../types";

export type Timeframe = "1m" | "5m" | "15m" | "30m" | "1h";

export type MarketCandles = Record<Timeframe, Candle[]>;

export type MarketSnapshot = {
  symbol: string;
  ticker: Ticker;
  candles: MarketCandles;
  timestamp: number;
};

export type MarketState = {
  loading: boolean;
  error?: string;
  snapshot?: MarketSnapshot;
};