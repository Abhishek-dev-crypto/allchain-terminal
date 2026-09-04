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

  const [sentimentExpanded, setSentimentExpanded] =
    useState(false);

  const [narratives, setNarratives] =
    useState<Narrative[]>([]);

  /* =========================================================
     FETCH LIVE SENTIMENT DATA
  ========================================================= */

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

        const allSources: NewsItem[] = newsData.map(
          (n: any) => {
            const sentiment =
              n.votes
                ? mapCryptoPanicSentiment(n.votes)
                : analyzeSentiment(n.title);

            return {
              title: n.title,
              source: n.source,
              sentiment,
              url: n.url,
              votes: n.votes,
            };
          }
        );

        const narrativeResults = buildNarratives(
          allSources.map((n) => ({
            title: n.title,
            source: n.source,
          }))
        );

        const sortedNarratives =
          [...narrativeResults].sort(
            (a, b) => b.score - a.score
          );

        setNarratives(sortedNarratives);
        setItems(allSources);
        setLastUpdated(Date.now());

        const result =
          computeFusionScore(allSources);

        setScore(result);
      } catch (err) {
        console.error(
          "Sentiment engine error:",
          err
        );

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

    window.addEventListener(
      "keydown",
      handleEsc
    );

    const interval = setInterval(
      fetchAll,
      60000
    );

    return () => {
      clearInterval(interval);
      window.removeEventListener(
        "keydown",
        handleEsc
      );
    };
  }, []);

  /* =========================================================
     LOCK PAGE WHEN EXPANDED
  ========================================================= */

  useEffect(() => {
    if (sentimentExpanded) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow =
        "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow =
        "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow =
        "";
    };
  }, [sentimentExpanded]);

  /* =========================================================
     BASIC TEXT SENTIMENT
  ========================================================= */

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

    let b = 0;
    let s = 0;

    bullish.forEach(
      (w) => t.includes(w) && b++
    );

    bearish.forEach(
      (w) => t.includes(w) && s++
    );

    if (b > s) return "bullish";
    if (s > b) return "bearish";

    return "neutral";
  };

  /* =========================================================
     CRYPTOPANIC SENTIMENT
  ========================================================= */

  const mapCryptoPanicSentiment = (
    votes?: {
      positive?: number;
      negative?: number;
    }
  ) => {
    if (!votes) return "neutral";

    const up = votes.positive || 0;
    const down = votes.negative || 0;

    if (up > down) return "bullish";
    if (down > up) return "bearish";

    return "neutral";
  };

  /* =========================================================
     SENTIMENT FUSION
  ========================================================= */

  const computeFusionScore = (
    data: NewsItem[]
  ) => {
    let score = 50;

    const weights = {
      CryptoPanic: 0.5,
      Reddit: 0.3,
      CoinGecko: 0.2,
    };

    data.forEach((d) => {
      const title =
        d.title.toLowerCase();

      if (title.includes("etf")) {
        score += 3;
      }

      if (title.includes("surge")) {
        score += 2;
      }

      if (title.includes("record inflow")) {
        score += 4;
      }

      if (title.includes("hack")) {
        score -= 3;
      }

      if (title.includes("exploit")) {
        score -= 4;
      }

      if (title.includes("lawsuit")) {
        score -= 2;
      }

      let impact = 0;

      if (d.sentiment === "bullish") {
        impact = 1;
      }

      if (d.sentiment === "bearish") {
        impact = -1;
      }

      score +=
        impact *
        ((weights as any)[d.source] || 0.1) *
        10;
    });

    return Math.max(
      0,
      Math.min(
        100,
        Math.round(score)
      )
    );
  };

  /* =========================================================
     SENTIMENT LABEL
  ========================================================= */

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

  /* =========================================================
     LOADING / ERROR STATES
  ========================================================= */

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

  /* =========================================================
     NARRATIVE EXPLANATIONS
  ========================================================= */

  const explainNarrative = (
    name: string
  ) => {
    switch (name) {
      case "REGULATION":
        return {
          icon: "⚖️",
          title: "Government & Regulation",
          description:
            "Government decisions and new crypto rules are influencing investor confidence.",
        };

      case "INSTITUTIONAL":
        return {
          icon: "🏦",
          title: "Large Investors",
          description:
            "Banks, funds and other large investors are attracting attention in the crypto market.",
        };

      case "LIQUIDITY":
        return {
          icon: "💧",
          title: "Money Flow",
          description:
            "Changes in the amount of money available in markets are affecting investor behaviour.",
        };

      case "RETAIL_FOMO":
        return {
          icon: "🚀",
          title: "Retail Hype",
          description:
            "Individual traders and social media activity are increasing interest in crypto.",
        };

      case "ETF_FLOW":
        return {
          icon: "📈",
          title: "Bitcoin ETF Activity",
          description:
            "Bitcoin ETF demand and fund activity are influencing market sentiment.",
        };

      case "WHALES":
        return {
          icon: "🐋",
          title: "Large Holder Activity",
          description:
            "Very large crypto holders are becoming part of the current market story.",
        };

      case "AI_CRYPTO":
        return {
          icon: "🤖",
          title: "AI & Crypto",
          description:
            "Crypto projects connected to AI are attracting investor attention.",
        };

      case "MEME_SPECULATION":
        return {
          icon: "🎭",
          title: "Meme Coin Speculation",
          description:
            "Speculative trading around meme coins is becoming more noticeable.",
        };

      default:
        return {
          icon: "🧠",
          title: "Market Story",
          description:
            "A market theme is attracting investor attention.",
        };
    }
  };

  /* =========================================================
     SIMPLE MARKET SUMMARY
  ========================================================= */

  const generateSummary = () => {
    const top = narratives[0];

    if (!top) {
      return "Investor sentiment is mixed, and there is no clear dominant story right now.";
    }

    if (score >= 70) {
      return "Investors are showing strong confidence, with positive sentiment dominating the market.";
    }

    if (score <= 35) {
      return "Fear is dominating the market, and investors are behaving more cautiously.";
    }

    switch (top.name) {
      case "REGULATION":
        return "Government decisions and crypto regulations are currently having a strong influence on investor sentiment.";

      case "INSTITUTIONAL":
        return "Activity from large investors and financial firms is becoming an important part of the market story.";

      case "LIQUIDITY":
        return "Money-flow and economic conditions are currently influencing how investors view crypto.";

      case "RETAIL_FOMO":
        return "Retail traders and social media activity are increasing attention and speculation.";

      case "ETF_FLOW":
        return "Bitcoin ETF activity is influencing investor demand and market sentiment.";

      case "WHALES":
        return "Large crypto holders are attracting attention and becoming part of the current market story.";

      case "AI_CRYPTO":
        return "AI-related crypto projects are attracting increasing investor attention.";

      case "MEME_SPECULATION":
        return "Speculative activity around meme coins is becoming more noticeable.";

      default:
        return "Several market stories are competing for investor attention.";
    }
  };

  /* =========================================================
     UNIQUE NEWS
  ========================================================= */

  const uniqueItems = items.filter(
    (item, index, self) =>
      index ===
      self.findIndex(
        (t) =>
          t.title === item.title
      )
  );

  /* =========================================================
     SENTIMENT UI
  ========================================================= */

  const sentimentUI = {
    "EXTREME FEAR": {
      color: "text-red-400",
      border: "border-red-500/30",
      glow: "shadow-lg shadow-red-500/20",
      badge: "bg-red-500/10",
      icon: "💀",
      simpleLabel: "Very Fearful",
    },

    FEAR: {
      color: "text-orange-400",
      border: "border-orange-500/30",
      glow: "shadow-lg shadow-orange-500/20",
      badge: "bg-orange-500/10",
      icon: "⚠️",
      simpleLabel: "Cautious",
    },

    NEUTRAL: {
      color: "text-yellow-400",
      border: "border-yellow-500/30",
      glow: "shadow-lg shadow-yellow-500/20",
      badge: "bg-yellow-500/10",
      icon: "🟡",
      simpleLabel: "Mixed",
    },

    BULLISH: {
      color: "text-emerald-400",
      border: "border-emerald-500/30",
      glow: "shadow-lg shadow-emerald-500/20",
      badge: "bg-emerald-500/10",
      icon: "🚀",
      simpleLabel: "Positive",
    },

    "EXTREME GREED": {
      color: "text-green-400",
      border: "border-green-500/30",
      glow: "shadow-lg shadow-green-500/20",
      badge: "bg-green-500/10",
      icon: "🤑",
      simpleLabel: "Very Positive",
    },
  };

  const activeUI =
    sentimentUI[
      label as keyof typeof sentimentUI
    ] ?? sentimentUI.NEUTRAL;

  /* =========================================================
     SIGNALS
  ========================================================= */

  const alerts = narratives
    .filter((n) => n.score > 2)
    .map((n) => {
      switch (n.name) {
        case "REGULATION":
          return "⚠️ Regulation is becoming an important market driver.";

        case "ETF_FLOW":
          return "📈 Bitcoin ETF activity is attracting increased attention.";

        case "LIQUIDITY":
          return "💧 Money-flow conditions are becoming an important market driver.";

        default:
          return null;
      }
    })
    .filter(Boolean);

  /* =========================================================
     AI CONCLUSION
     
     Existing confidence calculation is retained internally
     because the existing AI conclusion engine expects it.
     It is NOT displayed as "AI Confidence" to users.
  ========================================================= */

  const confidence =
    Math.min(
      95,
      Math.round(
        (
          narratives.filter(
            (n) => n.score > 2
          ).length *
            18 +
          uniqueItems.length * 2 +
          score
        ) / 2
      )
    );

  const aiConclusion =
    generateAIConclusion({
      score,
      narratives,
      items: uniqueItems,
      confidence,
    });

  /* =========================================================
     TIME
  ========================================================= */

  const updatedText =
    lastUpdated
      ? `Updated ${Math.floor(
          (Date.now() - lastUpdated) /
            1000
        )}s ago`
      : "";

  /* =========================================================
     UI
  ========================================================= */

  return (
    <motion.div
      className={
        sentimentExpanded
          ? "fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md md:p-6"
          : ""
      }
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
    >
      <div
        className={`
          rounded-lg
          border
          bg-white/5
          ${activeUI.border}
          ${activeUI.glow}
          ${
            sentimentExpanded
              ? "w-full max-w-5xl p-4"
              : "overflow-hidden p-4"
          }
        `}
      >

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[9px] uppercase tracking-[0.3em] text-cyan-300/60">
              Investor Psychology
            </div>

            <h2 className="mt-1 text-sm font-semibold text-white">
              Market Sentiment
            </h2>

            <p className="mt-1 max-w-md text-[10px] leading-relaxed text-white/35">
              Shows whether investors are feeling more
              positive, negative, or uncertain about crypto.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`
                flex items-center gap-1.5
                rounded-md
                px-2 py-1
                text-[9px]
                font-semibold
                ${activeUI.badge}
                ${activeUI.color}
              `}
            >
              <span>{activeUI.icon}</span>
              {activeUI.simpleLabel}
            </span>

            {sentimentExpanded && (
              <button
                onClick={() =>
                  setSentimentExpanded(false)
                }
                className="text-[10px] text-white/40 hover:text-white"
              >
                ✕ Close
              </button>
            )}
          </div>
        </div>

        {/* =====================================================
            DATA WARNING
        ===================================================== */}

        {error && items.length > 0 && (
          <div className="mt-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-3 py-2">
            <div className="text-[10px] text-yellow-300">
              ⚠ Data feed delayed
            </div>

            <div className="mt-1 text-[9px] text-white/40">
              Showing the last successful sentiment reading.
            </div>
          </div>
        )}

        {/* =====================================================
            MARKET MOOD
        ===================================================== */}

        <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-4">

          <div className="flex items-end justify-between">
            <div>
              <div className="text-[8px] uppercase tracking-[0.2em] text-white/30">
                Current Mood
              </div>

              <motion.div
                initial={{
                  scale: 0.8,
                  opacity: 0,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                transition={{
                  duration: 0.4,
                }}
                className={`mt-1 text-2xl font-bold ${activeUI.color}`}
              >
                {label}
              </motion.div>
            </div>

            <div className="text-right">
              <div className="text-[8px] uppercase tracking-wide text-white/25">
                Sentiment Score
              </div>

              <div
                className={`mt-1 text-lg font-semibold ${activeUI.color}`}
              >
                {score}/100
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="relative h-2 w-full rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-400">
              <motion.div
                initial={{
                  left: "50%",
                }}
                animate={{
                  left: `${score}%`,
                }}
                transition={{
                  duration: 0.8,
                }}
                className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black bg-white shadow-lg"
              />
            </div>

            <div className="mt-1 flex justify-between text-[8px] uppercase tracking-wide text-white/30">
              <span>Fear</span>
              <span>Neutral</span>
              <span>Greed</span>
            </div>
          </div>

          <div className="mt-3 text-[9px] leading-relaxed text-white/30">
            This score summarizes the tone of current market news and investor reactions.
          </div>
        </div>

        {/* =====================================================
            WHAT IS HAPPENING?
        ===================================================== */}

        <div className="mt-3 rounded-lg border border-violet-500/20 bg-violet-500/5 p-3">

          <div className="flex items-center gap-2">
            <span className="text-sm">
              🧠
            </span>

            <div>
              <div className="text-[10px] font-semibold text-violet-300">
                What Is Happening?
              </div>

              <div className="text-[8px] text-white/25">
                AllChain's market read
              </div>
            </div>
          </div>

          <div className="mt-2 text-[11px] leading-relaxed text-white/75">
            {generateSummary()}
          </div>
        </div>

        {/* =====================================================
            WHAT DOES THIS MEAN?
        ===================================================== */}

        <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">

          <div className="text-[9px] uppercase tracking-[0.2em] text-white/30">
            What Does This Mean?
          </div>

          <div className="mt-2 text-[10px] leading-relaxed text-white/55">
            {score < 40
              ? "Investors appear cautious. Fear is relatively strong, so price movements may remain unstable."
              : score < 60
              ? "Investors are divided. There is no strong agreement about where the market is heading."
              : "Investors are becoming more confident. Positive sentiment is currently stronger than negative sentiment."}
          </div>

          <div className="mt-2 text-[8px] leading-relaxed text-white/20">
            Sentiment shows how investors are behaving. It does not predict the next price move.
          </div>
        </div>

        {/* =====================================================
            IMPORTANT SIGNALS
        ===================================================== */}

        {alerts.length > 0 && (
          <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">

            <div className="text-[9px] uppercase tracking-[0.2em] text-amber-300/60">
              Worth Watching
            </div>

            <div className="mt-2 space-y-2">
              {alerts
                .slice(
                  0,
                  sentimentExpanded
                    ? alerts.length
                    : 3
                )
                .map(
                  (
                    alert,
                    index
                  ) => (
                    <div
                      key={index}
                      className="text-[9px] leading-relaxed text-white/50"
                    >
                      {alert}
                    </div>
                  )
                )}
            </div>
          </div>
        )}

        {/* =====================================================
            AI CONCLUSION
        ===================================================== */}

        <div className="mt-3 rounded-lg border border-violet-500/20 bg-violet-500/5 p-3">

          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-semibold text-violet-300">
                🧠 AllChain Market Conclusion
              </div>

              <div className="mt-0.5 text-[8px] text-white/25">
                A simplified interpretation of the current signals
              </div>
            </div>

            <div className="rounded-md bg-white/10 px-2 py-1 text-[8px] text-white/50">
              {aiConclusion.state}
            </div>
          </div>

          <div className="mt-3">
            <div className="text-[8px] uppercase tracking-wide text-white/30">
              The Bigger Picture
            </div>

            <div className="mt-1 text-[10px] leading-relaxed text-white/70">
              {aiConclusion.summary}
            </div>
          </div>

          <div className="mt-3">
            <div className="text-[8px] uppercase tracking-wide text-white/30">
              Short-Term View
            </div>

            <div className="mt-1 text-[9px] leading-relaxed text-white/50">
              {aiConclusion.outlook}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">

            <div className="rounded-lg border border-white/10 bg-black/30 p-2.5">
              <div className="text-[8px] uppercase tracking-wide text-white/30">
                Risk
              </div>

              <div className="mt-1 text-[10px] font-medium text-white/70">
                {aiConclusion.risk}
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-black/30 p-2.5">
              <div className="text-[8px] uppercase tracking-wide text-white/30">
                Investor Behaviour
              </div>

              <div className="mt-1 text-[9px] leading-relaxed text-white/55">
                {aiConclusion.behavior}
              </div>
            </div>

          </div>

          {aiConclusion.drivers.length > 0 && (
            <div className="mt-3">

              <div className="text-[8px] uppercase tracking-wide text-white/30">
                Main Things Driving Sentiment
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {aiConclusion.drivers.map(
                  (
                    d: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined,
                    i: Key | null | undefined
                  ) => (
                    <div
                      key={i}
                      className="rounded-md bg-white/10 px-2 py-1 text-[8px] text-white/55"
                    >
                      {d}
                    </div>
                  )
                )}
              </div>

            </div>
          )}
        </div>

        {/* =====================================================
            MARKET STORIES
        ===================================================== */}

        <div className="mt-4">

          <div className="flex items-center justify-between">

            <div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-white/30">
                What's Influencing Investors?
              </div>

              <div className="mt-1 text-[8px] text-white/20">
                The biggest stories currently shaping sentiment
              </div>
            </div>

            <div className="text-[8px] text-white/25">
              {narratives.length} themes
            </div>

          </div>

          <div
            className={
              sentimentExpanded
                ? "mt-2 grid grid-cols-1 gap-2 md:grid-cols-2"
                : "mt-2 space-y-2"
            }
          >

            {(sentimentExpanded
              ? narratives
              : narratives.slice(0, 3)
            ).map((n, i) => {

              const narrative =
                explainNarrative(
                  n.name
                );

              return (
                <div
                  key={i}
                  className="rounded-lg border border-white/10 bg-white/5 p-3"
                >

                  <div className="flex items-start gap-2">

                    <span className="text-sm">
                      {narrative.icon}
                    </span>

                    <div className="min-w-0 flex-1">

                      <div className="text-[10px] font-semibold text-white">
                        {narrative.title}
                      </div>

                      <div className="mt-1 text-[9px] leading-relaxed text-white/45">
                        {narrative.description}
                      </div>

                      {n.examples?.[0] && (
                        <div className="mt-2 border-l border-white/10 pl-2 text-[8px] leading-relaxed text-white/30">
                          {n.examples[0]}
                        </div>
                      )}

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        </div>

        {/* =====================================================
            LIVE NEWS
        ===================================================== */}

        <div className="mt-4">

          <div className="flex items-center justify-between">

            <div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-white/30">
                What's Happening Now?
              </div>

              <div className="mt-1 text-[8px] text-white/20">
                Recent market headlines behind the sentiment reading
              </div>
            </div>

            <div className="text-[8px] text-white/25">
              {uniqueItems.length} signals
            </div>

          </div>

          <div className="mt-2 space-y-2">

            {(sentimentExpanded
              ? uniqueItems
              : uniqueItems.slice(0, 3)
            ).map((n, i) => (

              <a
                key={i}
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-lg border border-white/10 bg-black/40 p-2.5 transition hover:bg-white/[0.04]"
              >

                <div className="flex items-start gap-2">

                  <div
                    className={`
                      mt-1
                      h-2
                      w-2
                      shrink-0
                      rounded-full
                      ${
                        n.sentiment === "bullish"
                          ? "bg-green-400"
                          : n.sentiment === "bearish"
                          ? "bg-red-400"
                          : "bg-yellow-400"
                      }
                    `}
                  />

                  <div className="flex-1">

                    <div
                      className={`
                        text-[10px]
                        leading-relaxed
                        ${
                          n.sentiment === "bullish"
                            ? "text-green-200"
                            : n.sentiment === "bearish"
                            ? "text-red-200"
                            : "text-white/75"
                        }
                      `}
                    >
                      {n.title}
                    </div>

                    <div className="mt-1.5 flex items-center gap-2">

                      <span
                        className={`
                          rounded
                          px-1.5
                          py-0.5
                          text-[8px]
                          ${
                            n.sentiment === "bullish"
                              ? "bg-emerald-500/10 text-emerald-300"
                              : n.sentiment === "bearish"
                              ? "bg-red-500/10 text-red-300"
                              : "bg-yellow-500/10 text-yellow-300"
                          }
                        `}
                      >
                        {n.sentiment === "bullish"
                          ? "POSITIVE"
                          : n.sentiment === "bearish"
                          ? "NEGATIVE"
                          : "MIXED"}
                      </span>

                      <span className="rounded bg-white/10 px-1.5 py-0.5 text-[8px] text-white/40">
                        {n.source}
                      </span>

                    </div>

                  </div>

                </div>

              </a>
            ))}

          </div>

          <div className="mt-2 text-[8px] leading-relaxed text-white/20">
            Headlines and external news sources belong to their respective publishers.
          </div>

        </div>

        {/* =====================================================
            VIEW ALL
        ===================================================== */}

        <button
          onClick={() =>
            setSentimentExpanded(
              !sentimentExpanded
            )
          }
          className="mt-3 w-full rounded-lg border border-violet-500/20 py-2 text-[9px] font-medium text-violet-300 transition hover:bg-violet-500/10"
        >
          {sentimentExpanded
            ? "Show Compact View"
            : "View Full Sentiment Analysis"}
        </button>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2">

          <div className="text-[8px] text-white/20">
            Based on current market news and investor signals
          </div>

          <div className="text-[8px] text-white/20">
            {updatedText || "Updating..."}
          </div>

        </div>

      </div>
    </motion.div>
  );
}