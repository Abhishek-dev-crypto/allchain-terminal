import { IntelOutput } from "@/lib/intelligence/buildIntel";
import { AIOutput } from "@/lib/ai/AIEngine";

/* ================= UI TYPES ================= */

export type AIUIOutput = {

    trendStrength: string;

    marketRegime: string;

    momentumLabel: string;

    volatilityLabel: string;

    signalQuality: string;

    tradeReadinessLabel: string;

    decision: string;

    decisionReason: string;

    nextConfirmation: string;

    confidenceLabel: string;

    marketPressure: string;

    riskProfile: string;

    aiGuidance: string;

    confluence: string;

    aiConfidence: string;

    /* ================= AI NARRATIVE ================= */

  aiNarrative: {
    title: string;
    overview: string;
    marketStory: string;
    conclusion: string;
  };

};

function getMomentumLabel(momentum: number) {

    if (momentum > 65) return "Strong";

    if (momentum > 45) return "Moderate";

    return "Weak";

}

function getVolatilityLabel(volatility: number) {

    if (volatility > 70) return "High";

    if (volatility > 40) return "Moderate";

    return "Low";

}

/* ================= HELPERS ================= */

function clamp(n: number) {
  return Math.max(0, Math.min(100, n));
}

function getTrendLabel(score: number) {
  if (score > 65) return "Strong Trend";
  if (score > 45) return "Moderate Trend";
  return "Weak Trend";
}

function getParticipationLabel(volumeStrength: number) {
  if (volumeStrength > 65) return "High Participation";
  if (volumeStrength > 40) return "Moderate Participation";
  return "Low Participation";
}

function getSignalQuality(confidence: number) {
  if (confidence > 70) return "High Quality";
  if (confidence > 50) return "Medium Quality";
  return "Low Quality";
}

function getReadinessLabel(confidence: number) {
  if (confidence > 75) return "READY TO TRADE";
  if (confidence > 55) return "WAIT FOR CONFIRMATION";
  return "NOT READY";
}

function getConfidenceLabel(confidence: number) {
  if (confidence > 75) return "Very High Confidence";
  if (confidence > 55) return "Moderate Confidence";
  return "Low Confidence";
}

/* ================= MAIN FORMATTER ================= */

export function formatAIForUI(
  intel: IntelOutput,
  ai: AIOutput
): AIUIOutput {

  const { alignmentScore, flow } = intel;

  const confidence = ai?.confidence ?? 0;

  const regime = intel.regime;

  const momentumValue = intel.momentum.shortTerm;

  const volatility = intel.volatility;

  const action = ai?.action ?? "HOLD";

  const volumeStrength = flow?.volumeStrength ?? 0;

  /* ================= 1. TREND ================= */
  const trendStrength = getTrendLabel(alignmentScore);

  /* ================= 2. MARKET PARTICIPATION ================= */
  

  /* ================= 3. SIGNAL QUALITY ================= */
  const signalQuality = getSignalQuality(confidence);

  /* ================= 4. TRADE READINESS ================= */
  const tradeReadinessLabel = getReadinessLabel(confidence);

  /* ================= 5. CONFIDENCE LABEL ================= */
  const confidenceLabel = getConfidenceLabel(confidence);

  /* ================= 6. DECISION ================= */
  const decision = `${action} (${confidence}%)`;

  /* ================= 7. SAFE REASONING ================= */
  const reasoning = ai?.reasoning ?? {};


/* ================= CAPITAL FLOW ================= */



/* ================= MARKET REGIME ================= */

const marketRegime =
  intel.regime === "BULL"
    ? "🟢 Bull Market"
    : intel.regime === "BEAR"
    ? "🔴 Bear Market"
    : "🟡 Sideways";

/* ================= CONFLUENCE ================= */

const confluence = `${intel.confluence.score}%`;

/* ================= AI CONFIDENCE ================= */

const aiConfidence = `${ai.confidence}%`;

  const momentumLabel =
    getMomentumLabel(momentumValue);

  const volatilityLabel =
    getVolatilityLabel(volatility);

 const reasons: string[] = [];

 if (reasoning.regime === "BULL")
  reasons.push("Market is trending upward.");

if (reasoning.regime === "BEAR")
  reasons.push("Market is trending downward.");

if (reasoning.regime === "SIDEWAYS")
  reasons.push("Market is moving sideways without a clear trend.");

if (reasoning.flowBias === "BULLISH_FLOW")
  reasons.push("Buying pressure is stronger than selling pressure.");

if (reasoning.flowBias === "BEARISH_FLOW")
  reasons.push("Selling pressure is stronger than buying pressure.");

if (reasoning.flowBias === "NEUTRAL_FLOW")
  reasons.push("Buyers and sellers are currently balanced.");

if (alignmentScore > 70)
  reasons.push("Multiple timeframes are aligned.");

else if (alignmentScore > 40)
  reasons.push("Some timeframes are aligned.");

else
  reasons.push("Trend alignment is currently weak.");

if (reasoning.signalAction === "BUY")
  reasons.push("Technical indicators currently favor buyers.");

if (reasoning.signalAction === "SELL")
  reasons.push("Technical indicators currently favor sellers.");

if (reasoning.signalAction === "HOLD")
  reasons.push("No strong technical signal has been confirmed.");

if (confidence < 50)
    reasons.push("The current setup has low confidence.");

if (confidence > 75)
    reasons.push("The current setup has high confidence.");

const decisionReason = reasons.join("\n• ");



  /* ================= 8. NEXT CONFIRMATION ================= */
  const nextConfirmation =
    action === "BUY"
      ? "Wait for volume continuation + higher low confirmation"
      : action === "SELL"
      ? "Wait for breakdown confirmation below support"
      : "Wait for directional breakout or regime shift";

      
/* ================= marketPressure ================= */

let marketPressure = "";

const flowState = intel.flow.state;

if (flowState === "ACCUMULATION" && signalQuality === "High Quality") {
  marketPressure = "🟢 Strong Accumulation";
} else if (flowState === "DISTRIBUTION" && signalQuality === "High Quality") {
  marketPressure = "🔴 Strong Distribution";
} else if (flowState === "ACCUMULATION") {
  marketPressure = "🟡 Building Accumulation";
} else if (flowState === "DISTRIBUTION") {
  marketPressure = "🟡 Building Distribution";
} else {
  marketPressure = "⚪ Balanced";
}

/* ================= RISK ================= */

let riskProfile = "";

if (ai.risk === "LOW")
  riskProfile = "Low market risk with favorable conditions.";

else if (ai.risk === "HIGH")
  riskProfile = "Elevated market risk. Exercise caution.";

else
  riskProfile = "Moderate risk environment.";

/* ================= AI GUIDANCE ================= */

let aiGuidance = "";

if (action === "BUY")
  aiGuidance =
    "Momentum and market conditions support considering long positions.";

else if (action === "SELL")
  aiGuidance =
    "Market weakness favors protecting capital or reducing exposure.";

else
  aiGuidance =
    "Wait for stronger confirmation before entering a new trade.";

    /* ================= AI NARRATIVE ================= */

const aiNarrative = {
  title: "Current Market View",

  overview: "",

  marketStory: "",

  conclusion: "",
};

if (intel.regime === "BULL") {
  aiNarrative.overview =
    "The market remains in a bullish regime with buyers maintaining overall control.";
} else if (intel.regime === "BEAR") {
  aiNarrative.overview =
    "The market remains in a bearish regime as selling pressure continues to dominate.";
} else {
  aiNarrative.overview =
    "The market is currently moving sideways with no confirmed directional trend.";
}

if (flow.buyPressure > flow.sellPressure * 1.2) {
  aiNarrative.marketStory =
    "Capital flow suggests buyers are steadily accumulating positions while overall participation remains stable.";
} else if (flow.sellPressure > flow.buyPressure * 1.2) {
  aiNarrative.marketStory =
    "Selling pressure continues to outweigh buying interest, indicating ongoing distribution.";
} else {
  aiNarrative.marketStory =
    "Buying and selling activity remain relatively balanced, reflecting market indecision.";
}

if (action === "BUY") {
  aiNarrative.conclusion =
    "Current conditions support cautiously looking for long opportunities while continuing to monitor confirmation signals.";
} else if (action === "SELL") {
  aiNarrative.conclusion =
    "Current conditions favor defensive positioning until stronger buying pressure returns.";
} else {
  aiNarrative.conclusion =
    "The AI recommends waiting for stronger confirmation before committing to a new position.";
}

  return {

    trendStrength,

    marketRegime,

    momentumLabel,

    volatilityLabel,

    signalQuality,

    tradeReadinessLabel,

    decision,

    decisionReason,

    nextConfirmation,

    confidenceLabel,

    marketPressure,

    riskProfile,

    aiGuidance,

    confluence,

    aiConfidence,

    aiNarrative,
};
}