'use client';

import { motion } from 'framer-motion';

const metrics = [
  {
    label: 'Risk Appetite',
    value: 'HIGH',
    strength: '82%',
    color: 'text-emerald-300',
  },
  {
    label: 'Liquidity',
    value: 'EXPANDING',
    strength: '76%',
    color: 'text-cyan-300',
  },
  {
    label: 'Momentum',
    value: 'STRONG',
    strength: '88%',
    color: 'text-purple-300',
  },
  {
    label: 'Volatility',
    value: 'MODERATE',
    strength: '52%',
    color: 'text-amber-300',
  },
  {
    label: 'Whale Activity',
    value: 'ACCUMULATING',
    strength: '74%',
    color: 'text-emerald-300',
  },
  {
    label: 'Narrative Strength',
    value: 'ACCELERATING',
    strength: '91%',
    color: 'text-cyan-300',
  },
];

export default function AIRegimeMatrix() {
  return (
    <section className="terminal-panel p-6">

      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">

        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-white/40">
            AI Regime Matrix
          </p>

          <h2 className="mt-1 text-xl font-semibold text-white">
            Market Structure Analysis
          </h2>
        </div>

        <div className="rounded-full border border-purple-400/20 bg-purple-400/10 px-3 py-1.5">
          <span className="text-[10px] uppercase tracking-wider text-purple-300">
            AI SYNCHRONIZED
          </span>
        </div>

      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="terminal-card group relative overflow-hidden p-5"
          >

            {/* glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.08),transparent_40%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="relative z-10">

              <div className="flex items-center justify-between">

                <p className="text-xs uppercase tracking-wider text-white/40">
                  {metric.label}
                </p>

                <span className={`text-xs font-medium ${metric.color}`}>
                  {metric.strength}
                </span>

              </div>

              <h3 className={`mt-4 text-lg font-semibold ${metric.color}`}>
                {metric.value}
              </h3>

              {/* progress */}
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-white/30"
                  style={{
                    width: metric.strength,
                  }}
                />
              </div>

            </div>

          </motion.div>
        ))}

      </div>

    </section>
  );
}