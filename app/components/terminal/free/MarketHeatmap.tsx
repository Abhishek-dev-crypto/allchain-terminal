'use client';

import {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';

import {
  motion,
  AnimatePresence,
} from 'framer-motion';

import {
  buildMarketStructure,
} from "@/lib/intel/narrativeEngine";

import { useMarketSnapshot } from "@/lib/intel/useMarketSnapshot";

import { useMarket } from "@/lib/providers/MarketProvider";

type Timeframe =
  | '15M'
  | '1H'
  | '4H'
  | '24H'
  | '7D';

export default function MarketHeatmap() {

  const { coins } = useMarket();

  const [open, setOpen] = useState(false);
  const [timeframe, setTimeframe] = useState<Timeframe>('24H');

  // =========================
  // SCROLL LOCK + ESC
  // =========================
  useEffect(() => {
    if (!open) return;

    const originalBodyOverflow =
      document.body.style.overflow;

    const originalHtmlOverflow =
      document.documentElement.style.overflow;

    const scrollBarWidth =
      window.innerWidth -
      document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow =
      'hidden';

    document.body.style.paddingRight =
      `${scrollBarWidth}px`;

    const handleKeyDown = (
      e: KeyboardEvent
    ) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        originalBodyOverflow;

      document.documentElement.style.overflow =
        originalHtmlOverflow;

      document.body.style.paddingRight = '';

      window.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [open]);

  // =========================
  // FETCH
  // =========================
 

  // =========================
  // HELPERS
  // =========================

  const isHot = useCallback(
    (change: number) =>
      Math.abs(change) > 3,
    []
  );

  const getSector = useCallback(
    (id: string) => {
      const l1 = [
        'bitcoin',
        'ethereum',
        'solana',
        'ripple',
      ];

      const defi = ['chainlink'];

      const infra = [
        'avalanche-2',
        'near',
        'toncoin',
      ];

      const meme = ['dogecoin'];

      if (l1.includes(id)) return 'L1';
      if (defi.includes(id)) return 'DEFI';
      if (infra.includes(id)) return 'INFRA';
      if (meme.includes(id)) return 'MEME';

      return 'OTHER';
    },
    []
  );

  const getWhaleSignal = useCallback(
    (change: number) => {
      if (change > 3)
        return 'ACCUMULATION';

      if (change < -3)
        return 'DISTRIBUTION';

      return 'NEUTRAL';
    },
    []
  );

 const getFlowLabel = useCallback(
  (signal: string) => {
    if (signal === 'ACCUMULATION') {
      return '↑ ACCUM';
    }

    if (signal === 'DISTRIBUTION') {
      return '↓ DIST';
    }

    return '→ NEUTRAL';
  },
  []
);

  const getSentiment = useCallback(
    (change: number) => {
      if (change > 3) {
        return {
          label: 'BULLISH',
          color: 'text-emerald-300',
        };
      }

      if (change < -3) {
        return {
          label: 'BEARISH',
          color: 'text-red-300',
        };
      }

      return {
        label: 'NEUTRAL',
        color: 'text-white/40',
      };
    },
    []
  );

  const getColor = useCallback(
    (change: number) => {
      if (change > 3) {
        return `
          bg-emerald-500/20
          border-emerald-400/30
        `;
      }

      if (change > 0) {
        return `
          bg-emerald-500/10
          border-emerald-500/20
        `;
      }

      if (change < -3) {
        return `
          bg-red-500/20
          border-red-400/30
        `;
      }

      if (change < 0) {
        return `
          bg-red-500/10
          border-red-500/20
        `;
      }

      return `
        bg-white/[0.03]
        border-white/10
      `;
    },
    []
  );

  const getVolumeOpacity = useCallback(
    (volume?: number) => {
      const v = volume ?? 0;

      if (v > 50_000_000_000)
        return 'opacity-100';

      if (v > 10_000_000_000)
        return 'opacity-90';

      if (v > 1_000_000_000)
        return 'opacity-80';

      return 'opacity-60';
    },
    []
  );

 const getTileSize = useCallback(
  (
    symbol: string,
    fullscreen: boolean
  ) => {
    if (symbol === 'BTC') {
      return fullscreen
        ? `
          col-span-3
          row-span-2
        `
        : `
          col-span-2
          row-span-2
        `;
    }

    if (symbol === 'ETH') {
      return fullscreen
        ? `
          col-span-2
          row-span-2
        `
        : `
          col-span-2
          row-span-1
        `;
    }

    if (
      ['SOL', 'XRP'].includes(symbol)
    ) {
      return 'col-span-2';
    }

    return 'col-span-1';
  },
  []
);

  const getSymbolStyle = useCallback(
  (symbol: string) => {
    if (symbol === 'BTC') {
      return {
        text: 'text-3xl',
        glow: 'from-orange-400/20',
        ring: 'ring-orange-400/20',
        label: 'MARKET LEADER',
      };
    }

    if (symbol === 'ETH') {
      return {
        text: 'text-2xl',
        glow: 'from-blue-400/20',
        ring: 'ring-blue-400/20',
        label: 'ECOSYSTEM',
      };
    }

    if (
      ['SOL', 'XRP'].includes(symbol)
    ) {
      return {
        text: 'text-lg',
        glow: 'from-cyan-400/10',
        ring: 'ring-cyan-400/10',
        label: 'SECTOR MOVER',
      };
    }

    return {
      text: 'text-sm',
      glow: 'from-white/5',
      ring: 'ring-white/5',
      label: 'FLOW',
    };
  },
  []
);

  // =========================
  // DERIVED
  // =========================

  const maxVolume = useMemo(() => {
    if (!coins.length) return 1;

    return Math.max(
      ...coins.map(
        (c) => c.volume ?? 0
      )
    );
  }, [coins]);

  const enrichedCoins = useMemo(() => {
    return [...coins]
      .map((coin) => ({
        ...coin,

        sector: getSector(coin.id),

        whale: getWhaleSignal(
          coin.change24h
        ),

        sentiment: getSentiment(
          coin.change24h
        ),

        hot: isHot(coin.change24h),

        strength: Math.min(
          100,
          Math.round(
            coin.change24h * 8 +
              ((coin.volume ?? 0) /
                maxVolume) *
                50
          )
        ),
      }))
      .sort(
        (a, b) =>
          b.marketCap - a.marketCap
      );
  }, [
    coins,
    getSector,
    getWhaleSignal,
    getSentiment,
    isHot,
    maxVolume,
  ]);

  const structure = useMemo(() => {
  return buildMarketStructure(coins);
}, [coins]);

  const sectorMap = useMemo(() => {
    const map: Record<
      string,
      number
    > = {};

    enrichedCoins.forEach((c) => {
      map[c.sector] =
        (map[c.sector] || 0) +
        c.change24h;
    });

    return map;
  }, [enrichedCoins]);

const momentumLeaders = useMemo(() => {
  return [...enrichedCoins]
    .sort(
      (a, b) =>
        b.change24h - a.change24h
    )
    .slice(0, 3);
}, [enrichedCoins]);

  // =========================
  // LOADING
  // =========================

  if (!coins?.length) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/40">
      No market data available
    </div>
  );
}

  // =========================
  // REUSABLE UI
  // =========================

  const HeatmapUI = ({
    fullscreen = false,
  }: {
    fullscreen?: boolean;
  }) => (
    <>

      <div
  className="
    mb-4
    flex items-center
    justify-between
  "
>
  <div
    className={`
      flex items-center gap-2
      ${fullscreen ? 'text-sm' : 'text-[11px]'}
      text-emerald-300
    `}
  >
    <div
      className="
        h-2 w-2
        rounded-full
        bg-emerald-400
        animate-pulse
      "
    />

    LIVE MARKET INTELLIGENCE
  </div>

  <div
    className={`
      ${fullscreen ? 'text-xs' : 'text-[10px]'}
      text-white/30
    `}
  >
    Real-time AI monitoring
  </div>
</div>


      {/* TOP INTELLIGENCE BAR */}
      <div
        className={`
          grid grid-cols-2
          md:grid-cols-6
          gap-2 mb-4
          ${fullscreen ? 'text-sm' : 'text-[10px]'}
        `}
        >
        <div
          className="
            rounded-xl
            border border-white/10
            bg-white/[0.04]
            p-2
          "
          >
          <div className={`
  ${fullscreen ? 'text-xs' : 'text-[10px]'}
  text-white/40
`}>
            Market
          </div>

          <div
            className="
              font-semibold
              text-white
            "
            >
            {structure.marketMood}
          </div>
        </div>

        <div
          className="
            rounded-xl
            border border-white/10
            bg-white/[0.04]
            p-2
          "
          >
          <div className={`
  ${fullscreen ? 'text-xs' : 'text-[10px]'}
  text-white/40
`}>
            Rotation
          </div>

          <div
            className="
              font-semibold
              text-cyan-300
            "
            >
            {structure.leaderSector}
          </div>
        </div>

         {/* AI FLOW */}
<div
  className="
    rounded-xl
    border border-white/10
    bg-white/[0.04]
    p-2
  "
>
  <div
    className={`
      ${fullscreen ? 'text-xs' : 'text-[10px]'}
      text-white/40
    `}
  >
    AI Flow
  </div>

  <div
    className="
      font-semibold
      text-emerald-300
    "
  >
    {structure.aiFlow}
  </div>
</div>

{/* VOLATILITY */}
<div
  className="
    rounded-xl
    border border-white/10
    bg-white/[0.04]
    p-2
  "
>
  <div
    className={`
      ${fullscreen ? 'text-xs' : 'text-[10px]'}
      text-white/40
    `}
  >
    Volatility
  </div>

  <div
    className="
      font-semibold
      text-white
      "
  >
    {structure.volatility}
  </div>
</div>

          <div
            className="
              rounded-xl
              border border-white/10
              bg-white/[0.04]
              p-2
              "
              >
              <div className={`
  ${fullscreen ? 'text-xs' : 'text-[10px]'}
  text-white/40
`}>
                Timeframe
              </div>

            <div
                className="
                font-semibold
                  text-white
                "
                >
                {timeframe}
            </div>
          </div>

          <div
            className="
            rounded-xl
            border border-white/10
            bg-white/[0.04]
            p-2
            "
            >
            <div className={`
  ${fullscreen ? 'text-xs' : 'text-[10px]'}
  text-white/40
`}>
              Refresh
            </div>

            <div
              className="
                font-semibold
                text-white
              "
              >
              60s
            </div>
          </div>
      </div>

      {/* TIMEFRAME */}
      <div
        className="
          flex gap-2
          mb-4
          flex-wrap
        "
      >
        {(
          [
            '15M',
            '1H',
            '4H',
            '24H',
            '7D',
          ] as Timeframe[]
        ).map((tf) => (
          <button
            key={tf}
            onClick={() =>
              setTimeframe(tf)
            }
            className={`
              px-3 py-1
              rounded-lg
              ${fullscreen ? 'text-sm' : 'text-[10px]'}
              transition
              border

              ${
                timeframe === tf
                  ? `
                    bg-white/15
                    border-white/20
                    text-white
                  `
                  : `
                    bg-white/[0.03]
                    border-white/10
                    text-white/50
                    hover:scale-105
                    active:scale-95
                  `
              }
            `}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* AI INSIGHT */}
      <div
        className={`
          mb-4
          rounded-xl
          border border-cyan-500/20
          bg-cyan-500/5
          ${fullscreen ? 'p-3' : 'p-2'}
        `}
        >
        <div
          className={`
            mb-1
            ${fullscreen ? 'text-xs' : 'text-[10px]'}
            uppercase
            tracking-wider
            text-cyan-300
          `}
        >
          AI Rotation Insight
        </div>

        <div
          className={`
  ${fullscreen ? 'text-sm' : 'text-xs'}
  text-white/80
`}
        >
          {structure.rotationInsight}
        </div>
      </div>

      <div className="mb-4">
  <div
    className={`
      mb-2
      ${fullscreen ? 'text-sm' : 'text-[10px]'}
      uppercase
      tracking-wider
      text-white/40
    `}
  >
    Momentum Leaders
  </div>

  <div className="flex gap-2 min-w-0">
    {momentumLeaders.map((coin) => (
      <div
        key={coin.id}
        className="
  min-w-0
  flex-1

  rounded-xl
  border border-emerald-500/20
  bg-emerald-500/5

  px-3 py-2
"
      >
        <div
          className={`
  ${
    fullscreen
      ? 'text-2xl'
      : 'text-sm'
  }
  font-semibold
  text-white
`}
        >
          {coin.symbol}
        </div>

        <div
           className={`
    ${fullscreen ? 'text-sm' : 'text-xs'}
    text-white/80
  `}
        >
          +{coin.change24h.toFixed(2)}%
        </div>
      </div>
    ))}
  </div>
</div>

      {/* HEATMAP */}
      <div
        className={`
          grid
${fullscreen
  ? 'grid-cols-6'
  : 'grid-cols-4'}
          auto-rows-fr
          gap-2
          ${
            fullscreen
  ? 'min-h-[650px]'
  : 'min-h-[420px]'
          }
        `}
      >{enrichedCoins.map((coin) => {
  const symbolStyle =
    getSymbolStyle(coin.symbol);

  return (
          <motion.div
            layout
            key={coin.id}
            whileHover={{
              scale: 1.02,
            }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 18,
            }}
           className={`
  group
  relative overflow-hidden min-w-0

  rounded-2xl
  border
 ${fullscreen ? 'p-3' : 'p-2'}

  flex flex-col justify-between

  backdrop-blur-xl

  transition-all duration-300

  hover:scale-[1.02]
  hover:z-10

  bg-gradient-to-br
  ${symbolStyle.glow}
  to-transparent

  ring-1
  ${symbolStyle.ring}

  ${getTileSize(
  coin.symbol,
  fullscreen
)}

  ${getColor(coin.change24h)}

  ${getVolumeOpacity(coin.volume)}
`}
          >
            {fullscreen && coin.change24h > 4 && (
  <div
    className={`
  ${fullscreen ? 'text-xs' : 'text-[9px]'}

  absolute top-2 right-2 z-20

  rounded-full
  border border-emerald-400/20
  bg-emerald-400/15

  px-2 py-1

  font-semibold
  text-emerald-300

  animate-pulse
`}
  >
    MOMENTUM
  </div>
)}


            {/* GLOW */}
            {coin.hot && (
              <div
                className={`
                  absolute inset-0
                  blur-3xl
                  animate-pulse
                  ${
                    Math.abs(coin.change24h) > 0.3
                      ? 'bg-emerald-400/10'
                      : 'bg-red-400/10'
                  }
                `}
              />
            )}

            {/* CONTENT */}
            <div
  className="
    relative z-10
    flex flex-col gap-y-2

    min-w-0
    overflow-hidden
    break-words
  "
>
  
  {/* TOP */}
  <div
    className="
      flex items-start
      justify-between
      gap-2
    "
  >
    <div
      className={`
        font-bold tracking-tight

        ${
          fullscreen
            ? symbolStyle.text
             : 'text-sm'
        }
      `}
    >
      {coin.symbol}
        <div>
        {fullscreen && (
         <div
            className={`
  mt-1
  ${fullscreen ? 'text-xs' : 'text-[9px]'}
  uppercase
  tracking-wider
  text-white/30
`}
            >
            {symbolStyle.label}
          </div>
        )}
        </div>
    </div>

    <div
      className={`
        font-semibold

        ${
          fullscreen
            ? 'text-xs'
            : 'text-sm'
        }

        ${
          coin.change24h >= 0
            ? 'text-emerald-300'
            : 'text-red-300'
        }
      `}
    >
      {coin.change24h.toFixed(2)}%
    </div>
  </div>

  {/* FULLSCREEN ONLY */}
  {fullscreen && (
    <>
      <div
        className={`
          ${fullscreen ? 'text-sm' : 'text-[10px]'}
          text-white/40
        `}
      >
        {coin.sector}
      </div>

      <div
        className={`
          ${fullscreen ? 'text-2xl' : 'text-lg'}
          font-semibold
          text-white
        `}
      >
        $
        {coin.price.toLocaleString()}
      </div>

      <div
        className={`
          flex items-center
          justify-between
          ${fullscreen ? 'text-sm' : 'text-[10px]'}
        `}
      >
        <div
          className={
            coin.sentiment.color
          }
        >
          {
            coin.sentiment
              .label
          }
        </div>

        <div
          className="
            text-cyan-300
          "
        >
          RS {coin.strength}
        </div>
      </div>

      <div
        className={`
          ${fullscreen ? 'text-xs' : 'text-[9px]'}
          text-white/30
        `}
      >
        {getFlowLabel(coin.whale)}
      </div>
    </>
  )}
</div>
          </motion.div>
        );})}
      </div>

      {/* FOOTER */}
      <div
        className={`
          mt-4
          flex items-center
          justify-between
          ${fullscreen ? 'text-sm' : 'text-[10px]'}
          text-white/30
        `}
      >
        <span>
          AI market intelligence
          engine active
        </span>

        <span>
          Live sector rotation
          tracking
        </span>
      </div>
    </>
  );

  // =========================
  // MAIN
  // =========================

  return (
    <>
      {/* CARD */}
      <motion.div
        layout
        layoutId="market-heatmap"
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
  type: 'spring',
  stiffness: 90,
  damping: 22,
  mass: 0.9,
}}
        
        className={`
          rounded-3xl
          border border-white/10
          bg-white/[0.03]
          p-4
          backdrop-blur-2xl
          overflow-hidden

          ${getVolumeOpacity(
            maxVolume
          )}
        `}
      >
        <HeatmapUI />

        <button
          onClick={() => setOpen(true)}
          className="
            mt-4
            w-full
            rounded-xl
            border border-white/10
            bg-white/[0.05]
            py-3
            text-sm
            text-white/80
            transition
            hover:bg-white/[0.08]
          "
        >
          View Full Heatmap
        </button>
      </motion.div>

      {/* FULLSCREEN */}
      <AnimatePresence>
        {open && (
          <motion.div
  initial={{
    opacity: 0,
    backdropFilter: 'blur(0px)',
  }}
  animate={{
    opacity: 1,
    backdropFilter: 'blur(20px)',
  }}
  exit={{
    opacity: 0,
    backdropFilter: 'blur(0px)',
  }}
  transition={{
    duration: 0.35,
  }}
            className="
              fixed inset-0
              z-50
              bg-black/80
              backdrop-blur-2xl
              p-6
            "
            onClick={() =>
              setOpen(false)
            }
          >
            <motion.div
              layout
              layoutId="market-heatmap"
              transition={{
                type: 'spring',
                stiffness: 120,
                damping: 20,
              }}
              className="
                h-full
                overflow-auto
                rounded-3xl
                border border-white/10
                bg-black/80
                shadow-2xl
                backdrop-blur-3xl
                p-6
              "
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              {/* HEADER */}
              <motion.div
  initial={{
    opacity: 0,
    y: 10,
  }}
  animate={{
    opacity: 1,
    y: 0,
  }}
  transition={{
    delay: 0.15,
    duration: 0.3,
  }}
  className="
    mb-6
    flex items-center
    justify-between
  "
>
                <div>
                  <div
                    className="
                      text-2xl
                      font-bold
                      text-white
                    "
                  >
                    Market Intelligence
                  </div>

                  <div
                    className="
                      mt-1
                      text-sm
                      text-white/40
                    "
                  >
                    AI-powered market
                    structure visualization

                  </div>

              
                </div>

                <button
                  onClick={() =>
                    setOpen(false)
                  }
                  className="
                    rounded-xl
                    border border-white/10
                    bg-white/[0.05]
                    px-4 py-2
                    text-white/50
                    transition
                    hover:text-white
                  "
                >
                  ✕
                </button>
              </motion.div>

              <motion.div
  initial={{
    opacity: 0,
    y: 20,
  }}
  animate={{
    opacity: 1,
    y: 0,
  }}
  transition={{
    delay: 0.2,
    duration: 0.35,
  }}
>
  <HeatmapUI fullscreen />
</motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


