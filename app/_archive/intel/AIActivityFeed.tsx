'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  Brain,
  AlertTriangle,
  TrendingUp,
  Waves,
  ShieldAlert,
} from 'lucide-react';

const feed = [
  {
    type: 'Liquidity Alert',
    message: 'Stablecoin inflows accelerating into ETH ecosystem.',
    level: 'HIGH',
    icon: Waves,
    color: 'text-cyan-300',
  },
  {
    type: 'Narrative Shift',
    message: 'AI infrastructure narratives gaining social dominance.',
    level: 'MEDIUM',
    icon: Brain,
    color: 'text-purple-300',
  },
  {
    type: 'Momentum Expansion',
    message: 'BTC volatility compression resolving upward.',
    level: 'HIGH',
    icon: TrendingUp,
    color: 'text-emerald-300',
  },
  {
    type: 'Risk Monitor',
    message: 'Leverage exposure increasing across altcoin markets.',
    level: 'WARNING',
    icon: AlertTriangle,
    color: 'text-amber-300',
  },
  {
    type: 'System Health',
    message: 'AI cognition engine synchronized successfully.',
    level: 'STABLE',
    icon: Activity,
    color: 'text-cyan-300',
  },
  {
    type: 'Threat Detection',
    message: 'Unusual whale transfer activity detected.',
    level: 'WATCH',
    icon: ShieldAlert,
    color: 'text-rose-300',
  },
];

export default function AIActivityFeed() {
  return (
    <section className="terminal-panel overflow-hidden p-5">

      {/* HEADER */}
      <div className="mb-5 flex items-center justify-between">

        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-white/40">
            Live Intelligence Stream
          </p>

          <h2 className="mt-1 text-xl font-semibold text-white">
            Real-Time AI Telemetry
          </h2>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5">
          <div className="h-2 w-2 rounded-full bg-cyan-300 animate-pulse" />

          <span className="text-[10px] uppercase tracking-wider text-cyan-300">
            STREAM ACTIVE
          </span>
        </div>

      </div>

      {/* STREAM */}
      <div className="space-y-4">

        {feed.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="terminal-card group relative overflow-hidden p-4"
            >

              {/* glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.06),transparent_40%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative z-10 flex gap-4">

                {/* ICON */}
                <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] ${item.color}`}>
                  <Icon className="h-5 w-5" />
                </div>

                {/* CONTENT */}
                <div className="flex-1">

                  <div className="flex flex-wrap items-center gap-2">

                    <p className="text-sm font-medium text-white">
                      {item.type}
                    </p>

                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/50">
                      {item.level}
                    </span>

                    <span className="text-[10px] text-white/30">
                        LIVE
                    </span>

                  </div>

                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    {item.message}
                  </p>

                </div>

              </div>

            </motion.div>
          );
        })}

      </div>

    </section>
  );
}