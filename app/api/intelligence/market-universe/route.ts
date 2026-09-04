import { NextResponse } from "next/server";
import { getMarketUniverse } from "@/lib/market/MarketUniverse";

export async function GET() {
  try {
    const universe =
      await getMarketUniverse();

    return NextResponse.json(
      universe
    );
  } catch (error) {
    console.error(
      "Market Universe Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Market universe unavailable",
      },
      {
        status: 500,
      }
    );
  }
}