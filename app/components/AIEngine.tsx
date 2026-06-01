"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

/* ================= TYPES ================= */
type Signal = "BUY" | "SELL" | "HOLD";

type Candle = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

const STEPS = [
  "Scanning market structure...",
  "Detecting volatility shift...",
  "Analyzing momentum flow...",
  "Checking liquidity zones...",
  "Running execution model...",
  "Generating signal..."
];



/* ================= HELPERS ================= */
const safe = (n: any, fallback = 0) => {
  const num = Number(n);
  return isNaN(num) ? fallback : num;
};

function formatPrice(price: number) {
  if (price >= 1000) return price.toFixed(2);
  if (price >= 1) return price.toFixed(3);
  if (price >= 0.1) return price.toFixed(4);
  if (price >= 0.01) return price.toFixed(5);

  return price.toFixed(6);
}

function macd(prices: number[]) {
  const ema12Series: number[] = [];
  const ema26Series: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    ema12Series.push(ema(prices.slice(0, i + 1), 12));
    ema26Series.push(ema(prices.slice(0, i + 1), 26));
  }

  const macdSeries = ema12Series.map((v, i) => v - ema26Series[i]);

  const macdLine = macdSeries[macdSeries.length - 1];
  const signalLine = ema(macdSeries.slice(-9), 9);

  return { macdLine, signalLine };
}

/* ================= ATR ================= */
function calculateATR(candles: Candle[], period = 14) {
  if (candles.length < period + 1) return 0;

  let trs: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;

    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );

    trs.push(tr);
  }

  const recent = trs.slice(-period);
  return recent.reduce((a, b) => a + b, 0) / period;
}

/* ================= INDICATORS ================= */
function ema(prices: number[], period: number) {
  const k = 2 / (period + 1);
  let val = prices[0] || 0;

  for (let i = 1; i < prices.length; i++) {
    val = prices[i] * k + val * (1 - k);
  }

  return val;
}

function rsi(prices: number[], period = 14) {
  if (prices.length < period + 1) return 50;

  let gain = 0;
  let loss = 0;

  for (let i = prices.length - period; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gain += diff;
    else loss += Math.abs(diff);
  }

  const rs = gain / (loss || 1);
  return 100 - 100 / (1 + rs);
}

/* ================= SIGNAL ================= */
function computeSignalAdvanced(candles: Candle[]) {
  if (candles.length < 30) {
    return {
      signal: "HOLD" as Signal,
      confidence: 50,
      atr: 0,
    };
  }

  // ✅ ALWAYS define base data first
  const closes = candles.map(c => c.close);
  const last = candles[candles.length - 1];

  const r = rsi(closes);
  const e10 = ema(closes.slice(-10), 10);
  const e20 = ema(closes.slice(-20), 20);

  const avgVol =
    candles.slice(-10).reduce((a, b) => a + b.volume, 0) / 10;

  const volumeSpike = last.volume > avgVol * 1.5;

  const atr = calculateATR(candles);

  // ✅ DEFINE SCORE BEFORE USING
  let score = 0;

  // ================= RSI =================

// bullish momentum
if (r > 55 && r < 75) score += 2;

// bearish momentum
if (r < 45 && r > 25) score -= 2;

// exhaustion zones
if (r >= 75) score -= 1;
if (r <= 25) score += 1;


// ================= TREND =================

if (e10 > e20) {
  score += 3;

  // trend acceleration
  if (closes[closes.length - 1] > e10) {
    score += 1;
  }

} else {

  score -= 3;

  if (closes[closes.length - 1] < e10) {
    score -= 1;
  }
}

  // ================= VOLUME =================
  if (volumeSpike) {
    score += last.close > last.open ? 1 : -1;
  }

  // ================= MACD =================
  const { macdLine, signalLine } = macd(closes);

  if (macdLine > signalLine) score += 1;
  else score -= 1;

  // ================= MARKET STRUCTURE =================
  const last5 = candles.slice(-5);

  if (last5.length >= 5) {
    const higherHighs =
      last5[4].high > last5[3].high &&
      last5[3].high > last5[2].high;

    const lowerLows =
      last5[4].low < last5[3].low &&
      last5[3].low < last5[2].low;

    if (higherHighs) score += 2;
    if (lowerLows) score -= 2;
  }

  // ================= SIGNAL =================
  let signal: Signal = "HOLD";
  if (score >= 3) signal = "BUY";
  else if (score <= -3) signal = "SELL";

  // ================= CONFIDENCE =================
  let confidence = 50 + Math.abs(score) * 10;

  if (volumeSpike) confidence += 5;
  if (atr > 0) confidence += 5;

  confidence = Math.min(95, Math.max(40, confidence));

  return {
    signal,
    confidence,
    atr,
  };
}

  function AIBuySection({
  balance,
  price,
  onExecute,
}: any) {

  const [amount, setAmount] = useState("");

  return (
    <div className="space-y-3">

      <div>
        <p className="text-xs text-gray-400 mb-1">
          Amount (INR)
        </p>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter INR amount"
          className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2"
        />
      </div>

      <button
        onClick={() => onExecute(Number(amount))}
        disabled={!Number(amount)}
        className="w-full rounded-lg bg-green-600 py-2 font-semibold disabled:opacity-50"
      >
        Confirm BUY
      </button>

    </div>
  );
}
function AISellSection({
  position,
  price,
  onExecute,
}: any) {

  const qtyOwned = position?.qty || 0;

  const estimatedValue = qtyOwned * price * 83;

  if (!qtyOwned) {
    return (
      <div className="text-center py-6 text-gray-400">
        No holdings available
      </div>
    );
  }

  const sellOptions = [
    { label: "25%", percent: 0.25 },
    { label: "50%", percent: 0.5 },
    { label: "100%", percent: 1 },
  ];

  return (
    <div className="space-y-4">

      {/* HOLDINGS INFO */}
      <div className="rounded-lg bg-white/5 p-3">

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Holdings</span>

          <span className="text-white">
            {qtyOwned.toFixed(6)}
          </span>
        </div>

        <div className="flex justify-between text-sm mt-2">
          <span className="text-gray-400">Estimated INR</span>

          <span className="text-white">
            ₹{estimatedValue.toFixed(2)}
          </span>
        </div>

      </div>

      {/* SELL BUTTONS */}
      <div className="grid grid-cols-3 gap-2">

        {sellOptions.map((option) => {

          const sellQty = qtyOwned * option.percent;

          const sellAmount =
            estimatedValue * option.percent;

          return (
            <button
              key={option.label}
              onClick={() =>
                onExecute(sellQty, sellAmount)
              }
              className={`rounded-lg py-2 text-sm font-semibold transition-all
                ${
                  option.percent === 1
                    ? "bg-red-600 hover:bg-red-500"
                    : "bg-orange-500 hover:bg-orange-400"
                }
              `}
            >
              {option.label}
            </button>
          );
        })}

      </div>

    </div>
  );
}

/* ================= COMPONENT ================= */
export default function AIEngine({
  symbol,
  coinName,
  balance = 0,
  position,
  onExecute,
  onUpdate,
}: any) {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [price, setPrice] = useState(0);

    const [atrValue, setAtrValue] = useState(0);

    const [change, setChange] = useState(0); // ✅ ADD THIS

    const [analysisDone, setAnalysisDone] = useState(false);
    const [suggestionDone, setSuggestionDone] = useState(false);

    const [visibleSteps, setVisibleSteps] = useState<string[]>([]);

  const [analysis, setAnalysis] = useState("Waiting...");
  const [signal, setSignal] = useState<Signal>("HOLD");



  const [confidence, setConfidence] = useState(0);
  const [edge, setEdge] = useState(0);

  const [loading, setLoading] = useState(false);

  /* ================= FETCH ================= */
 const fetchCandles = async (interval: string) => {
  const res = await fetch(
    `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=50`
  );

  const data = await res.json();

  return data.map((d: any[]) => ({
    open: safe(d[1]),
    high: safe(d[2]),
    low: safe(d[3]),
    close: safe(d[4]),
    volume: safe(d[5]),
  }));
};

 const runAI = async () => {
  setLoading(true);

  // RESET STATE (important for UI flow)
  setVisibleSteps([]);
  setAnalysisDone(false);
  setSuggestionDone(false);

  // FETCH REAL DATA
 const [data1m, data5m, data15m] = await Promise.all([
  fetchCandles("1m"),
  fetchCandles("5m"),
  fetchCandles("15m"),
]);

// 👇 ADD IT HERE
    setCandles(data1m);
    setPrice(data1m[data1m.length - 1]?.close || 0);

  setAnalysis("Scanning structure & momentum...");

  setTimeout(() => {
  // 🔥 MULTI-TIMEFRAME SIGNALS
  const s1 = computeSignalAdvanced(data1m);
  const s5 = computeSignalAdvanced(data5m);
  const s15 = computeSignalAdvanced(data15m);

  // ================= SCORE SYSTEM =================
  let score = 0;

  // 1m = fast reaction
  if (s1.signal === "BUY") score += 1;
  if (s1.signal === "SELL") score -= 1;

  // 5m = confirmation
  if (s5.signal === "BUY") score += 2;
  if (s5.signal === "SELL") score -= 2;

  // 15m = strongest bias
  if (s15.signal === "BUY") score += 3;
  if (s15.signal === "SELL") score -= 3;

  // ================= FINAL SIGNAL =================
  let sig: Signal = "HOLD";

 if (score >= 2) sig = "BUY";
  else if (score <= -2) sig = "SELL";

  // ✅ alignment check BEFORE setting state
const aligned =
  s1.signal === s5.signal &&
  s5.signal === s15.signal;

// allow partial alignment (more realistic)
const buyVotes =
  (s1.signal === "BUY" ? 1 : 0) +
  (s5.signal === "BUY" ? 1 : 0) +
  (s15.signal === "BUY" ? 1 : 0);

const sellVotes =
  (s1.signal === "SELL" ? 1 : 0) +
  (s5.signal === "SELL" ? 1 : 0) +
  (s15.signal === "SELL" ? 1 : 0);

if (buyVotes >= 2) sig = "BUY";
else if (sellVotes >= 2) sig = "SELL";
else sig = "HOLD";

// ✅ ATR FILTER (ADD HERE)





  // ================= CONFIDENCE =================
  let conf =
    (s1.confidence * 0.2) +
    (s5.confidence * 0.3) +
    (s15.confidence * 0.5);

    // ❗ reduce confidence if not aligned
    if (!aligned) conf *= 0.6;

   
    const latestPrice = (data1m[data1m.length - 1]?.close || 0) ;

  // ================= ATR =================
  let atr =
  (s1.atr * 0.2) +
  (s5.atr * 0.3) +
  (s15.atr * 0.5);

// minimum volatility protection
atr = Math.max(atr, latestPrice * 0.002);
  setAtrValue(atr);

  // avoid dead markets only
  if (atr < latestPrice * 0.0005) {
      sig = "HOLD";
      }

  // ================= SET STATE =================
  setSignal(sig);
  setConfidence(Math.round(conf));


  

 const trendStrength = Math.abs(score) / 6; // normalize score

const volatilityFactor = atr / latestPrice;

const edgeVal =
  (conf / 100) *
  (0.5 + trendStrength) *   // ensure base strength
  volatilityFactor *
  200;                      // amplify to visible scale



  setEdge(Number(edgeVal.toFixed(2)));

  // ================= ANALYSIS TEXT =================
 const analysisText =
  sig === "BUY"
    ? "BUY because:\n• 15m trend bullish\n• 5m momentum confirmation\n• volume expansion detected\n• structure forming higher highs"
    : sig === "SELL"
    ? "SELL because:\n• 15m trend bearish\n• 5m breakdown pressure\n• selling volume increasing\n• structure forming lower lows"
    : "No trade:\n• mixed timeframe signals\n• weak momentum\n• low volatility";

  setAnalysis(analysisText);

  onUpdate?.({
  signal: sig,
  confidence: Math.round(conf),
  edge: Number(edgeVal.toFixed(2)),
  analysis: analysisText,
  entry: latestPrice,
  tp:
    sig === "BUY"
      ? latestPrice + atr * 1.5
      : latestPrice - atr * 1.5,
  sl:
    sig === "BUY"
      ? latestPrice - atr
      : latestPrice + atr,
    });

  setAnalysisDone(true);

  setTimeout(() => {
    setSuggestionDone(true);
  }, 500);

  setLoading(false);
}, 1000);

};

  useEffect(() => {
    if (symbol) runAI();
  }, [symbol]);

  useEffect(() => {
  setVisibleSteps([]);
  setAnalysisDone(false);
  setSuggestionDone(false);

  let i = 0;

  const interval = setInterval(() => {
    setVisibleSteps(prev => [...prev, STEPS[i]]);
    i++;

    if (i >= STEPS.length) {
      clearInterval(interval);

      
    }
  }, 300);


  return () => clearInterval(interval);
}, [symbol]);

  const hasHoldings = (position?.qty || 0) > 0;

  /* ================= TRADE ================= */
 const [showTradeModal, setShowTradeModal] = useState(false);

// ================= TRADE LEVELS =================

const entry = price;

let tp = entry;
let sl = entry;

const risk = atrValue;

let rr = 2;

if (confidence > 70) rr = 3;
if (confidence > 85) rr = 4;

const reward = atrValue * rr;

if (signal === "BUY") {
  tp = entry + reward;
  sl = entry - risk;
}

if (signal === "SELL") {
  tp = entry - reward;
  sl = entry + risk;
}

  /* ================= UI ================= */
  return (
    <div className="h-full flex flex-col text-white text-xs gap-2">

     {/* ================= LAYER 1 ================= */}
<div className="px-3 py-2 border-b border-white/5">

  {/* TOP BAR */}
<div className="flex items-center justify-between mb-3">

  {/* AI ENGINE TITLE */}
  <p className="text-[16px] sm:text-[20px] leading-none font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 drop-shadow-[0_0_12px_rgba(59,130,246,0.45)]">
    AI Engine
  </p>

  {/* LIVE STATUS */}
  <div className="flex items-center gap-1.5">

    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />

    <span className="text-[10px] uppercase tracking-[0.15em] text-green-400 font-semibold">
      LIVE
    </span>

  </div>


  </div>

  {/* MAIN INFO ROW */}
  <div className="flex items-center justify-between">

    {/* LEFT SIDE */}
    <div className="flex flex-col min-w-[130px]">

      {/* COIN NAME */}
      <span className="text-[13px] sm:text-[15px] font-semibold truncate">
        {coinName || symbol}
      </span>

      {/* SYMBOL */}
      <span className="text-[10px] uppercase tracking-wide text-gray-500 mt-1">
        {symbol}
      </span>

    </div>

    {/* RIGHT SIDE */}
    <div className="w-[145px] text-right flex flex-col items-end">

      {/* PRICE */}
      <span className="text-[18px] sm:text-[22px] font-bold text-white leading-none tabular-nums">
       ${formatPrice(price)}
      </span>

      {/* CHANGE */}
      <span
        className={`text-[11px] font-semibold tabular-nums mt-1 ${
          change > 0
            ? "text-green-400"
            : change < 0
            ? "text-red-400"
            : "text-gray-400"
        }`}
      >
        {change > 0 ? "▲" : change < 0 ? "▼" : "•"}{" "}
        {change.toFixed(2)}%
      </span>

    </div>

  </div>

</div>


{/* ================= LAYER 2 ================= */}
<div className="flex flex-col gap-2">

  {/* 🔵 AI ANALYSIS */}
  <div className="bg-[#0B1220]/80 border border-white/5 rounded-lg p-3 h-[160px] flex flex-col">
    
    <p className="text-xs text-blue-400 mb-2 tracking-wide">
      AI ANALYSIS
    </p>

   <div className="flex-1 flex flex-col justify-between text-[11px] font-mono">

  {/* STEP LOADER */}
  <div className="space-y-1">
    {STEPS.map((step, i) => {
      const isActive = i === visibleSteps.length - 1;
      const isCompleted = i < visibleSteps.length;

      return (
        <div
          key={i}
          className={`flex items-center justify-between transition-all duration-300
            ${isCompleted ? "text-blue-300" : "text-gray-600"}
          `}
        >
          <span>• {step}</span>

          <span
            className={`text-[10px] ${
              isCompleted
                ? "text-green-400"
                : isActive
                ? "text-yellow-400 animate-pulse"
                : "text-gray-700"
            }`}
          >
            {isCompleted ? "✔" : isActive ? "..." : "-"}
          </span>
        </div>
      );
    })}
  </div>

  {/* ✅ ACTUAL AI EXPLANATION */}
 

</div>
  </div>

 {/* 🟡 AI SUGGESTION */}
<div className="bg-[#0B1220]/80 border border-white/5 rounded-lg px-3 py-2 h-[50px] flex items-center justify-between">

  {/* LEFT: LABEL */}
  <p className="text-xs text-blue-400 tracking-wide">
  AI SUGGESTION
</p>

  {/* RIGHT: STATE */}
  <div className="text-right">

    {!analysisDone ? (
      <p className="text-gray-500 text-[10px] animate-pulse">
        Awaiting...
      </p>
    ) : !suggestionDone ? (
      <p className="text-gray-500 text-[10px] animate-pulse">
        Processing...
      </p>
    ) : (
      <span
        className={`text-lg font-bold ${
          signal === "BUY"
            ? "text-green-400"
            : signal === "SELL"
            ? "text-red-400"
            : "text-yellow-400"
        }`}
      >
        {signal}
      </span>
    )}

  </div>
</div>

 {/* 🟣 AI TRADE SETUP */}
<div className="bg-[#0B1220]/80 border border-white/5 rounded-lg p-3 h-[105px] flex flex-col">

  <p className="text-xs text-blue-400 tracking-wide mb-1">
  AI TRADE SETUP
</p>

  <div className="flex-1 flex flex-col justify-center space-y-1">

   {!suggestionDone ? (

  <p className="text-gray-500 text-[11px] animate-pulse">
    Preparing execution...
  </p>

) : signal === "HOLD" ? (

  <div className="flex flex-1 items-center justify-center">
  <motion.p
    className="text-gray-500 text-[13px]"
    animate={{ opacity: [0.4, 1, 0.4] }}
    transition={{ duration: 1.8, repeat: Infinity }}
  >
    Waiting for high-probability setup
  </motion.p>
</div>

) : (

  <>
    {/* ENTRY */}
    <div className="flex justify-between items-center">
      <span className="text-gray-400 text-[11px]">Entry</span>

      <span className="text-white text-[14px] font-semibold">
        ${formatPrice(price)}
      </span>
    </div>

    {/* TP */}
    <div className="flex justify-between items-center">
      <span className="text-green-400 text-[11px]">TP</span>

      <span className="text-green-400 text-[14px] font-semibold">
        ${formatPrice(tp)}
      </span>
    </div>

    {/* SL */}
    <div className="flex justify-between items-center">
      <span className="text-red-400 text-[11px]">SL</span>

      <span className="text-red-400 text-[14px] font-semibold">
        ${formatPrice(sl)}
      </span>
    </div>
  </>

)}
  </div>
</div>

</div>

{/* ================= LAYER 3 ================= */}
<div className="bg-[#0B1220]/80 border border-white/5 rounded-lg p-2 space-y-2">

  {/* CONFIDENCE */}
  <div>
    
    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
      <span>Confidence</span>

      <span className="text-white font-semibold">
        {confidence}%
      </span>
    </div>

    <div className="h-[5px] bg-white/10 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          confidence > 70
            ? "bg-green-500"
            : confidence > 50
            ? "bg-yellow-500"
            : "bg-red-500"
        }`}
        style={{ width: `${confidence}%` }}
      />
    </div>

  </div>

  {/* EDGE SCORE */}
  <div>

    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
      <span>Edge Score</span>

      <span className="text-white font-semibold">
        {edge.toFixed(2)}
      </span>
    </div>

    <div className="h-[5px] bg-white/10 rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-500 rounded-full transition-all duration-500"
        style={{
          width: `${Math.min(edge * 100, 100)}%`,
        }}
      />
    </div>

  </div>

</div>

   {/* ================= LAYER 4 ================= */}
<div className="flex gap-2 pt-1">

  {/* ANALYZE BUTTON */}
  <button
    onClick={runAI}
    className="flex-1 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-gray-300 transition-all"
  >
    Re-Analyze
  </button>

  {/* EXECUTE BUTTON */}
  <button
 onClick={() => setShowTradeModal(true)}
  disabled={
    signal === "HOLD" ||
    (signal === "SELL" && !hasHoldings)
  }
  className={`flex-1 py-1.5 rounded text-[10px] font-semibold transition-all
    ${
      signal === "BUY"
        ? "bg-green-600/90 hover:bg-green-600 shadow-[0_0_6px_rgba(34,197,94,0.25)]"

        : signal === "SELL" && hasHoldings
        ? "bg-red-600/90 hover:bg-red-600 shadow-[0_0_6px_rgba(239,68,68,0.25)]"

        : "bg-gray-700 text-gray-400 cursor-not-allowed"
    }
  `}
>
  {signal === "HOLD"
    ? "No Trade"
    : signal === "SELL" && !hasHoldings
    ? "No Holdings"
    : `Execute ${signal}`}
</button>

</div>

{/* ================= LAYER 5 ================= */}
<div className="mt-1.5 px-2 py-1.5 border border-yellow-500/10 bg-yellow-500/5 rounded text-[10px] text-yellow-400 flex items-center justify-center gap-2 flex-wrap text-center overflow-hidden">
  <span>⚠</span>
  <span>AI-generated signal,Not financial advice,Manage risk  </span>
</div>

    {showTradeModal && (
  <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">

    <div className="w-full max-w-[360px] mx-4 rounded-2xl border border-white/10 bg-[#0B1220] p-5">

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-lg font-bold">
            AI {signal} Execution
          </p>

          <p className="text-xs text-gray-400">
            {coinName || symbol}
          </p>
        </div>

        <button
          onClick={() => setShowTradeModal(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* BUY */}
      {signal === "BUY" && (
        <AIBuySection
          balance={balance}
          price={price}
          onExecute={(amount: number) => {
            onExecute?.("buy", amount);
            setShowTradeModal(false);
          }}
        />
      )}

      {/* SELL */}
      {signal === "SELL" && (
        <AISellSection
          position={position}
          price={price}
          onExecute={(qty: number, amount: number) => {
            onExecute?.("sell", amount, qty);
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