import { Candle } from "./computeSignalAdvanced";

export type MarketRegime = "BULL" | "BEAR" | "SIDEWAYS";

export type RegimeOutput = {
  regime: MarketRegime;
  strength: number; // 0–100 confidence
  volatility: number;
};

function ema(values: number[], period: number) {
  const k = 2 / (period + 1);

  // proper seed = SMA of first window
  const slice = values.slice(0, period);
  let val = slice.reduce((a, b) => a + b, 0) / slice.length;

  for (let i = period; i < values.length; i++) {
    val = values[i] * k + val * (1 - k);
  }

  return val;
}

function calculateVolatility(candles: Candle[]) {
  const returns: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const prev = candles[i - 1].close;
    const curr = candles[i].close;

    returns.push((curr - prev) / prev);
  }

  const mean =
    returns.reduce((a, b) => a + b, 0) / returns.length;

  const variance =
    returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
    returns.length;

  return Math.sqrt(variance); // std deviation
}

export function detectRegime(candles: Candle[]): RegimeOutput {
  if (!candles || candles.length < 50) {
    return {
      regime: "SIDEWAYS",
      strength: 0,
      volatility: 0,
    };
  }

  const closes = candles.map(c => c.close);

  const ema20 = ema(closes.slice(-60), 20);
  const ema50 = ema(closes.slice(-60), 50);

  const latest = closes[closes.length - 1];

  const volatility = calculateVolatility(candles);

  // normalize volatility (robust across assets)
  const volScore = Math.min(volatility * 1000, 100);

  // trend signals
  const bull = ema20 > ema50 && latest > ema20;
  const bear = ema20 < ema50 && latest < ema20;

  let regime: MarketRegime = "SIDEWAYS";

  if (bull && volScore > 10) regime = "BULL";
  else if (bear && volScore > 10) regime = "BEAR";

  // strength calculation
  const trendStrength =
    Math.abs(ema20 - ema50) / latest;

  const strength =
    Math.min(trendStrength * 5000 + volScore * 0.5, 100);

  return {
    regime,
    strength,
    volatility: volScore,
  };
}