'use client';

import {
  BrainCircuit,
  Activity,
  Bell,
  Crown,
  Bitcoin,
  Flame,
} from 'lucide-react';

export default function TerminalCommandBar() {
  return (
    <div className="sticky top-4 z-40 mb-6">

      <div className="terminal-panel-deep flex h-[64px] items-center justify-between px-5">

        {/* LEFT */}
        <div className="flex items-center gap-4">

          {/* AI STATUS */}
          <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />

            <span className="text-xs uppercase tracking-wider text-emerald-300">
              AI ACTIVE
            </span>
          </div>

          {/* REGIME */}
          <div className="hidden md:flex items-center gap-2 text-sm text-white/60">
            <BrainCircuit className="h-4 w-4 text-cyan-300" />

            <span>Risk-On Expansion</span>
          </div>
        </div>

        {/* CENTER */}
        <div className="hidden lg:flex items-center gap-6">

          {/* BTC */}
          <div className="flex items-center gap-2">
            <Bitcoin className="h-4 w-4 text-orange-400" />

            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/40">
                BTC
              </p>

              <p className="text-sm font-medium text-white">
                $109,240
              </p>
            </div>
          </div>

          {/* FEAR */}
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-purple-400" />

            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/40">
                Sentiment
              </p>

              <p className="text-sm font-medium text-white">
                Greed 74
              </p>
            </div>
          </div>

          {/* VOL */}
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-300" />

            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/40">
                Volatility
              </p>

              <p className="text-sm font-medium text-white">
                Moderate
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          {/* CONFIDENCE */}
          <div className="hidden md:flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5">
            <span className="text-xs uppercase tracking-wider text-cyan-300">
              AI Confidence 82%
            </span>
          </div>

          {/* NOTIFICATION */}
          <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
            <Bell className="h-4 w-4 text-white/60" />
          </button>

          {/* PREMIUM */}
          <button className="flex items-center gap-2 rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 hover:bg-yellow-400/20 transition-colors">
            <Crown className="h-4 w-4 text-yellow-300" />

            <span className="hidden md:block text-xs uppercase tracking-wider text-yellow-300">
              Upgrade
            </span>
          </button>

        </div>

      </div>
    </div>
  );
}