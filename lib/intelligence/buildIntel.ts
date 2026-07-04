import {
  Candle,
  TechnicalEvidence,
} from "./computeSignalAdvanced";
import { analyzeCapitalFlow, FlowOutput } from "./capitalFlow";
import { computeSignalAdvanced } from "./computeSignalAdvanced";
import { detectRegime } from "./detectRegime";

/* ================= TYPES ================= */

export type TimeframeState = "BULLISH" | "BEARISH" | "NEUTRAL";

export type IntelOutput = {
  alignmentScore: number;

  regime: "BULL" | "BEAR" | "SIDEWAYS";

  flow: {
    buyPressure: number;
    sellPressure: number;
    volumeStrength: number;
    liquiditySpike: boolean;
    state: "ACCUMULATION" | "DISTRIBUTION" | "NEUTRAL";
  };

  signal: {
  action: "BUY" | "SELL" | "HOLD";
  confidence: number;
  technicalEvidence: TechnicalEvidence;
};

  momentum: {
    shortTerm: number;
    longTerm: number;
    acceleration: number;
  };

  volatility: number;

  trend: {
    oneMinute: TimeframeState;
    fiveMinute: TimeframeState;
    fifteenMinute: TimeframeState;
    thirtyMinute: TimeframeState;
    oneHour: TimeframeState;

    alignmentScore: number;
    dominantTrend: "BULLISH" | "BEARISH" | "MIXED";
  };

  confluence: {
    trendScore: number;
    flowScore: number;
    signalScore: number;
    regimeScore: number;

    total: number;
    bias: "BULLISH" | "BEARISH" | "NEUTRAL";

    direction: "BULLISH" | "BEARISH" | "MIXED";
    agreementScore: number;
    score: number;

    intelligenceScore: number;
  };
};

/* ================= UTILS ================= */

function clamp(n: number) {
  return Math.max(0, Math.min(100, n));
}

function safeGet(candles: Candle[], indexFromEnd: number) {
  return candles?.[candles.length - indexFromEnd];
}

/* ================= TREND ================= */

function getTrend(candles: Candle[]): TimeframeState {
  if (!candles || candles.length < 10) return "NEUTRAL";

  const last = safeGet(candles, 1);
  const prev = safeGet(candles, 5);

  if (!last || !prev) return "NEUTRAL";

  const change = ((last.close - prev.close) / (prev.close || 1)) * 100;

  if (change > 0.3) return "BULLISH";
  if (change < -0.3) return "BEARISH";
  return "NEUTRAL";
}

function dominantTrend(trends: TimeframeState[]) {
  const bull = trends.filter(t => t === "BULLISH").length;
  const bear = trends.filter(t => t === "BEARISH").length;

  if (bull > bear) return "BULLISH";
  if (bear > bull) return "BEARISH";
  return "MIXED";
}



/* ================= MAIN ENGINE ================= */

export function buildIntel(
  m1: Candle[],
  m5: Candle[],
  m15: Candle[],
  m30: Candle[],
  h1: Candle[]
): IntelOutput {

  /* ================= CORE MODULES ================= */
 const flow = analyzeCapitalFlow(m5) as FlowOutput;
  const signal = computeSignalAdvanced(m5);
  const regimeData = detectRegime(m15);
const regime = regimeData.regime;
  
  /* ================= TREND ENGINE ================= */

  const oneMinute = getTrend(m1);
  const fiveMinute = getTrend(m5);
  const fifteenMinute = getTrend(m15);
  const thirtyMinute = getTrend(m30);
  const oneHour = getTrend(h1);

  const trends: TimeframeState[] = [
    oneMinute,
    fiveMinute,
    fifteenMinute,
    thirtyMinute,
    oneHour,
  ];

  const bullCount = trends.filter(t => t === "BULLISH").length;
  const bearCount = trends.filter(t => t === "BEARISH").length;

  const alignmentScore = clamp(
    (Math.max(bullCount, bearCount) / trends.length) * 100
  );

  const trendDominant = dominantTrend(trends);

  /* ================= MOMENTUM ================= */

  const shortTerm =
  safeGet(m1, 1) && safeGet(m1, 5)
    ? ((safeGet(m1, 1)!.close - safeGet(m1, 5)!.close) /
        (safeGet(m1, 5)!.close || 1)) *
        100 +
      50
    : 50;

  const longTerm =
  safeGet(m15, 1) && safeGet(m15, 5)
    ? ((safeGet(m15, 1)!.close - safeGet(m15, 5)!.close) /
        (safeGet(m15, 5)!.close || 1)) *
        100 +
      50
    : 50;

  const acceleration = clamp(shortTerm - longTerm + 50);

  /* ================= VOLATILITY ================= */

  const last = safeGet(m5, 1);
  const prev = safeGet(m5, 2);

  const volatility =
  last && prev
    ? (Math.abs(last.high - last.low) / last.close) * 100
    : 0;


    const imbalance =
  (flow.buyPressure - flow.sellPressure) /
  Math.max(flow.buyPressure + flow.sellPressure, 1);


// smoother scaling (log compression)
const normalizedVolatility = clamp(Math.log1p(volatility) * 25);

  /* ================= CONFLUENCE CORE ================= */

 const trendScore =
  alignmentScore > 60 ? 1 :
  alignmentScore < 40 ? -1 : 0;

  const flowScore =
  imbalance > 0.15 ? 1 :
  imbalance < -0.15 ? -1 : 0;

  const signalScore =
    signal.signal === "BUY" ? 1 :
    signal.signal === "SELL" ? -1 : 0;

  const regimeScore =
    regime === "BULL" ? 1 :
    regime === "BEAR" ? -1 : 0;

  const total = trendScore + flowScore + signalScore + regimeScore;

  let bias: "BULLISH" | "BEARISH" | "NEUTRAL" = "NEUTRAL";

  if (total >= 2) bias = "BULLISH";
  else if (total <= -2) bias = "BEARISH";

  const direction: "BULLISH" | "BEARISH" | "MIXED" =
    total >= 2 ? "BULLISH" : total <= -2 ? "BEARISH" : "MIXED";

  /* ================= AGREEMENT ================= */

const signals = [trendScore, flowScore, signalScore, regimeScore];

const agreementScore =
  clamp(
    (Math.abs(signals.reduce((a, b) => a + b, 0)) / signals.length) * 100
  );

  /* ================= INTELLIGENCE SCORE ================= */

  const directionalPressure =
    (flow.buyPressure - flow.sellPressure) * 0.4 +
    (signal.signal === "BUY" ? 1 : signal.signal === "SELL" ? -1 : 0) * 0.3 +
    (alignmentScore > 60 ? 1 : alignmentScore < 40 ? -1 : 0) * 0.3;

  const regimeMultiplier =
  regime === "BULL" ? 1.15 :
  regime === "BEAR" ? 0.9 :
  0.75;

  const normalizedPressure = clamp((directionalPressure + 1) * 50);

let intelligenceScore =
  normalizedPressure * 0.5 +
  agreementScore * 0.3 +
  alignmentScore * 0.2;

intelligenceScore *= regimeMultiplier;
intelligenceScore = clamp(intelligenceScore);

  /* ================= FINAL ACTION ENGINE ================= */

 let action: "BUY" | "SELL" | "HOLD" = "HOLD";

const isUnsafe =
  (regime !== "BULL" && regime !== "BEAR") ||
  agreementScore < 40 ||
  normalizedVolatility > 70;

if (isUnsafe) {
  action = "HOLD";
} else {
  if (
    intelligenceScore > 70 &&
    flow.buyPressure > flow.sellPressure &&
    regime !== "BEAR"
  ) {
    action = "BUY";
  } 
  else if (
    intelligenceScore < 30 &&
    flow.sellPressure > flow.buyPressure &&
    regime !== "BULL"
  ) {
    action = "SELL";
  }
}


  /* ================= FINAL OUTPUT ================= */

  return {
    alignmentScore,
    regime,

    flow: {
      buyPressure: flow.buyPressure,
      sellPressure: flow.sellPressure,
      volumeStrength: flow.volumeStrength,
      liquiditySpike: flow.liquiditySpike,
      state: flow.state,
    },

    signal: {
    action: signal.signal,
    confidence: signal.confidence,
    technicalEvidence: signal.technicalEvidence,
    },

    momentum: {
      shortTerm,
      longTerm,
      acceleration,
    },

    volatility: normalizedVolatility,

    trend: {
      oneMinute,
      fiveMinute,
      fifteenMinute,
      thirtyMinute,
      oneHour,

      alignmentScore,
      dominantTrend: trendDominant,
    },

    confluence: {
      trendScore,
      flowScore,
      signalScore,
      regimeScore,

      total,
      bias,

      direction,
      agreementScore,
      score: clamp(((total + 4) / 8) * 100),

      intelligenceScore,
      
    },
  };
}