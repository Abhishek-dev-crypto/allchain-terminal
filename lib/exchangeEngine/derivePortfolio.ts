import { EngineState, TradeEvent } from './types';

const USD_INR = 83;
const FEE_RATE = 0.001;

type NormalizedTrade = TradeEvent & {
  priceInr: number;
};

const normalizeTrade = (t: TradeEvent): NormalizedTrade => {
  const priceInr =
    t.priceCurrency === 'USD' ? t.price * USD_INR : t.price;

  return {
    ...t,
    priceInr,
  };
};

export function derivePortfolio(trades: TradeEvent[]): EngineState {
  const balance = 1000000;

  const portfolio: Record<string, { qty: number; avgPrice: number }> = {};

  const normalized = trades.map(normalizeTrade);

  let runningBalance = balance;

  for (const t of normalized) {
    const coin = t.coin;

    /* ================= BUY ================= */
    if (t.type === 'buy') {
      const qty = t.qty || 0;
      const amount = t.amount || 0;

      const fee = amount * FEE_RATE;
      const totalCost = amount + fee;

      runningBalance -= totalCost;

      const existing = portfolio[coin];

      if (existing) {
        const newQty = existing.qty + qty;

        const totalCostBasis =
          existing.avgPrice * existing.qty + t.priceInr * qty;

        portfolio[coin] = {
          qty: newQty,
          avgPrice: totalCostBasis / newQty,
        };
      } else {
        portfolio[coin] = {
          qty,
          avgPrice: t.priceInr,
        };
      }
    }

    /* ================= SELL ================= */
    if (t.type === 'sell') {
      const qty = t.qty || 0;

      const existing = portfolio[coin];
      if (!existing) continue;

      const sellValue = qty * t.priceInr;
      const fee = sellValue * FEE_RATE;
      const proceeds = sellValue - fee;

      runningBalance += proceeds;

      const remainingQty = existing.qty - qty;

      if (remainingQty <= 1e-8) {
        delete portfolio[coin];
      } else {
        portfolio[coin] = {
          qty: remainingQty,
          avgPrice: existing.avgPrice,
        };
      }
    }
  }

  return {
    balance: runningBalance,
    portfolio,
    trades,
    activeOrders: [],
  };
}