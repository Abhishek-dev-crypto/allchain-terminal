export function scoreSignal(item: any) {
  const text = item.title.toLowerCase();

  let score = 0;
  let label = "LOW IMPACT";
  let source = "MARKET";

  // HIGH IMPACT
  const highImpactKeywords = [
    "hack",
    "sec",
    "etf",
    "bitcoin",
    "ethereum",
    "lawsuit",
    "ban",
    "approval",
    "exploit",
    "uniswap",
  ];

  // MEDIUM IMPACT
  const mediumKeywords = [
    "defi",
    "airdrop",
    "whale",
    "binance",
    "solana",
    "upgrade",
  ];

  if (highImpactKeywords.some((k) => text.includes(k))) {
    score += 70;
  }

  if (mediumKeywords.some((k) => text.includes(k))) {
    score += 40;
  }

  if (item.score > 500) score += 20;
  if (item.comments > 100) score += 10;

  // LABELS
  if (score >= 70) label = "BREAKING";
  else if (score >= 50) label = "HIGH IMPACT";
  else if (score >= 30) label = "NARRATIVE SHIFT";

  // SOURCE ENGINE
  if (text.includes("etf")) {
    source = "ETF";
  } else if (text.includes("whale")) {
    source = "WHALE";
  } else if (
    text.includes("sec") ||
    text.includes("lawsuit")
  ) {
    source = "REGULATION";
  } else if (
    text.includes("bitcoin") ||
    text.includes("ethereum")
  ) {
    source = "MARKET";
  } else {
    source = "REDDIT";
  }

  return {
    ...item,
    score,
    label,
    source,
  };
}