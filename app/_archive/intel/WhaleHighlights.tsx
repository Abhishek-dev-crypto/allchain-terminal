"use client";

import { motion } from "framer-motion";

export default function WhaleHighlights() {
  const whales = [
    {
      asset: "BTC",
      action: "Accumulation",
      value: "$42.8M",
      label: "Large Wallet Inflow",
      impact: "High",
    },
    {
      asset: "ETH",
      action: "Distribution",
      value: "$18.3M",
      label: "Profit Taking Detected",
      impact: "Medium",
    },
    {
      asset: "SOL",
      action: "Accumulation",
      value: "$9.6M",
      label: "Smart Money Entry",
      impact: "High",
    },
    {
      asset: "RNDR",
      action: "Whale Spike",
      value: "$6.1M",
      label: "Unusual Transfer Activity",
      impact: "Medium",
    },
  ];

  return (
    <section className="rounded-[18px] border border-white/10 bg-[#060816] p-3 h-full overflow-hidden">

      {/* ================= HEADER ================= */}
      <div className="mb-2 flex items-start justify-between gap-3">

        <div>
          <h3 className="text-[15px] font-semibold text-white">
            Whale Highlights
          </h3>

          <p className="mt-0.5 text-[10px] text-gray-500">
            Large capital movement intelligence feed
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5">
          <div className="h-1 w-1 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-[8px] uppercase tracking-[0.12em] text-violet-300">
            Live
          </span>
        </div>

      </div>

      {/* ================= FEED ================= */}
      <div className="space-y-4">

        {whales.map((w, i) => {
          const isBuy = w.action === "Accumulation";

          return (
            <motion.div
              key={w.asset + i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-2 hover:bg-white/[0.04]"
            >

              {/* TOP ROW */}
              <div className="flex items-start justify-between gap-2">

                <div className="flex items-center gap-2 min-w-0">

                  <div className="h-7 w-7 flex items-center justify-center rounded-md border border-white/10 bg-gradient-to-br from-violet-500/10 to-emerald-500/10 text-[10px] font-semibold text-white">
                    {w.asset}
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-white leading-tight">
                      {w.action}
                    </p>

                    <p className="text-[9px] text-gray-500 truncate leading-tight">
                      {w.label}
                    </p>
                  </div>

                </div>

                <div className="text-right shrink-0">
                  <p className="text-[10px] font-medium text-white">
                    {w.value}
                  </p>

                  <p
                    className={`text-[8px] uppercase tracking-[0.12em] ${
                      isBuy ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {isBuy ? "INFLOW" : "OUTFLOW"}
                  </p>
                </div>

              </div>

              {/* IMPACT BAR */}
              <div className="mt-1.5 flex items-center gap-2">

                <div className="h-1 flex-1 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      w.impact === "High"
                        ? "bg-violet-400"
                        : "bg-emerald-400"
                    }`}
                    style={{
                      width: w.impact === "High" ? "85%" : "60%",
                    }}
                  />
                </div>

                <span className="text-[8px] text-gray-400">
                  {w.impact}
                </span>

              </div>

            </motion.div>
          );
        })}

      </div>

    </section>
  );
}