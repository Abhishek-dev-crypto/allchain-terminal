import { NextResponse } from "next/server";

import { cachedFetch } from "@/lib/cache/cachedFetch";
import { cacheTTL } from "@/lib/cache/cacheTTL";

const REQUEST_TIMEOUT = 8000;

export async function GET() {
  try {
    const data = await cachedFetch({
      key: "market:global",
      ttl: cacheTTL.global,

      fetcher: async () => {
        const controller = new AbortController();

        const timeout = setTimeout(() => {
          controller.abort();
        }, REQUEST_TIMEOUT);

        try {
          const res = await fetch(
            "https://api.coingecko.com/api/v3/global",
            {
              signal: controller.signal,
            }
          );

          if (!res.ok) {
            throw new Error("CoinGecko fetch failed");
          }

          return await res.json();
        } finally {
          clearTimeout(timeout);
        }
      },
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error("Global API Error:", err);

    return NextResponse.json(
      {
        error: "Failed to fetch global market data",
      },
      {
        status: 500,
      }
    );
  }
}