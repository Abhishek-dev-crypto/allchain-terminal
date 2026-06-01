"use client";

import { motion } from "framer-motion";
import {
  BrainCircuit,
  Activity,
  ShieldAlert,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function AIFocusBrief() {
  const regime = "Risk-On Expansion";
  const confidence = 82;
  const volatility = "Moderate";
  const aiSignal = "Ethereum momentum strengthening as liquidity expands.";
  const narrative = "AI infrastructure and ETH ecosystem flows accelerating.";
  const action = "Momentum continuation currently favored by AI systems.";

  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#071028] via-[#090B1A] to-[#050816] p-6 lg:p-8"
    >
      {/* BACKGROUND GLOW */}
      <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* TOP LABEL */}
      <div className="relative z-10 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
            <BrainCircuit className="h-5 w-5 text-cyan-300" />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-white/40">
              AI Focus Brief
            </p>

            <h2 className="text-sm font-semibold text-white">
              Institutional Market Intelligence
            </h2>
          </div>
        </div>

        <div className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1 text-xs font-medium text-emerald-300 md:flex">
          CORE INTELLIGENCE ACTIVE
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT SIDE */}
        <div className="lg:col-span-8">
          {/* HEADLINE */}
          <div className="mb-6">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-400/10 px-3 py-1 text-xs font-medium text-purple-300">
              <Sparkles className="h-3.5 w-3.5" />
              AI PRIORITY SIGNAL
            </div>

            <h1 className="max-w-3xl text-3xl font-semibold leading-tight text-white lg:text-4xl">
              Market conditions favor{" "}
              <span className="bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">
                momentum continuation
              </span>{" "}
              across AI and Ethereum-linked assets.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60 lg:text-base">
              {aiSignal} Capital inflows remain supportive while market
              sentiment continues stabilizing under moderate volatility
              conditions.
            </p>
          </div>

          {/* METRICS */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* REGIME */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm">
              <div className="mb-3 flex items-center gap-2 text-white/40">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wider">
                  Market Regime
                </span>
              </div>

              <h3 className="text-lg font-semibold text-emerald-300">
                {regime}
              </h3>

              <p className="mt-2 text-xs text-white/50">
                Liquidity expansion detected across major crypto sectors.
              </p>
            </div>

            {/* CONFIDENCE */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm">
              <div className="mb-3 flex items-center gap-2 text-white/40">
                <Activity className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wider">
                  AI Confidence
                </span>
              </div>

              <h3 className="text-lg font-semibold text-cyan-300">
                {confidence}%
              </h3>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${confidence}%` }}
                  transition={{ duration: 1 }}
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-400"
                />
              </div>

              <p className="mt-2 text-xs text-white/50">
                AI models currently aligned toward bullish continuation.
              </p>
            </div>

            {/* VOLATILITY */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm">
              <div className="mb-3 flex items-center gap-2 text-white/40">
                <ShieldAlert className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wider">
                  Volatility State
                </span>
              </div>

              <h3 className="text-lg font-semibold text-yellow-300">
                {volatility}
              </h3>

              <p className="mt-2 text-xs text-white/50">
                Elevated movement expected but without extreme instability.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col justify-between lg:col-span-4">
          {/* AI SUMMARY CARD */}
          <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-cyan-500/5 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-purple-300/70">
              AI Market Interpretation
            </p>

            <h3 className="mt-3 text-lg font-semibold text-white">
              Capital Rotation Strengthening
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-white/60">
              {narrative}
            </p>

            <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs uppercase tracking-wider text-cyan-300">
                AI Action Bias
              </p>

              <p className="mt-2 text-sm text-white/70">{action}</p>
            </div>
          </div>

          {/* CTA BUTTONS */}
          <div className="mt-5 grid gap-3">
            <button className="group flex items-center justify-between rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-4 transition-all hover:bg-cyan-400/20">
              <div className="text-left">
                <p className="text-sm font-semibold text-white">
                  Open Trading Terminal
                </p>
                <p className="text-xs text-white/50">
                  Launch AI-assisted execution workspace
                </p>
              </div>

              <ArrowRight className="h-5 w-5 text-cyan-300 transition-transform group-hover:translate-x-1" />
            </button>

            <button className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 transition-all hover:bg-white/[0.06]">
              <div className="text-left">
                <p className="text-sm font-semibold text-white">
                  Explore AI Systems
                </p>
                <p className="text-xs text-white/50">
                  Inspect narratives, whales & sector flows
                </p>
              </div>

              <ArrowRight className="h-5 w-5 text-white/40 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}