import type { Candle } from "../types";

export type MarketContext = {
  volatility: number;
  momentum: number;
  regime: "TRENDING" | "RANGING" | "BREAKOUT";
  symbol: string;
  timeframe?: string;
};

function avg(arr: number[]) {
  return arr.length ? arr.reduce((a, b) => a + b) / arr.length : 0;
}

export function buildMarketContextFromCandles(
  candles: Candle[][],
  symbol: string,
    timeframe?: string
): MarketContext {
  const flat = candles.flat();

  const changes = flat.map(c => c.close - c.open);
  const momentum = avg(changes);

  const volatility =
    avg(flat.map(c => (c.high - c.low))) * 10;

  const regime =
    volatility > 6
      ? "BREAKOUT"
      : volatility > 3
      ? "TRENDING"
      : "RANGING";

  return {
    volatility,
    momentum,
    regime,
    symbol,
    timeframe,
  };
}