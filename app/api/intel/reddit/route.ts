import { NextResponse } from "next/server";

import { cachedFetch } from "@/lib/cache/cachedFetch";
import { cacheTTL } from "@/lib/cache/cacheTTL";

const REQUEST_TIMEOUT = 8000;

type RedditPost = {
  data: {
    title: string;
    score: number;
    num_comments: number;
  };
};

type RedditResponse = {
  data?: {
    children?: RedditPost[];
  };
};

export async function GET() {
  try {
    const posts = await cachedFetch({
      key: "market:reddit",
      ttl: cacheTTL.reddit,

      fetcher: async () => {
        const controller = new AbortController();

        const timeout = setTimeout(() => {
          controller.abort();
        }, REQUEST_TIMEOUT);

        try {
          const res = await fetch(
            "https://www.reddit.com/r/cryptocurrency/top.json?limit=20",
            {
              signal: controller.signal,
              headers: {
                "User-Agent": "crypto-mvp/1.0",
              },
            }
          );

          if (!res.ok) {
            throw new Error("Reddit fetch failed");
          }

          const data: RedditResponse = await res.json();

          return (data.data?.children ?? []).map((post) => ({
            title: post.data.title,
            score: post.data.score,
            comments: post.data.num_comments,
          }));
        } finally {
          clearTimeout(timeout);
        }
      },
    });

    return NextResponse.json(posts);
  } catch (err) {
    console.error("Reddit API Error:", err);

    return NextResponse.json([], {
      status: 200,
    });
  }
}