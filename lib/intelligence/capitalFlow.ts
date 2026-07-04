import { Candle } from "./computeSignalAdvanced";

export type FlowState = "ACCUMULATION" | "DISTRIBUTION" | "NEUTRAL";

export type FlowOutput = {
  state: FlowState;
  buyPressure: number;
  sellPressure: number;
  liquiditySpike: boolean;
  volumeStrength: number;

  // 🔥 NEW (important for your Intel engine)
  flowMomentum: number;
  imbalance: number;
};

function clamp(n: number) {
  return Math.max(0, Math.min(100, n));
}

export function analyzeCapitalFlow(candles: Candle[]): FlowOutput {
  if (!candles || candles.length < 20) {
    return {
      state: "NEUTRAL",
      buyPressure: 0,
      sellPressure: 0,
      liquiditySpike: false,
      volumeStrength: 0,
      flowMomentum: 0,
      imbalance: 0,
    };
  }

  const last20 = candles.slice(-20);

  let buyPressure = 0;
  let sellPressure = 0;
  let volumeSum = 0;

  // decay weighting (recent candles matter more)
  const decayFactor = 0.9;

  let weight = 1;

  for (let i = last20.length - 1; i > 0; i--) {
    const c = last20[i];
    const prev = last20[i - 1];

    const isGreen = c.close > c.open;
    const body = Math.abs(c.close - c.open);
    const range = c.high - c.low || 1;

    const efficiency = body / range;

    const weightedVolume = c.volume * weight;

    volumeSum += c.volume;

    if (isGreen) {
      buyPressure += efficiency * weightedVolume;
    } else {
      sellPressure += efficiency * weightedVolume;
    }

    weight *= decayFactor;
  }

  const totalPressure = buyPressure + sellPressure;

  const imbalance =
    totalPressure === 0
      ? 0
      : (buyPressure - sellPressure) / totalPressure;

  // normalize volume strength (0–100)
  const avgVolume = volumeSum / last20.length;
  const latestVolume = last20[last20.length - 1].volume;

  const volumeStrength = clamp(
    (latestVolume / (avgVolume || 1)) * 50
  );

  // smarter liquidity detection (sustained spike, not single candle)
  const last5 = last20.slice(-5);
  const avgLast5 =
    last5.reduce((a, b) => a + b.volume, 0) / last5.length;

  const liquiditySpike =
    latestVolume > avgVolume * 1.8 &&
    avgLast5 > avgVolume * 1.3;

  // FLOW MOMENTUM (critical upgrade)
  const recentPressure = last20.slice(-5).reduce((acc, c) => {
    const body = Math.abs(c.close - c.open);
    return acc + body * c.volume;
  }, 0);

  const olderPressure = last20.slice(0, 5).reduce((acc, c) => {
    const body = Math.abs(c.close - c.open);
    return acc + body * c.volume;
  }, 0);

  const flowMomentum =
    olderPressure === 0
      ? 0
      : ((recentPressure - olderPressure) / olderPressure) * 100;

  // STATE CLASSIFICATION (clean + stable)
  let state: FlowState = "NEUTRAL";

  if (buyPressure > sellPressure * 1.25 && imbalance > 0.15) {
    state = "ACCUMULATION";
  } else if (sellPressure > buyPressure * 1.25 && imbalance < -0.15) {
    state = "DISTRIBUTION";
  }

  return {
    state,
    buyPressure,
    sellPressure,
    liquiditySpike,
    volumeStrength,
    flowMomentum,
    imbalance,
  };
}