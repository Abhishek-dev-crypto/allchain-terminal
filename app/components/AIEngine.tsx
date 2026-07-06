"use client";

import React, { useEffect, useState } from "react";
import { useAI } from "@/app/hooks/useAI";
import LoadingOverlay from "../components/LoadingOverlay";

/* ================= BUY ================= */

const AIBuySection = React.memo(function AIBuySection({ onExecute }: any) {
  const [amount, setAmount] = useState("");

  return (
    <div className="space-y-2">
      <div>
        <p className="text-xs text-gray-400 mb-1">Amount (INR)</p>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2"
        />
      </div>

      <button
        onClick={() => onExecute(Number(amount))}
        disabled={!Number(amount)}
        className="w-full bg-green-600 py-2 rounded font-semibold disabled:opacity-40"
      >
        Confirm BUY
      </button>
    </div>
  );
});

/* ================= SELL ================= */

const AISellSection = React.memo(function AISellSection({ position, price, onExecute }: any) {
  const qtyOwned = position?.qty || 0;
  const INR_RATE = 83;

  const estimatedValue = qtyOwned * price * INR_RATE;

  if (!qtyOwned) {
    return <div className="text-center text-gray-400 py-6">No holdings</div>;
  }

  const sellOptions = [
    { label: "25%", percent: 0.25 },
    { label: "50%", percent: 0.5 },
    { label: "100%", percent: 1 },
  ];

  return (
    <div className="space-y-3">

      <div className="bg-white/5 p-1.5 rounded-lg">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Holdings</span>
          <span>{qtyOwned.toFixed(6)}</span>
        </div>

        <div className="flex justify-between text-sm mt-2">
          <span className="text-gray-400">Value</span>
          <span>₹{estimatedValue.toFixed(2)}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {sellOptions.map((opt) => (
          <button
            key={opt.label}
            onClick={() =>
              onExecute(qtyOwned * opt.percent, estimatedValue * opt.percent)
            }
            className="bg-orange-500 hover:bg-orange-400 py-2 rounded text-sm font-semibold"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
});

/* ================= MAIN ================= */

export default function AIEngineUI({
  symbol,
  coinName,
  price,
  position,
  onExecute,
}: any) {
  const { ai, ui, loading, error, runAI } = useAI(symbol);
  const [showTradeModal, setShowTradeModal] = useState(false);


  if (error) {
    return <div className="p-4 text-red-400">{error}</div>;
  }

 const safeAI = ai ?? {
  action: "HOLD",
  confidence: 0,
  risk: "—",
};

const safeUI = ui ?? {
  marketRegime: "—",
  momentumLabel: "—",
  volatilityLabel: "—",
  confluence: "—",
  marketPressure: "—",
  confidenceLabel: "—",
  aiNarrative: {
    overview: "Analyzing market...",
    marketStory: "Processing data...",
    conclusion: "Waiting for signal..."
  }
};

const isLoading = loading && !ui;

  const isBuy = safeAI.action === "BUY";
  const isSell = safeAI.action === "SELL";

  return (
    <div className="relative h-full flex flex-col gap-2 text-white p-1.5">

      {isLoading && (
    <LoadingOverlay message="AI analyzing market..." />
)}

{/* ================= HERO (ONE LINE) ================= */}
<div className="flex items-center justify-between px-3 py-2 rounded-lg border border-white/5 bg-[#0B1220]/90">

  {/* Left: Engine + Coin */}
  <div className="flex items-center gap-2">

    <div className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">
      AI Engine
    </div>

    <div className="flex flex-col leading-tight">
  
  <span className="text-sm font-semibold text-white">
    {coinName || symbol}
  </span>

  <span className="text-[9px] text-gray-500 tracking-wide">
    {symbol}
  </span>

</div>

  </div>

  {/* Right: Status Cluster */}
  <div className="flex items-center gap-2 text-[11px]">

    {/* Action */}
    <span
      className={`px-2 py-0.5 rounded-full font-semibold ${
        safeAI.action === "BUY"
          ? "bg-green-500/15 text-green-400"
          : safeAI.action === "SELL"
          ? "bg-red-500/15 text-red-400"
          : "bg-yellow-500/15 text-yellow-300"
      }`}
    >
      {safeAI.action}
    </span>

    {/* Live dot */}
    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />

  </div>
</div>


<div className="relative bg-[#0B1220]/90 border border-white/5 rounded-lg p-1.5">


  {/* Header always visible */}
  <div className="flex items-center justify-between mb-2">
    <p className="text-[10px] uppercase text-cyan-400">Intel Core</p>
    <span className="text-[10px] text-gray-500">Live Market Intelligence</span>
  </div>

  {/* Data */}
  <div className="space-y-1 text-[11px] opacity-100">
    <div className="flex justify-between">
      <span className="text-gray-500">Market Regime</span>
      <span>{safeUI.marketRegime}</span>
    </div>

    <div className="flex justify-between">
      <span className="text-gray-500">Momentum</span>
      <span>{safeUI.momentumLabel}</span>
    </div>

    <div className="flex justify-between">
      <span className="text-gray-500">Volatility</span>
      <span>{safeUI.volatilityLabel}</span>
    </div>

    <div className="flex justify-between">
      <span className="text-gray-500">Confluence</span>
      <span className="text-cyan-300 font-semibold">
        {safeUI.confluence}
      </span>
    </div>

    <div className="flex justify-between">
      <span className="text-gray-500">Market Pressure</span>
      <span>{safeUI.marketPressure}</span>
    </div>
  </div>

</div>


     <div className="rounded-lg bg-[#0B1220]/90 border border-white/5 p-1.5">

  {/* Top Row */}
  <div className="flex items-center justify-between">

    {/* Left */}
    <div className="leading-tight">
      <p className="text-[9px] uppercase text-gray-400">
        Confidence
      </p>

      <div className="text-lg font-bold">
        {safeAI.confidence}%
      </div>

      <div className="text-[10px] text-cyan-300">
        {safeUI.confidenceLabel}
      </div>
    </div>

    {/* Right */}
    <div className="text-right leading-tight">
      <p className="text-[9px] text-gray-500">
        Risk
      </p>

      <div
        className={`text-sm font-semibold ${
          safeAI.risk === "LOW"
            ? "text-green-400"
            : safeAI.risk === "HIGH"
            ? "text-red-400"
            : "text-yellow-400"
        }`}
      >
        {safeAI.risk}
      </div>
    </div>

  </div>

  {/* Progress Bar */}
  <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
    <div
      className={`h-full ${
        safeAI.confidence > 75
          ? "bg-green-500"
          : safeAI.confidence > 50
          ? "bg-yellow-500"
          : "bg-red-500"
      }`}
      style={{ width: `${safeAI.confidence}%` }}
    />
  </div>

  {/* Execution */}
  <div className="flex justify-between mt-2 text-[10px]">
    <span className="text-gray-500">Execution</span>
    <span className="font-semibold">
      {safeAI.action === "BUY"
        ? "READY TO BUY"
        : safeAI.action === "SELL"
        ? "READY TO SELL"
        : "WAIT"}
    </span>
  </div>
</div>

{/* ================= Narrative Engine ================= */}
<div className="relative bg-[#0B1220]/80 border border-white/5 rounded-lg p-2 space-y-2">

  <h3 className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wide">
    AI Narrative
  </h3>

  <p className="text-[11px] text-gray-300">
    {safeUI.aiNarrative.overview }
  </p>

  <p className="text-[11px] text-gray-200">
    {safeUI.aiNarrative.marketStory}
  </p>

  <p className="text-[11px] text-cyan-300 border-t border-white/5 pt-1">
    {safeUI.aiNarrative.conclusion }
  </p>

</div>

{/* ================= ACTION BAR ================= */}
<div className="mt-1 flex items-center justify-between rounded-lg border border-white/5 bg-[#0B1220]/60 px-2 py-1.5">

  {/* Left: Refresh */}
  <button
    onClick={runAI}
    className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition shrink-0"
  >
    ⟳ <span>Refresh</span>
  </button>

  {/* Center Divider */}
  <div className="h-4 w-px bg-white/10" />

  {/* Right: Primary Action */}
  <button
    onClick={() => setShowTradeModal(true)}
    disabled={!ai || safeAI.action === "HOLD"}
    className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition shrink-0
      disabled:opacity-40 disabled:cursor-not-allowed
      ${
        safeAI.action === "BUY"
          ? "bg-green-600/80 hover:bg-green-500 text-white"
          : safeAI.action === "SELL"
          ? "bg-red-600/80 hover:bg-red-500 text-white"
          : "bg-white/5 text-gray-500"
      }`}
  >

    <span className={`h-1.5 w-1.5 rounded-full ${
      safeAI.action === "BUY"
        ? "bg-green-400"
        : safeAI.action === "SELL"
        ? "bg-red-400"
        : "bg-gray-500"
    }`} />

    {safeAI.action === "BUY"
      ? "Execute Buy"
      : safeAI.action === "SELL"
      ? "Execute Sell"
      : "No Signal"}

  </button>

</div>

<p className="mt-1 text-[10px] text-yellow-300/70 text-center tracking-wide">
  Market risk applies • Trade responsibly
</p>

      {/* ================= MODAL ================= */}
      {showTradeModal && safeAI && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-[#0B1220] p-5 rounded-xl w-[360px]">

            <div className="flex justify-between mb-4">
              <div>
                <p className="font-bold">
                  {safeAI.action} Setup
                </p>
                <p className="text-xs text-gray-400">
                  {coinName || symbol}
                </p>
              </div>

              <button onClick={() => setShowTradeModal(false)}>
                ✕
              </button>
            </div>

            {isBuy && (
              <AIBuySection
                onExecute={(amount: number) => {
                  const inrPrice = (price ?? 0) * 83;

                  if (inrPrice <= 0) return;

                  const qty = Number((amount / inrPrice).toFixed(8));

                onExecute?.(
                  "buy",
                  amount,
                  qty
                );

                setShowTradeModal(false);
              }}
              />
            )}

            {isSell && (
              <AISellSection
                position={position}
                price={position?.currentPrice ?? 0}
                onExecute={(qty: number, amt: number) => {
                  onExecute?.("sell", amt, qty);
                  setShowTradeModal(false);
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}