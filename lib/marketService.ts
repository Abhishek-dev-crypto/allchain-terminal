// lib/marketService.ts

import { getCache, setCache } from "@/lib/marketCache";

const BINANCE_BASE = "https://api.binance.com/api/v3";


export async function getTickerPrice(symbol: string) {
  const key = `price:${symbol}`;

  // 1. check cache
  const cached = await getCache(key);
  if (cached) return cached;

  // 2. fetch Binance
  const res = await fetch(
    `${BINANCE_BASE}/ticker/price?symbol=${symbol}`
  );

  const data = await res.json();

  const result = {
    symbol: data.symbol,
    price: parseFloat(data.price),
  };

  // 3. store cache
  await setCache(key, result, 3); // 3 sec cache

  return result;
}

export async function getMultiplePrices(symbols: string[]) {
  const key = `multi:${symbols.sort().join(",")}`;

  const cached = await getCache(key);
  if (cached) return cached;

  const res = await fetch(`${BINANCE_BASE}/ticker/price`);
  const data = await res.json();

  const result = data.filter((coin: any) =>
    symbols.includes(coin.symbol)
  );

  await setCache(key, result, 3);

  return result;
}

export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export async function getKlines(
  symbol: string,
  interval = "1m"
): Promise<Candle[]> {

  const key = `klines:${symbol}:${interval}`;

  const cached = await getCache(key) as Candle[] | null;

  if (cached) return cached;

  const res = await fetch(
    `${BINANCE_BASE}/klines?symbol=${symbol}&interval=${interval}&limit=100`
  );

  const data = await res.json();

  const map = new Map<number, Candle>();

  for (const c of data) {
    const time = Math.floor(c[0] / 1000);

    map.set(time, {
      time,
      open: parseFloat(c[1]),
      high: parseFloat(c[2]),
      low: parseFloat(c[3]),
      close: parseFloat(c[4]),
      volume: parseFloat(c[5]),
    });
  }

  const result = Array.from(map.values()).sort(
    (a, b) => a.time - b.time
  );

  await setCache(key, result, 5);

  return result;
}