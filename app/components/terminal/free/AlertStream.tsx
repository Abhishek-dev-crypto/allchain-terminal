'use client';

import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import { buildAlerts } from '@/lib/intel/buildAlerts';
import { useMarket } from '@/lib/providers/MarketProvider';

import {
  subscribeMarketEvent,
} from '@/lib/events/marketEvents';

type Flow = {
  name: string;
  avg: number;
};

export default function AlertStream() {
  const { coins, engine } = useMarket();

  const [systemAlerts, setSystemAlerts] =
    useState<string[]>([]);

  /**
   * --------------------------------------------------
   * MARKET SYSTEM EVENTS
   * --------------------------------------------------
   */

  useEffect(() => {
    const addSystemAlert = (message: string) => {
      setSystemAlerts((prev) => {
        if (prev[0] === message) return prev;

        return [message, ...prev].slice(0, 3);
      });
    };

    const unsubscribeRefresh =
      subscribeMarketEvent(
        'MARKET_REFRESHED',
        () => {
          addSystemAlert(
            'Market data refreshed'
          );
        }
      );

    const unsubscribeRegime =
      subscribeMarketEvent(
        'REGIME_CHANGED',
        () => {
          addSystemAlert(
            'Market conditions have changed'
          );
        }
      );

    const unsubscribeDisconnect =
      subscribeMarketEvent(
        'STREAM_DISCONNECTED',
        () => {
          addSystemAlert(
            'Live market data connection interrupted'
          );
        }
      );

    const unsubscribeVolatility =
      subscribeMarketEvent(
        'VOLATILITY_SPIKE',
        () => {
          addSystemAlert(
            'Market volatility is rising'
          );
        }
      );

    return () => {
      unsubscribeRefresh();
      unsubscribeRegime();
      unsubscribeDisconnect();
      unsubscribeVolatility();
    };
  }, []);

  /**
   * --------------------------------------------------
   * SECTOR FLOW EXTRACTION
   * --------------------------------------------------
   *
   * Keep the underlying engine data intact,
   * but convert sector names into readable labels.
   */

  const sectorMap: Record<string, string> = {
    BTC: 'Large Caps',

    ETH: 'Layer 1',
    SOL: 'Layer 1',
    AVAX: 'Layer 1',
    SUI: 'Layer 1',

    LINK: 'Infrastructure',
    NEAR: 'Infrastructure',

    UNI: 'DeFi',
    AAVE: 'DeFi',

    DOGE: 'Meme',
    SHIB: 'Meme',

    XRP: 'Payments',
    XLM: 'Payments',
  };

  const flows = useMemo<Flow[]>(() => {
    const grouped: Record<
      string,
      {
        total: number;
        count: number;
      }
    > = {};

    coins.forEach((coin) => {
      const sector =
        sectorMap[
          coin.symbol.toUpperCase()
        ] || 'Other';

      if (!grouped[sector]) {
        grouped[sector] = {
          total: 0,
          count: 0,
        };
      }

      grouped[sector].total +=
        coin.change24h;

      grouped[sector].count += 1;
    });

    return Object.entries(grouped)
      .map(([name, data]) => ({
        name,
        avg:
          data.total /
          (data.count || 1),
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [coins]);

  /**
   * --------------------------------------------------
   * ALERT ENGINE
   * --------------------------------------------------
   */

  const alerts = useMemo(() => {
    return buildAlerts(flows);
  }, [flows]);

  /**
   * --------------------------------------------------
   * BEGINNER-FRIENDLY TRANSLATION
   * --------------------------------------------------
   */

  const readableCategory: Record<
    string,
    string
  > = {
    'Market Regime':
      'Market Direction',

    'Sector Pressure':
      'Sector Movement',

    Volatility:
      'Market Risk',

    'Capital Rotation':
      'Money Movement',

    Momentum:
      'Price Momentum',

    'Market Structure':
      'Market Structure',

    'Market Pulse':
      'Market Pulse',
  };

  const categoryIcons: Record<
    string,
    string
  > = {
    'Market Regime': '⚠',
    'Sector Pressure': '🔥',
    Volatility: '📈',
    'Capital Rotation': '🔄',
    Momentum: '🚀',
    'Market Structure': '🧠',
    'Market Pulse': '📡',
  };

  /**
   * --------------------------------------------------
   * SEVERITY STYLES
   * --------------------------------------------------
   */

  const severityMap = {
    critical: {
      dot: 'bg-red-400',
      border:
        'border-red-400/20',
      glow:
        'shadow-[0_0_20px_rgba(248,113,113,0.15)]',
      label:
        'Important',
      text:
        'text-red-300',
    },

    warning: {
      dot: 'bg-yellow-300',
      border:
        'border-yellow-300/20',
      glow:
        'shadow-[0_0_20px_rgba(253,224,71,0.12)]',
      label:
        'Watch',
      text:
        'text-yellow-300',
    },

    info: {
      dot: 'bg-cyan-300',
      border:
        'border-cyan-300/20',
      glow:
        'shadow-[0_0_20px_rgba(34,211,238,0.12)]',
      label:
        'Info',
      text:
        'text-cyan-300',
    },

    positive: {
      dot: 'bg-emerald-400',
      border:
        'border-emerald-400/20',
      glow:
        'shadow-[0_0_20px_rgba(52,211,153,0.12)]',
      label:
        'Positive',
      text:
        'text-emerald-300',
    },
  };

  /**
   * --------------------------------------------------
   * MARKET SUMMARY
   * --------------------------------------------------
   */

  const marketSummary =
    engine.regime === 'RISK_ON'
      ? 'Buyers are broadly in control'
      : engine.regime === 'RISK_OFF'
      ? 'Sellers are broadly in control'
      : engine.regime === 'ROTATION'
      ? 'Money is moving between sectors'
      : 'The market lacks a clear direction';

  const marketSummaryDetail =
    engine.regime === 'RISK_ON'
      ? `${engine.positiveBreadth.toFixed(
          0
        )}% of tracked assets are positive, suggesting broad market participation.`
      : engine.regime === 'RISK_OFF'
      ? `${engine.positiveBreadth.toFixed(
          0
        )}% of tracked assets are positive, showing weaker overall participation.`
      : engine.regime === 'ROTATION'
      ? 'Different parts of the market are taking turns leading.'
      : 'Price action is mixed, making the overall market direction less clear.';

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="
        rounded-3xl
        border
        border-white/10
        bg-white/[0.02]
        p-5
      "
    >

      {/* ------------------------------------------------ */}
      {/* HEADER */}
      {/* ------------------------------------------------ */}

      <div className="mb-5 flex items-start justify-between">

        <div>

          <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-300">
            ALERT STREAM
          </div>

          <div className="mt-2 text-lg font-bold text-white">
            What is happening in the market?
          </div>

          <p className="mt-1 text-sm text-white/60">
            AI-powered signals translated into
            simple market insights
          </p>

        </div>

        {/* LIVE SIGNAL */}

        <div className="
          flex
          items-center
          gap-2
          rounded-full
          border
          border-emerald-400/20
          bg-emerald-400/10
          px-3
          py-1
        ">

          <div className="
            h-2
            w-2
            animate-pulse
            rounded-full
            bg-emerald-400
          " />

          <span className="
            text-[10px]
            font-medium
            uppercase
            tracking-wide
            text-emerald-300
          ">
            LIVE
          </span>

        </div>

      </div>

      {/* ------------------------------------------------ */}
      {/* MARKET SUMMARY */}
      {/* ------------------------------------------------ */}

      <div className="
        mb-4
        rounded-2xl
        border
        border-cyan-400/10
        bg-cyan-400/[0.03]
        p-4
      ">

        <div className="
          text-[10px]
          uppercase
          tracking-[0.2em]
          text-white/40
        ">
          Market Snapshot
        </div>

        <div className="mt-2 text-sm font-semibold text-white">
          {marketSummary}
        </div>

        <p className="
          mt-1
          text-xs
          leading-relaxed
          text-white/55
        ">
          {marketSummaryDetail}
        </p>

      </div>

      {/* ------------------------------------------------ */}
      {/* SYSTEM EVENTS */}
      {/* ------------------------------------------------ */}

      {systemAlerts.length > 0 && (
        <div className="mb-4 space-y-2">

          {systemAlerts.map(
            (alert, index) => (
              <motion.div
                key={`${alert}-${index}`}
                initial={{
                  opacity: 0,
                  y: -4,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="
                  rounded-xl
                  border
                  border-cyan-500/20
                  bg-cyan-500/10
                  px-3
                  py-2
                  text-xs
                  text-cyan-200
                "
              >
                {alert}
              </motion.div>
            )
          )}

        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* ALERT LIST */}
      {/* ------------------------------------------------ */}

      <div className="
        max-h-[420px]
        space-y-3
        overflow-y-auto
        pr-1
      ">

        {alerts.length === 0 ? (

          <div className="
            rounded-2xl
            border
            border-white/10
            bg-white/[0.02]
            p-5
            text-center
          ">

            <div className="text-sm font-semibold text-white">
              No major alerts right now
            </div>

            <p className="
              mt-1
              text-xs
              text-white/45
            ">
              The market is currently showing
              no significant structural changes.
            </p>

          </div>

        ) : (

          alerts.map((alert) => {

            const styles =
              severityMap[
                alert.severity
              ];

            const readableName =
              readableCategory[
                alert.category
              ] || alert.category;

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

                <div className="
                  flex
                  items-start
                  justify-between
                  gap-3
                ">

                  <div className="
                    flex
                    items-center
                    gap-2
                  ">

                    <div
                      className={`
                        h-2.5
                        w-2.5
                        shrink-0
                        rounded-full
                        ${styles.dot}
                      `}
                    />

                    <span className="
                      text-xs
                      uppercase
                      tracking-wide
                      text-white/40
                    ">
                      {categoryIcons[
                        alert.category
                      ] || '•'}{' '}
                      {readableName}
                    </span>

                    <span
                      className={`
                        rounded-md
                        border
                        px-1.5
                        py-0.5
                        text-[9px]
                        uppercase
                        tracking-wide
                        ${styles.text}
                        ${styles.border}
                      `}
                    >
                      {styles.label}
                    </span>

                  </div>

                  <span className="
                    shrink-0
                    text-[11px]
                    text-white/30
                  ">
                    {alert.timestamp}
                  </span>

                </div>

                {/* CONTENT */}

                <div className="mt-3">

                  <div className="
                    text-sm
                    font-semibold
                    text-white
                  ">
                    {alert.title}
                  </div>

                  <p className="
                    mt-1
                    text-xs
                    leading-relaxed
                    text-white/55
                  ">
                    {alert.description}
                  </p>

                </div>

              </motion.div>
            );
          })

        )}

      </div>

    </motion.section>
  );
}