import { NextResponse } from "next/server";
import { forecastMarketRegime } from "@/lib/intelligence/marketRegimeForecast";

export async function GET() {
  try {
    const forecast = await forecastMarketRegime();

    return NextResponse.json(
      {
        ...forecast,
        meta: {
          engine: "Market Regime Forecast Engine v1",
          methodology:
            "Cross-asset crypto market regime analysis",
          horizon: "7D",
        },
      },
      {
        headers: {
          "Cache-Control":
            "public, max-age=30, stale-while-revalidate=60",
          "CDN-Cache-Control":
            "public, max-age=30",
        },
      }
    );
  } catch (error) {
    console.error(
      "Market Regime Forecast Error:",
      error
    );

    return NextResponse.json(
      {
        error: "Market regime forecast unavailable",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}