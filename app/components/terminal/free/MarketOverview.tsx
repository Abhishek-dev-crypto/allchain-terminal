"use client";

import { motion } from "framer-motion";

import { useMarketOverview } from "@/lib/hooks/useMarketOverview";


export default function MarketOverview() {
  
const {
  btc,
  eth,
  global,
  fearGreed,
  btcDominance,
  trendDirection,
  loading,
  lastUpdated,
} = useMarketOverview();
  // =========================
  // MARKET MOOD
  // =========================
  const getMarketMood = (value: number | null) => {
   if (value == null) return "--";

    if (value < 25) return "EXTREME FEAR";
    if (value < 45) return "FEAR";
    if (value < 55) return "NEUTRAL";
    if (value < 75) return "GREED";

    return "EXTREME GREED";
  };

  const mood = getMarketMood(fearGreed);

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="p-4 rounded-xl border border-white/10 bg-white/5">
        <div className="animate-pulse text-white/60 text-xs">
          Loading market intelligence...
        </div>
      </div>
    );
  }

  const formatMarketNumber = (num?: number) => {
  if (num == null) return "--";

  if (num >= 1_000_000_000_000) {
    return `$${(num / 1_000_000_000_000).toFixed(2)}T`;
  }

  if (num >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(2)}B`;
  }

  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(2)}M`;
  }

  return `$${num.toLocaleString()}`;
};

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-2.5 rounded-xl border border-white/10 bg-white/[0.03] space-y-2"
    >
      
     {/* ========================= */}
{/* UNIFIED HEADER */}
{/* ========================= */}
<div className="flex items-start justify-between">

  <div className="space-y-1">

    <div className="flex items-center gap-2">
      <h2 className="text-[10px] uppercase tracking-[0.35em] font-bold text-white">
        Market Overview
      </h2>

      <span className="text-[10px] text-white/30">
        intelligence feed
      </span>
    </div>

    <div className="flex items-center gap-2 text-[10px] text-white/40">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      live
      <span>•</span>
      60s refresh
    </div>

  </div>

  <div className={`text-[10px] px-2 py-0.5 rounded-md border border-white/10 bg-white/5 ${
    trendDirection.label === "BULLISH"
      ? "text-emerald-400"
      : trendDirection.label === "DEFENSIVE"
      ? "text-red-400"
      : "text-yellow-400"
  }`}>
    {trendDirection.label}
  </div>

</div>

<div className="text-xs text-white/50">
  Live market data aggregation layer
</div>


  {/* ========================= */}
  {/* MAIN GRID */}
  {/* ========================= */}
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">

       {/* BTC */}
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
    <div className="flex items-center justify-between">

    <div>
      <div className="text-[10px] text-white/40 uppercase tracking-wide">
        Bitcoin
      </div>

      <div className="text-xs font-medium text-white">
        ${btc?.usd?.toLocaleString() ?? "--"}
      </div>
    </div>

    <div className={`text-xs ${
      (btc?.usd_24h_change ?? 0) > 0
        ? "text-emerald-400"
        : "text-red-400"
    }`}>
      {(btc?.usd_24h_change ?? 0) > 0 ? "+" : "-"}
      {Math.abs(btc?.usd_24h_change ?? 0).toFixed(2)}%
    </div>

  </div>
</div>


{/* ETH */}
<div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
  <div className="flex items-center justify-between">

    <div>
      <div className="text-[10px] text-white/40 uppercase tracking-wide">
       Ethereum
      </div>

      <div className="text-xs font-medium text-white">
        ${eth?.usd?.toLocaleString() ?? "--"}
      </div>
    </div>

    <div className={`text-xs ${
       (eth?.usd_24h_change ?? 0) > 0
          ? "text-emerald-400"
          : "text-red-400"
      }`}
    >
       {(eth?.usd_24h_change ?? 0) > 0 ? "+" : "-"}
      {Math.abs(eth?.usd_24h_change ?? 0).toFixed(2)}%
    </div>

  </div>
</div>

        {/* FEAR & GREED */}
       <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5 space-y-2">

  <div className="flex justify-between text-[10px] text-white/40">
    <span>Fear & Greed</span>
    <span className="text-white/60">{fearGreed ?? "--"}</span>
  </div>

  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${fearGreed ?? 0}%` }}
      className="h-full bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-400"
    />
  </div>

  <div className={`text-[10px] ${
    mood.includes("FEAR")
      ? "text-red-400"
      : mood.includes("GREED")
      ? "text-emerald-400"
      : "text-yellow-400"
  }`}>
    {mood}
  </div>

</div>

        {/* BTC DOMINANCE */}
<div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">

  <div className="flex items-start justify-between">

    <div>
      <div className="text-[10px] text-white/40">
        BTC Dominance
      </div>

      <div className="text-xs font-medium text-white mt-1">
        {btcDominance?.toFixed(1) ?? "--"}%
      </div>
    </div>

    <div className="text-[10px] text-white/40 text-right max-w-[90px]">
      {btcDominance && btcDominance > 55
        ? "BTC lead"
        : "Alt strength"}
    </div>

  </div>

</div>

</div>

      {/* ========================= */}
      {/* GLOBAL METRICS */}
      {/* ========================= */}
      <div className="grid grid-cols-2 gap-2">
        {/* MARKET CAP */}
        <div className="rounded-xl bg-black/30 border border-white/10 p-2.5">
          <div className="text-xs text-white/50 mb-1">
            Total Market Cap
          </div>

          <div className="text-xs font-medium text-white">
            {formatMarketNumber(global?.data?.total_market_cap?.usd)}
          </div>
        </div>

        {/* VOLUME */}
        <div className="rounded-xl bg-black/30 border border-white/10 p-2.5">
          <div className="text-xs text-white/50 mb-1">
            24h Volume
          </div>

          <div className="text-xs font-medium text-white">
            {formatMarketNumber(global?.data?.total_volume?.usd)}
          </div>
        </div>

        {/* MARKET TREND */}
        <div className="p-2.5 rounded-lg bg-black/30 border border-white/10">
          <div className="text-white/50 text-xs">
               Market Trend
          </div>

          <div
            className={`text-xs font-semibold mt-1 ${
              (global?.data?.market_cap_change_percentage_24h_usd ?? 0) > 0
                ? "text-green-400"
                : "text-red-400"
              }`}
            >
              {global?.data?.market_cap_change_percentage_24h_usd?.toFixed(2)}%
          </div>
        </div>

       

        {/* ACTIVE COINS */}
        <div className="rounded-xl bg-black/30 border border-white/10 p-2.5">
          <div className="text-xs text-white/50 mb-1">
            Active Coins
          </div>

          <div className="text-xs font-medium text-white">
            {global?.data?.active_cryptocurrencies?.toLocaleString() ??
              "--"}
          </div>
        </div>
      </div>

    
      {/* ========================= */}
      {/* FOOTER */}
      {/* ========================= */}
      <div className="flex items-center justify-between text-[10px] text-white/35">
        <span>
          Markets:{" "}
          {global?.data?.markets?.toLocaleString() ?? "--"}
        </span>

        <span>
          Updated{" "}
          {lastUpdated
            ? lastUpdated.toLocaleTimeString()
            : "--"}
        </span>

         <span>•</span>

        <span>Auto-refresh: 60s</span>
      </div>
    </motion.div>
  );
}