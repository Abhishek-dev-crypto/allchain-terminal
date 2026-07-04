import { NextResponse } from "next/server";

import { cachedFetch } from "@/lib/cache/cachedFetch";
import { cacheTTL } from "@/lib/cache/cacheTTL";

const REQUEST_TIMEOUT = 8000;

export async function GET() {
  try {
    const fearGreed = await cachedFetch({
      key: "market:fear-greed",
      ttl: cacheTTL.fearGreed,

      fetcher: async () => {
        const controller = new AbortController();

        const timeout = setTimeout(() => {
          controller.abort();
        }, REQUEST_TIMEOUT);

        try {
          const res = await fetch(
            "https://api.alternative.me/fng/?limit=1",
            {
              signal: controller.signal,
              next: {
                revalidate: 300,
              },
            }
          );

          if (!res.ok) {
            throw new Error("Fear & Greed fetch failed");
          }

          return await res.json();
        } finally {
          clearTimeout(timeout);
        }
      },
    });

    return NextResponse.json(fearGreed);
  } catch (err) {
    console.error("Fear & Greed API Error:", err);

    return NextResponse.json(
      {
        error: "Failed to fetch Fear & Greed Index",
      },
      {
        status: 500,
      }
    );
  }
}