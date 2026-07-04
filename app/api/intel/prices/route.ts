import { NextResponse } from "next/server";

import { cachedFetch } from "@/lib/cache/cachedFetch";
import { cacheTTL } from "@/lib/cache/cacheTTL";

const REQUEST_TIMEOUT = 8000;

export async function GET() {
  try {
    const prices = await cachedFetch({
      key: "market:prices",
      ttl: cacheTTL.prices,

      fetcher: async () => {
        const controller = new AbortController();

        const timeout = setTimeout(() => {
          controller.abort();
        }, REQUEST_TIMEOUT);

        try {
          const res = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true",
            {
              signal: controller.signal,
              next: {
                revalidate: 30,
              },
            }
          );

          if (!res.ok) {
            throw new Error("CoinGecko price fetch failed");
          }

          return await res.json();
        } finally {
          clearTimeout(timeout);
        }
      },
    });

    return NextResponse.json(prices);
  } catch (err) {
    console.error("Prices API Error:", err);

    return NextResponse.json(
      {
        error: "Failed to fetch prices",
      },
      {
        status: 500,
      }
    );
  }
}