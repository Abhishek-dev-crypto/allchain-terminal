'use client';

import {
  Activity,
  BrainCircuit,
  TrendingUp,
  Eye,
  Waves,
  ShieldCheck,
} from 'lucide-react';

const watchlist = [
  { symbol: 'BTC', price: '$109.2K', change: '+2.4%' },
  { symbol: 'ETH', price: '$5.8K', change: '+4.1%' },
  { symbol: 'SOL', price: '$242', change: '+7.8%' },
  { symbol: 'AI', price: '$18.2', change: '+11.3%' },
];

const logs = [
  'Narrative shift detected',
  'Stablecoin inflow increasing',
  'ETH momentum strengthening',
  'Volatility compression easing',
];

export default function AIContextRail() {
  return (
    <aside className="sticky top-4 hidden xl:flex shrink-0 w-[260px] flex-col gap-5 self-start">
      {/* AI STATUS */}
      <div className="terminal-panel-deep p-5 terminal-hover">
        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
            <BrainCircuit className="h-6 w-6 text-cyan-300" />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-white/40">
              AI STATUS
            </p>

            <h3 className="mt-1 text-lg font-semibold text-white">
              Intelligence Active
            </h3>
          </div>

        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">

          <div className="terminal-card p-3">
            <p className="text-[10px] uppercase tracking-wider text-white/40">
              Bias
            </p>

            <p className="mt-1 text-sm font-medium text-emerald-300">
              Bullish
            </p>
          </div>

          <div className="terminal-card p-3">
            <p className="text-[10px] uppercase tracking-wider text-white/40">
              Confidence
            </p>

            <p className="mt-1 text-sm font-medium text-cyan-300">
              82%
            </p>
          </div>

        </div>
      </div>

      {/* PRIORITY SIGNAL */}
      <div className="terminal-panel p-5 terminal-hover">

        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-300" />

          <p className="text-xs uppercase tracking-wider text-emerald-300">
            Priority Signal
          </p>
        </div>

        <h3 className="mt-4 text-lg font-semibold text-white leading-snug">
          ETH liquidity acceleration detected across AI-linked sectors.
        </h3>

        <p className="mt-3 text-sm leading-relaxed text-white/55">
          AI models indicate strengthening capital rotation into Ethereum ecosystem assets.
        </p>

      </div>

      {/* WATCHLIST */}
      <div className="terminal-panel p-5 terminal-hover">

        <div className="mb-4 flex items-center gap-2">
          <Eye className="h-4 w-4 text-cyan-300" />

          <p className="text-xs uppercase tracking-wider text-white/50">
            Watchlist
          </p>
        </div>

        <div className="space-y-3">

          {watchlist.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-white">
                  {item.symbol}
                </p>

                <p className="text-xs text-white/40">
                  {item.price}
                </p>
              </div>

              <span className="text-sm font-medium text-emerald-300">
                {item.change}
              </span>
            </div>
          ))}

        </div>
      </div>

      {/* QUICK SIGNALS */}
      <div className="terminal-panel p-5 terminal-hover">

        <div className="mb-4 flex items-center gap-2">
          <Waves className="h-4 w-4 text-purple-300" />

          <p className="text-xs uppercase tracking-wider text-white/50">
            Quick Signals
          </p>
        </div>

        <div className="space-y-3">

          {[
            'Momentum expanding',
            'Volatility stable',
            'Whale inflow positive',
            'Risk appetite increasing',
          ].map((signal, i) => (
            <div key={i} className="flex items-center gap-3">

              <div className="h-2 w-2 rounded-full bg-cyan-300" />

              <p className="text-sm text-white/65">
                {signal}
              </p>

            </div>
          ))}

        </div>
      </div>

      {/* SYSTEM LOG */}
      <div className="terminal-panel p-5 flex-1 terminal-hover">

        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-purple-300" />

          <p className="text-xs uppercase tracking-wider text-white/50">
            System Log
          </p>
        </div>

        <div className="space-y-3">

          {logs.map((log, index) => (
            <div
              key={index}
              className="rounded-xl border border-white/8 bg-black/20 p-3"
            >
              <p className="text-xs text-white/55">
                [{String(index + 1).padStart(2, '0')}] {log}
              </p>
            </div>
          ))}

        </div>

      </div>

    </aside>
  );
}