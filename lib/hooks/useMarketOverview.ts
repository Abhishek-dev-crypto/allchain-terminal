"use client";

import { useEffect, useMemo, useState } from "react";

type CoinData = {
  usd: number;
  usd_24h_change: number;
};

type GlobalData = {
  data: {
    total_market_cap: { usd: number };
    total_volume: { usd: number };
    market_cap_change_percentage_24h_usd?: number;
    market_cap_percentage: {
      btc: number;
    };
    active_cryptocurrencies: number;
    markets: number;
  };
};

export function useMarketOverview() {
  const [btc, setBtc] = useState<CoinData | null>(null);
  const [eth, setEth] = useState<CoinData | null>(null);
  const [global, setGlobal] = useState<GlobalData | null>(null);

  const [fearGreed, setFearGreed] = useState<number | null>(null);
  const [btcDominance, setBtcDominance] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [priceRes, globalRes, fgRes] = await Promise.all([
          fetch("/api/intel/prices"),
          fetch("/api/intel/global"),
          fetch("/api/intel/fear-greed"),
        ]);

        if (!priceRes.ok) throw new Error("Price fetch failed");
        if (!globalRes.ok) throw new Error("Global fetch failed");
        if (!fgRes.ok) throw new Error("Fear & Greed fetch failed");

        const priceData = await priceRes.json();
        const globalData = await globalRes.json();
        const fgData = await fgRes.json();

        setBtc({
          usd: priceData.bitcoin.usd,
          usd_24h_change: priceData.bitcoin.usd_24h_change,
        });

        setEth({
          usd: priceData.ethereum.usd,
          usd_24h_change: priceData.ethereum.usd_24h_change,
        });

        setGlobal(globalData);

        setBtcDominance(
          globalData?.data?.market_cap_percentage?.btc ?? null
        );

        setFearGreed(Number(fgData.data[0].value));

        setLastUpdated(new Date());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    const interval = setInterval(fetchData, 60000);

    return () => clearInterval(interval);
  }, []);

  const trendDirection = useMemo(() => {
    const btcChange = btc?.usd_24h_change ?? 0;
    const ethChange = eth?.usd_24h_change ?? 0;
    const marketChange =
      global?.data?.market_cap_change_percentage_24h_usd ?? 0;

    const avg = (btcChange + ethChange + marketChange) / 3;

    if (avg > 2)
      return {
        label: "BULLISH",
        color: "text-emerald-400",
      };

    if (avg < -2)
      return {
        label: "DEFENSIVE",
        color: "text-red-400",
      };

    return {
      label: "STABLE",
      color: "text-yellow-400",
    };
  }, [btc, eth, global]);

  return {
    btc,
    eth,
    global,
    fearGreed,
    btcDominance,
    trendDirection,
    loading,
    lastUpdated,
  };
}