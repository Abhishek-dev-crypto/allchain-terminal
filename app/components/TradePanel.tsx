'use client';

import { useState, useMemo } from 'react';
import Button from './ui/button';

type Position = {
  qty: number;
  avgPrice: number;
};

type Mode = 'buy' | 'sell';
type OrderType = 'market' | 'limit' | 'stop';

export default function TradePanel({
  coinId,
  price,
  balance,
  position,
  onTrade,
}: {
  coinId: string;
  price: number;
  balance: number;
  position?: Position;
  onTrade: (
    type: Mode,
    amount: number,
    qty: number,
    limitPrice?: number,
    orderType?: OrderType
  ) => void;
}) {
  const [mode, setMode] = useState<Mode>('buy');
  const [orderType, setOrderType] =
    useState<OrderType>('market');

  const [amount, setAmount] = useState('');

  const numAmount = Number(amount) || 0;

  const safePrice = price || 0;

  const qtyOwned = position?.qty || 0;

  /* ---------------- PRICE ---------------- */

  const USD_INR = 83;

  /* convert USD -> INR once */
  const marketPriceInr = safePrice * USD_INR;

  /* only market orders for now */
  const executionPrice = marketPriceInr;

  /* ---------------- CALCULATIONS ---------------- */

  const qty = useMemo(() => {
    if (mode === 'buy') {
      return numAmount / executionPrice;
    }

    return numAmount;
  }, [numAmount, executionPrice, mode]);

  const total = useMemo(() => {
    return qty * executionPrice;
  }, [qty, executionPrice]);

  /* ---------------- VALIDATION ---------------- */

  const error = useMemo(() => {
    if (!numAmount || numAmount <= 0) {
      return 'Enter amount';
    }

    if (executionPrice <= 0) {
      return 'Invalid price';
    }

    if (mode === 'buy' && numAmount > balance) {
      return 'Insufficient balance';
    }

    if (mode === 'sell' && qty > qtyOwned) {
      return 'Insufficient holdings';
    }

    return '';
  }, [
    numAmount,
    executionPrice,
    balance,
    qtyOwned,
    qty,
    mode,
  ]);

  const disabled =
    !!error || orderType !== 'market';

  /* ---------------- MAX ---------------- */

  const handleMax = () => {
    if (mode === 'buy') {
      setAmount(balance.toFixed(0));
    } else {
      setAmount(qtyOwned.toFixed(6));
    }
  };

  /* ---------------- TRADE ---------------- */

  const handleTrade = () => {
    if (disabled) return;

    onTrade(
      mode,
      numAmount,
      qty,
      undefined,
      orderType
    );

    setAmount('');
  };

  return (
    <div className="h-full overflow-y-auto flex flex-col bg-[#0B1220]/80 backdrop-blur border border-white/5 rounded-xl p-3 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

      {/* BUY / SELL */}
      <div className="flex bg-white/5 rounded-lg p-1">
        <button
          onClick={() => setMode('buy')}
          className={`flex-1 py-1.5 text-sm rounded transition ${
            mode === 'buy'
              ? 'bg-green-600 text-white'
              : 'text-gray-400'
          }`}
        >
          Buy
        </button>

        <button
          onClick={() => setMode('sell')}
          className={`flex-1 py-1.5 text-sm rounded transition ${
            mode === 'sell'
              ? 'bg-red-600 text-white'
              : 'text-gray-400'
          }`}
        >
          Sell
        </button>
      </div>

      {/* ORDER TYPE */}
      <div className="flex text-xs gap-2">
        {['market', 'limit', 'stop'].map((t) => (
          <button
            key={t}
            onClick={() =>
              setOrderType(t as OrderType)
            }
            className={`px-3 py-1 rounded transition ${
              orderType === t
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:bg-white/5'
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* COMING SOON */}
      {orderType !== 'market' && (
        <div className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
          {orderType.toUpperCase()} orders will
          be available soon
        </div>
      )}

      {/* PRICE INFO */}
      <div className="text-xs flex justify-between text-gray-400">
        <span>Market Price</span>

        <span className="text-white">
          ₹{marketPriceInr.toFixed(2)}
        </span>
      </div>

      {/* AMOUNT */}
<div className="flex gap-2">
  <input
    type="number"
    value={amount}
    disabled={orderType !== 'market'}
    onChange={(e) => setAmount(e.target.value)}
    placeholder={
      orderType !== 'market'
        ? `${orderType.toUpperCase()} orders coming soon`
        : mode === 'buy'
        ? 'Amount (₹)'
        : `Quantity (${coinId.replace('USDT', '')})`
    }
    className={`flex-1 px-2 py-2 text-sm rounded border transition ${
      orderType !== 'market'
        ? 'bg-neutral-900 text-gray-500 border-white/5 cursor-not-allowed'
        : 'bg-black/40 border-white/10'
    }`}
  />

  <button
    onClick={handleMax}
    disabled={orderType !== 'market'}
    className={`px-3 text-xs rounded transition ${
      orderType !== 'market'
        ? 'bg-white/5 text-gray-500 cursor-not-allowed'
        : 'bg-white/10 hover:bg-white/20'
    }`}
  >
    Max
  </button>
</div>

      {/* BALANCE */}
      <div className="text-xs flex justify-between text-gray-400">
        <span>Balance</span>

        <span className="text-white">
          ₹{balance.toFixed(0)}
        </span>
      </div>

      {/* HOLDINGS */}
      <div className="text-xs flex justify-between text-gray-400">
        <span>
          Holdings ({coinId.replace('USDT', '')})
        </span>

        <span className="text-white">
          {qtyOwned.toFixed(5)}
        </span>
      </div>

      {/* PREVIEW */}
      {numAmount > 0 && !error && (
        <div className="text-xs space-y-1 border-t border-white/5 pt-2">

          <div className="flex justify-between">
            <span>Est. Qty</span>

            <span className="text-white">
              {qty.toFixed(5)}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Total</span>

            <span className="text-white">
              ₹{total.toFixed(2)}
            </span>
          </div>

        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="text-xs text-red-400">
          {error}
        </div>
      )}

      {/* CTA */}
      <Button
        disabled={disabled}
        onClick={handleTrade}
        className={`w-full text-sm ${
          mode === 'buy'
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-red-600 hover:bg-red-700'
        }`}
      >
        {orderType !== 'market'
          ? `${orderType.toUpperCase()} Coming Soon`
          : `${mode === 'buy' ? 'Buy' : 'Sell'} ${coinId}`}
      </Button>
    </div>
  );
}