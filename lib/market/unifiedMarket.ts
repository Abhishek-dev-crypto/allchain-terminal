import { getCache, setCache } from "@/lib/marketCache";
import { getCoinGeckoId } from "@/lib/coingeckoSymbolMap";

export async function getUnifiedMarket(symbol: string) {
  const cacheKey = `umdl:${symbol}`;

  // 1. CACHE FIRST
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const coinId = getCoinGeckoId(symbol);

  if (!coinId) {
    throw new Error(`Unsupported symbol: ${symbol}`);
  }

  // 2. COINGECKO FETCH
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`
  );

  if (!res.ok) {
    throw new Error(`CoinGecko HTTP ${res.status}`);
  }

  const data = await res.json();
  const coin = data?.[coinId];

  if (!coin) throw new Error("Invalid CoinGecko response");

  const result = {
    symbol,
    price: coin.usd ?? null,
    change24h: coin.usd_24h_change ?? null,
    high24h: null,
    low24h: null,
    volume24h: null,

    source: "coingecko",
    timestamp: Date.now(),
  };

  // 3. CACHE
  await setCache(cacheKey, result, 10);

  return result;
}