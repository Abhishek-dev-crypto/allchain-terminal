import type { MarketSnapshot } from "./useMarketSnapshot";

export type TimelineState =
  | "WEAK"
  | "NEUTRAL"
  | "EXPANDING"
  | "ACCELERATING"
  | "STRONG TREND";

export type TimelineNode = {
  timeframe: string;
  state: TimelineState;
  confidence: number;
};

export function buildMomentumTimeline(
  snapshot: MarketSnapshot
): TimelineNode[] {
  const {
    breadth,
    momentum,
    flow,
  } = snapshot;

  const score =
    momentum.strength +
    breadth.greenPercent / 20 +
    flow.score / 25;

  const buildState = (
    modifier: number
  ): TimelineState => {
    const total = score + modifier;

    if (total >= 15) return "STRONG TREND";
    if (total >= 12) return "ACCELERATING";
    if (total >= 9) return "EXPANDING";
    if (total >= 6) return "NEUTRAL";

    return "WEAK";
  };

  return [
    {
      timeframe: "15M",
      state: buildState(-3),
      confidence: 58,
    },

    {
      timeframe: "1H",
      state: buildState(-1),
      confidence: 66,
    },

    {
      timeframe: "4H",
      state: buildState(1),
      confidence: 78,
    },

    {
      timeframe: "24H",
      state: buildState(3),
      confidence: 86,
    },
  ];
}