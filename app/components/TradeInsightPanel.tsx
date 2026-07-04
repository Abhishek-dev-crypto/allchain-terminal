"use client";

import React from "react";
import { useAI } from "@/app/hooks/useAI";

export default function TradeInsightPanel({
  symbol,
}: {
  symbol: string;
}) {
  const { ai, ui, loading } = useAI(symbol);

  if (!symbol) return null;

  if (loading || !ai || !ui) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
        Loading Trade Insights...
      </div>
    );
  }

  const tradingBias =
    ai.action === "BUY"
      ? "Bullish"
      : ai.action === "SELL"
      ? "Bearish"
      : "Neutral";

  const smartMoney =
    ui.marketPressure?.toLowerCase().includes("accumulation")
      ? "Accumulating"
      : ui.marketPressure?.toLowerCase().includes("distribution")
      ? "Distributing"
      : "Neutral";

return (
  <div className="h-full flex flex-col gap-2 text-white text-[11px]">

    {/* HEADER */}
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xs font-semibold">Trade Insights</h2>
        <p className="text-[9px] text-gray-500 uppercase">
          Market Intelligence
        </p>
      </div>

      <span className="text-[10px] text-cyan-400">{symbol}</span>
    </div>

    {/* WHY PRICE MOVED */}
    <div className="rounded-md border border-white/5 bg-white/5 p-2">
      <p className="text-[9px] uppercase text-cyan-400 mb-1">
        Why Price Moved
      </p>

      <p className="text-[10px] text-gray-300 leading-4 line-clamp-3">
        {ui.aiNarrative?.overview}
      </p>
    </div>

    {/* PARTICIPATION */}
    <div className="rounded-md border border-white/5 bg-white/5 p-2">

      <p className="text-[9px] uppercase text-cyan-400 mb-2">
        Market Participation
      </p>

      <div className="space-y-1">

        <div className="flex justify-between">
          <span className="text-gray-400">Smart Money</span>
          <span>{smartMoney}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Pressure</span>
          <span>{ui.marketPressure}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Retail</span>
          <span>{ui.momentumLabel}</span>
        </div>

      </div>

    </div>

    {/* TRADING BIAS */}
    <div className="rounded-md border border-cyan-500/20 bg-cyan-500/5 px-2 py-2">

      <div className="text-[8px] uppercase text-gray-400">
        Current Bias
      </div>

      <div
        className={`text-sm font-bold mt-1 ${
          tradingBias === "Bullish"
            ? "text-green-400"
            : tradingBias === "Bearish"
            ? "text-red-400"
            : "text-yellow-400"
        }`}
      >
        {tradingBias}
      </div>

    </div>

  </div>
);
}