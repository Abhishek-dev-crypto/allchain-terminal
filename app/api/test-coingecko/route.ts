import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/ping"
  );

  const data = await res.json();

  return NextResponse.json(data);
}