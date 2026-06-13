import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/marketCache";

const BINANCE_BASE = "https://api.binance.com/api/v3";

export async function GET() {
  try {
    const key = "tickers:24hr";

    const cached = await getCache(key);
    if (cached && Array.isArray(cached)) {
      return NextResponse.json(cached);
    }

    const res = await fetch(`${BINANCE_BASE}/ticker/24hr`, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!res.ok) {
      throw new Error(`Binance HTTP ${res.status}`);
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error("Invalid Binance response (not array)");
    }

    await setCache(key, data, 10);

    return NextResponse.json(data);
  } catch (err) {
    console.error("Ticker API Error:", err);

    return NextResponse.json([], { status: 200 }); // 🔥 NEVER BREAK UI
  }
}