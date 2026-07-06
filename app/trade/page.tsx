'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import { onSnapshot, doc, setDoc, addDoc, collection } from 'firebase/firestore';
import PositionsPanel from '../components/PositionsPanel';

import CoinList from '../components/CoinList';
import CandlestickChart from '../components/CandlestickChart';
import TradePanel from '../components/TradePanel';
import AIEngine from '../components/AIEngine';

import OrderBook from '../components/OrderBook';
import AIChatWidget from '../components/AIChatWidget';

import { executeTrade, derivePortfolio } from '@/lib/exchangeEngine';
import { auth } from '@/lib/firebaseConfig';
import { db } from '../../lib/firebaseConfig';
import TradeSuccessModal from '../components/TradeSuccessModal';

import TradeInsightPanel from '../components/TradeInsightPanel';

type Coin = {
  symbol: string;
  name: string;
};

type PortfolioItem = {
  qty: number;
  avgPrice: number;
};

export default function TradePage() {
  const router = useRouter();

  const [tradeModal, setTradeModal] = useState<any>(null);
  const [aiData, setAiData] = useState<any>(null);

  const [userId, setUserId] = useState<string | null>(null);

  const [selectedCoin, setSelectedCoin] = useState<Coin>({
    symbol: 'BTCUSDT',
    name: 'Bitcoin',
  });

  
  const [mobileTab, setMobileTab] = useState<
  "trade" | "orderbook" | "insights"
>("trade");

  const [mobileCoinSelected, setMobileCoinSelected] =
  useState(false);


  const [engineState, setEngineState] = useState({
  balance: 1000000,
  portfolio: {} as Record<string, PortfolioItem>,
  trades: [] as any[],
  activeOrders: [] as any[],
});

  const [currentPriceMap, setCurrentPriceMap] = useState<Record<string, number>>({});

  useEffect(() => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "trade_loaded");
  }
}, []);


  /* ---------------- AUTH ---------------- */
  useEffect(() => {
  let unsub: (() => void) | undefined;

  const unsubAuth = onAuthStateChanged(auth, (user) => {

    // Stop previous Firestore listener immediately
    if (unsub) {
      unsub();
      unsub = undefined;
    }

    if (!user) {
      setUserId(null);
      router.replace('/');
      return;
    }

    setUserId(user.uid);

    const ref = doc(db, 'portfolios', user.uid);

    unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        setEngineState({
          balance: 1000000,
          portfolio: {},
          trades: [],
          activeOrders: [],
        });

        setDoc(ref, { trades: [] });
        return;
      }

      const trades = snap.data()?.trades || [];
      setEngineState(derivePortfolio(trades));
    });
  });

  return () => {
    if (unsub) unsub();
    unsubAuth();
  };
}, [router]);

  /* ---------------- PRICE ---------------- */
 const fetcher = useCallback(async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch ticker");
  }

  return res.json();
}, []);

const { data } = useSWR(
  `/api/market/ticker?symbol=${selectedCoin.symbol}`,
  fetcher,
  {
    refreshInterval: 10000,
  }
);

  const price = Number(data?.price || 0);
const change = Number(data?.change24h || 0);

const currentCoinKey = useMemo(
    () => selectedCoin.symbol.toLowerCase().replace("usdt",""),
    [selectedCoin.symbol]
);

  useEffect(() => {
    if (!price) return;

    const key = currentCoinKey;

    setCurrentPriceMap((p) => ({
      ...p,
      [key]: price,
    }));
  }, [price, currentCoinKey]);

  useEffect(() => {
  if (!userId) return;

  const interval = setInterval(async () => {
    await setDoc(
      doc(db, 'users', userId),
      {
        lastActive: Date.now(),
      },
      { merge: true }
    );
  }, 30000);

  return () => clearInterval(interval);
}, [userId]);

  /* ---------------- TRADE ---------------- */
 const handleTrade = async (
  type: 'buy' | 'sell',
  amount: number,
  qty: number,
  limitPrice?: number,
  orderType?: 'market' | 'limit' | 'stop'
) => {
  if (!userId) return;

  const coin = currentCoinKey;

  // ================= LIMIT ORDER =================
  if (orderType === 'limit' && limitPrice) {

    const order = {
      id: Date.now(),
      type,
      coin,
      amount,
      qty,
      limitPrice,
      createdAt: Date.now(),
      status: 'OPEN',
    };

    const updatedState = {
      ...engineState,
      activeOrders: [
        ...(engineState.activeOrders || []),
        order,
      ],
    };

    setEngineState(updatedState);

    const ref = doc(db, 'portfolios', userId);

    await setDoc(
      ref,
      {
        trades: updatedState.trades,
        activeOrders: updatedState.activeOrders,
        updatedAt: Date.now(),
      },
      { merge: true }
    );

    await addDoc(collection(db, "events"), {
  uid: auth.currentUser?.uid,
  type: "TRADE",
  action: type.toUpperCase(), // MUST be BUY or SELL
  coin,
  amount,
  qty,
  price,
  orderType,
  timestamp: Date.now(),
});

    toast.success('Limit order placed');

    return;
  }

  // ================= MARKET ORDER =================
  const USD_INR = 83;

const marketPriceInr = price * USD_INR;

const newState = executeTrade({
  state: engineState,
  type,
  coin,
  amount,
  qty,
  price: marketPriceInr,
});

  setTradeModal({
    type,
    coin: selectedCoin.symbol,
    amount,
    qty,
    price: marketPriceInr,
     balance: newState.balance,
  });

  setEngineState(newState);

  const ref = doc(db, 'portfolios', userId);

  await setDoc(
    ref,
    {
      trades: newState.trades,
      activeOrders: newState.activeOrders || [],
      updatedAt: Date.now(),
    },
    { merge: true }
  );

 await addDoc(collection(db, "events"), {
  uid: auth.currentUser?.uid,
  type: "TRADE",
  action: type.toUpperCase(), // MUST be BUY or SELL
  coin,
  amount,
  qty,
  price,
  orderType,
  timestamp: Date.now(),
});

  toast.success(`${type.toUpperCase()} executed`);
};

const handleSelectCoin = useCallback(
  (coin: Coin) => {
    setSelectedCoin(coin);
  },
  []
);

const currentPosition = useMemo(() => {
    return engineState.portfolio[
        currentCoinKey
    ];
}, [currentCoinKey, engineState.portfolio]);

const handleMobileSelectCoin = useCallback((coin: Coin) => {
    setSelectedCoin(coin);
    setMobileCoinSelected(true);
}, []);
 

  /* ---------------- UI ---------------- */
 return (
  <div className="min-h-screen bg-[#0B1220] text-white">

     <main className="flex-1">

    {/* 🔥 TOP TRADING ZONE */}
    <div className="flex flex-col lg:flex-row gap-2 p-2 border-b border-white/5">

  {/* LEFT — COIN LIST */}
  
{/* DESKTOP COIN LIST */}
<div className="hidden lg:flex lg:w-[240px] h-[620px] border border-white/5 rounded-xl bg-[#0B1220]/80 backdrop-blur flex-col">
  <CoinList
    selectedCoin={selectedCoin.symbol}
    onSelectCoin={handleSelectCoin}
/>
</div>

{/* MOBILE COIN LIST */}
{!mobileCoinSelected && (
  <>
    <div className="lg:hidden h-[540px] border border-white/5 rounded-xl bg-[#0B1220]/80 backdrop-blur overflow-hidden">
      <CoinList
        selectedCoin={selectedCoin.symbol}
        onSelectCoin={handleMobileSelectCoin}
      />
    </div>

    <div className="lg:hidden mt-2">
      <PositionsPanel
        portfolio={engineState.portfolio}
        trades={engineState.trades}
        currentPriceMap={currentPriceMap}
      />
    </div>
  </>
)}

  {/* CENTER */}
<div className="hidden lg:flex flex-1 flex-col">

  <div className="w-full h-[300px] sm:h-[420px] lg:h-[620px] border border-white/5 rounded-xl bg-[#0B1220]/80 backdrop-blur overflow-hidden">
  <CandlestickChart
  symbol={selectedCoin.symbol}
  coinName={selectedCoin.name}
  price={price}
  change={change}
  high={Number(data?.high24h || 0)}
  low={Number(data?.low24h || 0)}
  volume={Number(data?.volume24h || 0)}
/>
  </div>

  </div>

  {/* MOBILE TERMINAL */}
{mobileCoinSelected && (
  <div className="lg:hidden w-full">

    <button
      onClick={() => setMobileCoinSelected(false)}
      className="mb-2 w-full rounded-lg bg-white/5 py-3 text-sm"
    >
      ← Back To Markets
    </button>

    <div className="
  rounded-2xl
  border border-white/10
  bg-gradient-to-b
  from-[#111827]
  to-[#0B1220]
  shadow-xl
  shadow-black/30
  overflow-hidden
">
      <CandlestickChart
        symbol={selectedCoin.symbol}
        coinName={selectedCoin.name}
        price={price}
        change={change}
        high={Number(data?.high24h || 0)}
        low={Number(data?.low24h || 0)}
        volume={Number(data?.volume24h || 0)}
/>
    </div>

  </div>
)}

  {/* MOBILE TERMINAL TABS */}
{mobileCoinSelected && (
<div className="lg:hidden mt-2">

  <div className="grid grid-cols-3 gap-2 mb-2">

    <button
      onClick={() => setMobileTab('trade')}
      className={`py-2 text-xs rounded-lg ${
        mobileTab === 'trade'
          ? 'bg-blue-600 text-white'
          : 'bg-white/5 text-gray-400'
      }`}
    >
      Trade
    </button>

    <button
      onClick={() => setMobileTab('orderbook')}
      className={`py-2 text-xs rounded-lg ${
        mobileTab === 'orderbook'
          ? 'bg-blue-600 text-white'
          : 'bg-white/5 text-gray-400'
      }`}
    >
      OrderBook
    </button>

    <button
      onClick={() => setMobileTab('insights')}
      className={`py-2 text-xs rounded-lg ${
        mobileTab === 'insights'
          ? 'bg-blue-600 text-white'
          : 'bg-white/5 text-gray-400'
      }`}
    >
      Insights
    </button>

  </div>

  {mobileTab === 'trade' && (
    <div className="space-y-2">

      <div className="rounded-xl border border-white/5 bg-[#0B1220]/80 p-2">
        <AIEngine
          symbol={selectedCoin.symbol}
          coinName={selectedCoin.name}
          price={price}
          balance={engineState.balance}
          position={currentPosition}
          onExecute={handleTrade}
          onUpdate={setAiData}
        />
      </div>

      <div className="rounded-xl border border-white/5 bg-[#0B1220]/80 p-2">
        <TradePanel
          coinId={selectedCoin.symbol}
          price={price}
          balance={engineState.balance}
          position={currentPosition}
          onTrade={handleTrade}
        />
      </div>

    </div>
  )}

  {mobileTab === 'orderbook' && (
    <div className="rounded-xl border border-white/5 bg-[#0B1220]/80 p-2 h-[420px]">
      <OrderBook symbol={selectedCoin.symbol} />
    </div>
  )}

</div>
)} 


{/* DESKTOP ONLY */}
<div className="hidden lg:block lg:w-[300px] border border-white/5 rounded-xl bg-[#0B1220]/80 backdrop-blur p-2 overflow-y-auto">
  <AIEngine
    symbol={selectedCoin.symbol}
    coinName={selectedCoin.name}
    price={price}
    balance={engineState.balance}
    position={currentPosition}
    onExecute={handleTrade}
    onUpdate={setAiData}
  />
</div>

</div>

   {/* 🔥 BOTTOM SECTION */}
<div className="hidden lg:block p-2">
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">

    {/* TRADE PANEL */}
    <div className="col-span-12 lg:col-span-3">
    <div className="h-[340px] rounded-xl border border-white/5 bg-[#0B1220]/80 backdrop-blur p-1.5 overflow-hidden">
        <TradePanel
          coinId={selectedCoin.symbol}
         price={price}
          balance={engineState.balance}
          position={currentPosition}
          onTrade={handleTrade}
        />
      </div>
    </div>

    {/* 🔥 ORDER BOOK */}
    <div className="col-span-12 lg:col-span-6">
      <div className="h-[340px] rounded-xl border border-white/5 bg-[#0B1220]/80 backdrop-blur p-1.5 overflow-x-auto">
        <OrderBook symbol={selectedCoin.symbol} />
      </div>
    </div>

    <div className="col-span-12 lg:col-span-3">
    <div className="h-[340px] rounded-xl border border-white/5 bg-[#0B1220]/80 backdrop-blur p-1.5 overflow-hidden">
        
     <div className="mt-2 border-t border-white/10 pt-2 h-[250px]">
    <TradeInsightPanel symbol={selectedCoin.symbol} />
  </div>
  </div>
    </div>


 <div className="col-span-12">
  <PositionsPanel
    portfolio={engineState.portfolio}
    trades={engineState.trades}
    currentPriceMap={currentPriceMap}
  />
</div>

  </div>
</div>
</main>
<TradeSuccessModal
  open={!!tradeModal}
  trade={tradeModal}
  onClose={() => setTradeModal(null)}
/>

 {/* FLOATING AI CHAT WIDGET */}
<div className="fixed bottom-4 right-4 z-50">
  <AIChatWidget
    coinId={selectedCoin.symbol}
    price={price}
    change={change}
    tradeScore={aiData?.tradeScore || 0}
  />
</div>
</div>
)}
