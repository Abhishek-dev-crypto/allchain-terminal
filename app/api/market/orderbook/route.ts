// app/api/market/orderbook/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/marketCache";

const BINANCE_BASE = "https://api.binance.com/api/v3";

export async function GET(req: NextRequest) {
  try {
    const symbol =
      req.nextUrl.searchParams.get("symbol") || "BTCUSDT";

    const key = `orderbook:${symbol}`;

    // 1. Redis cache
    const cached = await getCache(key);

    if (cached) {
      return NextResponse.json(cached);
    }

    // 2. Binance
    const res = await fetch(
      `${BINANCE_BASE}/depth?symbol=${symbol}&limit=20`
    );

    const data = await res.json();

    const result = {
      bids: data.bids || [],
      asks: data.asks || [],
    };

    // 3. Cache for 3 seconds
    await setCache(key, result, 3);

    return NextResponse.json(result);

  } catch (err) {
    console.error("Orderbook API Error:", err);

    return NextResponse.json(
      { error: "Failed to fetch order book" },
      { status: 500 }
    );
  }
}