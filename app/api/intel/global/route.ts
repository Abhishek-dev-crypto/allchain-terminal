import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/global",
      {
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      throw new Error("CoinGecko fetch failed");
    }

    const data = await res.json();

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 }
    );
  }
}