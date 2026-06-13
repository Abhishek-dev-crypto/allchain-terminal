'use client';

import { useEffect, useState, useMemo } from 'react';

type Order = {
  price: number;
  qty: number;
  total?: number;
};

type Props = {
  symbol: string;
};

type OrderBookData = {
  bids: Order[];
  asks: Order[];
};

export default function OrderBook({ symbol }: Props) {
  const [orderBook, setOrderBook] = useState<OrderBookData>({
    bids: [],
    asks: [],
  });

 useEffect(() => {
  if (!symbol) return;

  const fetchOrderBook = async () => {
    try {
      const res = await fetch(
  `https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=20`
      );

      const data = await res.json();

      const asksRaw: Order[] = (data.asks || [])
        .map((a: string[]) => ({
          price: Number(a[0]),
          qty: Number(a[1]),
        }))
        .sort(
          (a: Order, b: Order) => a.price - b.price
        )
        .slice(0, 15);

      const bidsRaw: Order[] = (data.bids || [])
        .map((b: string[]) => ({
          price: Number(b[0]),
          qty: Number(b[1]),
        }))
        .sort(
          (a: Order, b: Order) => b.price - a.price
        )
        .slice(0, 15);

      let askTotal = 0;
      const asks = asksRaw.map((a) => {
        askTotal += a.qty;
        return {
          ...a,
          total: askTotal,
        };
      });

      let bidTotal = 0;
      const bids = bidsRaw.map((b) => {
        bidTotal += b.qty;
        return {
          ...b,
          total: bidTotal,
        };
      });

      setOrderBook({
        bids,
        asks,
      });

    } catch (err) {
      console.error(
        "OrderBook fetch error:",
        err
      );
    }
  };

  fetchOrderBook();

  const interval = setInterval(
    fetchOrderBook,
    3000
  );

  return () => clearInterval(interval);

}, [symbol]);

  /* ================= DERIVED ================= */

  const bestBid = orderBook.bids[0]?.price || 0;
  const bestAsk = orderBook.asks[0]?.price || 0;

  const spread = bestAsk - bestBid;
  const spreadPercent =
    midSafe(bestBid, bestAsk) > 0
      ? (spread / midSafe(bestBid, bestAsk)) * 100
      : 0;

  const mid = (bestAsk + bestBid) / 2;

  const maxTotal = useMemo(() => {
    return Math.max(
      ...orderBook.bids.map((b) => b.total || 0),
      ...orderBook.asks.map((a) => a.total || 0),
      1
    );
  }, [orderBook]);

  function midSafe(bid: number, ask: number) {
    return (bid + ask) / 2;
  }

  return (
    <div className="h-full flex flex-col text-[10px] font-mono text-white">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-2 px-1">

        <div>
          <p className="text-sm font-bold text-white">
            Order Book
          </p>

          <p className="text-[9px] text-gray-500 uppercase tracking-wider">
            Live Market Depth
          </p>
        </div>

        <div className="flex items-center gap-1 text-[9px] text-green-400">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          LIVE
        </div>

      </div>

      {/* COLUMN HEADER */}
      <div className="grid grid-cols-3 px-2 py-1 border-y border-white/5 text-[9px] text-gray-500 mb-1">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      {/* ASKS */}
      <div className="flex-1 overflow-hidden space-y-[1px]">

        {orderBook.asks
          .slice()
          .reverse()
          .map((ask, i) => {

            const depth =
              ((ask.total || 0) / maxTotal) * 100;

            return (
              <div
                key={i}
                className="relative grid grid-cols-3 items-center h-[18px] px-2 rounded overflow-hidden"
              >

                {/* DEPTH */}
                <div
                  className="absolute right-0 top-0 h-full bg-red-500/12 transition-all duration-300"
                  style={{
                    width: `${depth}%`,
                  }}
                />

                <span className="relative z-10 text-red-400 tabular-nums">
                  {ask.price.toFixed(2)}
                </span>

                <span className="relative z-10 text-right text-gray-300 tabular-nums">
                  {ask.qty.toFixed(4)}
                </span>

                <span className="relative z-10 text-right text-gray-500 tabular-nums">
                  {(ask.total || 0).toFixed(2)}
                </span>

              </div>
            );
          })}
      </div>

      {/* MID PRICE */}
      <div className="my-2 rounded-lg border border-cyan-500/10 bg-cyan-500/5 py-2 text-center">

        <div className="text-[20px] font-bold text-cyan-400 tracking-wide tabular-nums">
          {mid ? mid.toFixed(2) : '--'}
        </div>

        <div className="mt-1 flex items-center justify-center gap-3 text-[9px] text-gray-400">

          <span>
            Spread: {spread.toFixed(2)}
          </span>

          <span>
            {spreadPercent.toFixed(4)}%
          </span>

        </div>

      </div>

      {/* BIDS */}
      <div className="flex-1 overflow-hidden space-y-[1px]">

        {orderBook.bids.map((bid, i) => {

          const depth =
            ((bid.total || 0) / maxTotal) * 100;

          return (
            <div
              key={i}
              className="relative grid grid-cols-3 items-center h-[18px] px-2 rounded overflow-hidden"
            >

              {/* DEPTH */}
              <div
                className="absolute right-0 top-0 h-full bg-green-500/12 transition-all duration-300"
                style={{
                  width: `${depth}%`,
                }}
              />

              <span className="relative z-10 text-green-400 tabular-nums">
                {bid.price.toFixed(2)}
              </span>

              <span className="relative z-10 text-right text-gray-300 tabular-nums">
                {bid.qty.toFixed(4)}
              </span>

              <span className="relative z-10 text-right text-gray-500 tabular-nums">
                {(bid.total || 0).toFixed(2)}
              </span>

            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="mt-2 pt-2 border-t border-white/5 flex justify-between text-[9px] text-gray-500">

        <span>
          Bids: {orderBook.bids.length}
        </span>

        <span>
          Asks: {orderBook.asks.length}
        </span>

      </div>

    </div>
  );
}