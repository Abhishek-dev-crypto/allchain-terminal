'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import {
  Activity,
  BrainCircuit,
  ArrowRight,
} from 'lucide-react';

import { trackEvent } from "lib/analytics";

export default function IntelPage() {

  useEffect(() => {
  trackEvent("intel_loaded");
}, []);

  return (
    <div className="min-h-screen bg-black px-4 py-8 md:px-8">

      <div className="mx-auto max-w-7xl">

         {/* LIVE STATUS */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs text-emerald-300">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Real-time AI systems active
          </div>

        {/* HEADER */}
<div className="mb-12 text-center">

  <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
    Welcome to AllChain Intelligence Terminal
  </p>

  <h1 className="mt-5 text-4xl font-semibold leading-tight text-white md:text-6xl">
    Choose Your
    <span className="bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">
      {" "}AI Workspace
    </span>
  </h1>

  <p className="mx-auto mt-6 max-w-3xl text-sm leading-relaxed text-white/55 md:text-base">
    Access AI-assisted trading execution or explore institutional-grade
    market intelligence powered by real-time cognition systems,
    narrative engines, liquidity analysis, and live market telemetry.
  </p>

</div>

        {/* MAIN GRID */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* ================================================= */}
          {/* TRADE TERMINAL */}
          {/* ================================================= */}
          <div className="group relative overflow-hidden rounded-3xl border border-cyan-400/10 bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/20">

            {/* BACKGROUND GLOW */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent opacity-70 transition duration-500 group-hover:opacity-100" />

            <div className="relative z-10">

              {/* TOP */}
              <div className="flex items-start justify-between">

                <div className="flex items-center gap-4">

                  <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                    <Activity className="h-7 w-7 text-cyan-300" />
                  </div>

                  <div>

                    <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
                      Trade Terminal
                    </p>

                    <h2 className="mt-2 text-3xl font-semibold text-white">
                      AI-Assisted Trading
                    </h2>

                  </div>

                </div>

                <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                  LIVE
                </div>

              </div>

              {/* DESCRIPTION */}
              <p className="mt-6 text-sm leading-relaxed text-white/60">
                Execute trades using AI-generated setups,
                live order books, portfolio monitoring,
                risk management systems, and execution intelligence.
              </p>

              {/* STATUS */}
              <div className="mt-5 flex items-center gap-2 text-xs text-white/40">

                <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />

                <span>
                  Execution systems synchronized
                </span>

              </div>

              {/* FEATURES */}
              <div className="mt-6 flex flex-wrap gap-2">

                {[
                  'AI Signals',
                  'Order Book',
                  'Execution Engine',
                  'Portfolio Tracking',
                  'Risk Controls',
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs text-white/70"
                  >
                    {item}
                  </div>
                ))}

              </div>

              {/* STATS */}
              <div className="mt-6 grid grid-cols-3 gap-2 md:gap-4">

                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">

                  <p className="text-xs text-white/40">
                    Markets
                  </p>

                 <p className="mt-2 text-lg md:text-2xl font-semibold text-cyan-300">
                    400+
                  </p>

                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">

                  <p className="text-xs text-white/40">
                    AI Confidence
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-cyan-300">
                    82%
                  </p>

                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">

                  <p className="text-xs text-white/40">
                    Status
                  </p>

                 <p className="mt-2 text-lg md:text-2xl font-semibold text-emerald-300">
                    ACTIVE
                  </p>

                </div>

              </div>

              {/* CTA */}
              <Link href="/trade">

                <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-300 px-6 py-4 text-sm font-semibold text-black transition duration-300 hover:scale-[1.01]">

                  Open Trading Terminal

                  <ArrowRight className="h-4 w-4" />

                </button>

              </Link>

            </div>
          </div>

          {/* ================================================= */}
          {/* MARKET INTELLIGENCE */}
          {/* ================================================= */}
          <div className="group relative overflow-hidden rounded-3xl border border-purple-400/10 bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-purple-400/20">

            {/* BACKGROUND GLOW */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-70 transition duration-500 group-hover:opacity-100" />

            <div className="relative z-10">

              {/* TOP */}
              <div className="flex items-start justify-between">

                <div className="flex items-center gap-4">

                  <div className="rounded-2xl border border-purple-400/20 bg-purple-400/10 p-4">
                    <BrainCircuit className="h-7 w-7 text-purple-300" />
                  </div>

                  <div>

                    <p className="text-xs uppercase tracking-[0.3em] text-purple-300">
                      Market Intelligence
                    </p>

                    <h2 className="mt-2 text-3xl font-semibold text-white">
                      AI Market Cognition
                    </h2>

                  </div>

                </div>

                <div className="rounded-full border border-purple-400/20 bg-purple-400/10 px-3 py-1 text-xs text-purple-300">
                  AI CORE
                </div>

              </div>

              {/* DESCRIPTION */}
              <p className="mt-6 text-sm leading-relaxed text-white/60">
                Analyze market narratives, whale activity,
                sector rotation, capital flows, sentiment,
                volatility regimes, and AI-driven intelligence systems.
              </p>

              {/* STATUS */}
              <div className="mt-5 flex items-center gap-2 text-xs text-white/40">

                <div className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />

                <span>
                  Intelligence systems monitoring markets
                </span>

              </div>

              {/* FEATURES */}
              <div className="mt-6 flex flex-wrap gap-3">

                {[
                  'Narratives',
                  'Heatmaps',
                  'Sector Rotation',
                  'Whale Tracking',
                  'Liquidity Flows',
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs text-white/70"
                  >
                    {item}
                  </div>
                ))}

              </div>

              {/* STATS */}
              <div className="mt-6 grid grid-cols-3 gap-4">

                <div className="rounded-xl border border-white/10 bg-black/30 p-2 md:p-4">

                  <p className="text-[10px] md:text-xs text-white/40">
                    AI Systems
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-white">
                    12
                  </p>

                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">

                  <p className="text-xs text-white/40">
                    Regime
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-purple-300">
                    Risk-On
                  </p>

                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">

                  <p className="text-xs text-white/40">
                    Narratives
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-emerald-300">
                    LIVE
                  </p>

                </div>

              </div>

              {/* CTA */}
              <Link href="/market">

                <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-400 to-purple-300 px-6 py-4 text-sm font-semibold text-black transition duration-300 hover:scale-[1.01]">

                  Explore Market Intelligence

                  <ArrowRight className="h-4 w-4" />

                </button>

              </Link>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}