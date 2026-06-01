import { getMarketData } from "./market";
import { getRedditSentiment } from "./sentiment";
import { getWhaleData } from "./whales";
import { getNews } from "./narratives";

export async function getIntelSnapshot() {

  const [
    market,
    redditSentiment,
    whales,
    news,
  ] = await Promise.all([
    getMarketData(),
    getRedditSentiment(),
    getWhaleData(),
    getNews(),
  ]);

  // ================= FEAR & GREED =================
  let fearGreed = 50;

  try {
    const fearGreedRes = await fetch(
      "https://api.alternative.me/fng/"
    );

    const fearGreedJson =
      await fearGreedRes.json();

    fearGreed = Number(
      fearGreedJson?.data?.[0]?.value || 50
    );
  } catch (err) {
    console.error(
      "Fear & Greed fetch failed:",
      err
    );
  }

  const bias: "bullish" | "bearish" | "neutral" =
  fearGreed > 60
    ? "bullish"
    : fearGreed < 40
    ? "bearish"
    : "neutral";

const conviction: "high" | "medium" | "low" =
  fearGreed > 75 || fearGreed < 25
    ? "high"
    : fearGreed > 60 || fearGreed < 40
    ? "medium"
    : "low";

  return {
    market,

    sentiment: {
      fearGreed,
      bias,
      conviction,

      // optional reddit sentiment merge
      reddit: redditSentiment,
    },

    whales,
    news,

    timestamp: Date.now(),
  };
}