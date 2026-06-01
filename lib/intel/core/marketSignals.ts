export type MomentumState =
  | "ACCELERATING"
  | "DECELERATING"
  | "NEUTRAL";

export type FlowState =
  | "ACCUMULATION"
  | "DISTRIBUTION"
  | "NEUTRAL";

export type SentimentState =
  | "BULLISH"
  | "BEARISH"
  | "NEUTRAL";

export type MarketSignals = {
  momentum: {
    direction: MomentumState;
    strength: number; // 0–100
  };

  flow: {
    state: FlowState;
    score: number; // 0–100
  };

  sentiment: SentimentState;
};