"use client";

import { motion } from "framer-motion";

export default function MarketPagePreview() {
  const overviewCoins = [
    {
      symbol: "BTC",
      price: "$77,227",
      change: "+0.67%",
      positive: true,
    },
    {
      symbol: "ETH",
      price: "$2,108.98",
      change: "-0.40%",
      positive: false,
    },
    {
      symbol: "BNB",
      price: "$577.45",
      change: "+0.75%",
      positive: true,
    },
    {
      symbol: "XRP",
      price: "$0.53",
      change: "-0.30%",
      positive: false,
    },
    {
      symbol: "SOL",
      price: "$126.63",
      change: "-0.45%",
      positive: false,
    },
  ];

  const sectors = [
    {
      name: "LARGE_CAP",
      flow: "100%",
      momentum: "+0.69%",
      positive: true,
      width: "100%",
    },
    {
      name: "INFRA",
      flow: "0%",
      momentum: "-0.61%",
      positive: false,
      width: "62%",
    },
    {
      name: "L1",
      flow: "0%",
      momentum: "-0.40%",
      positive: false,
      width: "44%",
    },
    {
      name: "PAYMENTS",
      flow: "0%",
      momentum: "-0.30%",
      positive: false,
      width: "35%",
    },
    {
      name: "MEME",
      flow: "0%",
      momentum: "-0.22%",
      positive: false,
      width: "28%",
    },
    {
      name: "OTHER",
      flow: "50%",
      momentum: "+0.16%",
      positive: true,
      width: "38%",
    },
  ];

  const narratives = [
    {
      title: "Market Momentum Pulse",
      state: "BUILDING",
      score: "0.46",
      tone: "NEUTRAL",
    },
    {
      title: "Large Cap Structure",
      state: "BUILDING",
      score: "12.36",
      tone: "NEUTRAL",
    },
  ];

  const signals = [
    {
      bias: "BEARISH",
      title: "Weak Market Breadth",
      conviction: "HIGH CONVICTION",
      strength: "7",
      color: "red",
    },
    {
      bias: "NEUTRAL",
      title: "Bitcoin Dominance Strength",
      conviction: "MEDIUM CONVICTION",
      strength: "7",
      color: "yellow",
    },
  ];

  const liveFeed = [
    {
      text: "Bitcoin ETFs 6 day loss streak pushes market lower...",
      tag: "BEARISH",
    },
    {
      text: "Coinbase does not fear competition from Wall Street...",
      tag: "NEUTRAL",
    },
    {
      text: "Crypto trader sees Hyperliquid, AI tokens rotating...",
      tag: "NEUTRAL",
    },
  ];

  return (
    <section className="mt-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-[28px] border border-blue-500/10 bg-[#050816] shadow-[0_0_120px_rgba(37,99,235,0.15)]"
      >
        {/* BACKGROUND */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_28%)]" />

        {/* HEADER */}
        <div className="relative border-b border-white/5 px-6 py-2 flex items-center justify-between">

          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-white">
                Global AI Brain
              </h2>

              <div className="px-2 py-1 rounded-full border border-green-500/20 bg-green-500/10 text-[10px] text-green-400">
                SYSTEM ACTIVE
              </div>
            </div>

            <div className="text-[11px] text-gray-500 mt-1">
              Core Intelligence Active • v1.0 cognition engine
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px]">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400">
              CONNECTED
            </span>
          </div>
        </div>

       {/* TOP STRIP */}
<div className="relative grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-1.5 p-2 border-b border-white/5">

  {[
    {
      title: "Market Regime",
      value: "DEFENSIVE",
      sub: "Risk-Off Environment",
      color: "text-red-400",
    },
    {
      title: "Market Mood",
      value: "RISK OFF",
      sub: "Conviction: LOW",
      color: "text-blue-400",
    },
    {
      title: "AI Flow",
      value: "DISTRIBUTION",
      sub: "Selling Pressure",
      color: "text-purple-400",
    },
    {
      title: "Volatility",
      value: "LOW",
      sub: "0.47% Average",
      color: "text-green-400",
    },
    {
      title: "Breadth",
      value: "25%",
      sub: "Positive Assets",
      color: "text-white",
    },
    {
      title: "Market Trend",
      value: "+0.38%",
      sub: "24h Performance",
      color: "text-green-400",
    },
  ].map((item, i) => (
    <div
      key={i}
      className="rounded-lg border border-white/5 bg-white/[0.025] px-2 py-1.5 min-h-[62px] flex flex-col justify-between"
    >

      <div className="text-[8px] uppercase tracking-[0.14em] text-gray-500">
        {item.title}
      </div>

      <div className={`mt-1 text-[11px] font-semibold ${item.color}`}>
        {item.value}
      </div>

      <div className="text-[9px] text-gray-500 leading-tight mt-0.5">
        {item.sub}
      </div>
    </div>
  ))}
</div>

        {/* MAIN GRID */}
        <div className="relative grid xl:grid-cols-[290px_1fr_360px] gap-2 p-2.5 md:p-3">

          {/* LEFT */}
          <div className="space-y-2">

            {/* MARKET OVERVIEW */}
<div className="rounded-xl border border-white/5 bg-white/[0.03] p-2.5">

  <div className="flex items-center justify-between mb-2">
    <div className="text-[13px] font-medium text-white">
      Market Overview
    </div>

    <div className="text-[9px] text-green-400 tracking-wide">
      LIVE
    </div>
  </div>

  <div className="space-y-2">
    {overviewCoins.map((coin, i) => (
      <div
        key={i}
        className="flex items-center justify-between"
      >

        <div className="flex items-center gap-2">

          <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[9px] text-white">
            {coin.symbol[0]}
          </div>

          <div className="leading-tight">

            <div className="text-[12px] text-white font-medium">
              {coin.symbol}
            </div>

            <div className="text-[10px] text-gray-500">
              {coin.price}
            </div>
          </div>
        </div>

        <div
          className={`text-[11px] font-medium ${
            coin.positive
              ? "text-green-400"
              : "text-red-400"
          }`}
        >
          {coin.change}
        </div>
      </div>
    ))}
  </div>
</div>

           {/* MARKET STATS */}
<div className="rounded-xl border border-white/5 bg-white/[0.03] p-2">

  <div className="text-[12px] font-medium text-white mb-2">
    Market Stats
  </div>

  <div className="space-y-1.5">

    {[
      ["Total Market Cap", "$2.66T"],
      ["24h Volume", "$65.14B"],
      ["BTC Dominance", "58.2%"],
      ["Fear & Greed", "30 (Fear)"],
      ["Active Coins", "17,394"],
    ].map((item, i) => (
      <div
        key={i}
        className="flex items-center justify-between text-[10px]"
      >

        <span className="text-gray-500 tracking-wide">
          {item[0]}
        </span>

        <span className="text-white font-medium">
          {item[1]}
        </span>
      </div>
    ))}
  </div>
</div>

           {/* WHALE */}
<div className="rounded-xl border border-white/5 bg-white/[0.03] p-2">

  <div className="flex items-center justify-between mb-2">

    <div className="text-[12px] font-medium text-white">
      Whale Intelligence
    </div>

    <div className="text-[8px] tracking-wide text-cyan-400">
      TRACKING
    </div>
  </div>

  <div className="rounded-lg border border-white/5 bg-black/20 p-2 text-center">

    <div className="text-2xl font-bold text-white leading-none">
      63%
    </div>

    <div className="text-[9px] text-gray-500 mt-1 tracking-wide">
      CONFIDENCE
    </div>
  </div>

  <div className="mt-2 space-y-1.5">

    {[
      "BTC Accumulation",
      "ETH Distribution",
      "SOL Smart Money Entry",
    ].map((x, i) => (
      <div
        key={i}
        className="flex items-center justify-between text-[10px]"
      >

        <span className="text-gray-500 truncate">
          {x}
        </span>

        <span className="text-green-400 tracking-wide">
          ACTIVE
        </span>
      </div>
    ))}
  </div>
</div>
</div>

          {/* CENTER */}
          <div className="space-y-2">

           {/* SECTOR ROTATION */}
<div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">

  <div className="flex items-center justify-between mb-3">

    <div className="text-[13px] font-medium text-white">
      Sector Rotation
    </div>

    <div className="text-[9px] tracking-wide text-green-400">
      AI FLOW ACTIVE
    </div>
  </div>

  <div className="grid lg:grid-cols-[170px_1fr] gap-4 items-center">

    {/* DONUT */}
    <div className="flex items-center justify-center">

      <div className="relative w-36 h-36 rounded-full bg-[conic-gradient(#22c55e_0deg,#22c55e_120deg,#eab308_120deg,#eab308_180deg,#ef4444_180deg,#ef4444_260deg,#4f46e5_260deg,#4f46e5_360deg)]">

        <div className="absolute inset-4 rounded-full bg-[#050816] flex flex-col items-center justify-center">

          <div className="text-[10px] tracking-wide text-gray-400">
            BALANCED FLOW
          </div>

          <div className="text-xl font-bold text-white mt-1">
            38/100
          </div>
        </div>
      </div>
    </div>

    {/* TABLE */}
    <div className="space-y-1.5">

      {sectors.map((sector, i) => (
        <div key={i}>

          <div className="flex justify-between text-[10px] mb-1">

            <span className="text-gray-400 tracking-wide">
              {sector.name}
            </span>

            <span
              className={
                sector.positive
                  ? "text-green-400"
                  : "text-red-400"
              }
            >
              {sector.momentum}
            </span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">

            <motion.div
              initial={{ width: 0 }}
              whileInView={{
                width: sector.width,
              }}
              transition={{ duration: 0.7 }}
              className={`h-full ${
                sector.positive
                  ? "bg-gradient-to-r from-green-500 to-emerald-300"
                  : "bg-gradient-to-r from-red-500 to-orange-300"
              }`}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
            {/* LOWER GRID */}
            <div className="grid lg:grid-cols-2 gap-2">
                
                  {/* CAPITAL FLOW */}
                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-2.5 md:p-3">

                <div className="flex items-center justify-between mb-4">
                    <div className="text-white font-medium">
                        Capital Flow
                    </div>

                    <div className="text-[10px] text-yellow-400">
                        Choppy Conditions
                    </div>
                </div>

                <div className="space-y-2">

                  {sectors.map((sector, i) => (
                    <div key={i}>

                        <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-gray-400">
                            {sector.name}
                            </span>

                            <span
                                className={
                                sector.positive
                                ? "text-green-400"
                                : "text-red-400"
                                }
                            >
                                {sector.momentum}
                            </span>
                        </div>

                            <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">

                            <div
                                style={{
                                    width: sector.width,
                                }}
                                className={`h-full ${
                                sector.positive
                                    ? "bg-gradient-to-r from-green-500 to-emerald-300"
                                    : "bg-gradient-to-r from-red-500 to-orange-300"
                                    }`}
                            />
                            </div>
                            </div>
                         ))}
                    </div>
                </div>

                


              
                    {/* AI CONCLUSION */}
                    <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/[0.03] p-2.5 md:p-3">

                        <div className="text-white font-medium mb-4">
                            AI Market Conclusion
                        </div>

                        <div className="flex items-center gap-2">

                            <div className="relative w-24 h-24 rounded-full border-[8px] border-yellow-400/20 flex items-center justify-center">

                                <div className="text-center">
                                    <div className="text-sm font-bold text-white">
                                        83%
                                        </div>

                                        <div className="text-[9px] text-gray-500">
                                            AI Confidence
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1">

                                    <div className="text-sm text-white">
                                        Neutral
                                    </div>

                                    <div className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                                        ETF demand and institutional buying are supporting overall market activity.
                                    </div>

                                    <div className="mt-3 text-yellow-400 text-sm font-medium">
                                        Risk Level: MEDIUM
                                    </div>
                                </div>
                            </div>
                        </div>

                     </div>

                
                     
            </div>

          {/* RIGHT */}
          <div className="space-y-2">

           {/* NARRATIVES */}
<div className="rounded-xl border border-white/5 bg-white/[0.03] p-2">

  <div className="flex items-center justify-between mb-2">

    <div className="text-[12px] font-medium text-white">
      AI Narrative Engine
    </div>

    <div className="text-[8px] tracking-wide text-green-400">
      2 ACTIVE
    </div>
  </div>

  <div className="space-y-1.5">

    {narratives.map((n, i) => (
      <div
        key={i}
        className="rounded-lg border border-white/5 bg-black/20 p-2"
      >

        <div className="flex items-center justify-between gap-3">

          <div className="min-w-0">

            <div className="text-[11px] text-white font-medium truncate">
              {n.title}
            </div>

            <div className="text-[9px] text-gray-500 mt-0.5 leading-relaxed">
              Market structure interpretation active.
            </div>
          </div>

          <div className="text-right shrink-0">

            <div className="text-[8px] tracking-wide text-green-400">
              {n.state}
            </div>

            <div className="text-[16px] font-semibold text-white mt-0.5 leading-none">
              {n.score}
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>

            {/* SIGNAL ENGINE */}
<div className="rounded-xl border border-white/5 bg-white/[0.03] p-2.5">

  <div className="flex items-center justify-between mb-2">

    <div className="text-[13px] font-medium text-white">
      AI Signal Engine
    </div>

    <div className="text-[9px] text-green-400 tracking-wide">
      2 SIGNALS
    </div>
  </div>

  <div className="space-y-1.5">

    {signals.map((signal, i) => (
      <div
        key={i}
        className={`rounded-lg border p-2 ${
          signal.color === "red"
            ? "border-red-500/15 bg-red-500/[0.025]"
            : "border-yellow-500/15 bg-yellow-500/[0.025]"
        }`}
      >

        <div className="flex items-start justify-between gap-3">

          <div className="min-w-0 flex-1">

            <div
              className={`text-[10px] font-semibold tracking-wide ${
                signal.color === "red"
                  ? "text-red-400"
                  : "text-yellow-400"
              }`}
            >
              {signal.bias}
            </div>

            <div className="text-[12px] text-white mt-0.5 leading-tight">
              {signal.title}
            </div>

            <div className="text-[10px] text-gray-500 mt-1">
              {signal.conviction}
            </div>
          </div>

          <div className="text-right shrink-0">

            <div className="text-[9px] uppercase tracking-wide text-gray-500">
              STR
            </div>

            <div className="text-[13px] text-white font-semibold mt-0.5">
              {signal.strength}
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>

          {/* LIVE NEWS */}
<div className="rounded-xl border border-white/5 bg-white/[0.03] p-2">

  <div className="flex items-center justify-between mb-2">

    <div className="text-[12px] font-medium text-white">
      Live News & Signals
    </div>

    <div className="text-[8px] tracking-wide text-green-400">
      8 ACTIVE
    </div>
  </div>

  <div className="space-y-1.5">

    {liveFeed.map((item, i) => (
      <div
        key={i}
        className="rounded-lg bg-black/20 px-2 py-1.5"
      >

        <div className="flex items-start justify-between gap-2">

          <div className="text-[9px] text-gray-300 leading-relaxed line-clamp-2">
            {item.text}
          </div>

          <div
            className={`text-[8px] shrink-0 tracking-wide ${
              item.tag === "BEARISH"
                ? "text-red-400"
                : "text-yellow-400"
            }`}
          >
            {item.tag}
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
</div>
</div>

      </motion.div>
    </section>
  );
}