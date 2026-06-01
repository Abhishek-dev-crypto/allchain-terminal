import type { Coin } from "@/lib/types/coin";
import {
  calculateRegimeConfidence,
  calculateMarketHealth,
} from "@/lib/intel/scoring";

import {
  classifyVolatility,
  classifyBreadth,
  classifyStability,
  calculateDispersion,
  calculateMomentumScore,
  calculateVolatilityScore,
} from "@/lib/intel/helpers";

export type MarketRegime =
  | "RISK_ON"
  | "RISK_OFF"
  | "ROTATION"
  | "CHOPPY";

export type MarketEngineOutput = {
  flows: { name: string; avg: number }[];

  avgFlow: number;
  positiveBreadth: number;
  negativeBreadth: number;

  volatility: number;
  participation: number;

  regime: MarketRegime;

  momentum: "ACCELERATING" | "DECELERATING" | "NEUTRAL";

  leaders: Coin[];
  laggards: Coin[];

  btcDominance: number;
  ethDominance: number;
  altStrength: number;

  regimeConfidence: number;
  marketHealth: number;

  volatilityState: "LOW" | "NORMAL" | "ELEVATED" | "EXTREME";
  breadthState: "STRONG" | "WEAK" | "NARROW";
  stability: "STABLE" | "FRAGILE" | "UNSTABLE";

  signals: {
    momentum: { direction: string; strength: number };
    flow: { state: string; score: number };
    sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  };
};

const sectorMap: Record<string, string> = {
  BTC: "LARGE_CAP",
  ETH: "L1",
  SOL: "L1",
  AVAX: "L1",
  SUI: "L1",
  LINK: "INFRA",
  NEAR: "INFRA",
  UNI: "DEFI",
  AAVE: "DEFI",
  DOGE: "MEME",
  SHIB: "MEME",
  XRP: "PAYMENTS",
  XLM: "PAYMENTS",
};

export function buildMarketEngine(coins: Coin[]): MarketEngineOutput {
  if (!coins.length) {
    return {
      flows: [],
      avgFlow: 0,
      positiveBreadth: 0,
      negativeBreadth: 0,
      volatility: 0,
      participation: 0,
      regime: "CHOPPY",
      momentum: "NEUTRAL",
      leaders: [],
      laggards: [],
      btcDominance: 0,
      ethDominance: 0,
      altStrength: 0,
      regimeConfidence: 0,
      marketHealth: 0,
      volatilityState: "LOW",
      breadthState: "NARROW",
      stability: "STABLE",
      signals: {
        momentum: { direction: "NEUTRAL", strength: 0 },
        flow: { state: "NEUTRAL", score: 0 },
        sentiment: "NEUTRAL",
      },
    };
  }

  // ======================
  // SECTOR FLOWS
  // ======================
  const grouped: Record<string, { total: number; count: number }> = {};

  coins.forEach((coin) => {
    const sector = sectorMap[coin.symbol.toUpperCase()] || "OTHER";

    if (!grouped[sector]) grouped[sector] = { total: 0, count: 0 };

    grouped[sector].total += coin.change24h;
    grouped[sector].count += 1;
  });

  const flows = Object.entries(grouped).map(([name, d]) => ({
  name,
  avg: d.total / d.count,
}));

  const values = flows.map((f) => f.avg);

  const avgFlow =
    values.reduce((s, v) => s + v, 0) / (values.length || 1);

  const positiveBreadth =
    (coins.filter((c) => c.change24h > 0).length / coins.length) * 100;

  const negativeBreadth = 100 - positiveBreadth;

  const volatility =
    coins.reduce((s, c) => s + Math.abs(c.change24h), 0) / coins.length;

  const participation =
    (coins.filter((c) => Math.abs(c.change24h) > 3).length / coins.length) *
    100;

  // ======================
  // REGIME
  // ======================
  let regime: MarketRegime = "CHOPPY";

  const dispersion = calculateDispersion(values);

  if (avgFlow < -2 && negativeBreadth > 70) regime = "RISK_OFF";
  else if (avgFlow > 2 && positiveBreadth > 65) regime = "RISK_ON";
  else if (dispersion > 5) regime = "ROTATION";

  // ======================
  // MOMENTUM
  // ======================
  const momentum: MarketEngineOutput["momentum"] =
    avgFlow > 1.5 && positiveBreadth > 60
      ? "ACCELERATING"
      : avgFlow < -1.5 && negativeBreadth > 60
      ? "DECELERATING"
      : "NEUTRAL";

  // ======================
  // LEADERS / LAGGARDS
  // ======================
  const sorted = [...coins].sort((a, b) => b.change24h - a.change24h);

  const leaders = sorted.slice(0, 5);
  const laggards = [...sorted].reverse().slice(0, 5);

  // ======================
  // DOMINANCE
  // ======================
  const totalCap = coins.reduce((s, c) => s + c.marketCap, 0) || 1;

  const btc = coins.find((c) => c.symbol === "BTC");
  const eth = coins.find((c) => c.symbol === "ETH");

  const btcDominance = ((btc?.marketCap || 0) / totalCap) * 100;
  const ethDominance = ((eth?.marketCap || 0) / totalCap) * 100;
  const altStrength = Math.max(0, 100 - btcDominance - ethDominance);

  // ======================
  // SIGNALS (RAW ONLY)
  // ======================
  const momentumStrength =
    Math.min(100, Math.abs(avgFlow) * 20 + participation);

  const flowState =
    participation > 60 && avgFlow > 1
      ? "ACCUMULATION"
      : participation > 60 && avgFlow < -1
      ? "DISTRIBUTION"
      : "NEUTRAL";

  const sentiment: "BULLISH" | "BEARISH" | "NEUTRAL" =
    positiveBreadth > 60
      ? "BULLISH"
      : negativeBreadth > 60
      ? "BEARISH"
      : "NEUTRAL";

  // ======================
  // SCORES
  // ======================
  const regimeConfidence = calculateRegimeConfidence({
    participationScore: participation,
    volatilityScore: calculateVolatilityScore(volatility),
    breadthScore: positiveBreadth,
    momentumScore: calculateMomentumScore(avgFlow),
  });

  const marketHealth = calculateMarketHealth({
    momentumScore: calculateMomentumScore(avgFlow),
    breadthScore: positiveBreadth,
    participationScore: participation,
    volatilityScore: calculateVolatilityScore(volatility),
  });

  const volatilityState = classifyVolatility(volatility);
  const breadthState = classifyBreadth(positiveBreadth);
  const stability = classifyStability(volatility, negativeBreadth);

  return {
    flows,
    avgFlow: Number(avgFlow.toFixed(2)),
    positiveBreadth: Number(positiveBreadth.toFixed(1)),
    negativeBreadth: Number(negativeBreadth.toFixed(1)),
    volatility: Number(volatility.toFixed(2)),
    participation: Number(participation.toFixed(1)),

    regime,
    momentum,

    leaders,
    laggards,

    btcDominance: Number(btcDominance.toFixed(1)),
    ethDominance: Number(ethDominance.toFixed(1)),
    altStrength: Number(altStrength.toFixed(1)),

    regimeConfidence: Number(regimeConfidence.toFixed(1)),
    marketHealth: Number(marketHealth.toFixed(1)),

    volatilityState,
    breadthState,
    stability,

    signals: {
      momentum: {
        direction: momentum,
        strength: momentumStrength,
      },
      flow: {
        state: flowState,
        score:
          flowState === "ACCUMULATION"
            ? participation
            : 100 - participation,
      },
      sentiment,
    },
  };
}