import { NextResponse } from 'next/server';
import { cachedFetch } from "@/lib/cache/cachedFetch";
import { cacheTTL } from "@/lib/cache/cacheTTL";
import { recordMarketSnapshot } from "@/lib/intel/marketSnapshotHistory";


export async function GET() {
  try {
    const formatted = await cachedFetch({
  key: "market:heatmap",
  ttl: cacheTTL.heatmap,

  fetcher: async () => {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 8000);

    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false",
        {
          signal: controller.signal,
        }
      );

      if (!res.ok) {
        throw new Error("CoinGecko fetch failed");
      }

     const data = await res.json();

const coins = data.map((coin: any) => ({
  id: coin.id,
  symbol: coin.symbol.toUpperCase(),
  price: coin.current_price,
  change24h: coin.price_change_percentage_24h ?? 0,
  high24h: coin.high_24h ?? undefined,
  low24h: coin.low_24h ?? undefined,
  marketCap: coin.market_cap,
  volume24h: coin.total_volume ?? 0,
}));

return coins;

    } finally {
      clearTimeout(timeout);
    }
  },
});


/* =========================================================
   RECORD REAL HISTORICAL OBSERVATION
========================================================= */

try {
  await recordMarketSnapshot(formatted);
} catch (error) {
  console.error(
    "Market snapshot history recording failed:",
    error
  );
}

return NextResponse.json(formatted);
  } catch (err) {
    console.error("Heatmap API Error:", err);

    return NextResponse.json(
      {
        error: "Failed to fetch heatmap",
      },
      {
        status: 500,
      }
    );
  }
}