'use client';

import {
  BrainCircuit,
  CandlestickChart,
  BarChart3,
  Sparkles,
  Wallet,
  Eye,
  Settings,
  Crown,
} from 'lucide-react';

const navItems = [
  {
    label: 'Intelligence',
    icon: BrainCircuit,
    active: true,
  },
  {
    label: 'Markets',
    icon: BarChart3,
  },
  {
    label: 'Terminal',
    icon: CandlestickChart,
  },
  {
    label: 'AI Systems',
    icon: Sparkles,
  },
  {
    label: 'Portfolio',
    icon: Wallet,
  },
  {
    label: 'Watchlist',
    icon: Eye,
  },
];

export default function TerminalSidebar() {
  return (
    <aside className="hidden xl:flex sticky top-6 h-[calc(100vh-48px)] w-[92px] flex-col justify-between terminal-panel-deep p-4">

      {/* TOP */}
      <div>

        {/* LOGO */}
        <div className="mb-8 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
            <BrainCircuit className="h-7 w-7 text-cyan-300" />
          </div>
        </div>

        {/* NAV */}
        <div className="space-y-3">
          {navItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <button
                key={index}
                className={`group flex w-full flex-col items-center gap-2 rounded-2xl p-3 transition-all duration-300 ${
                  item.active
                    ? 'bg-cyan-400/10 border border-cyan-400/20'
                    : 'hover:bg-white/[0.04]'
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    item.active
                      ? 'text-cyan-300'
                      : 'text-white/50 group-hover:text-white'
                  }`}
                />

                <span
                  className={`text-[10px] ${
                    item.active
                      ? 'text-cyan-300'
                      : 'text-white/40 group-hover:text-white/70'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BOTTOM */}
      <div className="space-y-3">

        {/* AI STATUS */}
        <div className="rounded-2xl border border-purple-400/20 bg-purple-400/10 p-3 text-center">
          <div className="mx-auto mb-2 h-2 w-2 rounded-full bg-purple-400 animate-pulse" />

          <p className="text-[10px] uppercase tracking-wider text-purple-300">
            AI ACTIVE
          </p>

          <p className="mt-1 text-[10px] text-white/50">
            Confidence 82%
          </p>
        </div>

        {/* SETTINGS */}
        <button className="group flex w-full flex-col items-center gap-2 rounded-2xl p-3 hover:bg-white/[0.04]">
          <Settings className="h-5 w-5 text-white/40 group-hover:text-white/70" />

          <span className="text-[10px] text-white/40 group-hover:text-white/70">
            Settings
          </span>
        </button>

        {/* PREMIUM */}
        <button className="group flex w-full flex-col items-center gap-2 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-3 transition-all hover:bg-yellow-400/20">
          <Crown className="h-5 w-5 text-yellow-300" />

          <span className="text-[10px] text-yellow-300">
            Upgrade
          </span>
        </button>

      </div>
    </aside>
  );
}