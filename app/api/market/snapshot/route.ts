import { NextResponse } from "next/server";
import { marketEngine } from "@/lib/market/MarketEngine";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const symbol = (searchParams.get("symbol") || "BTCUSDT").toUpperCase();

  try {
    // basic guard (prevents garbage queries hitting engine)
    if (!/^[A-Z0-9]+$/.test(symbol)) {
      return NextResponse.json(
        { error: "Invalid symbol" },
        { status: 400 }
      );
    }

    const snapshot = await marketEngine.getSnapshot(symbol);

    return NextResponse.json(snapshot, {
      headers: {
        // 🔥 prevents frontend spam requests from hammering server
        "Cache-Control": "public, max-age=2, stale-while-revalidate=5",

        // optional CDN caching
        "CDN-Cache-Control": "public, max-age=2",
      },
    });
  } catch (err) {
    console.error("Snapshot API Error:", err);

    return NextResponse.json(
      { error: "Snapshot failed" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}