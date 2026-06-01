export type TradeEvent = {
  id: string;
  type: 'buy' | 'sell';
  coin: string;

  amount?: number;
  qty?: number;

  price: number;
  fee: number;
  timestamp: number;

  // ✅ ADD THIS
  priceCurrency?: 'USD' | 'INR';
};

export type PortfolioItem = {
  qty: number;
  avgPrice: number;
};

export type EngineState = {
  balance: number;

  portfolio: Record<
    string,
    {
      qty: number;
      avgPrice: number;
    }
  >;

  trades: TradeEvent[];

  activeOrders: any[];
};

/* ---------------- ORDER SYSTEM (FIXED) ---------------- */

export type OrderSide = 'buy' | 'sell';

export type Order = {
  id: string;
  userId: string;
  coin: string;
  side: OrderSide;
  price: number;
  amount: number;
  qty: number;

  status: 'open' | 'filled' | 'cancelled';

  filledQty: number;   // ✅ instead of "filled"
  remainingQty: number;

  timestamp: number;
};

export type OrderBook = {
  bids: Order[];
  asks: Order[];
};