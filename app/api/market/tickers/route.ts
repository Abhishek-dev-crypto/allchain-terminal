import { NextResponse } from "next/server";
import { getCache, setCache, fetchWithLock } from "@/lib/marketCache";

const CACHE_KEY = "market:tickers:v1";
const TTL = 15; // good balance for 24hr ticker data

export async function GET() {
  try {
    // 1. CHECK CACHE FIRST (FAST PATH)
    const cached = await getCache<any[]>(CACHE_KEY);
    if (cached) {
      return NextResponse.json(cached);
    }

    // 2. FETCH WITH DEDUPE LOCK (PREVENT STORM CALLS)
    const data = await fetchWithLock(CACHE_KEY, async () => {
      const res = await fetch("https://api.binance.com/api/v3/ticker/24hr");

      if (!res.ok) {
        throw new Error(`Binance error: ${res.status}`);
      }

      return res.json();
    });

    if (!Array.isArray(data)) {
      return NextResponse.json([]);
    }

    // 3. PROCESS DATA
    const STABLES = ["USDCUSDT", "BUSDUSDT", "FDUSDUSDT"];

    const result = data
      .filter(
        (d: any) =>
          typeof d.symbol === "string" &&
          d.symbol.endsWith("USDT") &&
          !STABLES.includes(d.symbol)
      )
      .sort(
        (a: any, b: any) =>
          Number(b.quoteVolume || 0) - Number(a.quoteVolume || 0)
      )
      .slice(0, 100)
      .map((d: any) => ({
        symbol: d.symbol,
        lastPrice: Number(d.lastPrice || 0),
        priceChangePercent: Number(d.priceChangePercent || 0),
        quoteVolume: Number(d.quoteVolume || 0),
        highPrice: Number(d.highPrice || 0),
        lowPrice: Number(d.lowPrice || 0),
      }));

    // 4. SAVE TO CACHE (SLOW PATH ONLY)
    await setCache(CACHE_KEY, result, TTL);

    return NextResponse.json(result);
  } catch (err) {
    console.error("Tickers error:", err);
    return NextResponse.json([]);
  }
}