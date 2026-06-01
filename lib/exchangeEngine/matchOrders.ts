import { Order, OrderBook, TradeEvent } from './types';

export function matchOrders(orderBook: OrderBook): {
  orderBook: OrderBook;
  trades: TradeEvent[];
} {
  const trades: TradeEvent[] = [];

  const bids = [...orderBook.bids].sort((a, b) => b.price - a.price);
  const asks = [...orderBook.asks].sort((a, b) => a.price - b.price);

  let i = 0;
  let j = 0;

  while (i < bids.length && j < asks.length) {
    const bid = bids[i];
    const ask = asks[j];

    // ❌ no match possible
    if (bid.price < ask.price) break;

    const bidRemaining = bid.remainingQty;
    const askRemaining = ask.remainingQty;

    const matchQty = Math.min(bidRemaining, askRemaining);

    if (matchQty <= 0) {
      if (bidRemaining <= 0) i++;
      if (askRemaining <= 0) j++;
      continue;
    }

    const tradePrice =
      ask.timestamp <= bid.timestamp ? ask.price : bid.price;

    const trade: TradeEvent = {
      id: `${Date.now()}-${Math.random()}`,
      type: 'buy',
      coin: bid.coin,
      price: tradePrice,
      qty: matchQty,
      amount: matchQty * tradePrice,
      fee: 0,
      timestamp: Date.now(),
    };

    trades.push(trade);

    // ❗ IMMUTABLE UPDATE (NO direct mutation)
    bid.remainingQty -= matchQty;
    ask.remainingQty -= matchQty;

    bid.filledQty += matchQty;
    ask.filledQty += matchQty;

    if (bid.remainingQty <= 0) {
      bid.status = 'filled';
      i++;
    } else {
      bid.status = 'open';
    }

    if (ask.remainingQty <= 0) {
      ask.status = 'filled';
      j++;
    } else {
      ask.status = 'open';
    }
  }

  return {
    orderBook: {
      bids: bids.filter(o => o.status !== 'filled'),
      asks: asks.filter(o => o.status !== 'filled'),
    },
    trades,
  };
}