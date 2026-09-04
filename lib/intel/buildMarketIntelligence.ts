import type { Coin } from "../types/coin";
import type { MarketEngineOutput } from "./marketEngine";

export type MarketIntelligenceLayer = {
  mood: string;
  conviction: "LOW" | "MEDIUM" | "HIGH";

  flowLabel: string;
  momentumLabel: string;

  breadth: {
    positive: number;
    label: string;
  };

  volatility: {
    value: number;
    label: string;
  };

  leaders: Coin[];

  sectorRotation: MarketEngineOutput["sectorRotation"];
};

export function buildMarketIntelligence(
  engine: MarketEngineOutput
): MarketIntelligenceLayer {
  const mood =
    engine.regime === "RISK_ON"
      ? "RISK ON"
      : engine.regime === "RISK_OFF"
      ? "RISK OFF"
      : engine.regime === "ROTATION"
      ? "ROTATION"
      : "CHOPPY";

  const conviction =
    engine.regimeConfidence > 70
      ? "HIGH"
      : engine.regimeConfidence > 40
      ? "MEDIUM"
      : "LOW";

  const flowLabel =
    engine.momentum === "ACCELERATING"
      ? "EXPANSION"
      : engine.momentum === "DECELERATING"
      ? "CONTRACTION"
      : "NEUTRAL";

  const momentumLabel =
    engine.momentum === "ACCELERATING"
      ? "BUILDING"
      : engine.momentum === "DECELERATING"
      ? "WEAKENING"
      : "FLAT";

  const breadthLabel =
    engine.positiveBreadth > 70
      ? "STRONG"
      : engine.positiveBreadth > 40
      ? "MODERATE"
      : "WEAK";

  const volatilityLabel =
    engine.volatility < 2
      ? "LOW"
      : engine.volatility < 5
      ? "NORMAL"
      : "HIGH";

  return {
    mood,
    conviction,

    flowLabel,
    momentumLabel,

    breadth: {
      positive: engine.positiveBreadth,
      label: breadthLabel,
    },

    volatility: {
      value: engine.volatility,
      label: volatilityLabel,
    },

    leaders: engine.leaders,

    sectorRotation: engine.sectorRotation,
  };
}