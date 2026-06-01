"use client";

import { motion } from "framer-motion";


export default function AISentiment() {
  

  const isLoading = false;

const fearGreed = 68;

  // ================= LABEL =================
  const sentimentLabel =
    fearGreed >= 75
      ? "Extreme Greed"
      : fearGreed >= 60
      ? "Bullish"
      : fearGreed >= 40
      ? "Neutral"
      : fearGreed >= 25
      ? "Fear"
      : "Extreme Fear";

  // ================= COLORS =================
  const sentimentColor =
    fearGreed >= 60
      ? "text-emerald-400"
      : fearGreed < 40
      ? "text-red-400"
      : "text-orange-400";

  const ringColor =
    fearGreed >= 60
      ? "border-emerald-400/70"
      : fearGreed < 40
      ? "border-red-400/70"
      : "border-orange-400/70";

  // ================= INSIGHTS =================
  const insights =
    fearGreed >= 75
      ? [
          "Risk appetite accelerating",
          "Momentum traders entering market",
          "Speculative activity increasing",
        ]
      : fearGreed >= 60
      ? [
          "Bullish positioning strengthening",
          "Capital inflows increasing",
          "Market sentiment improving",
        ]
      : fearGreed >= 40
      ? [
          "Mixed market positioning",
          "Neutral momentum detected",
          "Sector rotation ongoing",
        ]
      : fearGreed >= 25
      ? [
          "Defensive positioning increasing",
          "Risk appetite weakening",
          "Volatility concerns rising",
        ]
      : [
          "Extreme fear detected",
          "Panic selling increasing",
          "Capitulation risk elevated",
        ];

  return (
    <section className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#060816] p-5 min-h-[320px]">

      {/* GRID */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* GLOW */}
      <div className="absolute top-0 right-0 h-[180px] w-[180px] bg-violet-500/10 blur-3xl" />

      <div className="relative z-10 h-full flex flex-col">

        {/* ================= HEADER ================= */}
        <div className="mb-5 flex items-start justify-between gap-4">

          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-violet-300">
              AI Sentiment Engine
            </div>

            <h3 className="mt-4 text-lg font-semibold text-white">
              Market Sentiment
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              Real-time emotional & behavioral analysis
            </p>
          </div>

          <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-gray-400">
            LIVE
          </div>

        </div>

        {/* ================= LOADING ================= */}
        {isLoading ? (
          <div className="space-y-3">

            {/* TOP SKELETON */}
            <div className="flex gap-5">

              <div className="h-28 w-28 rounded-full border border-white/10 bg-white/5 animate-pulse" />

              <div className="flex-1 space-y-3">

                <div className="h-5 w-40 bg-white/5 rounded animate-pulse" />
                <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
                <div className="h-1.5 w-full bg-white/5 rounded animate-pulse" />

              </div>

            </div>

            {/* INSIGHTS SKELETON */}
            <div className="space-y-2 mt-5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 rounded-xl border border-white/10 bg-white/5 animate-pulse"
                />
              ))}
            </div>

          </div>

        ) : (

          <>
            {/* ================= MAIN CONTENT ================= */}
            <div className="flex items-center gap-5">

              {/* RING */}
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(139,92,246,0.10)",
                    "0 0 35px rgba(139,92,246,0.18)",
                    "0 0 20px rgba(139,92,246,0.10)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className={`relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-[10px] ${ringColor}`}
              >
                <div className="text-center">
                  <p className="text-3xl font-semibold text-white">
                    {fearGreed}
                  </p>
                  <p className={`mt-1 text-[10px] uppercase tracking-[0.15em] ${sentimentColor}`}>
                    AI SCORE
                  </p>
                </div>
              </motion.div>

              {/* RIGHT */}
              <div className="flex-1">
                <p className={`text-lg font-semibold ${sentimentColor}`}>
                  {sentimentLabel}
                </p>

                <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      fearGreed >= 60
                        ? "bg-emerald-400"
                        : fearGreed < 40
                        ? "bg-red-400"
                        : "bg-orange-400"
                    }`}
                    style={{ width: `${fearGreed}%` }}
                  />
                </div>
              </div>

            </div>

            {/* ================= INSIGHTS ================= */}
            <div className="mt-5 space-y-2">

              {insights.map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5"
                >
                  <div
                    className={`h-1.5 w-1.5 rounded-full ${
                      fearGreed >= 60
                        ? "bg-emerald-400"
                        : fearGreed < 40
                        ? "bg-red-400"
                        : "bg-orange-400"
                    }`}
                  />
                  <p className="text-xs text-gray-300">{item}</p>
                </motion.div>
              ))}

            </div>
          </>
        )}

      </div>
    </section>
  );
}