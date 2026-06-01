import type { MarketSnapshot } from "./useMarketSnapshot";

export type TradeSignal = {
  type: "BULLISH" | "BEARISH" | "NEUTRAL";
  title: string;
  message: string;
  conviction: "LOW" | "MEDIUM" | "HIGH";
  timeframe: "SCALP" | "INTRADAY" | "SWING" | "POSITION";
  category: "MOMENTUM" | "FLOW" | "VOLATILITY" | "BREADTH" | "ROTATION" | "RISK";
  strength: number;
};

export function buildTradeSignals(snapshot: MarketSnapshot): TradeSignal[] {
  const { breadth, momentum, flow, volatility, dominance, marketState } = snapshot;

  const signals: TradeSignal[] = [];

  /**
   * 🚀 MOMENTUM EXPANSION
   */
  if (momentum.direction === "ACCELERATING" && breadth.greenPercent > 70) {
    signals.push({
      type: "BULLISH",
      title: "Momentum Expansion",
      message: "Momentum participation is expanding across leading assets.",
      conviction: breadth.greenPercent > 85 ? "HIGH" : "MEDIUM",
      timeframe: "SWING",
      category: "MOMENTUM",
      strength: Math.min(10, Math.round(momentum.strength)),
    });
  }

  /**
   * 💰 ACCUMULATION FLOW (FIXED)
   */
  if (flow.state === "ACCUMULATION") {
    signals.push({
      type: "BULLISH",
      title: "Capital Accumulation",
      message: "Buy-side participation is dominating flow structure.",
      conviction: flow.score > 80 ? "HIGH" : "MEDIUM",
      timeframe: "POSITION",
      category: "FLOW",
      strength: Math.min(10, Math.round(flow.score / 10)),
    });
  }

  /**
   * ⚡ VOLATILITY COMPRESSION
   */
  if (volatility.level === "LOW" && momentum.direction === "ACCELERATING") {
    signals.push({
      type: "NEUTRAL",
      title: "Volatility Compression",
      message: "Low volatility with rising momentum suggests potential breakout expansion.",
      conviction: "MEDIUM",
      timeframe: "INTRADAY",
      category: "VOLATILITY",
      strength: 6,
    });
  }

  /**
   * 📉 WEAK BREADTH
   */
  if (breadth.greenPercent < 45) {
    signals.push({
      type: "BEARISH",
      title: "Weak Market Breadth",
      message: "Market participation is weakening beneath index performance.",
      conviction: breadth.greenPercent < 35 ? "HIGH" : "MEDIUM",
      timeframe: "SWING",
      category: "BREADTH",
      strength: Math.max(1, 10 - Math.round(breadth.greenPercent / 10)),
    });
  }

  /**
   * 🔥 MOMENTUM EXHAUSTION
   */
  if (momentum.strength > 8 && volatility.average > 7) {
    signals.push({
      type: "BEARISH",
      title: "Momentum Exhaustion",
      message: "Overextended momentum with rising volatility indicates fatigue.",
      conviction: "HIGH",
      timeframe: "SCALP",
      category: "RISK",
      strength: 9,
    });
  }

  /**
   * 🏦 BTC DOMINANCE
   */
  if (dominance.btc > 60) {
    signals.push({
      type: "NEUTRAL",
      title: "Bitcoin Dominance Strength",
      message: "Capital concentration remains in BTC, limiting alt expansion.",
      conviction: "MEDIUM",
      timeframe: "POSITION",
      category: "ROTATION",
      strength: 7,
    });
  }

  /**
   * 🌊 RISK-ON EXPANSION
   */
  if (
    marketState.mood === "RISK_ON" &&
    breadth.greenPercent > 80 &&
    flow.state === "ACCUMULATION"
  ) {
    signals.push({
      type: "BULLISH",
      title: "Risk-On Expansion",
      message: "Strong participation across assets signals healthy risk appetite.",
      conviction: "HIGH",
      timeframe: "SWING",
      category: "MOMENTUM",
      strength: 9,
    });
  }

  /**
   * 🛡️ RISK-OFF STRUCTURE
   */
  if (marketState.mood === "RISK_OFF" && volatility.level === "HIGH") {
    signals.push({
      type: "BEARISH",
      title: "Defensive Market Structure",
      message: "High volatility with risk-off sentiment indicates defensive positioning.",
      conviction: "HIGH",
      timeframe: "INTRADAY",
      category: "RISK",
      strength: 8,
    });
  }

  /**
   * 📊 SORT
   */
  return signals.sort((a, b) => b.strength - a.strength);
}