'use client';

import { motion } from 'framer-motion';

const pulses = [
  {
    label: 'BTC DOM',
    value: '54.2%',
    positive: true,
  },
  {
    label: 'ETH/BTC',
    value: '+2.4%',
    positive: true,
  },
  {
    label: 'TOTAL3',
    value: '+3.1%',
    positive: true,
  },
  {
    label: 'DXY',
    value: '-0.42%',
    positive: false,
  },
  {
    label: 'NASDAQ',
    value: '+1.2%',
    positive: true,
  },
  {
    label: 'Funding',
    value: 'Positive',
    positive: true,
  },
  {
    label: 'Open Interest',
    value: 'Rising',
    positive: true,
  },
  {
    label: 'Liquidity',
    value: 'Expanding',
    positive: true,
  },
];

export default function MarketPulseStrip() {
  return (
    <section className="terminal-panel overflow-hidden px-4 py-3">

      <div className="flex flex-wrap items-center gap-3">

        {pulses.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5"
          >

            <span className="text-[10px] uppercase tracking-wider text-white/40">
              {item.label}
            </span>

            <span
              className={`text-xs font-medium ${
                item.positive
                  ? 'text-emerald-300'
                  : 'text-rose-300'
              }`}
            >
              {item.value}
            </span>

          </motion.div>
        ))}

      </div>

    </section>
  );
}