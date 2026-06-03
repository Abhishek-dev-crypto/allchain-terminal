'use client';

import React from 'react';
import { motion } from 'framer-motion';

type Trade = {
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  qty: number;
  coin: string;
  balance: number;
};

export default function TradeSuccessModal({
  open,
  trade,
  onClose,
}: {
  open: boolean;
  trade: Trade | null;
  onClose: () => void;
}) {
  if (!open || !trade) return null;

  const fee = trade.amount * 0.001;

  // Simulated current price (for now)
  const currentPrice = trade.price * (1 + (Math.random() - 0.5) * 0.01);

  const pnl = (currentPrice - trade.price) * trade.qty;
  const pnlPercent = (pnl / trade.amount) * 100;

  const isProfit = pnl >= 0;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#020617] border border-green-500/20 rounded-2xl p-6 w-[95vw] max-w-[360px] shadow-xl"
      >

        {/* HEADER */}
        <div className="text-center mb-4">
          <div className="text-green-400 text-3xl mb-2">✔</div>
          <h2 className="text-xl font-bold">
            {trade.type.toUpperCase()} EXECUTED
          </h2>
          <p className="text-gray-400 text-sm">
            {String(trade.coin || "UNKNOWN").toUpperCase()} / USDT
          </p>
        </div>

        {/* DETAILS */}
        <div className="space-y-2 text-sm">

          <div className="flex justify-between">
            <span>Quantity</span>
            <span>{Number(trade.qty || 0).toFixed(6)}</span>
          </div>

          <div className="flex justify-between">
            <span>Price</span>
            <span>₹{trade.price.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Amount</span>
            <span>₹{trade.amount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-yellow-400">
            <span>Fee (0.1%)</span>
            <span>₹{fee.toFixed(2)}</span>
          </div>

          {/* DIVIDER */}
          <div className="border-t border-neutral-700 my-2" />

          {/* PnL */}
          <div className="flex justify-between">
            <span>Entry</span>
            <span>₹{trade.price.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Current</span>
            <span>₹{currentPrice.toFixed(2)}</span>
          </div>

          <div className="flex justify-between font-semibold">
            <span>PnL</span>
            <span className={isProfit ? 'text-green-400' : 'text-red-400'}>
              {isProfit ? '+' : ''}₹{pnl.toFixed(2)} ({pnlPercent.toFixed(2)}%)
            </span>
          </div>

          {/* BALANCE */}
          <div className="flex justify-between border-t border-neutral-700 pt-2 mt-2">
            <span>Balance After</span>
            <span>₹{(trade.balance ?? 0).toFixed(2)}</span>
          </div>
        </div>

        {/* BUTTON */}
        <button
          onClick={onClose}
          className="mt-5 w-full bg-green-600 hover:bg-green-500 py-2 rounded-lg font-medium transition"
        >
          Done
        </button>

      </motion.div>
    </div>
  );
}