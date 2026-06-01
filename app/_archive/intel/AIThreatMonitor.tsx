'use client';

import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ShieldAlert,
  Radar,
  Siren,
} from 'lucide-react';

const threats = [
  {
    title: 'Leverage Build-Up',
    description:
      'Open interest rising aggressively across altcoin futures markets.',
    severity: 'HIGH',
    icon: AlertTriangle,
    color: 'text-amber-300',
  },
  {
    title: 'Whale Transfer Spike',
    description:
      'Large BTC wallet movements detected toward exchange clusters.',
    severity: 'WATCH',
    icon: Radar,
    color: 'text-cyan-300',
  },
  {
    title: 'Funding Imbalance',
    description:
      'Long positioning becoming crowded in AI-linked assets.',
    severity: 'MEDIUM',
    icon: ShieldAlert,
    color: 'text-purple-300',
  },
  {
    title: 'Volatility Expansion Risk',
    description:
      'Compression conditions indicate possible sharp directional move.',
    severity: 'WARNING',
    icon: Siren,
    color: 'text-rose-300',
  },
];

export default function AIThreatMonitor() {
  return (
    <section className="terminal-panel p-6">

      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">

        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-white/40">
            Threat Intelligence
          </p>

          <h2 className="mt-1 text-xl font-semibold text-white">
            AI Risk Monitoring System
          </h2>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1.5">
          <div className="h-2 w-2 rounded-full bg-rose-300 animate-pulse" />

          <span className="text-[10px] uppercase tracking-wider text-rose-300">
            THREAT SCAN ACTIVE
          </span>
        </div>

      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {threats.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="terminal-card group relative overflow-hidden p-5"
            >

              {/* glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.08),transparent_45%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative z-10">

                <div className="flex items-start justify-between">

                  <div className="flex items-center gap-3">

                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] ${item.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-white">
                        {item.title}
                      </p>

                      <p className={`mt-1 text-[10px] uppercase tracking-wider ${item.color}`}>
                        {item.severity}
                      </p>
                    </div>

                  </div>

                </div>

                <p className="mt-5 text-sm leading-relaxed text-white/60">
                  {item.description}
                </p>

              </div>

            </motion.div>
          );
        })}

      </div>

    </section>
  );
}