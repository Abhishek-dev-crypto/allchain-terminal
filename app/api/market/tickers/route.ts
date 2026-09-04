import { NextResponse } from "next/server";
import { cacheOrchestrator } from "@/lib/market/cache/cacheOrchestrator";

const CACHE_KEY = "market:tickers:v1";

export async function GET() {
  try {
    const result = await cacheOrchestrator({
      key: CACHE_KEY,
      type: "ticker",

      fetcher: async () => {
        const res = await fetch(
          "https://api.binance.com/api/v3/ticker/24hr"
        );

        if (!res.ok) {
          throw new Error(`Binance error: ${res.status}`);
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          return [];
        }

        const STABLES = [
          "USDCUSDT",
          "BUSDUSDT",
          "FDUSDUSDT",
        ];

        return data
          .filter(
            (d: any) =>
              typeof d.symbol === "string" &&
              d.symbol.endsWith("USDT") &&
              !STABLES.includes(d.symbol)
          )
          .sort(
            (a: any, b: any) =>
              Number(b.quoteVolume || 0) -
              Number(a.quoteVolume || 0)
          )
          .slice(0, 100)
          .map((d: any) => ({
            symbol: d.symbol,
            lastPrice: Number(d.lastPrice || 0),
            priceChangePercent: Number(
              d.priceChangePercent || 0
            ),
            quoteVolume: Number(d.quoteVolume || 0),
            highPrice: Number(d.highPrice || 0),
            lowPrice: Number(d.lowPrice || 0),
          }));
      },

      enableHotCache: true,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Tickers error:", err);

    return NextResponse.json([], {
      status: 200,
    });
  }
}