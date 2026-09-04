import { NextResponse } from "next/server";

import { buildMarketSnapshot } from "@/lib/intel/buildMarketSnapshot";
import { buildMomentumTimeline } from "@/lib/intel/buildMomentumTimeline";

export async function GET() {
  try {
    /*
     * Get current real market data.
     *
     * The heatmap API already handles:
     * - CoinGecko
     * - caching
     * - formatting
     */
    const marketResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/intel/heatmap`,
      {
        cache: "no-store",
      }
    );

    if (!marketResponse.ok) {
      throw new Error(
        "Failed to fetch current market data"
      );
    }

    const coins = await marketResponse.json();

    if (!Array.isArray(coins) || !coins.length) {
      throw new Error(
        "Current market data is empty"
      );
    }

    /*
     * Build the current market snapshot using
     * the same intelligence engine used elsewhere.
     */
    const currentSnapshot =
      buildMarketSnapshot(coins);

    /*
     * Build the complete historical momentum
     * timeline from real Redis snapshots.
     */
    const timeline =
      await buildMomentumTimeline(
        currentSnapshot
      );

    return NextResponse.json(timeline);
  } catch (error) {
    console.error(
      "Momentum Timeline API Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to build momentum timeline",
      },
      {
        status: 500,
      }
    );
  }
}