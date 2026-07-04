import { NextResponse } from "next/server";
import { marketEngine } from "@/lib/market/MarketEngine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");

    if (!symbol) {
      return NextResponse.json(
        { error: "Missing symbol" },
        { status: 400 }
      );
    }

    const snapshot = await marketEngine.getSnapshot(symbol);
    const data = snapshot?.ticker;

    // Safety normalization (prevents UI crashes)
    if (!data) {
      return NextResponse.json({
        symbol,
        price: null,
        change24h: null,
        source: "empty",
      });
    }

    return NextResponse.json({
      symbol: data.symbol ?? symbol,
      price: Number(data.price ?? 0),
      change24h: Number(data.change24h ?? 0),
      source: data.source ?? "marketEngine",
    });
  } catch (err) {
    console.error("Ticker API Error:", err);

    return NextResponse.json(
      {
        symbol: null,
        price: null,
        change24h: null,
        source: "error",
      },
      { status: 500 }
    );
  }
}