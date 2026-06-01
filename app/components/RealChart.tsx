"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  UTCTimestamp,
} from "lightweight-charts";

type Props = {
  price: number;
};

export default function RealChart({ price }: Props) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstance = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // 🔥 Create chart
    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 180,
      layout: {
        background: { color: "#0b0f14" },
        textColor: "#aaa",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.05)" },
        horzLines: { color: "rgba(255,255,255,0.05)" },
      },
      crosshair: {
        mode: 0,
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.1)",
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.1)",
      },
    });

    const series = chart.addCandlestickSeries({
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    chartInstance.current = chart;
    seriesRef.current = series;

    // 📊 Generate initial candles (fake but realistic)
    let lastPrice = price || 30000;
    const data: CandlestickData[] = [];

    for (let i = 0; i < 30; i++) {
      const open = lastPrice;
      const close = open + (Math.random() - 0.5) * 200;
      const high = Math.max(open, close) + Math.random() * 100;
      const low = Math.min(open, close) - Math.random() * 100;

      data.push({
        time: (Date.now() / 1000 - (30 - i) * 60) as UTCTimestamp,
        open,
        high,
        low,
        close,
      });

      lastPrice = close;
    }

    series.setData(data);

    return () => {
      chart.remove();
    };
  }, []);

  // ⚡ live update effect
  useEffect(() => {
    if (!seriesRef.current) return;

    const time = (Date.now() / 1000) as UTCTimestamp;

    const open = price;
    const close = price + (Math.random() - 0.5) * 100;
    const high = Math.max(open, close) + Math.random() * 50;
    const low = Math.min(open, close) - Math.random() * 50;

    seriesRef.current.update({
      time,
      open,
      high,
      low,
      close,
    });
  }, [price]);

  return <div ref={chartRef} className="w-full" />;
}