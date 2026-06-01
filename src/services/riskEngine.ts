// src/services/riskEngine.ts

export function calculateRiskScore(trades: any[], portfolio: any[], balance: number) {
  let riskScore = 0;

  const tradesLast24h = trades.filter(
    (t) => Date.now() - t.timestamp < 24 * 60 * 60 * 1000
  ).length;

  const totalHoldings = portfolio.reduce((sum, p) => sum + p.value, 0);
  const topAsset = Math.max(...portfolio.map((p) => p.value || 0), 0);
  const topAssetHoldingPercent = totalHoldings
    ? (topAsset / totalHoldings) * 100
    : 0;

  const avgTradeSizePercentOfBalance =
    trades.length > 0
      ? (trades.reduce((sum, t) => sum + t.totalValue, 0) /
          trades.length /
          balance) *
        100
      : 0;

  const avgHoldingTimeMinutes = 30; // placeholder for now

  // Overtrading
  if (tradesLast24h > 10) riskScore += 3;
  else if (tradesLast24h > 5) riskScore += 2;
  else if (tradesLast24h > 2) riskScore += 1;

  // Concentration risk
  if (topAssetHoldingPercent > 70) riskScore += 3;
  else if (topAssetHoldingPercent > 50) riskScore += 2;
  else if (topAssetHoldingPercent > 30) riskScore += 1;

  // Trade size risk
  if (avgTradeSizePercentOfBalance > 30) riskScore += 3;
  else if (avgTradeSizePercentOfBalance > 15) riskScore += 2;
  else if (avgTradeSizePercentOfBalance > 5) riskScore += 1;

  // Impulsive trading
  if (avgHoldingTimeMinutes < 10) riskScore += 2;
  else if (avgHoldingTimeMinutes < 60) riskScore += 1;

  return Math.min(10, riskScore);
}

export function getInsight(riskScore: number) {
  if (riskScore >= 8) {
    return "⚠️ High-risk behavior detected. Reduce trading frequency and diversify holdings.";
  }

  if (riskScore >= 5) {
    return "📊 Moderate risk. Monitor position sizing and avoid overtrading.";
  }

  if (riskScore >= 2) {
    return "✅ Healthy trading behavior. Good discipline.";
  }

  return "🧠 Excellent discipline. Very stable trading pattern.";
}

export function getDisciplineScore(riskScore: number) {
  return 10 - riskScore;
}