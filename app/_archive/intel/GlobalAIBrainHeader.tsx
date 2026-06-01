"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function GlobalAIBrainHeader() {
  // Simulated global AI state (UI-only)
  const regime = "Risk-On Conditions";
  const confidence = 82;
  const liquidity = "Expanding";
  const narrativeCycle = "Mid Expansion";

  const [mounted, setMounted] = useState(false);

    useEffect(() => {
    setMounted(true);
    }, []);

  const isRiskOn = regime === "Risk-On Conditions";

  return (
    <section className="relative rounded-[20px] border border-emerald-500/10 bg-[#060816] p-4 overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.05)]">

      {/* ================= BACKGROUND GLOW ================= */}
      <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.25),transparent_60%)]" />

      <div className="relative z-10 flex flex-col gap-3">

        {/* ================= TOP ROW ================= */}
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                    {mounted && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                    )}
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>

            <div
            />

            <h2 className="text-[13px] font-semibold text-white">
              Global AI Brain
            </h2>

            
            <span className="text-[9px] uppercase tracking-[0.15em] text-gray-500">
              SYSTEM ACTIVE
            </span>

          </div>

          <div className="mt-2 flex items-center gap-2 text-[9px] uppercase tracking-[0.15em]">
  
                <span className="text-emerald-400">Core Intelligence Active</span>
                
            </div>

          <div className="text-[9px] uppercase tracking-[0.15em] px-2 py-1 rounded-full border border-white/10 bg-white/[0.03] text-gray-400">
            v1.0 cognition engine
          </div>

        </div>

        {/* ================= CORE STATES ================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">

          {/* REGIME */}
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
            <p className="text-[9px] text-gray-500">Market Regime</p>
            <p className={`text-[12px] font-semibold ${isRiskOn ? "text-emerald-400" : "text-red-400"}`}>
              {regime}
            </p>
          </div>

          {/* CONFIDENCE */}
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
            <p className="text-[9px] text-gray-500">AI Confidence</p>
            <p className="text-[12px] font-semibold text-white">
              {confidence}%
            </p>
          </div>

          {/* LIQUIDITY */}
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
            <p className="text-[9px] text-gray-500">Liquidity Regime</p>
            <p className="text-[12px] font-semibold text-violet-300">
              {liquidity}
            </p>
          </div>

          {/* NARRATIVE */}
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
            <p className="text-[9px] text-gray-500">Narrative Phase</p>
            <p className="text-[12px] font-semibold text-gray-300">
              {narrativeCycle}
            </p>
          </div>

        </div>

        {/* ================= INTELLIGENCE BAR ================= */}
        <div className="flex items-center justify-between text-[10px] text-gray-400">

          <span>System Cognition Flow</span>

          <span className="text-emerald-400">
            {isRiskOn ? "Risk-On Conditions Dominant" : "Defensive Bias Active"}
          </span>

        </div>

        <div className="h-1 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className={`h-full ${isRiskOn ? "bg-emerald-400" : "bg-red-400"}`}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 1 }}
          />
        </div>

      </div>
    </section>
  );
}