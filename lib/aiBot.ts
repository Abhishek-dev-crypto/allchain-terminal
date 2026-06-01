/* =========================
   TYPES
========================= */

export type TradeSignal = {
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  score: number;
  label: string;
  reason: string;
};

export type AIBotSignal = TradeSignal;

export type AutoTradeSignal = {
  action: 'BUY' | 'SELL' | 'HOLD' | 'WAIT';
  confidence: number;
  score: number;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  reason: string;
  strategy: string;
};

/* =========================
   SIMPLE UI AI (Trade Page)
========================= */

export const getTradeSignal = (
  change: number,
  high: number = 0,
  low: number = 0,
  tradeScore: number = 50,
  price?: number // 👈 NEW
): TradeSignal => {
  const volatility = low ? ((high - low) / low) * 100 : 0;
  const mid = (high + low) / 2;

  let score = 50;

  // momentum
  if (change > 3) score += 20;
  else if (change > 1) score += 10;
  else if (change < -3) score -= 20;

  // volatility
  if (volatility > 5) score -= 10;
  if (volatility < 2) score += 10;

  // behavior
  score += (tradeScore - 50) * 0.3;

   // 🔥 PRICE POSITION (NEW EDGE)
  let structure: 'above' | 'below' | 'neutral' = 'neutral';

  if (price && price > mid) {
    score += 5;
    structure = 'above';
  } else if (price && price < mid) {
    score -= 5;
    structure = 'below';
  }

  score = Math.max(0, Math.min(100, score));

  let signal: TradeSignal['signal'] = 'HOLD';

  if (score >= 70) signal = 'BUY';
  else if (score <= 35) signal = 'SELL';

  // 🔥 HUMAN-LIKE REASONING
  let reason = '';
  let label = '';

  if (signal === 'BUY') {
    if (change > 3 && structure === 'above') {
      reason = 'Strong breakout with upward momentum';
      label = 'Momentum Breakout';
    } else if (structure === 'above') {
      reason = 'Price holding above mid-range, buyers in control';
      label = 'Bullish Structure';
    } else {
      reason = 'Mild bullish trend forming';
      label = 'Early Uptrend';
    }
  }

  else if (signal === 'SELL') {
    if (change < -3 && structure === 'below') {
      reason = 'Breakdown with strong selling pressure';
      label = 'Bearish Breakdown';
    } else if (structure === 'below') {
      reason = 'Price below mid-range, sellers dominating';
      label = 'Bearish Structure';
    } else {
      reason = 'Weak market, downside risk increasing';
      label = 'Early Downtrend';
    }
  }

  else {
    if (Math.abs(change) < 0.5) {
      reason = 'Low volatility, no clear direction';
      label = 'Sideways Market';
    } else {
      reason = 'Mixed signals, waiting for confirmation';
      label = 'Uncertain Market';
    }
  }

  return {
    signal,
    confidence: Math.round(score),
    score: Math.round(score),
    label,
    reason,
  };
};

/* =========================
   PRO AI BOT (Dashboard UI)
========================= */

export const generateAIBotSignal = (
  change: number,
  high: number = 0,
  low: number = 0,
  tradeScore: number = 50
): AIBotSignal => {
  const volatility = low ? ((high - low) / low) * 100 : 0;

  let score = 50;

  // momentum
  if (change > 6) score += 30;
  else if (change > 3) score += 20;
  else if (change > 1) score += 10;

  if (change < -6) score -= 30;
  else if (change < -3) score -= 20;

  // volatility
  if (volatility > 8) score -= 15;
  else if (volatility < 2) score += 10;

  // behavior
  score += (tradeScore - 50) * 0.4;

  score = Math.max(0, Math.min(100, score));

  let signal: TradeSignal['signal'] = 'HOLD';

  if (score >= 70) signal = 'BUY';
  else if (score <= 35) signal = 'SELL';

  return {
    signal, // ✅ FIXED
    confidence: Math.round(score),
    score: Math.round(score),
    label:
      score >= 70
        ? 'Strong Buy Setup'
        : score <= 35
        ? 'Strong Sell Setup'
        : 'Neutral Market',
    reason:
      signal === 'BUY'
        ? 'Momentum + volatility favorable'
        : signal === 'SELL'
        ? 'Weak momentum / risk rising'
        : 'Market is neutral',
  };
};

/* =========================
   AUTOPILOT AI
========================= */

export const getAutoTradeSignal = (
  change: number,
  high: number = 0,
  low: number = 0,
  tradeScore: number = 50,
  positionQty: number = 0
): AutoTradeSignal => {
  const volatility = low ? ((high - low) / low) * 100 : 0;

  let score = 50;

  // momentum
  if (change > 6) score += 30;
  else if (change > 3) score += 20;
  else if (change > 1) score += 10;

  if (change < -6) score -= 30;
  else if (change < -3) score -= 20;

  // volatility
  if (volatility > 10) score -= 20;
  else if (volatility > 6) score -= 10;
  else if (volatility < 2) score += 10;

  // behavior
  score += (tradeScore - 50) * 0.3;

  score = Math.max(0, Math.min(100, score));

  // risk
  let risk: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';

  if (volatility > 10 || Math.abs(change) > 6) risk = 'HIGH';
  else if (volatility < 3 && Math.abs(change) < 3) risk = 'LOW';

  let action: AutoTradeSignal['action'] = 'HOLD';

  if (score >= 75) action = 'BUY';
  else if (score <= 30) action = 'SELL';

  // position-aware
  if (positionQty > 0 && action === 'BUY') {
    action = 'HOLD';
  }

  if (risk === 'HIGH' && action !== 'HOLD') {
    action = 'WAIT';
  }

  return {
    action,
    confidence: Math.round(score),
    score: Math.round(score),
    risk,
    strategy:
      action === 'BUY'
        ? 'Momentum breakout strategy'
        : action === 'SELL'
        ? 'Downtrend exit strategy'
        : action === 'WAIT'
        ? 'High risk filter strategy'
        : 'Hold position strategy',
    reason:
      action === 'BUY'
        ? 'Strong bullish momentum detected'
        : action === 'SELL'
        ? 'Bearish pressure increasing'
        : action === 'WAIT'
        ? 'Market too volatile to enter safely'
        : 'No strong signal, holding recommended',
  };
};