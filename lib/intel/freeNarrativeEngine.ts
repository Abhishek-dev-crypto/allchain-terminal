import type { MarketSnapshot } from "@/lib/intel/useMarketSnapshot";

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
  snapshot: MarketSnapshot
): FreeNarrative[] {
  const { momentum, flow, volatility, dominance, marketState, breadth } =
    snapshot;

  if (!snapshot.coins?.length) return [];

  const sentiment = mapSentiment(marketState.mood);
  const state = mapState(marketState.conviction);

  return [
    {
      title: "Market Momentum Pulse",

      insight:
        marketState.mood === "RISK_ON"
          ? "Market momentum is expanding across assets."
          : marketState.mood === "RISK_OFF"
          ? "Market momentum is weakening under selling pressure."
          : "Market momentum is neutral and range-bound.",

      momentum: {
        score: momentum.strength,
        direction: momentum.direction,
      },

      state,

      flow: {
        type: flow.state,
        score: flow.score,
      },

      sentiment,

      assets: momentum.leaders.map((c) => c.symbol),

      reasoning: [
        `${breadth.greenPercent}% assets positive`,
        `Momentum: ${momentum.direction}`,
        `Volatility: ${volatility.level}`,
        `Market mood: ${marketState.mood}`,
      ],
    },

    {
      title: "Large Cap Structure",

      insight:
        dominance.btc > 50
          ? "Bitcoin dominance is controlling market direction."
          : "Altcoins are gaining relative strength.",

      momentum: {
        score: dominance.altStrength,
        direction: momentum.direction,
      },

      state,

      flow: {
        type: flow.state,
        score: flow.score,
      },

      sentiment,

      assets: [
        `BTC ${dominance.btc}%`,
        `ETH ${dominance.eth}%`,
        `ALTS ${dominance.altStrength}%`,
      ],

      reasoning: [
        `BTC dominance ${dominance.btc}%`,
        `ETH dominance ${dominance.eth}%`,
        `Alt strength ${dominance.altStrength}%`,
      ],
    },
  ];
}