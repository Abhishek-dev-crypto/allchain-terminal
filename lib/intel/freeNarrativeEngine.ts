import type { MarketEngineOutput } from "@/lib/intel/marketEngine";

export type FreeNarrative = {
  title: string;
  insight: string;

  momentum: {
    score: number;
    direction: string;
  };

  state: string;

  flow: {
    type: string;
    score: number;
  };

  sentiment: string;
  assets: string[];
  reasoning: string[];
};

function mapState(conviction: string) {
  if (conviction === "HIGH") return "HOT";
  if (conviction === "MEDIUM") return "ACTIVE";
  return "BUILDING";
}

function mapSentiment(mood: string) {
  if (mood === "RISK_ON") return "BULLISH";
  if (mood === "RISK_OFF") return "BEARISH";
  return "NEUTRAL";
}

export function buildFreeNarrativeEngine(
  engine: MarketEngineOutput
): FreeNarrative[] {
  if (!engine || !engine.leaders) return [];

  const {
    momentum,
    flows,
    volatility,
    regime,
    positiveBreadth,
    signals,
    leaders,
    btcDominance,
    ethDominance,
    altStrength,
  } = engine;

  return [
    {
      title: "Market Momentum Pulse",

      insight:
        engine.regime === "RISK_ON"
          ? "Market momentum is expanding across assets."
          : engine.regime === "RISK_OFF"
          ? "Market momentum is weakening under selling pressure."
          : "Market momentum is neutral and range-bound.",

      momentum: {
        score: signals.momentum.strength,
        direction: signals.momentum.direction,
      },

      state: regime,

      flow: {
        type: signals.flow.state,
        score: signals.flow.score,
      },

      sentiment: signals.sentiment,

      assets: leaders.map((c) => c.symbol),

      reasoning: [
        `${positiveBreadth}% assets positive`,
        `Momentum: ${signals.momentum.direction}`,
        `Volatility: ${volatility}`,
        `Flow: ${signals.flow.state}`,
      ],
    },

    {
      title: "Large Cap Structure",

      insight:
        btcDominance > 50
          ? "Bitcoin dominance is controlling market direction."
          : "Altcoins are gaining relative strength.",

      momentum: {
        score: altStrength,
        direction: signals.momentum.direction,
      },

      state: regime,

      flow: {
        type: signals.flow.state,
        score: signals.flow.score,
      },

      sentiment: signals.sentiment,

      assets: [
        `BTC ${btcDominance}%`,
        `ETH ${ethDominance}%`,
        `ALTS ${altStrength}%`,
      ],

      reasoning: [
        `BTC dominance ${btcDominance}%`,
        `ETH dominance ${ethDominance}%`,
        `Alt strength ${altStrength}%`,
      ],
    },
  ];
}