import { NextResponse } from "next/server";

import { marketEngine } from "@/lib/market/MarketEngine";

import {
  forecastRegime,
} from "@/lib/intelligence/regimeForecast";

/* =========================================================
   CONFIG
========================================================= */

const ASSETS = [
  {
    asset: "Bitcoin",
    symbol: "BTC",
    marketSymbol: "BTCUSDT",
  },
  {
    asset: "Ethereum",
    symbol: "ETH",
    marketSymbol: "ETHUSDT",
  },
  {
    asset: "Solana",
    symbol: "SOL",
    marketSymbol: "SOLUSDT",
  },
];

/* =========================================================
   GET
========================================================= */

export async function GET() {
  try {
    const results = await Promise.all(
      ASSETS.map(async (asset) => {
        const [
          candles1h,
          candles4h,
          candles1d,
        ] = await Promise.all([
          marketEngine.getCandles(
            asset.marketSymbol,
            "1h"
          ),

          marketEngine.getCandles(
            asset.marketSymbol,
            "4h"
          ),

          marketEngine.getCandles(
            asset.marketSymbol,
            "1d"
          ),
        ]);

        const forecast = forecastRegime({
          symbol: asset.symbol,
          candles1h,
          candles4h,
          candles1d,
        });

        return {
          ...forecast,
          asset: asset.asset,
          symbol: asset.symbol,
        };
      })
    );

    return NextResponse.json(
      {
        signals: results,

        meta: {
          horizon: "7D",

          engine:
            "Regime Forecast Engine v1",

          methodology:
            "Multi-timeframe market regime analysis",

          generatedAt:
            new Date().toISOString(),
        },
      },
      {
        headers: {
          /*
            Keep API responses short-lived.

            MarketEngine itself already handles the
            underlying candle caching.
          */

          "Cache-Control":
            "public, max-age=15, stale-while-revalidate=30",

          "CDN-Cache-Control":
            "public, max-age=15",
        },
      }
    );
  } catch (error) {
    console.error(
      "Regime Forecast API Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Regime forecast unavailable",
      },
      {
        status: 500,

        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  }
}