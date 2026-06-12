import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

const BINANCE_BASE = "https://api.binance.com/api/v3";

export async function GET(req: NextRequest) {
  try {
    const symbol =
      req.nextUrl.searchParams.get("symbol") || "BTCUSDT";

    const interval =
      req.nextUrl.searchParams.get("interval") || "1m";

    const cacheKey = `klines:${symbol}:${interval}`;

    // 1. Check Redis
    const cached = await redis.get(cacheKey);

    if (cached) {
      return NextResponse.json(cached);
    }

    // 2. Binance
    const res = await fetch(
      `${BINANCE_BASE}/klines?symbol=${symbol}&interval=${interval}&limit=100`,
      {
        next: { revalidate: 0 },
      }
    );

    const data = await res.json();

    const result = data.map((c: any) => ({
      time: Math.floor(c[0] / 1000),
      open: parseFloat(c[1]),
      high: parseFloat(c[2]),
      low: parseFloat(c[3]),
      close: parseFloat(c[4]),
      volume: parseFloat(c[5]),
    }));

    // 3. Store in Redis
    await redis.set(cacheKey, result, {
      ex: 5,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Klines API Error:", error);

    return NextResponse.json(
      { error: "Failed to load klines" },
      { status: 500 }
    );
  }
}