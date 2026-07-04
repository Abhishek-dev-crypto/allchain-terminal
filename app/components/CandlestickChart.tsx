'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
  CandlestickData,
  HistogramData,
} from 'lightweight-charts';

type Props = {
  symbol: string;
  coinName?: string;
  price?: number;
  change?: number;
  high?: number;
  low?: number;
  volume?: number;
};

const TIMEFRAMES = ['1m', '5m', '15m','30m', '1h', '4h', '1d'] as const;

const BAR_SPACING = 10;

const CandlestickChart = React.memo(function CandlestickChart({
  symbol,
  coinName,
  price,
  change,
  high,
  low,
  volume,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  const [timeframe, setTimeframe] = useState<(typeof TIMEFRAMES)[number]>('1m');

  /* ---------------- INIT CHART ---------------- */
  useEffect(() => {
    if (!containerRef.current || chartRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: '#0B1220' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight || 400,
      crosshair: { mode: 1 },

      handleScroll: {
    mouseWheel: false,
    pressedMouseMove: false,
    horzTouchDrag: false,
    vertTouchDrag: false,
  },

  handleScale: {
    axisPressedMouseMove: false,
    mouseWheel: false,
    pinch: false,
    axisDoubleClickReset: false,
  },

      timeScale: {
      borderColor: '#2b2b43',
      timeVisible: true,
      secondsVisible: false,
      barSpacing: BAR_SPACING,

      tickMarkFormatter: (time: number) => {
  return new Date(time * 1000).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  });
},
},
    });

    chartRef.current = chart;

    candleRef.current = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    volumeRef.current = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });

    volumeRef.current.priceScale().applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });

    candleRef.current.priceScale().applyOptions({
      scaleMargins: { top: 0.05, bottom: 0.2 },
    });

    const handleResize = () => {
      if (!containerRef.current || !chartRef.current) return;

      chartRef.current.applyOptions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();

      chartRef.current = null;
      candleRef.current = null;
      volumeRef.current = null;
    };
  }, []);

  const firstLoad = useRef(true);
  /* ---------------- DATA FETCH ---------------- */
  useEffect(() => {
    if (!symbol) return;

    let alive = true;
    let interval: NodeJS.Timeout;

    

    const load = async () => {
      try {
        const res = await fetch(`/api/market/snapshot?symbol=${symbol}`);
const data = await res.json();


const raw = data.candles?.[timeframe] || [];


        if (!alive || !Array.isArray(raw)) return;

        const candles: CandlestickData<UTCTimestamp>[] = raw.map((d: any) => ({
          time: Math.floor(Number(d.time) / 1000) as UTCTimestamp,
          open: Number(d.open),
          high: Number(d.high),
          low: Number(d.low),
          close: Number(d.close),
        }));

        const volumes: HistogramData<UTCTimestamp>[] = raw.map((d: any) => ({
         time: Math.floor(Number(d.time) / 1000) as UTCTimestamp,
          value: Number(d.volume || 0),
          color: d.close > d.open ? '#22c55e' : '#ef4444',
        }));

        candleRef.current?.setData(candles);
        volumeRef.current?.setData(volumes);

       

        if (firstLoad.current) {
          chartRef.current?.timeScale().fitContent();
          firstLoad.current = false;
        }
      } catch (err) {
        console.error('Chart load error:', err);
      }
    };

    load();
    interval = setInterval(load, 5000);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [symbol, timeframe]);

  const handleTimeframe = useCallback(
    (tf: typeof TIMEFRAMES[number]) => {
        setTimeframe(tf);
    },
    []
);


  /* ---------------- UI ---------------- */
  return (
    <div className="flex flex-col h-full w-full bg-[#0B1220] rounded-lg overflow-hidden border border-white/5">

      {/* HEADER */}
      <div className="px-3 py-2 border-b border-white/5 flex flex-col lg:flex-row gap-2 lg:items-center lg:justify-between text-xs">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-white text-sm">
            {coinName || symbol}
          </span>

          <span className="text-lg font-semibold">
            {price ? `$${price.toFixed(4)}` : '--'}
          </span>

          <span className={change && change >= 0 ? 'text-green-400' : 'text-red-400'}>
            {change?.toFixed(2)}%
          </span>
        </div>

        <div className="flex items-center gap-6 text-gray-400">
          <div>24H High: <span className="text-white">{high ?? '--'}</span></div>
          <div>24H Low: <span className="text-white">{low ?? '--'}</span></div>
          <div>24H Vol: <span className="text-white">{volume ?? '--'}</span></div>
        </div>
      </div>

      {/* TIMEFRAMES */}
      <div className="px-3 py-2 border-b border-white/5 flex gap-2">
        {TIMEFRAMES.map((t) => (
          <button
            key={t}
            onClick={() => handleTimeframe(t)}
            className={`text-xs px-2 py-1 rounded ${
              timeframe === t
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-white/5'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* CHART */}
      <div
  ref={containerRef}
  className="flex-1 min-h-0 w-full"
/>
    </div>
  );
});
export default CandlestickChart;