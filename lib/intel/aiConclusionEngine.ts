type Narrative = {
  name: string;
  score: number;
  momentum: number;
  examples: string[];
};

type NewsItem = {
  title: string;
  source: string;
  sentiment: "bullish" | "bearish" | "neutral";
  url: string;
};

type AIConclusionInput = {
  score: number;
  narratives: Narrative[];
  items: NewsItem[];
  confidence: number;
};

type AIConclusion = {
  state: string;
  summary: string;
  outlook: string;
  risk: string;
  behavior: string;
  drivers: string[];
};

const narrativeTitles: Record<string, string> = {
  REGULATION: "Government Regulation",
  INSTITUTIONAL: "Institutional Buying",
  LIQUIDITY: "Global Money Flow",
  RETAIL_FOMO: "Retail Speculation",
  ETF_FLOW: "Bitcoin ETF Activity",
  WHALES: "Whale Activity",
  AI_CRYPTO: "AI Crypto Momentum",
  MEME_SPECULATION: "Meme Coin Speculation",
};

export const generateAIConclusion = ({
  score,
  narratives,
  items,
  confidence,
}: AIConclusionInput): AIConclusion => {
  // =========================
  // MARKET STATE
  // =========================
  let state = "Neutral";

  if (score >= 75) {
    state = "Strong Bullish";
  } else if (score >= 55) {
    state = "Bullish";
  } else if (score <= 25) {
    state = "Strong Bearish";
  } else if (score <= 45) {
    state = "Bearish";
  }

  // =========================
  // TOP NARRATIVE
  // =========================
  const topNarrative = narratives[0]?.name || "UNKNOWN";

  // =========================
  // SENTIMENT COUNTS
  // =========================
  const bullishCount = items.filter(
    (i) => i.sentiment === "bullish"
  ).length;

  const bearishCount = items.filter(
    (i) => i.sentiment === "bearish"
  ).length;

  // =========================
  // AI SUMMARY
  // =========================
  let summary =
    "Markets are showing mixed and uncertain conditions.";

  switch (topNarrative) {
    case "ETF_FLOW":
      summary =
        "Bitcoin ETF demand and institutional buying activity are helping support crypto market sentiment.";
      break;

    case "REGULATION":
      summary =
        "Government regulation and policy developments are becoming major market drivers.";
      break;

    case "LIQUIDITY":
      summary =
        "Global money flow and macroeconomic conditions are strongly influencing crypto prices.";
      break;

    case "INSTITUTIONAL":
      summary =
        "Large financial institutions and professional investors are increasing crypto market exposure.";
      break;

    case "RETAIL_FOMO":
      summary =
        "Retail speculation and social momentum are increasing across crypto markets.";
      break;

    case "WHALES":
      summary =
        "Large crypto holders are making significant trades that may impact market direction.";
      break;

    case "AI_CRYPTO":
      summary =
        "AI-related crypto projects are gaining investor attention and speculative momentum.";
      break;

    case "MEME_SPECULATION":
      summary =
        "High-risk meme coin trading activity is increasing across retail markets.";
      break;
  }

  // =========================
  // MARKET OUTLOOK
  // =========================
  let outlook =
    "Markets may continue moving sideways until stronger momentum appears.";

  if (bullishCount > bearishCount + 3) {
    outlook =
      "Bullish momentum may continue building if buying pressure remains strong.";
  }

  if (bearishCount > bullishCount + 3) {
    outlook =
      "Short-term downside volatility may continue if negative sentiment increases.";
  }

  if (score >= 70) {
    outlook =
      "Market momentum is improving and risk appetite appears to be strengthening.";
  }

  if (score <= 30) {
    outlook =
      "Defensive market behavior and elevated volatility may continue short term.";
  }

  // =========================
  // RISK LEVEL
  // =========================
  let risk = "Medium";

  if (score >= 70 && confidence >= 75) {
    risk = "Low";
  }

  if (score <= 35) {
    risk = "High";
  }

  // =========================
  // AI BEHAVIOR ANALYSIS
  // =========================
  let behavior =
    "Traders appear cautious while waiting for clearer market direction.";

  switch (topNarrative) {
    case "INSTITUTIONAL":
      behavior =
        "Large investors appear to be steadily accumulating positions.";
      break;

    case "RETAIL_FOMO":
      behavior =
        "Retail traders appear increasingly aggressive and momentum-driven.";
      break;

    case "REGULATION":
      behavior =
        "Markets are reacting sensitively to political and regulatory developments.";
      break;

    case "LIQUIDITY":
      behavior =
        "Macro conditions and central bank expectations are influencing investor positioning.";
      break;

    case "ETF_FLOW":
      behavior =
        "Institutional ETF flows are helping stabilize overall market sentiment.";
      break;

    case "WHALES":
      behavior =
        "Large whale transactions suggest high-value repositioning across markets.";
      break;
  }

  // =========================
  // TOP DRIVERS
  // =========================
  const drivers = narratives
    .slice(0, 3)
    .map((n) => narrativeTitles[n.name] || n.name);

  return {
    state,
    summary,
    outlook,
    risk,
    behavior,
    drivers,
  };
};