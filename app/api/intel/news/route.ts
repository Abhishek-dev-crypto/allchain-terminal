import { NextResponse } from "next/server";

import { cachedFetch } from "@/lib/cache/cachedFetch";
import { cacheTTL } from "@/lib/cache/cacheTTL";

const REQUEST_TIMEOUT = 8000;

export async function GET() {
  try {
    const news = await cachedFetch({
      key: "market:news",
      ttl: cacheTTL.news,

      fetcher: async () => {
        const controller = new AbortController();

        const timeout = setTimeout(() => {
          controller.abort();
        }, REQUEST_TIMEOUT);

        try {
          const [rssRes, cdRes] = await Promise.all([
            fetch(
              "https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss",
              {
                signal: controller.signal,
              }
            ),
            fetch(
              "https://api.rss2json.com/v1/api.json?rss_url=https://www.coindesk.com/arc/outboundfeeds/rss/",
              {
                signal: controller.signal,
              }
            ),
          ]);

          if (!rssRes.ok || !cdRes.ok) {
            throw new Error("News provider fetch failed");
          }

          const [rssData, cdData] = await Promise.all([
            rssRes.json(),
            cdRes.json(),
          ]);

          const rssItems = (rssData.items || []).map((item: any) => ({
            title: item.title,
            url: item.link,
            source: "CoinTelegraph",
          }));

          const cdItems = (cdData.items || []).map((item: any) => ({
            title: item.title,
            url: item.link,
            source: "CoinDesk",
          }));

          return [...rssItems, ...cdItems];
        } finally {
          clearTimeout(timeout);
        }
      },
    });

    return NextResponse.json(news);
  } catch (err) {
    console.error("News API Error:", err);

    return NextResponse.json(
      {
        error: "Failed to fetch news",
      },
      {
        status: 500,
      }
    );
  }
}