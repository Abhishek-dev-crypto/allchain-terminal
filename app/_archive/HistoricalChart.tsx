'use client';

import { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

export default function HistoricalChart({ coinId }: { coinId: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const chart = createChart(ref.current, {
      layout: {
        background: { color: '#0b0b0b' },
        textColor: '#ccc',
      },
      grid: {
        vertLines: { color: '#1f1f1f' },
        horzLines: { color: '#1f1f1f' },
      },
      height: 300,
    });

    // ✅ THIS IS CORRECT
    const candleSeries = chart.addCandlestickSeries();

    const load = async () => {
      const res = await fetch(`/api/ohlc?coinId=${coinId}&days=7`);
      const data = await res.json();

      const formatted = data.map((d: number[]) => ({
        time: d[0] / 1000,
        open: d[1],
        high: d[2],
        low: d[3],
        close: d[4],
      }));

      candleSeries.setData(formatted);
    };

    load();

    return () => chart.remove();
  }, [coinId]);

  return <div ref={ref} className="w-full" />;
}