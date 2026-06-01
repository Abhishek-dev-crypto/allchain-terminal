import { EngineState, TradeEvent } from './types';

const FEE_RATE = 0.001;
const USD_INR = 83;

const round = (n: number) => Number(n.toFixed(8));

export type ExecuteTradeParams = {
  state: EngineState;
  type: 'buy' | 'sell';
  coin: string;

  amount?: number; // BUY uses INR amount
  qty?: number;    // SELL uses crypto qty

  price: number;

  // 🔥 NEW: explicitly define currency of incoming price
  priceCurrency?: 'INR' | 'USD';
};

function normalizePrice(price: number, currency: 'INR' | 'USD' = 'INR') {
  return currency === 'USD' ? price * USD_INR : price;
}

export function executeTrade({
  state,
  type,
  coin,
  amount,
  qty,
  price,
  priceCurrency = 'INR',
}: ExecuteTradeParams): EngineState {

  if (!price || price <= 0) {
    throw new Error('Invalid price');
  }

  const finalPrice = normalizePrice(price, priceCurrency);

  let newBalance = state.balance;
  const newPortfolio = { ...state.portfolio };

  /* ================= BUY ================= */
  if (type === 'buy') {
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    const buyQty = round(amount / finalPrice);
    const fee = round(amount * FEE_RATE);
    const totalCost = round(amount + fee);

    if (newBalance < totalCost) {
      throw new Error('Insufficient balance');
    }

    newBalance = round(newBalance - totalCost);

    const existing = newPortfolio[coin];

    if (existing) {
      const newQty = round(existing.qty + buyQty);

      newPortfolio[coin] = {
        qty: newQty,
        avgPrice: round(
          (existing.avgPrice * existing.qty + finalPrice * buyQty) / newQty
        ),
      };
    } else {
      newPortfolio[coin] = {
        qty: buyQty,
        avgPrice: finalPrice,
      };
    }

    const trade: TradeEvent = {
  id: crypto.randomUUID(),
  type,
  coin,
  amount,
  qty: buyQty,
  price: finalPrice,
  fee,
  timestamp: Date.now(),

  priceCurrency, // ✅ ADD THIS
};

    return {
      balance: newBalance,
      portfolio: newPortfolio,
      trades: [...state.trades, trade],
      activeOrders: state.activeOrders || [],
    };
  }

  /* ================= SELL ================= */
  if (type === 'sell') {
    if (!qty || qty <= 0) {
      throw new Error('Invalid qty');
    }

    const existing = newPortfolio[coin];

    if (!existing) {
      throw new Error('No holdings');
    }

    if (existing.qty + 1e-8 < qty) {
      throw new Error('Insufficient holdings');
    }

    const sellAmount = round(qty * finalPrice);
    const fee = round(sellAmount * FEE_RATE);
    const proceeds = round(sellAmount - fee);

    newBalance = round(newBalance + proceeds);

    const remainingQty = round(existing.qty - qty);

    if (remainingQty <= 0.00000001) {
      delete newPortfolio[coin];
    } else {
      newPortfolio[coin] = {
        ...existing,
        qty: remainingQty,
      };
    }

    const trade: TradeEvent = {
  id: crypto.randomUUID(),
  type,
  coin,
  amount: sellAmount,
  qty,
  price: finalPrice,
  fee,
  timestamp: Date.now(),

  priceCurrency, // ✅ ADD THIS
};

    return {
      balance: newBalance,
      portfolio: newPortfolio,
      trades: [...state.trades, trade],
      activeOrders: state.activeOrders || [],
    };
  }

  return state;
}