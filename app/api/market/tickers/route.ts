import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/marketCache";

const BINANCE_BASE = "https://api.binance.com/api/v3";

export async function GET() {
  try {
    const key = "tickers:24hr";

    const cached = await getCache(key);

    if (cached) {
      return NextResponse.json(cached);
    }

    const res = await fetch(
      `${BINANCE_BASE}/ticker/24hr`
    );

    const data = await res.json();

    await setCache(key, data, 10);

    return NextResponse.json(data);
  } catch (err) {
    console.error("Ticker API Error:", err);

    return NextResponse.json(
      { error: "Failed to fetch tickers" },
      { status: 500 }
    );
  }
}