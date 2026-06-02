'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
} from 'lightweight-charts';
import { getKlines } from "@/lib/marketService";

type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type Props = {
  symbol: string;
  coinName?: string;
  price?: number;
  change?: number;
  high?: number;
  low?: number;
  volume?: number;
};

const TIMEFRAMES = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1d', value: '1d' },
];

const BAR_SPACING = 10;

export default function CandlestickChart({
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

  const [timeframe, setTimeframe] = useState('1m');

  /* ---------------- INIT CHART ---------------- */
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {

      localization: {
  locale: 'en-IN',
},

      layout: {
        background: { color: '#0B1220' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },

      width: containerRef.current.clientWidth,
      height: containerRef.current?.clientHeight || 400,

      crosshair: { mode: 1 },

      // 🔥 CLEAN BINANCE-STYLE TIME SCALE
      timeScale: {
  borderColor: '#2b2b43',

  timeVisible: true,
  secondsVisible: false,

  rightBarStaysOnScroll: true,
  fixLeftEdge: true,
  fixRightEdge: true,

  tickMarkFormatter: (
  time: UTCTimestamp,
  tickMarkType: any,
  locale: string
) => {
    return new Date(time * 1000).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  },

  barSpacing: BAR_SPACING,
},

      handleScale: {
        mouseWheel: window.innerWidth > 768,
        pinch: false,
        axisPressedMouseMove: false,
      },

      handleScroll: {
        mouseWheel: window.innerWidth > 768,
        pressedMouseMove: true,
        horzTouchDrag: true,
      },
    });

    chartRef.current = chart;

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    candleRef.current = candleSeries;

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
      base: 0,
    });

    volumeRef.current = volumeSeries;

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });

    candleSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.05, bottom: 0.2 },
    });

    const resize = () => {
  if (!containerRef.current || !chartRef.current) return;

  const { clientWidth, clientHeight } = containerRef.current;

  chartRef.current.applyOptions({
    width: clientWidth,
    height: clientHeight,
  });

  chartRef.current.timeScale().applyOptions({
    barSpacing: BAR_SPACING,
  });
};

    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      chart.remove();
    };
  }, []);

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    if (!symbol || !candleRef.current || !volumeRef.current) return;

    async function load() {
      try { 

       const data: Candle[] = await getKlines(symbol, timeframe);

       const seen = new Set<number>();

const candles = data
  .map((d) => ({
    time: d.time as UTCTimestamp,
    open: d.open,
    high: d.high,
    low: d.low,
    close: d.close,
  }))
  .filter((c) => {
    if (seen.has(c.time)) return false;
    seen.add(c.time);
    return true;
  })
  .sort((a, b) => a.time - b.time);

const volumes = candles.map((d: any, i: number) => ({
  time: d.time,
  value: data[i]?.volume ?? 0,
  color: d.close > d.open ? "#22c55e" : "#ef4444",
}));

        candleRef.current?.setData(candles);
        volumeRef.current?.setData(volumes);

        const chart = chartRef.current;
        if (!chart) return;

        requestAnimationFrame(() => {
          // 🚨 FIXED: USE TIME-BASED RANGE (NOT LOGICAL RANGE)
         const from = candles[Math.max(0, candles.length - 120)]?.time;
          const to = candles[candles.length - 1]?.time;

          chart.timeScale().fitContent();

          chart.timeScale().applyOptions({
            barSpacing: BAR_SPACING,
          });
        });

        
      } catch (err) {
        console.error('Chart load error:', err);
      }
    }

    
    load();
  }, [symbol, timeframe]);

  return (
    <div className="w-full bg-[#0B1220] rounded-lg overflow-hidden border border-white/5">

      {/* TOP BAR */}
     <div
className="
px-3 py-2
border-b border-white/5
flex flex-col lg:flex-row
gap-2
lg:items-center
lg:justify-between
text-xs
"
>
        <div className="flex items-center gap-4">
          <span className="font-semibold text-white text-sm">
            {coinName || symbol}
          </span>

          <span className="text-lg font-semibold">
            {price ? `$${price.toFixed(2)}` : '--'}
          </span>

          <span className={change !== undefined && change >= 0 ? "text-green-400" : "text-red-400"}>
            {change?.toFixed(2)}%
          </span>
        </div>

        <div className="flex items-center gap-6 text-gray-400">
          <div>24H High: <span className="text-white">{high?.toFixed(2) || '--'}</span></div>
          <div>24H Low: <span className="text-white">{low?.toFixed(2) || '--'}</span></div>
          <div>24H Vol: <span className="text-white">{volume?.toFixed(0) || '--'}</span></div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
        <div className="flex gap-2">
          {TIMEFRAMES.map((t) => (
            <button
              key={t.value}
              onClick={() => setTimeframe(t.value)}
              className={`text-xs px-2 py-1 rounded ${
                timeframe === t.value
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

      </div>

      {/* CHART */}
      <div
  ref={containerRef}
  className="w-full h-[320px] sm:h-[420px] lg:h-[520px]"
/>
    </div>
  );
}