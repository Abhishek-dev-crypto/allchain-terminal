import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/marketCache";

const BINANCE_BASE = "https://api.binance.com/api/v3";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const symbol = searchParams.get("symbol");

    if (!symbol) {
      return NextResponse.json(
        { error: "Missing symbol" },
        { status: 400 }
      );
    }

    const cacheKey = `ticker:${symbol}`;

    const cached = await getCache(cacheKey);

    if (cached) {
      return NextResponse.json(cached);
    }

    const res = await fetch(
      `${BINANCE_BASE}/ticker/24hr?symbol=${symbol}`
    );

    if (!res.ok) {
      throw new Error("Binance request failed");
    }

    const data = await res.json();

    const result = {
      symbol: data.symbol,
      lastPrice: data.lastPrice,
      priceChangePercent: data.priceChangePercent,
      highPrice: data.highPrice,
      lowPrice: data.lowPrice,
      volume: data.volume,
    };

    await setCache(cacheKey, result, 3);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Ticker API Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch ticker" },
      { status: 500 }
    );
  }
}