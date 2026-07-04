import { NextRequest, NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/marketCache";

function generateSyntheticOrderbook(price: number) {
  const depth = 10;
  const spread = price * 0.002; // 0.2%

  const bids = [];
  const asks = [];

  for (let i = 0; i < depth; i++) {
    const bidPrice = price - spread * (i + 1);
    const askPrice = price + spread * (i + 1);

    bids.push([
      bidPrice.toFixed(2),
      (Math.random() * 5 + 1).toFixed(4),
    ]);

    asks.push([
      askPrice.toFixed(2),
      (Math.random() * 5 + 1).toFixed(4),
    ]);
  }

  return { bids, asks };
}

export async function GET(req: NextRequest) {
  try {
    const symbol =
      req.nextUrl.searchParams.get("symbol") || "BTCUSDT";

    const key = `orderbook:${symbol}`;

    // 1. Cache
    const cached = await getCache(key);
    if (cached) {
      return NextResponse.json(cached);
    }

    // 2. Get reference price from ticker cache or fallback
    const tickerCacheKey = `ticker:${symbol}`;
    const ticker = (await getCache(tickerCacheKey)) as
  | { lastPrice: number }
  | null;

    const price =
      ticker?.lastPrice || 60000; // fallback safe price

    // 3. Generate synthetic orderbook
    const result = generateSyntheticOrderbook(Number(price));

    // 4. Cache
    await setCache(key, result, 2);

    return NextResponse.json(result);
  } catch (err) {
    console.error("Orderbook API Error:", err);

    return NextResponse.json(
      { bids: [], asks: [] },
      { status: 200 }
    );
  }
}

