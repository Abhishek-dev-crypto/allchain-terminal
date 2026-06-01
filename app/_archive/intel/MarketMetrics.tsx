"use client";

import { motion } from "framer-motion";


export default function MarketMetrics() {
  
  const btc = {
  price: 77041,
  change24h: -0.35,
};

const eth = {
  price: 2123.4,
  change24h: 0.35,
};

const fearGreed = 34;

  const marketMood =
    fearGreed > 70
      ? "RISK ON"
      : fearGreed < 35
      ? "RISK OFF"
      : "NEUTRAL";

  const moodColor =
    fearGreed > 70
      ? "text-emerald-400"
      : fearGreed < 35
      ? "text-red-400"
      : "text-orange-400";

  const btcChange = btc.change24h ?? 0;
  const ethChange = eth.change24h ?? 0;

  return (
    <section className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#070b18] p-4 min-h-[220px]">
      
      {/* BACKGROUNDS */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="absolute top-0 right-0 h-[180px] w-[180px] bg-violet-500/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-[180px] w-[180px] bg-emerald-500/10 blur-3xl" />

      <div className="relative z-10">

        {/* ================= HEADER ================= */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm uppercase tracking-[0.2em] text-gray-400">
              Market Metrics
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              AI-powered real-time market overview
            </p>
          </div>
        </div>

        
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

            {/* BTC */}
            <MetricCard
              title="BTC"
              value={`$${Number(btc.price || 0).toLocaleString()}`}
              change={btcChange}
            />

            

            {/* ETH */}
            <MetricCard
              title="ETH"
              value={`$${Number(eth.price || 0).toLocaleString()}`}
              change={ethChange}
            />

            {/* FEAR & GREED */}
            <motion.div
              whileHover={{ y: -2 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500">
                  Fear & Greed
                </p>

                <div className="relative flex items-center justify-center">
  <div className={`absolute h-5 w-5 rounded-full blur-md opacity-30 ${
    fearGreed > 70
      ? "bg-emerald-400"
      : fearGreed < 35
      ? "bg-red-400"
      : "bg-orange-400"
  }`} />

  <span className={`relative text-[10px] ${moodColor}`}>
    {fearGreed}
  </span>
</div>
              </div>

              <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/5">
                <div
                  className={`h-full rounded-full ${
                    fearGreed > 70
                      ? "bg-emerald-400 w-[85%]"
                      : fearGreed < 35
                      ? "bg-red-400 w-[30%]"
                      : "bg-orange-400 w-[55%]"
                  }`}
                />
              </div>

              <p className={`mt-3 text-sm font-medium ${moodColor}`}>
                {marketMood}
              </p>
            </motion.div>

            {/* AI CONFIDENCE */}
            <motion.div
              whileHover={{ y: -2 }}
              className="rounded-2xl border border-violet-500/20 bg-violet-500/5 px-4 py-3.5"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500">
                  AI Confidence
                </p>

                <div className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
              </div>

              <h3 className="mt-3 text-2xl font-semibold text-violet-300">
                82%
              </h3>

              <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[82%] rounded-full bg-violet-400" />
              </div>

              <p className="mt-3 text-xs text-gray-500">
                  AI market cognition active
              </p>
            </motion.div>

          </div>
        
      </div>
    </section>
  );
}

/* ================= CARD ================= */

function MetricCard({
  title,
  value,
  change,
}: {
  title: string;
  value: string;
  change: number;
}) {
  const positive = change >= 0;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="
  rounded-2xl
  border border-white/10
  bg-gradient-to-b from-white/[0.05] to-white/[0.02]
  p-4
  transition-all duration-300
  hover:border-violet-500/20
  hover:bg-white/[0.05]
  hover:shadow-[0_0_20px_rgba(139,92,246,0.12)]
"
    >
      <div className="flex items-center gap-2">
  <div
    className={`h-2 w-2 rounded-full ${
      positive ? "bg-emerald-400" : "bg-red-400"
    }`}
  />

  <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500">
    {title}
  </p>
</div>

      <h3 className="mt-3 text-xl font-semibold text-white">
        {value}
      </h3>

      <p
        className={`mt-2 text-xs font-medium ${
          positive ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {positive ? "+" : ""}
        {change.toFixed(2)}%
      </p>
    </motion.div>
  );
}