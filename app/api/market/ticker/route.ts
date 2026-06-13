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
      throw new Error(`Binance HTTP ${res.status}`);
    }

    const data = await res.json();

    if (!data || typeof data !== "object" || !data.symbol) {
      throw new Error("Invalid Binance response");
    }

    const result = {
      symbol: data.symbol,
      lastPrice: Number(data.lastPrice),
      priceChangePercent: Number(data.priceChangePercent),
      highPrice: Number(data.highPrice),
      lowPrice: Number(data.lowPrice),
      volume: Number(data.volume),
    };

    await setCache(cacheKey, result, 3);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Ticker API Error:", error);

    return NextResponse.json(
      {
        symbol: Symbol || null,
        lastPrice: 0,
        priceChangePercent: 0,
        highPrice: 0,
        lowPrice: 0,
        volume: 0,
      },
      { status: 200 } // 🔥 UI NEVER BREAKS
    );
  }
}