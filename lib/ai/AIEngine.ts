import { IntelOutput } from "@/lib/intelligence/buildIntel";

/* ================= OUTPUT ================= */

export type AIOutput = {
  action: "BUY" | "SELL" | "HOLD";
  confidence: number;
  risk: "LOW" | "MEDIUM" | "HIGH";

  reasoning: {
    regime: string;
    flowBias: string;
    signalAction: string;
    alignmentScore: number;

    confluence: {
      bias: "BULLISH" | "BEARISH" | "NEUTRAL";
      score: number;
    };

    momentum: {
      shortTerm: number;
      longTerm: number;
      acceleration: number;
    };
  };

  timestamp: number;
};

/* ================= UTILS ================= */

function clamp(n: number) {
  return Math.max(0, Math.min(100, n));
}

/* ================= AI ENGINE ================= */

export const AIEngine = {
  build(intel: IntelOutput): AIOutput {
    const {
      flow,
      signal,
      regime,
      alignmentScore,
      volatility,
      confluence,
      momentum,
    } = intel;

    /* ================= 1. FLOW BIAS ================= */
    const flowBias =
      flow.buyPressure > flow.sellPressure * 1.2
        ? "BULLISH_FLOW"
        : flow.sellPressure > flow.buyPressure * 1.2
        ? "BEARISH_FLOW"
        : "NEUTRAL_FLOW";

    /* ================= 2. CONFLUENCE WEIGHT ================= */
    const confluenceBias = confluence?.bias ?? "NEUTRAL";
    const confluenceScore = confluence?.total ?? 0;

    let confluenceWeight = 1;

    if (confluenceBias === "BULLISH") confluenceWeight = 1.15;
    if (confluenceBias === "BEARISH") confluenceWeight = 1.15;
    if (confluenceBias === "NEUTRAL") confluenceWeight = 0.9;

    /* ================= 3. REGIME WEIGHT ================= */
    let regimeWeight = 1;

    if (regime === "BULL") regimeWeight = 1.1;
    if (regime === "BEAR") regimeWeight = 1.1;
    if (regime === "SIDEWAYS") regimeWeight = 0.85;

    /* ================= 4. CORE CONFIDENCE MODEL ================= */
    let confidence =
      signal.confidence * 0.45 +
      alignmentScore * 0.3 +
      flow.volumeStrength * 0.15 +
      confluenceScore * 0.1;

    confidence *= confluenceWeight;
    confidence *= regimeWeight;

    // volatility penalty
    confidence -= volatility * 0.25;

    confidence = clamp(confidence);

    /* ================= 5. ACTION ENGINE ================= */
    let action: "BUY" | "SELL" | "HOLD" = "HOLD";

    const strongBuy =
      signal.action === "BUY" &&
      flowBias === "BULLISH_FLOW" &&
      confluenceBias !== "BEARISH" &&
      regime !== "BEAR";

    const strongSell =
      signal.action === "SELL" &&
      flowBias === "BEARISH_FLOW" &&
      confluenceBias !== "BULLISH" &&
      regime !== "BULL";

    if (strongBuy) {
      action = confidence > 55 ? "BUY" : "HOLD";
    } else if (strongSell) {
      action = confidence > 55 ? "SELL" : "HOLD";
    }

    // sideways protection
    if (regime === "SIDEWAYS" || confluenceBias === "NEUTRAL") {
      action = confidence > 70 ? signal.action : "HOLD";
    }

    /* ================= 6. RISK MODEL ================= */
    let risk: "LOW" | "MEDIUM" | "HIGH" = "MEDIUM";

    if (confidence > 75 && volatility < 30) risk = "LOW";
    else if (confidence < 45 || volatility > 65) risk = "HIGH";

    /* ================= FINAL OUTPUT ================= */
    return {
      action,
      confidence: Math.round(confidence),
      risk,

      reasoning: {
        regime,
        flowBias,
        signalAction: signal.action,
        alignmentScore,

        confluence: {
          bias: confluenceBias,
          score: confluenceScore,
        },

        momentum,
      },

      timestamp: Date.now(),
    };
  },
};