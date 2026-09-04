const BINANCE_BASE = "https://api.binance.com/api/v3";

/* ---------------- TICKER ---------------- */
export async function getTickerPrice(symbol: string) {
  const res = await safeFetch(`${BINANCE_BASE}/ticker/24hr?symbol=${symbol}`);

  if (!res.ok) throw new Error("Binance ticker failed");

  const data = await res.json();

  return {
    symbol: data.symbol,
    price: Number(data.lastPrice),
    change24h: Number(data.priceChangePercent),
    high24h: Number(data.highPrice),
    low24h: Number(data.lowPrice),
    volume24h: Number(data.volume),
  };
}

/* ---------------- MULTI (FIXED) ---------------- */
export async function getMultiplePrices(symbols: string[]) {
  const res = await safeFetch(`${BINANCE_BASE}/ticker/24hr`);

  if (!res.ok) throw new Error("Binance multi ticker failed");

  const data = await res.json();

  const map = new Map(
  (data || [])
    .filter((c: any) => c?.symbol)
    .map((c: any) => [c.symbol, c])
);

  return symbols
  .map((symbol) => map.get(symbol))
  .filter((x): x is any => Boolean(x));
}

/* ---------------- EXCHANGE INFO ---------------- */

export type BinanceSymbolInfo = {
  symbol: string;
  status: string;
  baseAsset: string;
  quoteAsset: string;
  isSpotTradingAllowed: boolean;
};

let exchangeInfoCache:
  | {
      data: BinanceSymbolInfo[];
      expiresAt: number;
    }
  | null = null;

const EXCHANGE_INFO_TTL = 5 * 60 * 1000;

export async function getExchangeSymbols(): Promise<
  BinanceSymbolInfo[]
> {
  if (
    exchangeInfoCache &&
    Date.now() < exchangeInfoCache.expiresAt
  ) {
    return exchangeInfoCache.data;
  }

  const res = await safeFetch(
    `${BINANCE_BASE}/exchangeInfo`
  );

  if (!res.ok) {
    throw new Error(
      `Binance exchange info failed (${res.status})`
    );
  }

  const data = await res.json();

  const symbols: BinanceSymbolInfo[] = (
    data?.symbols ?? []
  )
    .filter(
      (item: any) =>
        item &&
        typeof item.symbol === "string" &&
        typeof item.status === "string" &&
        typeof item.baseAsset === "string" &&
        typeof item.quoteAsset === "string"
    )
    .map((item: any) => ({
      symbol: item.symbol,
      status: item.status,
      baseAsset: item.baseAsset,
      quoteAsset: item.quoteAsset,
      isSpotTradingAllowed:
        Boolean(item.isSpotTradingAllowed),
    }));

  exchangeInfoCache = {
    data: symbols,
    expiresAt:
      Date.now() + EXCHANGE_INFO_TTL,
  };

  return symbols;
}

/* ---------------- CANDLES ---------------- */
export async function getKlines(symbol: string, interval = "1m") {
  const res = await safeFetch(
    `${BINANCE_BASE}/klines?symbol=${symbol}&interval=${interval}&limit=200`
  );

  if (!res.ok) {
  const body = await res.text();

  console.error("Binance klines error", {
    status: res.status,
    body,
    symbol,
    interval,
  });

  throw new Error(`Binance klines failed (${res.status})`);
}

  const data = await res.json();

  if (!Array.isArray(data)) return [];

  return data
    .filter((c: any[]) => Array.isArray(c) && c.length >= 6)
    .map((c: any[]) => ({
      time: Number(c[0]), // 🔥 KEEP IN MILLISECONDS (IMPORTANT)
      open: Number(c[1]),
      high: Number(c[2]),
      low: Number(c[3]),
      close: Number(c[4]),
      volume: Number(c[5]),
    }));
}

export async function safeFetch(url: string, timeout = 12000) {
  const controller = new AbortController();

  const id = setTimeout(() => {
    console.error(`⏱️ Request timed out after ${timeout}ms: ${url}`);
    controller.abort();
  }, timeout);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
    });

    return res;
  } finally {
    clearTimeout(id);
  }
}