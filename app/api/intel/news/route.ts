import { NextResponse } from "next/server";

export async function GET() {
  try {
    // =========================
    // COINTELEGRAPH RSS
    // =========================
    const rssRes = await fetch(
      "https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss",
      {
        next: { revalidate: 300 },
      }
    );

    const rssData = await rssRes.json();

    const rssItems = (rssData.items || []).map((item: any) => ({
      title: item.title,
      url: item.link,
      source: "CoinTelegraph",
    }));

    // =========================
    // COINDESK RSS
    // =========================
    const cdRes = await fetch(
      "https://api.rss2json.com/v1/api.json?rss_url=https://www.coindesk.com/arc/outboundfeeds/rss/",
      {
        next: { revalidate: 300 },
      }
    );

    const cdData = await cdRes.json();

    const cdItems = (cdData.items || []).map((item: any) => ({
      title: item.title,
      url: item.link,
      source: "CoinDesk",
    }));

    // =========================
    // MERGE
    // =========================
    const merged = [...rssItems, ...cdItems];

    return NextResponse.json(merged);
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}