"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth , db } from "../lib/firebaseConfig";
import Footer from "./components/Footer";
import LiveTicker from "./components/LiveTicker";
import MiniPreview from "./components/MiniPreview";
import { doc, setDoc } from "firebase/firestore";
import MarketPagePreview from "./components/MarketPagePreview";
import { trackEvent } from "../lib/analytics";



export default function LandingPage() {
  const [price, setPrice] = useState(60000);
  const [history, setHistory] = useState<number[]>([]);
  const [signal, setSignal] = useState<"BUY" | "SELL">("BUY");
  const [authLoading, setAuthLoading] = useState(false);

  const [pnl, setPnl] = useState(0);
  
  const [showThinking, setShowThinking] = useState(false);
  const [displaySignal, setDisplaySignal] = useState<"BUY" | "SELL">("BUY");
  const [displayConfidence, setDisplayConfidence] = useState(75);
  const router = useRouter();
  const [selectedCoin, setSelectedCoin] = useState("BTC");
  const [showHeader, setShowHeader] = useState(true);

  const [position, setPosition] = useState<null | {
  coin: string;
  direction: "BUY" | "SELL";
  entry: number;
  size: number;
}>(null);
  
  const [coins, setCoins] = useState([
  { symbol: "BTC", price: 60000, prev: 60000 },
  { symbol: "ETH", price: 3200, prev: 3200 },
  { symbol: "SOL", price: 140, prev: 140 },
  { symbol: "BNB", price: 580, prev: 580 },
  { symbol: "XRP", price: 0.6, prev: 0.6 },
  { symbol: "DOGE", price: 0.15, prev: 0.15 },
]);
const [paused, setPaused] = useState(false);
const [terminalStatus, setTerminalStatus] = useState("idle");
const [reasoning, setReasoning] = useState<string[]>([]);
const [marketMode, setMarketMode] = useState("NEUTRAL");
const [tradeSetup, setTradeSetup] = useState<any>(null);

const coinList = ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE"];
const [coinIndex, setCoinIndex] = useState(0);
const [visibleReasoning, setVisibleReasoning] = useState<string[]>([]);
const [aiPhase, setAiPhase] = useState<
  "idle" | "analyzing" | "suggestion" | "trade"
>("idle");


const activeCoin =
  coins.find((c) => c.symbol === selectedCoin) || coins[0]

useEffect(() => {
  if (paused) return;

  const interval = setInterval(() => {
    if (aiPhase !== "idle") return; // 🚀 BLOCK SWITCH

    setCoinIndex((prev) => {
      const next = (prev + 1) % coinList.length;
      setSelectedCoin(coinList[next]);
      return next;
    });
  }, 10000);

  return () => clearInterval(interval);
}, [paused, aiPhase]);


const generateSignal = (price: number, prev: number) => {
  if (!prev || prev === 0) return "BUY";

  const change = ((price - prev) / prev) * 100;

  if (!isFinite(change)) return "BUY";

  if (change > 0.3) return "BUY";
  if (change < -0.3) return "SELL";

  return change > 0 ? "BUY" : "SELL";
};

const generateConfidence = (change: number) => {
  const base = 60;
  const volatilityBoost = Math.min(Math.abs(change) * 20, 35);
  return Math.floor(base + volatilityBoost);
};

/* =========================
   AI SIMULATION
========================= */
useEffect(() => {
  if (!selectedCoin) return;

  setAiPhase("analyzing");
  setReasoning([]);
  setTradeSetup(null);

  const prevPrice =
  history.length > 1
    ? history[history.length - 2]
    : activeCoin.price || price;
  const safePrev = prevPrice || activeCoin.price || 1;

const change =
  safePrev === 0
    ? 0
    : ((activeCoin.price - safePrev) / safePrev) * 100;

  const newSignal = generateSignal(activeCoin.price, prevPrice);
  const newConfidence = generateConfidence(change);

  const lockedPrice = activeCoin.price;

  setPosition({
  coin: selectedCoin,
  direction: newSignal,
  entry: lockedPrice,
  size: 1,
});

 // ✅ STEP 0 — DEFINE STEPS LOCALLY (IMPORTANT FIX)
const steps =
  marketMode.includes("EXTREME")
    ? [
        "Extreme volatility detected...",
        "Order book imbalance increasing...",
        "Liquidity thinning rapidly...",
        "High-frequency signals unstable...",
        "Risk model adjusting exposure...",
      ]
    : marketMode.includes("HIGH")
    ? [
        "Volatility rising...",
        "Momentum shift detected...",
        "Liquidity redistribution...",
        "Short-term trend forming...",
        "Signal confirmation in progress...",
      ]
    : [
        "Stable market conditions...",
        "Minor price fluctuations...",
        "No structural break detected...",
        "Waiting for momentum shift...",
        "Signal remains neutral...",
      ];

// ✅ sync both states
setReasoning(steps);
setVisibleReasoning([]);

let i = 0;

const typingInterval = setInterval(() => {
  setVisibleReasoning((prev) => [
    ...prev,
    steps[i], // ✅ correct source
  ]);

   i++;

   if (i >= steps.length) {
    clearInterval(typingInterval);
  }
}, 400);

  // ✅ declare timers FIRST
  let t1: NodeJS.Timeout;
  let t2: NodeJS.Timeout;
  let t3: NodeJS.Timeout;

 const typingDuration = steps.length * 400;

t1 = setTimeout(() => {
  setDisplaySignal(newSignal);
  setDisplayConfidence(newConfidence);
  setAiPhase("suggestion");
}, typingDuration + 300);

  // STEP 2 → trade
  t2 = setTimeout(() => {
    setTradeSetup({
      coin: selectedCoin,
      direction: newSignal,
      entry: activeCoin.price,
      target:
        newSignal === "BUY"
          ? activeCoin.price * 1.02
          : activeCoin.price * 0.98,
      stop:
        newSignal === "BUY"
          ? activeCoin.price * 0.99
          : activeCoin.price * 1.01,
      confidence: newConfidence,
    });

    setAiPhase("trade");
  }, typingDuration + 1200);

  // STEP 3 → hold then reset
  t3 = setTimeout(() => {
    setAiPhase("idle");
  }, 8000);

  return () => {
    clearTimeout(t1);
    clearTimeout(t2);
    clearTimeout(t3);
    clearInterval(typingInterval);
  };
}, [selectedCoin, marketMode]);

useEffect(() => {
  if (!position) return;

  const interval = setInterval(() => {
    const currentPrice = activeCoin.price;

    const diff =
      position.direction === "BUY"
        ? currentPrice - position.entry
        : position.entry - currentPrice;

   const pnlValue =
    position.direction === "BUY"
    ? ((currentPrice - position.entry) / position.entry) * 100
    : ((position.entry - currentPrice) / position.entry) * 100;

    setPnl(pnlValue);
  }, 500);

  return () => clearInterval(interval);
}, [position, activeCoin.price]);

useEffect(() => {
  if (!position) return;

  const tp = position.direction === "BUY"
    ? position.entry * 1.02
    : position.entry * 0.98;

  const sl = position.direction === "BUY"
    ? position.entry * 0.99
    : position.entry * 1.01;

  const current = activeCoin.price;

  if (
    (position.direction === "BUY" && (current >= tp || current <= sl)) ||
    (position.direction === "SELL" && (current <= tp || current >= sl))
  ) {
    setPosition(null);
    setPnl((prev) => prev); // lock last pnl
  }
}, [activeCoin.price, position]);

/* =========================
   SCROLL DETECTION
========================= */
useEffect(() => {
  const handleScroll = () => {
    const currentY = window.scrollY;

    // hide after scrolling down a bit
    if (currentY > 80) {
      setShowHeader(false);
    }

    // only show when near top again
    if (currentY <= 10) {
      setShowHeader(true);
    }
  };

  window.addEventListener("scroll", handleScroll);

  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}, []);

/* =========================
   LIVE TICKER (COINGECKO)
========================= */
// ✅ BINANCE WEBSOCKET (REAL-TIME)
useEffect(() => {
  const ws = new WebSocket(
    "wss://stream.binance.com:9443/stream?streams=btcusdt@trade/ethusdt@trade/solusdt@trade/bnbusdt@trade/xrpusdt@trade/dogeusdt@trade"
  );

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    const newPrice = parseFloat(data.data.p);
    const symbol = data.stream.split("@")[0].replace("usdt", "").toUpperCase();

    setCoins((prev) =>
      prev.map((c) =>
        c.symbol === symbol
          ? { ...c, prev: c.price, price: newPrice }
          : c
      )
    );

    setPrice(newPrice);

    setHistory((prev) => {
      const updated = [...prev, newPrice];
      if (updated.length > 60) updated.shift();
      return updated;
    });
  };

  return () => ws.close();
}, []);
 
  /* =========================
     LOGIN
  ========================= */
 const login = async () => {
  
  try {
    setAuthLoading(true); // 🔥 START LOADING

    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    const user = result.user;

    trackEvent("user_signup", {
    method: "google",
    });

    await setDoc(
      doc(db, "users", user.uid),
      {
        email: user.email,
        createdAt: Date.now(),
        lastLogin: Date.now(),
        lastActive: Date.now(),
        isActive: true,
      },
      { merge: true }
    );

    // small delay so UX feels smooth (important)
    
      router.push("/intel");
      
    

  } catch (err) {
    console.error("LOGIN ERROR", err);
    setAuthLoading(false); // stop loading if error
  }
};


  return (
  <div className="relative min-h-screen bg-[#050505] text-white overflow-x-hidden">

    {authLoading && (
  <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center">
    
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mb-4" />

    <p className="text-sm tracking-[0.2em] uppercase text-gray-300">
      Connecting to AllChain Systems...
    </p>

    <p className="text-xs text-gray-500 mt-2">
      Initializing trade environment
    </p>

  </div>
)}

    {/* BACKGROUND */}
    <div className="absolute inset-0 opacity-10 pointer-events-none">
      <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:50px_50px]" />
    </div>

    {/* HEADER */}
<header
  className={`fixed top-0 left-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-white/10 transition-transform duration-300 ${
    showHeader ? "translate-y-0" : "-translate-y-[120%]"
  }`}
>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-4 flex items-center justify-between gap-3">
    
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center font-bold">
        A
      </div>
      <span className="text-lg font-semibold">AllChain</span>
    </div>

   <button
  onClick={() => {
    trackEvent("navbar_cta_click");
    login();
  }}
  className="px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg hover:scale-105 transition whitespace-nowrap"
  style={{
    backgroundColor: "#ffffff",
    color: "#000000",
    WebkitAppearance: "none",
    appearance: "none",
  }}
>
      Start Trading
    </button>



  </div>

  {/* TICKER */}
<div className="border-y border-white/10 py-2 overflow-hidden">
  <LiveTicker coins={coins} />
</div>
  
</header>



{/* HERO FIRST */}
    {/* ✅ MAIN CONTENT */}
   <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pt-32 sm:pt-36 md:pt-40">

    

         {/* HERO */}
 <section
  id="hero-section"
 className="relative pt-2 md:pt-6 pb-12 md:pb-16 overflow-visible"
>

   {/* SMALL BADGE (ATTENTION TRIGGER) */}
   {/* BADGE */}
  <motion.div
  initial={{ scale: 0.9, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ delay: 0.2 }}
  className="flex items-center justify-center gap-2 px-4 py-1 mb-1 rounded-full 
bg-white/5 border border-white/10 text-xs text-gray-300 backdrop-blur w-fit self-start"
>
  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
  Real-time AI Trading Simulator
</motion.div>


  {/* GLOW */}
  <div className="hidden md:block absolute right-[-150px] top-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/20 blur-[180px] rounded-full pointer-events-none" />

  <div className="grid md:grid-cols-2 lg:grid-cols-[0.9fr_1.5fr] gap-8 lg:gap-10 items-center">

    {/* LEFT */}
    <div id="hero-headline" className="max-w-lg">
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight">
        <span className="text-white">
          Practice trading with AI guidance
        </span>
        <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500">
          without risking a single rupee
        </span>
      </h1>

      <p className="text-gray-400 mt-4 text-base md:text-lg leading-relaxed">
        Trade real markets with AI guidance, live signals, and ₹10,00,000 in simulated capital.
      </p>

      <button
  id="start-trading-btn"
  onClick={() => {
  trackEvent("hero_cta_click");
  login();
}}
  className="mt-5 px-6 py-3 text-sm font-medium bg-white text-black rounded-lg hover:scale-[1.03] transition"
>
  Start Trading Free →
</button>

      
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.4, duration: 0.5 }}
  className="flex flex-wrap items-center gap-3 mt-5"
>

  {/* LIVE MARKET */}
  <motion.div
    whileHover={{ scale: 1.03 }}
    className="flex items-center gap-2 px-4 py-2 rounded-full
    bg-white/5 border border-white/10
    backdrop-blur-md shadow-lg"
  >
    <motion.span
      className="w-2 h-2 bg-green-400 rounded-full"
      animate={{
        scale: [1, 1.5, 1],
        opacity: [1, 0.5, 1],
      }}
      transition={{
        repeat: Infinity,
        duration: 1.5,
      }}
    />

    <span className="text-sm text-white font-medium">
      Live Market
    </span>
  </motion.div>

  {/* AI SIGNALS */}
  <motion.div
    whileHover={{ scale: 1.03 }}
    className="flex items-center gap-2 px-4 py-2 rounded-full
    bg-blue-500/10 border border-blue-500/20
    backdrop-blur-md shadow-lg"
  >
    <motion.span
      className="w-2 h-2 bg-blue-400 rounded-full"
      animate={{
        opacity: [0.4, 1, 0.4],
      }}
      transition={{
        repeat: Infinity,
        duration: 2,
      }}
    />

    <span className="text-sm text-white font-medium">
      AI Signals
    </span>
  </motion.div>

</motion.div>
</div>

    {/* RIGHT */}
    <div className="relative w-full">

      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="relative w-full"
      >
        {/* glow */}
        <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-3xl" />

        {/* preview */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="w-full max-w-none scale-100 md:scale-[1.03] lg:scale-[1.1]"
        >
          <div id="preview-card">

         {activeCoin?.price ? (
  <MiniPreview
    price={activeCoin.price}
    signal={displaySignal}
    confidence={displayConfidence}
    selectedCoin={selectedCoin}
  />
) : (
  <div className="h-[200px] bg-white/5 rounded-xl animate-pulse" />
)}
          </div>
        </motion.div>

      </motion.div>
    
    </div>

  </div>

  </section>

  {/* PREMIUM DIVIDER */}
<div className="relative flex items-center justify-center my-14">

  {/* left line */}
  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-white/5" />

  {/* center glow */}
  <div className="mx-4 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_25px_rgba(96,165,250,0.9)] animate-pulse" />

  {/* right line */}
  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/20 to-white/5" />

</div>
{/* ================= WHY ALLCHAIN ================= */}
<motion.section
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  className="mt-16"
>

  {/* TOP FEATURES */}
  <div className="grid md:grid-cols-3 gap-3">

    {[
      {
        icon: "🛡️",
        title: "Zero Risk",
        desc: "Practice with simulated capital.",
      },
      {
        icon: "🤖",
        title: "AI Signals",
        desc: "Confidence-scored trade guidance.",
      },
      {
        icon: "📊",
        title: "Live Engine",
        desc: "Real-time volatility simulation.",
      },
    ].map((item, i) => (
      <div
        key={i}
        className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"
      >
        <div className="flex items-center gap-3">

          <div className="text-lg">
            {item.icon}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">
              {item.title}
            </h3>

            <p className="text-[11px] text-gray-400 mt-0.5">
              {item.desc}
            </p>
          </div>

        </div>
      </div>
    ))}

  </div>

  {/* COMPACT COMPARISON */}
  <div className="mt-5 grid md:grid-cols-2 gap-4">

    {/* PROBLEM */}
    <div className="rounded-3xl border border-red-500/10 bg-red-500/[0.03] p-5">

      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-red-400" />

        <p className="text-[10px] uppercase tracking-[0.24em] text-red-400">
          WHY TRADERS FAIL
        </p>
      </div>

      <h3 className="text-lg font-semibold text-white mb-3">
        Most traders lose before learning properly.
      </h3>

      <div className="flex flex-wrap gap-2">

        {[
          "Emotional trading",
          "No structure",
          "Early capital loss",
          "No feedback loop",
        ].map((item, i) => (
          <div
            key={i}
            className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-gray-300"
          >
            {item}
          </div>
        ))}

      </div>
    </div>

    {/* SOLUTION */}
    <div className="rounded-3xl border border-green-500/10 bg-green-500/[0.03] p-5">

      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-green-400" />

        <p className="text-[10px] uppercase tracking-[0.24em] text-green-400">
          HOW ALLCHAIN HELPS
        </p>
      </div>

      <h3 className="text-lg font-semibold text-white mb-3">
        Learn through AI-guided simulation.
      </h3>

      <div className="flex flex-wrap gap-2">

        {[
          "AI reasoning",
          "Risk-free trading",
          "Live markets",
          "Performance learning",
        ].map((item, i) => (
          <div
            key={i}
            className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-gray-300"
          >
            {item}
          </div>
        ))}

      </div>
    </div>

  </div>

</motion.section>

{/* PREMIUM DIVIDER */}
<div className="relative flex items-center justify-center my-14">

  {/* left line */}
  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-white/5" />

  {/* center glow */}
  <div className="mx-4 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_25px_rgba(96,165,250,0.9)] animate-pulse" />

  {/* right line */}
  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/20 to-white/5" />

</div>


{/* ================= EXPERIENCE SECTION ================= */}
<div className="mt-20">

      {/* LEFT */}
      <div>
        <div>
          <MarketPagePreview/>
        </div>
         
         
      </div>

   {/* PREMIUM DIVIDER */}
<div className="relative flex items-center justify-center my-14">

  {/* left line */}
  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-white/5" />

  {/* center glow */}
  <div className="mx-4 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_25px_rgba(96,165,250,0.9)] animate-pulse" />

  {/* right line */}
  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/20 to-white/5" />

</div>

  
{/* ================= HOW IT WORKS ================= */}
<motion.section
  id="how-it-works"
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  className="mt-28"
>

  {/* HEADER */}
  <div className="text-center max-w-3xl mx-auto mb-14">

    <p className="text-[24px] uppercase tracking-[0.25em] text-blue-400 mb-4">
      HOW IT WORKS
    </p>

    <h2 className="text-2xl md:text-4xl font-semibold leading-tight">
      Learn trading through
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
        {" "}live market simulation
      </span>
    </h2>

    <p className="mt-5 text-sm md:text-base text-gray-400 leading-relaxed">
      Experience institutional-style trading workflows with AI guidance,
      real-time analysis, and simulated execution.
    </p>

  </div>

  {/* STEPS */}
  <div className="grid md:grid-cols-3 gap-5">

    {[
      {
        step: "01",
        title: "Get Virtual Capital",
        desc: "Start with ₹10,00,000 simulated balance and practice risk-free.",
      },
      {
        step: "02",
        title: "Trade Live Markets",
        desc: "Experience real-time volatility using live crypto market feeds.",
      },
      {
        step: "03",
        title: "Receive AI Guidance",
        desc: "Every setup includes signals, confidence scoring, and reasoning.",
      },
    ].map((item, i) => (
      <motion.div
        key={i}
        whileHover={{
          y: -4,
          scale: 1.01,
        }}
        transition={{ duration: 0.2 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6"
      >

        {/* glow */}
        <div className="absolute inset-0 bg-blue-500/[0.03] opacity-0 hover:opacity-100 transition duration-500 blur-3xl" />

        {/* number */}
        <div className="text-5xl font-bold text-white/10 mb-6">
          {item.step}
        </div>

        {/* content */}
        <h3 className="text-lg font-semibold text-white mb-3">
          {item.title}
        </h3>

        <p className="text-sm text-gray-400 leading-relaxed">
          {item.desc}
        </p>

      </motion.div>
    ))}

  </div>
</motion.section>

</div>

 {/* PREMIUM DIVIDER */}
<div className="relative flex items-center justify-center my-14">

  {/* left line */}
  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-white/5" />

  {/* center glow */}
  <div className="mx-4 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_25px_rgba(96,165,250,0.9)] animate-pulse" />

  {/* right line */}
  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/20 to-white/5" />

</div>

{/* ================= COMPACT POSITIONING + CTA ================= */}
<motion.section
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  className="mt-16 md:mt-24 px-4 sm:px-6"
>
  <div className="relative max-w-6xl mx-auto overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-xl">

    {/* glow */}
    <div className="absolute inset-0 bg-blue-500/[0.03] blur-3xl pointer-events-none" />

    <div className="relative p-6 md:p-8 lg:p-10">

      {/* TOP */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

        {/* LEFT */}
        <div className="max-w-3xl">

          <p className="text-[10px] uppercase tracking-[0.28em] text-blue-400 mb-3">
            SIMULATION-FIRST TRADING
          </p>

          <h2 className="text-3xl md:text-5xl font-semibold leading-[1.05] text-white">
            Learn trading through
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              {" "}live AI-guided simulation
            </span>
          </h2>

          <p className="mt-4 text-sm md:text-base text-gray-400 leading-relaxed max-w-2xl">
            Practice real market execution, understand volatility,
            and improve decision-making without risking capital.
          </p>

        </div>

        {/* CTA */}
        <div className="flex flex-col items-start lg:items-end gap-3">

          <button
            onClick={() => {
  trackEvent("bottom_cta_click");
  login();
}}
            className="px-8 py-4 rounded-2xl bg-white text-black font-semibold hover:scale-[1.03] transition"
          >
            Start Risk-Free →
          </button>

          <div className="text-xs text-gray-500">
            No capital required
          </div>

        </div>

      </div>

      {/* BOTTOM STRIP */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3">

        {[
          {
            title: "Live Markets",
            desc: "Real-time crypto price simulation.",
          },
          {
            title: "AI Guidance",
            desc: "Signals with reasoning and confidence.",
          },
          {
            title: "Risk-Free",
            desc: "Practice without financial exposure.",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -2 }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"
          >
            <h3 className="text-sm font-semibold text-white mb-1">
              {item.title}
            </h3>

            <p className="text-xs text-gray-400 leading-relaxed">
              {item.desc}
            </p>
          </motion.div>
        ))}

      </div>

    </div>
  </div>
</motion.section>


      </div>
      <Footer />
    </div>
  );
}


