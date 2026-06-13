// app/api/test-binance/route.ts

import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch(
    "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
  );

  const text = await res.text();

  return NextResponse.json({
    status: res.status,
    body: text,
  });
}
