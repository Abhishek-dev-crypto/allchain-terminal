'use client';

import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import { buildAlerts } from '@/lib/intel/buildAlerts';
import { useMarket } from '@/lib/providers/MarketProvider';

import {
  subscribeMarketEvent,
} from "@/lib/events/marketEvents";


type Flow = {
  name: string;
  avg: number;
};

const sectorMap: Record<string, string> = {
  BTC: 'LARGE_CAP',

  ETH: 'L1',
  SOL: 'L1',
  AVAX: 'L1',
  SUI: 'L1',

  LINK: 'INFRA',
  NEAR: 'INFRA',

  UNI: 'DEFI',
  AAVE: 'DEFI',

  DOGE: 'MEME',
  SHIB: 'MEME',

  XRP: 'PAYMENTS',
  XLM: 'PAYMENTS',
};

export default function AlertStream() {

  const {coins} = useMarket();

  const [systemAlerts, setSystemAlerts] =
  useState<string[]>([]);

  useEffect(() => {
  const unsubscribeRefresh =
    subscribeMarketEvent(
      "MARKET_REFRESHED",
      () => {
        setSystemAlerts((prev) => [
          "Market stream synchronized",
          ...prev,
        ].slice(0, 5));
      }
    );

    const unsubscribeRegime =
  subscribeMarketEvent(
    "REGIME_CHANGED",
    () => {
      setSystemAlerts((prev) => [
        "Market regime transition detected",
        ...prev,
      ].slice(0, 5));
    }
  );

  const unsubscribeDisconnect =
    subscribeMarketEvent(
      "STREAM_DISCONNECTED",
      () => {
        setSystemAlerts((prev) => [
          "Terminal stream disconnected",
          ...prev,
        ].slice(0, 5));
      }
    );

  const unsubscribeVolatility =
    subscribeMarketEvent(
      "VOLATILITY_SPIKE",
      () => {
        setSystemAlerts((prev) => [
          "Market instability detected",
          ...prev,
        ].slice(0, 5));
      }
    );

  return () => {
    unsubscribeRefresh();
    unsubscribeDisconnect();
    unsubscribeVolatility();
    unsubscribeRegime();
  };
}, []);

  /**
   * 📊 FLOW EXTRACTION
   */
  const flows = useMemo<Flow[]>(() => {
    const grouped: Record<
      string,
      { total: number; count: number }
    > = {};

    coins.forEach((coin) => {
      const sector =
        sectorMap[
          coin.symbol.toUpperCase()
        ] || 'OTHER';

      if (!grouped[sector]) {
        grouped[sector] = {
          total: 0,
          count: 0,
        };
      }

      grouped[sector].total += coin.change24h;
      grouped[sector].count += 1;
    });

    return Object.entries(grouped).map(
      ([name, data]) => ({
        name,
        avg: data.total / data.count,
      })
    );
  }, [coins]);

  /**
   * 🧠 ALERT ENGINE
   */
  const alerts = useMemo(() => {
    return buildAlerts(flows);
  }, [flows]);

  /**
   * 🎨 SEVERITY COLORS
   */
  const severityMap = {
    critical: {
      dot: 'bg-red-400',
      border: 'border-red-400/20',
      glow: 'shadow-[0_0_20px_rgba(248,113,113,0.15)]',
    },

    warning: {
      dot: 'bg-yellow-300',
      border: 'border-yellow-300/20',
      glow: 'shadow-[0_0_20px_rgba(253,224,71,0.12)]',
    },

    info: {
      dot: 'bg-cyan-300',
      border: 'border-cyan-300/20',
      glow: 'shadow-[0_0_20px_rgba(34,211,238,0.12)]',
    },

    positive: {
      dot: 'bg-emerald-400',
      border: 'border-emerald-400/20',
      glow: 'shadow-[0_0_20px_rgba(52,211,153,0.12)]',
    },
  };

  const categoryIcons: Record<string, string> = {
  "Market Regime": "⚠",
  "Sector Pressure": "🔥",
  "Volatility": "📈",
  "Capital Rotation": "🔄",
  "Momentum": "🚀",
  "Market Structure": "🧠",
  "Market Pulse": "📡",
};

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        rounded-3xl
        border
        border-white/10
        bg-white/[0.02]
        p-5
      "
    >

 {systemAlerts.map((alert, index) => (
  <div
    key={index}
    className="
      rounded-xl
      border border-cyan-500/20
      bg-cyan-500/10
      px-3 py-2
      text-xs text-cyan-200
    "
  >
    {alert}
  </div>
))}
      
      {/* HEADER */}
<div className="mb-5 flex items-start justify-between">

  <div>

    <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-300">
      ALERT STREAM
    </div>

    <div className="mt-2 text-lg font-bold text-white">
      Live Market Intelligence
    </div>

    <p className="mt-1 text-sm text-white/60">
      AI-generated market structure alerts
    </p>

  </div>

  {/* LIVE SIGNAL */}
  <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1">

    <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

    <span className="text-[10px] font-medium uppercase tracking-wide text-emerald-300">
      LIVE SIGNAL
    </span>

  </div>

</div>

      {/* ALERT LIST */}
     <div className=
     "max-h-[420px] space-y-3 overflow-y-auto pr-1">

        {alerts.map((alert) => {
          const styles =
            severityMap[alert.severity];

          return (
            <motion.div
              key={alert.id}
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.35,
              }}
              className={`
  relative
  rounded-2xl
  border
  bg-white/[0.02]
  p-4
  transition-all
  duration-300
  hover:-translate-y-[1px]
  hover:bg-white/[0.04]
  ${styles.border}
  ${styles.glow}
`}
            >

              {/* TOP */}
              <div className="flex items-start justify-between">

                <div className="flex items-center gap-2">

                  <div
                    className={`
                      h-2.5
                      w-2.5
                      rounded-full
                      animate-pulse
                      ${styles.dot}
                    `}
                  />

                  <span className="text-xs uppercase tracking-wide text-white/40">
                    {categoryIcons[alert.category] || "•"} {alert.category}
                  </span>

                </div>

                <span className="text-[11px] text-white/30">
                  {alert.timestamp}
                </span>

              </div>

              {/* CONTENT */}
              <div className="mt-3">

                <div className="text-sm font-semibold text-white">
                  {alert.title}
                </div>

                <p className="mt-1 text-xs leading-relaxed text-white/55">
                  {alert.description}
                </p>

              </div>

            </motion.div>
          );
        })}

      </div>

    </motion.section>
  );
}