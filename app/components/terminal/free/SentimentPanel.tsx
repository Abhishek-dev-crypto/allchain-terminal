"use client";

import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { buildNarratives } from "@/lib/intel/narrativeEngine";
import { generateAIConclusion } from "@/lib/intel/aiConclusionEngine";
import IntelFallback from "@/app/components/terminal/shared/IntelFallback";
import TerminalSkeleton from "@/app/components/terminal/shared/TerminalSkeleton";

type NewsItem = {
  title: string;
  source: string;
  sentiment: "bullish" | "bearish" | "neutral";
  url: string;
  votes?: {
  positive?: number;
  negative?: number;
  };
};

type Narrative = {
  name: string;
  score: number;
  momentum: number;
  examples: string[];
  };



export default function SentimentPanel() {
  const [items, setItems] = useState<NewsItem[]>([]);
const [score, setScore] = useState(50);

const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [lastUpdated, setLastUpdated] =
  useState<number | null>(null);
  
  const [sentimentExpanded, setSentimentExpanded] = useState(false);
  const [narratives, setNarratives] = useState<Narrative[]>([]);
  

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);

      try {
        setError(null);
        

          const newsRes = await fetch("/api/intel/news");

          if (!newsRes.ok) {
            throw new Error("NEWS_FEED_ERROR");
          }

          const newsData = await newsRes.json();

         const allSources: NewsItem[] = newsData.map((n: any) => {

                const cryptoPanicSentiment =
                    n.votes
                    ? mapCryptoPanicSentiment(n.votes)
                   : analyzeSentiment(n.title);

          return {
                title: n.title,
                source: n.source,
                sentiment: cryptoPanicSentiment,
                url: n.url,
                votes: n.votes,
              };
          });

          const narrativeResults = buildNarratives(
            
              allSources.map((n) => ({
              title: n.title,
              source: n.source,
            }))
          );

          const sortedNarratives = [...narrativeResults].sort(
           (a, b) => b.score - a.score
            );

          setNarratives(sortedNarratives);

          
          setItems(allSources);
          setLastUpdated(Date.now());

        // =========================
        // SENTIMENT FUSION ENGINE
        // =========================
        const result = computeFusionScore(allSources);

        setScore(result);
      } catch (err) {
          console.error("Sentiment engine error:", err);

        setError(
          "Unable to retrieve market news and sentiment signals."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAll();

    const handleEsc = (e: KeyboardEvent) => {
          if (e.key === "Escape") {
            setSentimentExpanded(false);
          }
        };

        window.addEventListener("keydown", handleEsc);

    const interval = setInterval(fetchAll, 60000);

    return () => {
          clearInterval(interval);
          window.removeEventListener("keydown", handleEsc);
        };
  }, []);

 useEffect(() => {
  if (sentimentExpanded) {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }

  return () => {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  };
}, [sentimentExpanded]);

  // =========================
  // BASIC TEXT SENTIMENT
  // =========================
  const analyzeSentiment = (text: string) => {
    const t = text.toLowerCase();

    const bullish = [
      "rise",
      "surge",
      "bull",
      "breakout",
      "rally",
      "pump",
      "gain",
    ];

    const bearish = [
      "fall",
      "drop",
      "crash",
      "bear",
      "dump",
      "loss",
      "decline",
    ];

    let b = 0,
      s = 0;

    bullish.forEach((w) => t.includes(w) && b++);
    bearish.forEach((w) => t.includes(w) && s++);

    if (b > s) return "bullish";
    if (s > b) return "bearish";
    return "neutral";
  };

  // =========================
  // CRYPTOPANIC WEIGHTING
  // =========================
  const mapCryptoPanicSentiment = ( votes?: { positive?: number; negative?: number; })  => {
    if (!votes) return "neutral";

    const up = votes.positive || 0;
    const down = votes.negative || 0;

    if (up > down) return "bullish";
    if (down > up) return "bearish";
    return "neutral";
  };

  // =========================
  // FUSION ENGINE
  // =========================
  const computeFusionScore = (data: NewsItem[]) => {
    let score = 50;

    const weights = {
      CryptoPanic: 0.5,
      Reddit: 0.3,
      CoinGecko: 0.2,
    };

    data.forEach((d) => {
      if (d.title.toLowerCase().includes("etf")) score += 3;
      if (d.title.toLowerCase().includes("surge")) score += 2;
      if (d.title.toLowerCase().includes("record inflow")) score += 4;

      if (d.title.toLowerCase().includes("hack")) score -= 3;
      if (d.title.toLowerCase().includes("exploit")) score -= 4;
      if (d.title.toLowerCase().includes("lawsuit")) score -= 2;
      let impact = 0;

      if (d.sentiment === "bullish") impact = +1;
      if (d.sentiment === "bearish") impact = -1;

      score += impact * ((weights as any)[d.source] || 0.1) * 10;
    });

    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const label =
    score < 25
      ? "EXTREME FEAR"
      : score < 45
      ? "FEAR"
      : score < 55
      ? "NEUTRAL"
      : score < 75
      ? "BULLISH"
      : "EXTREME GREED";

  if (loading && items.length === 0) {
  return <TerminalSkeleton />;
}

  if (error && items.length === 0) {
  return (
    <IntelFallback
      title="Sentiment Engine Offline"
      message={error}
      severity="warning"
    />
  );
}

   const explainNarrative = (name: string) => {
  switch (name) {
    case "REGULATION":
      return {
        icon: "⚖️",
        title: "Government & Regulation Activity",
        description:
          "Governments and regulators are becoming more active in crypto markets.",
      };

    case "INSTITUTIONAL":
      return {
        icon: "🏦",
        title: "Large Investor Activity",
        description:
          "Large financial firms and professional investors are increasing crypto exposure.",
      };

    case "LIQUIDITY":
      return {
        icon: "💧",
        title: "Global Money Flow",
        description:
          "Global money flow and economic conditions are strongly affecting crypto prices.",
      };

    case "RETAIL_FOMO":
      return {
        icon: "🚀",
        title: "Retail Hype Rising",
        description:
          "Smaller traders and social media hype are driving speculative buying.",
      };

    case "ETF_FLOW":
      return {
        icon: "📈",
        title: "Bitcoin ETF Demand",
        description:
          "Bitcoin ETF activity and large fund inflows are influencing the market.",
      };

    case "WHALES":
      return {
        icon: "🐋",
        title: "Large Whale Activity",
        description:
          "Very large crypto investors ('whales') are making trades that can move the market.",
      };

    case "AI_CRYPTO":
      return {
        icon: "🤖",
        title: "AI Crypto Momentum",
        description:
          "AI-related crypto projects are gaining investor attention.",
      };

    case "MEME_SPECULATION":
      return {
        icon: "🎭",
        title: "Meme Coin Speculation",
        description:
          "High-risk meme coin trading activity is increasing.",
      };

    default:
      return {
        icon: "🧠",
        title: "Market Narrative",
        description:
          "AI systems detected an emerging market trend.",
      };
  }
};

   const generateSummary = () => {
  const top = narratives[0];

  if (!top) {
    return "AI systems are detecting mixed and uncertain crypto market conditions.";
  }

  if (score >= 70) {
    return "Crypto markets are showing strong bullish momentum with rising investor confidence.";
  }

  if (score <= 35) {
    return "Markets are showing fear and defensive trading behavior across crypto assets.";
  }

  switch (top.name) {
    case "REGULATION":
      return "Government actions and new crypto regulations are heavily affecting market sentiment.";

    case "INSTITUTIONAL":
      return "Large investors and financial firms are increasing their influence on crypto markets.";

    case "LIQUIDITY":
      return "Global money flow and economic news are becoming major drivers for crypto prices.";

    case "RETAIL_FOMO":
      return "Retail traders and social media hype are accelerating market momentum.";

    case "ETF_FLOW":
      return "Bitcoin ETF demand and institutional buying are supporting market activity.";

    case "WHALES":
      return "Large crypto holders are making significant moves that may impact prices.";

    case "AI_CRYPTO":
      return "AI-focused crypto projects are attracting growing market attention.";

    case "MEME_SPECULATION":
      return "Speculative meme coin trading activity is increasing across the market.";

    default:
      return "AI systems are tracking multiple market trends and investor behaviors.";
  }
};


    const uniqueItems = items.filter(
  (item, index, self) =>
    index === self.findIndex((t) => t.title === item.title)
);

   const sentimentUI = {
  "EXTREME FEAR": {
    color: "text-red-400",
    border: "border-red-500/30",
    glow: "shadow-lg shadow-red-500/20",
    badge: "bg-red-500/10",
    icon: "💀",
  },

  FEAR: {
  color: "text-orange-400",
  border: "border-orange-500/30",
  glow: "shadow-lg shadow-orange-500/20",
  badge: "bg-orange-500/10",
  icon: "⚠️",
},

  NEUTRAL: {
    color: "text-yellow-400",
    border: "border-yellow-500/30",
     glow: "shadow-lg shadow-yellow-500/20",
    badge: "bg-yellow-500/10",
    icon: "🟡",
  },

  BULLISH: {
    color: "text-emerald-400",
    border: "border-emerald-500/30",
    glow: "shadow-lg shadow-emerald-500/20",
    badge: "bg-emerald-500/10",
    icon: "🚀",
  },

  "EXTREME GREED": {
    color: "text-green-400",
    border: "border-green-500/30",
     glow: "shadow-lg shadow-green-500/20",
    badge: "bg-green-500/10",
    icon: "🤑",
  },
};

const activeUI =
  sentimentUI[label as keyof typeof sentimentUI] ??
  sentimentUI.NEUTRAL;

const alerts = narratives
  .filter((n) => n.score > 2)
  .map((n) => {
    switch (n.name) {
      case "REGULATION":
        return "⚠️ Regulation pressure increasing";

      case "ETF_FLOW":
        return "📈 ETF narrative accelerating";

      case "LIQUIDITY":
        return "💧 Liquidity conditions stabilizing";

      default:
        return null;
    }
  })
  .filter(Boolean);

  const confidence =
  Math.min(
    95,
    Math.round(
      (
        narratives.filter((n) => n.score > 2).length * 18 +
        uniqueItems.length * 2 +
        score
      ) / 2
    )
  );

  const aiConclusion = generateAIConclusion({
  score,
  narratives,
  items: uniqueItems,
  confidence,
});

  const sourceStyles = {
  CryptoPanic: "bg-violet-500/10 text-violet-300",
  Reddit: "bg-orange-500/10 text-orange-300",
  CoinGecko: "bg-green-500/10 text-green-300",
};

 const fakeTimes = [
  "2m ago",
  "5m ago",
  "12m ago",
  "18m ago",
  "26m ago",
  "41m ago",
];



 return (
  <motion.div
    className={
        sentimentExpanded
        ? "fixed inset-0 z-50 bg-black/80 backdrop-blur-md overflow-y-auto flex justify-center items-start p-6"
        : ""
    }
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
  >
   <div
      className={`
           ${sentimentExpanded ? "w-full max-w-5xl" : "overflow-hidden"}
            ${sentimentExpanded ? "p-2" : "p-4"}
              rounded-lg
              border
              bg-white/5
            ${sentimentExpanded ? "space-y-3" : "space-y-4"}
            ${activeUI.border}
            ${activeUI.glow}
          `}
        >
    {/* HEADER */}
   <div className="flex justify-between items-center">
      <h2 className="text-[10px] uppercase tracking-[0.35em] font-bold text-white">
          Sentiment Engine
      </h2>

      {lastUpdated && (
  <div className="text-[10px] text-white/30">
    Updated{" "}
    {Math.floor(
      (Date.now() - lastUpdated) / 1000
    )}
    s ago
  </div>
)}

      <span
        className={`
          text-xs px-2 py-1 rounded flex items-center gap-1
          ${activeUI.badge}
          ${activeUI.color}
        `}
      >
        <span>{activeUI.icon}</span>
        {label}
      </span>

          {sentimentExpanded && (
          <button
                onClick={() => setSentimentExpanded(false)}
                className="text-xs text-white/50 hover:text-white"
              >
               ✕ Close
          </button>
          )}

    </div>

    {error && items.length > 0 && (
  <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-3 py-2">
    <div className="text-xs text-yellow-300">
      ⚠ Data feed delayed
    </div>

    <div className="mt-1 text-[11px] text-white/50">
      Showing last successful sentiment snapshot.
    </div>
  </div>
)}

    {/* SCORE SECTION */}
    <div className="space-y-3">
      <div className="flex items-end justify-between">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className={`text-2xl font-bold ${activeUI.color}`}
        >
          {score}
        </motion.div>

        <div className="text-xs text-white/50">Market Mood</div>
      </div>

      {/* TEMPERATURE BAR */}
      <div className="space-y-1">
        <div className="w-full h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-400 relative">
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg border border-black"
            style={{ left: `calc(${score}% - 8px)` }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-white/40 uppercase tracking-wide">
          <span>Extreme Fear</span>
          <span>Greed</span>
        </div>
      </div>

      {/* AI MARKET READ */}
      <div className="p-2.5 rounded-lg bg-gradient-to-br from-violet-500/10 to-emerald-500/10 border border-white/10">
        <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">
            AI Market Read
        </div>

        <div className="text-sm leading-relaxed text-white/80">
          {generateSummary()}
        </div>

        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="text-[10px] uppercase tracking-wide text-white/40 mb-1">
           What This Means For Traders
          </div>

          <div className="text-xs text-white/60 leading-relaxed">
            {score < 40
              ? "Short-term volatility and defensive market behavior may continue."
              : score < 60
              ? "Markets remain uncertain as traders wait for stronger confirmation."
              : "Momentum and risk appetite are improving across crypto markets."}
          </div>
        </div>

        {/* AI CONFIDENCE */}
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-white/40 mb-1 uppercase tracking-wide">
            <span>AI Confidence</span>
            <span>{confidence}%</span>
          </div>

          <div className="text-[10px] text-white/30 mb-2">
              Measures how confident the AI is after analyzing market news, momentum, and investor activity.
          </div>

          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-violet-500 to-emerald-400"
            />
          </div>
        </div>
      </div>

              {/* ========================= */}
{/* AI CONCLUSION ENGINE */}
{/* ========================= */}

<div className="p-2 rounded-lg border border-violet-500/20 bg-violet-500/5 space-y-3">

  <div className="flex items-center justify-between">
    <div className="text-sm font-semibold text-violet-300">
      🧠 AI Market Conclusion
    </div>

    <div className="text-[10px] px-2 py-1 rounded bg-white/10 text-white/60">
      {aiConclusion.state}
    </div>
  </div>

  {/* SUMMARY */}
  <div>
    <div className="text-[10px] uppercase tracking-wide text-white/40 mb-1">
      AI Interpretation
    </div>

    <div className="text-sm text-white/80 leading-relaxed">
      {aiConclusion.summary}
    </div>
  </div>

  {/* OUTLOOK */}
  <div>
    <div className="text-[10px] uppercase tracking-wide text-white/40 mb-1">
      Short-Term Outlook
    </div>

    <div className="text-xs text-white/60 leading-relaxed">
      {aiConclusion.outlook}
    </div>
  </div>

  {/* RISK + BEHAVIOR */}
  <div className="grid grid-cols-2 gap-2">

    <div className="rounded-lg bg-black/30 border border-white/10 p-2">
      <div className="text-[10px] uppercase tracking-wide text-white/40 mb-1">
        Risk Level
      </div>

      <div className="text-sm text-white/80">
        {aiConclusion.risk}
      </div>
    </div>

    <div className="rounded-lg bg-black/30 border border-white/10 p-2">
      <div className="text-[10px] uppercase tracking-wide text-white/40 mb-1">
        AI Trader Behavior
      </div>

      <div className="text-xs text-white/70 leading-relaxed">
        {aiConclusion.behavior}
      </div>
    </div>
  </div>

  {/* KEY DRIVERS */}
  <div>
    <div className="text-[10px] uppercase tracking-wide text-white/40 mb-2">
      Key Market Drivers
    </div>

    <div className="flex flex-wrap gap-2">
      {aiConclusion.drivers.map((d: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined, i: Key | null | undefined) => (
        <div
          key={i}
          className="px-2 py-1 rounded-lg bg-white/10 text-[10px] text-white/70"
        >
          {d}
        </div>
      ))}
    </div>
  </div>
</div>

    </div>

   {/* ===================== */}
{/* NARRATIVE ENGINE */}
{/* ===================== */}
<div className="space-y-2">

  <div className="flex items-center justify-between">
    <div className="text-xs text-white/60">
      Market Narratives
    </div>

    <div className="text-[10px] text-white/30">
      {narratives.length} active signals detected
    </div>
  </div>

  <div
    className={
      sentimentExpanded
        ? "grid grid-cols-2 gap-2"
        : "space-y-2"
    }
  >
    {narratives.map((n, i) => {
        const narrative = explainNarrative(n.name);

        return (
          <div
            key={i}
            className={`
                      rounded-lg bg-white/5 border border-white/10
                      ${sentimentExpanded ? "p-2" : "p-2.5"}
                    `}
                  >
            <div className="flex items-center gap-2">
              <span className="text-xs">{narrative.icon}</span>
              <div className="text-xs font-semibold">
                {narrative.title}
              </div>
            </div>

            <div className="text-xs text-white/50 mt-1">
              {narrative.description}
            </div>

            <div className="mt-2">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(n.score * 10, 100)}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-violet-500 to-emerald-400"
                />
              </div>

              <div className="text-[10px] text-white/40 mt-1">
                Market Influence: {Math.min(Math.round(n.score * 10), 100)}%
              </div>
            </div>

            <div className="text-xs mt-2 text-white/40">
              {n.examples?.[0]}
            </div>
          </div>
        );
      })}
    </div>
    </div>

    {/* LIVE SIGNAL FEED */}
    <div className="flex items-center justify-between">
      <div className="text-xs text-white/50 uppercase tracking-wide">
        Live Market Signals
      </div>

      <div className="flex gap-2 text-[10px] text-white/40">
        <span className="text-green-400">BULLISH = Positive</span>
        <span className="text-red-400">BEARISH = Negative</span>
        <span className="text-yellow-400">NEUTRAL = Mixed</span>
      </div>

      <div className="text-[10px] text-white/30">
        {uniqueItems.length} signals
      </div>
    </div>

    <div className="space-y-2">
     {(sentimentExpanded ? uniqueItems : uniqueItems.slice(0, 3)).map((n, i) => (
        <a
          key={i}
          href={n.url}
          target="_blank"
          rel="noopener noreferrer"
         className={`
                    group block text-xs rounded-lg bg-black/40 border border-white/10
                    ${sentimentExpanded ? "p-2" : "p-2"}
                  `}
                >
          <div className="flex items-start gap-2">
            <div
              className={`mt-1 w-2 h-2 rounded-full ${
                n.sentiment === "bullish"
                  ? "bg-green-400"
                  : n.sentiment === "bearish"
                  ? "bg-red-400"
                  : "bg-yellow-400"
              }`}
            />

            <div className="flex-1">
              <div
                className={`${
                  n.sentiment === "bullish"
                    ? "text-green-200"
                    : n.sentiment === "bearish"
                    ? "text-red-200"
                    : "text-white/80"
                }`}
              >
                {n.title}
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span
                     className={`px-1.5 py-0.5 rounded text-[10px]
                    ${
                        n.sentiment === "bullish"
                        ? "bg-emerald-500/10 text-emerald-300"
                        : n.sentiment === "bearish"
                         ? "bg-red-500/10 text-red-300"
                         : "bg-yellow-500/10 text-yellow-300"
                     }`}
                    >
                   {n.sentiment.toUpperCase()}
                  </span>

                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-white/50">
                     {n.source}
                  </span>

                  <span className="text-[10px] text-white/30">
                     {fakeTimes[i % fakeTimes.length]}
                  </span>
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>

    <div className="text-[10px] text-white/30">
        Headlines and external news sources belong to their respective publishers.
    </div>

    <button
        onClick={() => setSentimentExpanded(true)}
          className="w-full mt-2 text-xs text-violet-300 border border-violet-500/20 rounded-lg py-2 hover:bg-violet-500/10"
        >
      View All Signals
      </button>
    </div>
    
  </motion.div>
);}