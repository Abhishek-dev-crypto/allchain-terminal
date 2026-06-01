"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  price: number;
  signal: "BUY" | "SELL";
  confidence: number;
  selectedCoin: string;
};

export default function MiniPreview({
  price,
  signal,
  confidence,
  selectedCoin,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [chart, setChart] = useState<number[]>([]);
  const [displaySignal, setDisplaySignal] = useState(signal);
  const [displayConfidence, setDisplayConfidence] = useState(confidence);
  const [priceColor, setPriceColor] = useState("text-white");
  const [crosshair, setCrosshair] = useState<number | null>(null);
  const [tickOffset, setTickOffset] = useState(0);
  const [decisionPulse, setDecisionPulse] = useState(false);

  
    const [telemetry, setTelemetry] = useState([
  {
    label: "Volatility",
    value: "NEUTRAL",
    color: "text-yellow-400",
  },
  {
    label: "Latency",
    value: "128ms",
    color: "text-green-400",
  },
  {
    label: "Liquidity",
    value: "Stable",
    color: "text-cyan-400",
  },
  {
    label: "Spread",
    value: "0.04%",
    color: "text-white",
  },
  {
    label: "AI Drift",
    value: "+2.1",
    color: "text-blue-400",
  },
]); 

  const chartRef = useRef<HTMLDivElement>(null);

  const isBuy = displaySignal === "BUY";

  useEffect(() => setMounted(true), []);

  /* ================= AI LATENCY ================= */
  useEffect(() => {
    const delay = 350; // deterministic (prevents hydration mismatch)

    const t = setTimeout(() => {
      setDisplaySignal(signal);
      setDisplayConfidence(confidence);
    }, delay);

    return () => clearTimeout(t);
  }, [signal, confidence]);

  /* ================= PRICE COLOR ================= */
  useEffect(() => {
    setPriceColor((prev) =>
      prev === "text-green-400" ? "text-red-400" : "text-green-400"
    );

    const t = setTimeout(() => setPriceColor("text-white"), 300);
    return () => clearTimeout(t);
  }, [price]);

  /* ================= CHART ================= */
  useEffect(() => {
    if (!mounted) return;

    const data: number[] = [];
    let value = 50;

    for (let i = 0; i < 40; i++) {
      const drift = signal === "BUY" ? 0.4 : -0.4;
      const noise = (Math.random() - 0.5) * 6;

      value += drift + noise;
      value = Math.max(10, Math.min(90, value));
      data.push(value);
    }

    setChart(data);
  }, [signal, mounted]);

  /* ================= TICK ANIMATION ================= */
  useEffect(() => {
    const t = setInterval(() => {
      setTickOffset((prev) => (prev + 1) % 3);
    }, 300);

    return () => clearInterval(t);
  }, []);

  /* ================= SIGNAL PULSE ================= */
  useEffect(() => {
    setDecisionPulse(true);
    const t = setTimeout(() => setDecisionPulse(false), 400);
    return () => clearTimeout(t);
  }, [displaySignal]);

  {/* ================= TELEMETRY ENGINE ================= */}
useEffect(() => {

  const interval = setInterval(() => {

    setTelemetry([
      {
        label: "Volatility",
        value: ["LOW", "NEUTRAL", "ELEVATED"][
          Math.floor(Math.random() * 3)
        ],
        color: "text-yellow-400",
      },

      {
        label: "Latency",
        value: `${
          120 + Math.floor(Math.random() * 12)
        }ms`,
        color: "text-green-400",
      },

      {
        label: "Liquidity",
        value: ["Stable", "Strong", "Absorbing"][
          Math.floor(Math.random() * 3)
        ],
        color: "text-cyan-400",
      },

      {
        label: "Spread",
        value: `0.0${
          Math.floor(Math.random() * 5) + 2
        }%`,
        color: "text-white",
      },

      {
        label: "AI Drift",
        value: `+${
          (Math.random() * 4).toFixed(1)
        }`,
        color: "text-blue-400",
      },
    ]);

  }, 3000); // every 10 sec

  return () => clearInterval(interval);

}, []);

  /* ================= CROSSHAIR ================= */
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = chartRef.current?.getBoundingClientRect();
    if (!rect) return;

    setCrosshair(e.clientX - rect.left);
  };

  if (!mounted) {
    return (
      <div className="w-full h-[460px] bg-[#0b0f14] rounded-2xl border border-white/10 animate-pulse" />
    );
  }

  const simulatedPnl =
  signal === "BUY"
    ? (price % 100) * 120
    : -(price % 80) * 100;


  return (
    <div className="w-full min-h-[480px] rounded-2xl border border-white/10 bg-[#0b0f14] shadow-2xl overflow-hidden flex flex-col">

     {/* ================= HEADER ================= */}
<div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-black/20 text-[10px]">

  {/* LEFT */}
  <div className="flex items-center gap-2 flex-wrap">

    <div className="text-white font-semibold">
      {selectedCoin}/USDT
    </div>

    <div className="px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
      NEUTRAL
    </div>

    <div className="hidden md:flex text-gray-500">
      Neural execution active
    </div>
  </div>

  {/* RIGHT */}
  <div className="flex items-center gap-1.5 flex-wrap justify-end">

    {[selectedCoin, "ETH", "SOL", "BNB"]
      .filter((c, i, arr) => arr.indexOf(c) === i)
      .slice(0, 4)
      .map((coin) => (
        <div
          key={coin}
          className={`px-1.5 py-0.5 rounded border text-[9px] ${
            coin === selectedCoin
              ? "bg-cyan-400 text-black border-cyan-300"
              : "bg-white/5 border-white/10 text-gray-400"
          }`}
        >
          {coin}
        </div>
      ))}

    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-500/10 border border-green-500/20">
      <motion.div
        className="w-1 h-1 rounded-full bg-green-400"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.2,
        }}
      />

      <span className="text-green-400 text-[9px]">
        LIVE
      </span>
    </div>
  </div>
</div>

      {/* ================= ROW 2 ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2 min-h-[250px]">

        {/* CHART */}
        <div
          ref={chartRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setCrosshair(null)}
          className="col-span-2 bg-white/5 backdrop-blur-md rounded-xl p-2 flex flex-col relative hover:scale-[1.01] transition"
        >
          <div className="text-gray-400 text-[10px] mb-1 flex justify-between">
            <span className="flex gap-1">
              <span>Price</span>
              <span className="text-yellow-400 text-[9px]">LIVE</span>
            </span>

            <span className={`font-semibold flex items-center gap-1 ${priceColor}`}>
              ${price.toFixed(2)}
              <span className="text-[9px] text-gray-500">
                {["•", "••", "•••"][tickOffset]}
              </span>
            </span>
          </div>

          <div className="flex-1 flex items-end gap-[2px] relative">
            {chart.map((v, i) => {
              const isLast = i === chart.length - 1;

              return (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${v}%` }}
                  transition={{ duration: 0.25 }}
                  className={`flex-1 rounded-[2px] ${
                    isLast
                      ? "bg-white"
                      : isBuy
                      ? "bg-gradient-to-t from-green-500 to-emerald-400"
                      : "bg-gradient-to-t from-red-500 to-orange-400"
                  }`}
                />
              );
            })}

            {crosshair !== null && (
              <div
                style={{ left: crosshair }}
                className="absolute top-0 bottom-0 w-[1px] bg-white/30"
              />
            )}
          </div>
        </div>

        {/* SIDE PANEL */}
        <div className="flex flex-col gap-2">

          {/* AI ANALYSIS */}
          <div className="flex-1 bg-white/5 backdrop-blur-md rounded-xl p-2 text-[10px]">
            <div className="text-gray-400 mb-1">AI Analysis</div>
            <div className="space-y-1 text-gray-300">
              <div>• Momentum {isBuy ? "building" : "weakening"}</div>
              <div>• Liquidity stable</div>
              <div>• Volatility controlled</div>
            </div>
          </div>

          {/* SIGNAL */}
          <motion.div
            animate={{
              scale: decisionPulse ? 1.08 : 1,
              filter: decisionPulse ? "brightness(1.2)" : "brightness(1)",
            }}
            transition={{ duration: 0.25 }}
            className={`bg-white/5 backdrop-blur-md rounded-xl p-2 text-[10px] ${
              isBuy ? "text-green-400" : "text-red-400"
            }`}
          >
            <div className="text-gray-400 mb-1">Signal</div>

            <AnimatePresence mode="wait">
              <motion.div
                key={displaySignal}
                initial={{ y: 6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -6, opacity: 0 }}
                className="font-semibold"
              >
                {displaySignal} ({displayConfidence}%)
              </motion.div>
            </AnimatePresence>

            <div className="w-full h-[3px] bg-white/10 mt-1 rounded overflow-hidden">
              <motion.div
                animate={{
                  width: `${displayConfidence}%`,
                  x: [0, 2, -2, 0],
                }}
                transition={{
                  width: { duration: 0.5 },
                  x: { repeat: Infinity, duration: 1 },
                }}
                className={`h-full ${
                  isBuy ? "bg-green-400" : "bg-red-400"
                }`}
              />
            </div>
          </motion.div>

          {/* SETUP */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-2 text-[10px] text-gray-300">
            <div className="text-gray-400 mb-1">Setup</div>
            <div>Entry: ${price.toFixed(0)}</div>
            <div className="text-green-400">
              TP: ${(price * 1.02).toFixed(0)}
            </div>
            <div className="text-red-400">
              SL: ${(price * 0.99).toFixed(0)}
            </div>
          </div>
        </div>
      </div>

      {/* ================= ROW 3 ================= */}
      <div className="grid grid-cols-3 gap-2 px-2 pb-2 text-[10px]">

        <div className="bg-white/5 p-2 rounded-lg">
          <div className="text-gray-400">Balance</div>
          <div className="text-white font-semibold">₹10,00,000</div>
        </div>

        <div className="bg-white/5 p-2 rounded-lg">
          <div className="text-gray-400">PnL</div>
          <div className="text-green-400 font-semibold">
              {simulatedPnl >= 0 ? "+" : ""}₹{simulatedPnl.toFixed(0)}
          </div>
        </div>

        <div className="bg-white/5 p-2 rounded-lg">
          <div className="text-gray-400">Position</div>
          <div className="text-white">0.25 BTC</div>
        </div>
      </div>

    {/* ================= MARKET TELEMETRY ================= */}
<div className="grid grid-cols-5 gap-1 px-2 pb-2 text-[9px]">

  {telemetry.map((item, i) => (
    <motion.div
      key={item.label}
      initial={{ opacity: 0.7 }}
      animate={{
        opacity: [0.92, 1, 0.92],
      }}
      transition={{
        repeat: Infinity,
        duration: 10 + i * 2,
        ease: "easeInOut",
      }}
      className="rounded-lg border border-white/5 bg-white/[0.03] px-2 py-1.5"
    >
      <div className="text-gray-500 text-[8px]">
        {item.label}
      </div>

      <AnimatePresence mode="wait">

        <motion.div
          key={item.value}
          initial={{
            opacity: 0,
            y: 3,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: -3,
          }}
          transition={{
            duration: 0.35,
          }}
          className={`mt-1 font-medium ${item.color}`}
        >
          {item.value}
        </motion.div>

      </AnimatePresence>
    </motion.div>
  ))}
</div>

{/* ================= EXECUTION LATENCY ================= */}
<div className="px-2 pb-2">

  <div className="text-[10px] bg-white/5 rounded-lg px-2 py-1">

    <div className="flex items-center justify-between">

      <span className="text-gray-400">
        Execution Speed
      </span>

      <motion.span
        animate={{
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.2,
        }}
        className="text-green-400 font-medium"
      >
        {120 + Math.floor(Math.random() * 12)}ms
      </motion.span>
    </div>

    <div className="mt-1.5 w-full h-[3px] bg-white/10 rounded-full overflow-hidden">

      <motion.div
        animate={{
          width: ["68%", "82%", "74%", "88%", "76%"],
        }}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: "easeInOut",
        }}
        className="h-full rounded-full bg-gradient-to-r from-green-400 to-cyan-300"
      />
    </div>
  </div>
</div>


{/* ================= RISK METER ================= */}
<div className="px-2 pb-2">

  <div className="text-[10px] bg-white/5 rounded-lg px-2 py-1">

    <div className="flex justify-between text-gray-400 mb-1">
      <span>Risk Level</span>

      <motion.span
        animate={{
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
        }}
        className="text-yellow-400"
      >
        Moderate
      </motion.span>
    </div>

    <div className="w-full h-[4px] bg-white/10 rounded-full overflow-hidden">

      <motion.div
        animate={{
          width: ["52%", "67%", "58%", "72%", "60%"],
        }}
        transition={{
          repeat: Infinity,
          duration: 4,
          ease: "easeInOut",
        }}
        className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-400"
      />
    </div>
  </div>
</div>

    </div>
  );
}