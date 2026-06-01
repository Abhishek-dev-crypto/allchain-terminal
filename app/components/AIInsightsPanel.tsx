'use client';

import { useMemo } from 'react';

type Props = {
  price: number;
  change: number;
  data?: {
    signal: "BUY" | "SELL" | "HOLD";
    confidence: number;
    edge: number;
    analysis: string;
    entry: number;
    tp: number;
    sl: number;
  };
};

export default function AIInsightsPanel({ price, change, data }: Props) {
  /* ---------------- MARKET BIAS ---------------- */
  const bias = useMemo(() => {
    if (change > 1.5) return { text: 'Bullish', color: 'text-green-400' };
    if (change < -1.5) return { text: 'Bearish', color: 'text-red-400' };
    return { text: 'Neutral', color: 'text-yellow-400' };
  }, [change]);

 const analysisPoints = useMemo(() => {
  if (!data?.analysis) return [];

  return data.analysis
    .split("\n")
    .map(line => line.replace(/^•\s?/, "").trim())
    .filter(Boolean)
    .slice(0, 5);
}, [data?.analysis]);
 
  /* ---------------- MOMENTUM ---------------- */
  const momentum = useMemo(() => {
    const strength = Math.min(Math.abs(change) * 10, 100);

    if (strength > 70) return 'Strong';
    if (strength > 40) return 'Moderate';
    return 'Weak';
  }, [change]);

  /* ---------------- VOLATILITY ---------------- */
  const volatility = useMemo(() => {
    const v = Math.abs(change);

    if (v > 3) return 'High';
    if (v > 1.5) return 'Medium';
    return 'Low';
  }, [change]);

  /* ---------------- RISK ---------------- */
  const risk = useMemo(() => {
    if (volatility === 'High') return { text: 'High Risk', color: 'text-red-400' };
    if (volatility === 'Medium') return { text: 'Moderate Risk', color: 'text-yellow-400' };
    return { text: 'Low Risk', color: 'text-green-400' };
  }, [volatility]);

  /* ---------------- LEVELS (SIMPLE MODEL) ---------------- */
  const support = useMemo(() => price * 0.985, [price]);
  const resistance = useMemo(() => price * 1.015, [price]);

 /* ---------------- AI SUMMARY ---------------- */
const summary = useMemo(() => {
  const value = bias?.text?.toUpperCase?.() || '';

  if (value === 'BULLISH' || value === 'BUY') {
    return 'Momentum building. Buyers in control.';
  }

  if (value === 'BEARISH' || value === 'SELL') {
    return 'Downtrend pressure. Sellers dominating.';
  }

  return 'No clear edge. Wait for confirmation.';
}, [bias]);

  return (
    <div className="h-full rounded-xl border border-white/5 bg-[#0B1220]/80 backdrop-blur p-1.5 text-[11px] space-y-2">

      {/* HEADER */}
      <div className="flex justify-between items-center">

<p className="text-[16px] leading-none font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 drop-shadow-[0_0_12px_rgba(59,130,246,0.45)]">
    AI Insights
  </p>
        <p className="text-blue-400 text-[10px] uppercase tracking-wide">
  Live
</p>
      </div>

{/* AI ENGINE DATA */}
{!data ? (
  <div className="text-gray-500 text-sm">
    Waiting for AI analysis...
  </div>
) : (
  <div className="bg-white/5 p-2 rounded-lg space-y-2">


    {/* ANALYSIS */}
    <div>
      <div className="space-y-1">
  {analysisPoints.map((point, idx) => (
    <div
      key={idx}
      className="flex items-start gap-1 min-h-[14px]"
    >
      <span className="text-gray-500">•</span>
      <span className="text-[11px] text-gray-300 leading-4">
        {point || "\u00A0"}
      </span>
    </div>
  ))}
</div>
    </div>

  </div>
)}

      {/* GRID */}
      <div className="grid grid-cols-2 gap-2">

        <div className="bg-white/5 p-1.5 rounded-lg">
          <p className="text-gray-400">Volatility</p>
          <p>{volatility}</p>
        </div>

        <div className="bg-white/5 p-1.5 rounded-lg">
          <p className="text-gray-400">Risk</p>
          <p className={risk.color}>{risk.text}</p>
        </div>

      </div>

      {/* LEVELS */}
      <div className="bg-white/5 p-1.5 rounded-lg space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-400">Support</span>
          <span className="text-green-400">${support.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Resistance</span>
          <span className="text-red-400">${resistance.toFixed(2)}</span>
        </div>
      </div>

      {/* SUMMARY */}
     <div className="bg-blue-500/10 border border-blue-500/20 px-2 py-1.5 rounded-lg text-[10px] text-blue-300 leading-5">
        {summary}
      </div>

    </div>
  );
}