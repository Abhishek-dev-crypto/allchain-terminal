import { NextResponse } from "next/server";
import { marketEngine } from "@/lib/market/MarketEngine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const symbol = searchParams.get("symbol");
    const interval = searchParams.get("interval") || "1m";

    if (!symbol) {
      return NextResponse.json({ error: "Missing symbol" }, { status: 400 });
    }

    const data = await marketEngine.getCandles(symbol, interval);

    return NextResponse.json(data);
  } catch (err) {
    console.error("Klines API Error:", err);

    return NextResponse.json([], { status: 200 });
  }
}