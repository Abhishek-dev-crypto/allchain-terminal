'use client';

import { motion } from 'framer-motion';
import {
  Cpu,
  Activity,
  Database,
  Radar,
  BrainCircuit,
  Network,
} from 'lucide-react';

const systems = [
  {
    label: 'Model Accuracy',
    value: '94.2%',
    status: 'Optimal',
    icon: BrainCircuit,
    color: 'text-cyan-300',
  },
  {
    label: 'Signal Latency',
    value: '142ms',
    status: 'Stable',
    icon: Radar,
    color: 'text-emerald-300',
  },
  {
    label: 'Data Streams',
    value: '28 Active',
    status: 'Healthy',
    icon: Database,
    color: 'text-purple-300',
  },
  {
    label: 'AI Load',
    value: '68%',
    status: 'Normal',
    icon: Cpu,
    color: 'text-amber-300',
  },
  {
    label: 'Network Sync',
    value: '99.1%',
    status: 'Connected',
    icon: Network,
    color: 'text-cyan-300',
  },
  {
    label: 'System Health',
    value: 'Operational',
    status: 'Stable',
    icon: Activity,
    color: 'text-emerald-300',
  },
];

export default function LiveSystemTelemetry() {
  return (
    <section className="terminal-panel p-6">

      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">

        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-white/40">
            System Telemetry
          </p>

          <h2 className="mt-1 text-xl font-semibold text-white">
            Live AI Infrastructure
          </h2>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5">
          <div className="h-2 w-2 rounded-full bg-cyan-300 animate-pulse" />

          <span className="text-[10px] uppercase tracking-wider text-cyan-300">
            SYSTEMS ONLINE
          </span>
        </div>

      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

        {systems.map((system, index) => {
          const Icon = system.icon;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="terminal-card group relative overflow-hidden p-5"
            >

              {/* glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_40%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative z-10">

                <div className="flex items-start justify-between">

                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] ${system.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <span className={`text-[10px] uppercase tracking-wider ${system.color}`}>
                    {system.status}
                  </span>

                </div>

                <p className="mt-5 text-xs uppercase tracking-wider text-white/40">
                  {system.label}
                </p>

                <h3 className={`mt-2 text-lg font-semibold ${system.color}`}>
                  {system.value}
                </h3>

              </div>

            </motion.div>
          );
        })}

      </div>

    </section>
  );
}