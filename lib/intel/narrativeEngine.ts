import { NARRATIVES } from "./narrativeConfig";

type SourceItem = {
  title: string;
  source: string;
};

type Narrative = {
  name: string;
  score: number;
  momentum: number;
  examples: string[];
};


export function buildNarratives(data: SourceItem[]): Narrative[] {
  const results: Narrative[] = [];

  Object.entries(NARRATIVES).forEach(([key, keywords]) => {
    let score = 0;
    const examples: string[] = [];

   data.forEach((item) => {
  const text = item.title.toLowerCase();

  // =========================
  // NARRATIVE MATCHES
  // =========================
  const matches = keywords.filter((k) =>
    text.includes(k.toLowerCase())
  );

  // =========================
  // MOMENTUM DETECTION
  // =========================
  const momentumWords = [
    "surge",
    "breakout",
    "rally",
    "soars",
    "explodes",
    "record inflow",
    "massive",
    "parabolic",
    "bull run",
    "strong demand",
  ];

  let momentumBoost = 0;

  momentumWords.forEach((w) => {
    if (text.includes(w)) {
      momentumBoost += 1;
    }
  });

  // =========================
  // SOURCE WEIGHTING
  // =========================
  const sourceWeights = {
    CoinDesk: 1.2,
    CoinTelegraph: 1.1,
    Reddit: 0.7,
  };

  const sourceWeight =
    sourceWeights[item.source as keyof typeof sourceWeights] || 1;

  // =========================
  // FINAL SCORING
  // =========================
  if (matches.length > 0) {
    score +=
      (matches.length + momentumBoost) * sourceWeight;

    examples.push(item.title);
  }
});

    results.push({
      name: key,
      score: Number(score.toFixed(1)),
      momentum:
  score > 10
    ? 2
    : score > 5
    ? 1
    : score > 2
    ? 0
    : -1,
      examples: examples.slice(0, 3),
    });
  });

  return results.sort((a, b) => b.score - a.score);
}

// buildNarratives() function

type Coin = {
  id: string;
  symbol: string;
  change24h: number;
  marketCap: number;
  volume?: number;
};

type MarketStructure = {
  marketMood: string;
  aiFlow: string;
  volatility: string;
  leaderSector: string;
  momentumSummary: string;
  rotationInsight: string;
};

const L1 = [
  "bitcoin",
  "ethereum",
  "solana",
  "ripple",
];

const DEFI = ["chainlink"];

const INFRA = [
  "avalanche-2",
  "near",
  "toncoin",
];

const MEME = ["dogecoin"];

function getSector(id: string) {
  if (L1.includes(id)) return "L1";

  if (DEFI.includes(id)) {
    return "DEFI";
  }

  if (INFRA.includes(id)) {
    return "INFRA";
  }

  if (MEME.includes(id)) {
    return "MEME";
  }

  return "OTHER";
}

export function buildMarketStructure(
  coins: Coin[]
): MarketStructure {
  if (!coins.length) {
    return {
      marketMood: "NEUTRAL",
      aiFlow: "WAITING",
      volatility: "LOW",
      leaderSector: "NONE",
      momentumSummary:
        "Waiting for market data.",
      rotationInsight:
        "AI market structure engine initializing.",
    };
  }

  // =========================
  // MARKET BREADTH
  // =========================

  const bullishCount = coins.filter(
    (c) => c.change24h > 3
  ).length;

  const bearishCount = coins.filter(
    (c) => c.change24h < -3
  ).length;

  const greenCount = coins.filter(
    (c) => c.change24h > 0
  ).length;

  // =========================
  // MARKET MOOD
  // =========================

  let marketMood = "BALANCED";

  if (greenCount >= 8) {
    marketMood = "RISK-ON";
  }

  if (greenCount <= 4) {
    marketMood = "RISK-OFF";
  }

  // =========================
  // AI FLOW
  // =========================

  let aiFlow = "NEUTRAL";

  if (bullishCount >= 4) {
    aiFlow = "ACCUMULATION";
  }

  if (bearishCount >= 4) {
    aiFlow = "DISTRIBUTION";
  }

  // =========================
  // VOLATILITY
  // =========================

  const avgVolatility =
    coins.reduce(
      (acc, coin) =>
        acc + Math.abs(coin.change24h),
      0
    ) / coins.length;

  let volatility = "LOW";

  if (avgVolatility > 4) {
    volatility = "HIGH";
  } else if (avgVolatility > 2) {
    volatility = "MEDIUM";
  }

  // =========================
  // SECTOR ROTATION
  // =========================

  const sectorMap: Record<
    string,
    number
  > = {};

  coins.forEach((coin) => {
    const sector = getSector(coin.id);

    sectorMap[sector] =
      (sectorMap[sector] || 0) +
      coin.change24h;
  });

  const leaderSector =
    Object.entries(sectorMap).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || "OTHER";

  // =========================
  // MOMENTUM LEADERS
  // =========================

  const leaders = [...coins]
    .sort(
      (a, b) =>
        b.change24h - a.change24h
    )
    .slice(0, 3);

  const momentumSummary =
    leaders.length > 0
      ? `${leaders
          .map((c) => c.symbol)
          .join(
            ", "
          )} driving short-term momentum.`
      : "Momentum activity remains limited.";

  // =========================
  // ROTATION INSIGHT
  // =========================

  let rotationInsight =
    "Market participation remains balanced across sectors.";

  if (leaderSector === "INFRA") {
    rotationInsight = `
      Infrastructure ecosystems are attracting
      stronger participation as traders rotate
      toward utility-focused blockchain assets.
    `;
  }

  if (leaderSector === "MEME") {
    rotationInsight = `
      Speculative activity increasing as
      higher-risk meme assets begin
      outperforming broader market structure.
    `;
  }

  if (leaderSector === "L1") {
    rotationInsight = `
      Layer-1 ecosystems continue leading
      market participation with improving
      momentum across large-cap assets.
    `;
  }

  if (leaderSector === "DEFI") {
    rotationInsight = `
      DeFi-related assets gaining traction
      as capital rotates back into
      yield-focused crypto sectors.
    `;
  }

  if (bearishCount >= 4) {
    rotationInsight = `
      Defensive positioning increasing
      as weakness spreads across
      higher-beta crypto assets.
    `;
  }

  // =========================
  // RETURN
  // =========================

  return {
    marketMood,
    aiFlow,
    volatility,
    leaderSector,
    momentumSummary,
    rotationInsight,
  };
}