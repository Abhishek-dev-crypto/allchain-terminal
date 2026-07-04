// lib/intelligence/computeSignalAdvanced.ts

export type Candle = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type Signal = "BUY" | "SELL" | "HOLD";

export type SignalResult = {
  signal: Signal;
  confidence: number;
  atr: number;
  technicalEvidence: TechnicalEvidence;
};

function macd(prices: number[]) {
  const ema12Series: number[] = [];
  const ema26Series: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    ema12Series.push(ema(prices.slice(0, i + 1), 12));
    ema26Series.push(ema(prices.slice(0, i + 1), 26));
  }

  const macdLine = ema12Series[ema12Series.length - 1] -
                   ema26Series[ema26Series.length - 1];

  const signalLine = ema(
    ema12Series.map((v, i) => v - ema26Series[i]).slice(-9),
    9
  );

  return { macdLine, signalLine };
}

/* ===== INDICATORS ===== */

function ema(prices: number[], period: number) {
  const k = 2 / (period + 1);
  let val = prices[0] || 0;

  for (let i = 1; i < prices.length; i++) {
    val = prices[i] * k + val * (1 - k);
  }

  return val;
}

function rsi(prices: number[], period = 14) {
  if (prices.length < period + 1) return 50;

  let gain = 0;
  let loss = 0;

  for (let i = prices.length - period; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gain += diff;
    else loss += Math.abs(diff);
  }

  const rs = gain / (loss || 1);
  return 100 - 100 / (1 + rs);
}

function calculateATR(candles: Candle[], period = 14) {
  if (candles.length < period + 1) return 0;

  const trs: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;

    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );

    trs.push(tr);
  }

  const recent = trs.slice(-period);
  return recent.reduce((a, b) => a + b, 0) / period;
}

export type TechnicalEvidence = {
  score: number;

  ema: {
    trend: "BULLISH" | "BEARISH";
    aligned: boolean;
    distance: number;
  };

  rsi: {
    value: number;
    state:
      | "OVERBOUGHT"
      | "BULLISH"
      | "NEUTRAL"
      | "BEARISH"
      | "OVERSOLD";
  };

  macd: {
    state: "BULLISH" | "BEARISH";
    histogram: number;
  };

  volume: {
    spike: boolean;
    direction: "BUY" | "SELL" | "NEUTRAL";
    average: number;
    latest: number;
  };

  structure: {
    state: "HIGHER_HIGHS" | "LOWER_LOWS" | "RANGE";
  };
};



/* ================= CORE SIGNAL ENGINE ================= */

export function computeSignalAdvanced(candles: Candle[]): SignalResult {
  if (candles.length < 30) {
  return {
    signal: "HOLD",
    confidence: 50,
    atr: 0,

    technicalEvidence: {
      score: 0,

      ema: {
        trend: "BEARISH",
        aligned: false,
        distance: 0,
      },

      rsi: {
        value: 50,
        state: "NEUTRAL",
      },

      macd: {
        state: "BEARISH",
        histogram: 0,
      },

      volume: {
        spike: false,
        direction: "NEUTRAL",
        average: 0,
        latest: 0,
      },

      structure: {
        state: "RANGE",
      },
    },
  };
}

  // ===== Base Data =====
  const closes = candles.map(c => c.close);
  const last = candles.at(-1)!;

  const latestClose = last.close;

  const r = rsi(closes);
  const e10 = ema(closes.slice(-10), 10);
  const e20 = ema(closes.slice(-20), 20);
  const atr = calculateATR(candles);

  const emaDistance =
  e20 === 0
    ? 0
    : ((e10 - e20) / e20) * 100;

const emaEvidence: TechnicalEvidence["ema"] = {
  trend: e10 > e20 ? "BULLISH" : "BEARISH",
  aligned: Math.abs(emaDistance) > 0.2,
  distance: Number(emaDistance.toFixed(2)),
};

const rsiEvidence: TechnicalEvidence["rsi"] = {
  value: Number(r.toFixed(1)),
  state:
    r >= 75
      ? "OVERBOUGHT"
      : r > 55
      ? "BULLISH"
      : r <= 25
      ? "OVERSOLD"
      : r <= 45
      ? "BEARISH"
      : "NEUTRAL",
};



  // ===== Volume =====
  const avgVol =
    candles.slice(-10).reduce((a, b) => a + b.volume, 0) / 10;

  const volumeSpike = last.volume > avgVol * 1.5;

  // ===== Score Engine =====
  let score = 0;

  /* ---------- RSI ---------- */
  if (r >= 55 && r < 75) score += 2;   // bullish momentum
  if (r < 45 && r > 25) score -= 2;   // bearish momentum
  if (r >= 75) score -= 1;            // overbought
  if (r <= 25) score += 1;            // oversold

  /* ---------- Trend ---------- */
  if (e10 > e20) {
    score += 3;
    if (latestClose > e10) score += 1; // trend confirmation
  } else {
    score -= 3;
    if (latestClose < e10) score -= 1;
  }

  /* ---------- Volume ---------- */
  if (volumeSpike) {
    score += last.close > last.open ? 1 : -1;
  }

  /* ---------- MACD ---------- */
  const { macdLine, signalLine } = macd(closes);

  if (macdLine > signalLine) score += 1;
  else score -= 1;

  /* ---------- Market Structure ---------- */
  const last5 = candles.slice(-5);

  let higherHighs = false;
  let lowerLows = false;

  if (last5.length === 5) {
  higherHighs =
    last5[4].high > last5[3].high &&
    last5[3].high > last5[2].high;

  lowerLows =
    last5[4].low < last5[3].low &&
    last5[3].low < last5[2].low;

  if (higherHighs) score += 2;
  if (lowerLows) score -= 2;
}

  // ===== Signal Decision =====
  let signal: Signal = "HOLD";
  if (score >= 3) signal = "BUY";
  else if (score <= -3) signal = "SELL";

  // ===== Confidence Model =====
  let confidence = 50 + Math.abs(score) * 10;

  if (volumeSpike) confidence += 5;
  if (atr > 0) confidence += 5;

  confidence = Math.min(95, Math.max(40, confidence));

  const histogram = macdLine - signalLine;

const macdEvidence: TechnicalEvidence["macd"] = {
  state: histogram >= 0 ? "BULLISH" : "BEARISH",
  histogram: Number(histogram.toFixed(4)),
};

const volumeEvidence: TechnicalEvidence["volume"] = {
  spike: volumeSpike,
  direction: volumeSpike
    ? last.close > last.open
      ? "BUY"
      : "SELL"
    : "NEUTRAL",
  average: avgVol,
  latest: last.volume,
};

const structureEvidence: TechnicalEvidence["structure"] = {
  state: higherHighs
    ? "HIGHER_HIGHS"
    : lowerLows
    ? "LOWER_LOWS"
    : "RANGE",
};

  return {
  signal,
  confidence: Math.round(confidence),
  atr,

  technicalEvidence: {
    score,

    ema: emaEvidence,

    rsi: rsiEvidence,

    macd: macdEvidence,

    volume: volumeEvidence,

    structure: structureEvidence,
  },
};
}