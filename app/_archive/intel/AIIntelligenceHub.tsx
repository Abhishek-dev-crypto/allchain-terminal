'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  BrainCircuit,
  Radar,
  TrendingUp,
  Waves,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const liveSignals = [
  {
    icon: TrendingUp,
    title: 'ETH Momentum Expansion',
    desc: 'AI detects strengthening liquidity rotation into ETH ecosystem assets.',
    status: 'Bullish',
  },
  {
    icon: Waves,
    title: 'Volatility Compression',
    desc: 'Market conditions stabilizing after recent high-velocity movement.',
    status: 'Stabilizing',
  },
  {
    icon: Radar,
    title: 'Whale Flow Detection',
    desc: 'Large-wallet accumulation increasing across AI-linked narratives.',
    status: 'Active',
  },
];

const systemStatus = [
  'Narrative Engine Synced',
  'Predictive Models Active',
  'Liquidity Scanner Online',
  'Regime Detection Stable',
];

export default function AIIntelligenceHub() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#070B18]/90 backdrop-blur-xl"
    >
      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.08),transparent_30%)]" />

      <div className="relative z-10 p-5 lg:p-6">
        {/* HEADER */}
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
              <BrainCircuit className="h-5 w-5 text-cyan-300" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                Live Intelligence Stream
              </p>

              <h2 className="text-lg font-semibold text-white">
                Real-Time AI Market Telemetry
              </h2>
            </div>
          </div>

          {/* STATUS */}
          <div className="flex flex-wrap items-center gap-2">
            {systemStatus.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5"
              >
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />

                <span className="text-xs text-white/60">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* LIVE SIGNAL GRID */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {liveSignals.map((signal, index) => {
            const Icon = signal.icon;

            return (
              <motion.div
                key={index}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-cyan-400/20 hover:bg-cyan-400/[0.04]"
              >
                {/* CARD GLOW */}
                <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_45%)]" />

                <div className="relative z-10">
                  {/* TOP */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/20">
                      <Icon className="h-5 w-5 text-cyan-300" />
                    </div>

                    <div className="flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1">
                      <Activity className="h-3 w-3 text-emerald-300" />

                      <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-300">
                        {signal.status}
                      </span>
                    </div>
                  </div>

                  {/* CONTENT */}
                  <h3 className="text-base font-semibold text-white">
                    {signal.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-white/55">
                    {signal.desc}
                  </p>

                  {/* FOOTER */}
                  <div className="mt-5 flex items-center gap-2 text-xs text-cyan-300">
                    <Sparkles className="h-3.5 w-3.5" />

                    <span>AI confidence elevated</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* BOTTOM STATUS BAR */}
        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-300" />

            <p className="text-sm text-white/65">
              AI systems actively monitoring market structure, volatility,
              liquidity flows, and cross-sector rotation.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-400/10 px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />

            <span className="text-xs uppercase tracking-wider text-purple-300">
              LIVE ANALYSIS ACTIVE
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}