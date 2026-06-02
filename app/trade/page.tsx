'use client';

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import { onSnapshot, doc, setDoc, addDoc, collection } from 'firebase/firestore';
import AIInsightsPanel from '../components/AIInsightsPanel';
import PositionsPanel from '../components/PositionsPanel';

import CoinList from '../components/CoinList';
import CandlestickChart from '../components/CandlestickChart';
import TradePanel from '../components/TradePanel';
import AIEngine from '../components/AIEngine';
import OrderPanel from '../components/OrderPanel';
import OrderBook from '../components/OrderBook';

import { executeTrade, derivePortfolio } from '@/lib/exchangeEngine';
import { auth } from '@/lib/firebaseConfig';
import { db } from '../../lib/firebaseConfig';
import TradeSuccessModal from '../components/TradeSuccessModal';

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
  const [mounted, setMounted] = useState(false);
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

  useEffect(() => setMounted(true), []);

  /* ---------------- AUTH ---------------- */
  useEffect(() => {
    let unsub: any;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return router.replace('/');

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
        const state = derivePortfolio(trades);

        setEngineState(state);
      });
    });

    return () => {
      unsubAuth();
      if (unsub) unsub();
    };
  }, [router]);

  /* ---------------- PRICE ---------------- */
  const { data } = useSWR(
    selectedCoin.symbol,
    async (symbol) => {
      const res = await fetch(
        `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`
      );
      return res.json();
    }
  );

  const price = parseFloat(data?.lastPrice || 0);
  const change = parseFloat(data?.priceChangePercent || 0);

  useEffect(() => {
    if (!price) return;

    const key = selectedCoin.symbol.toLowerCase().replace('usdt', '');

    setCurrentPriceMap((p) => ({
      ...p,
      [key]: price,
    }));
  }, [price, selectedCoin]);

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

  const coin = selectedCoin.symbol.toLowerCase().replace('usdt', '');

  

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
    action: type, // ✅ THIS is the fix
    coin,
    amount,
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
  action: "BUY",
  coin,
  amount: amount,
  timestamp: Date.now(),
});

  toast.success(`${type.toUpperCase()} executed`);
};

  if (!mounted) return null;

  /* ---------------- UI ---------------- */
 return (
  <div className="min-h-screen bg-[#0B1220] text-white">

    {/* 🔥 TOP TRADING ZONE */}
    <div className="flex flex-col lg:flex-row gap-2 p-2 border-b border-white/5">

  {/* LEFT — COIN LIST */}
  
{/* DESKTOP COIN LIST */}
<div className="hidden lg:flex lg:w-[240px] h-[620px] border border-white/5 rounded-xl bg-[#0B1220]/80 backdrop-blur flex-col">
  <CoinList
    selectedCoin={selectedCoin.symbol}
    onSelectCoin={setSelectedCoin}
  />
</div>

{/* MOBILE COIN LIST */}
{!mobileCoinSelected && (
  <>
    <div className="lg:hidden w-full border border-white/5 rounded-xl bg-[#0B1220]/80 backdrop-blur flex flex-col">
      <CoinList
        selectedCoin={selectedCoin.symbol}
        onSelectCoin={(coin) => {
          setSelectedCoin(coin);
          setMobileCoinSelected(true);
        }}
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
  price={parseFloat(data?.lastPrice || 0)}
  change={parseFloat(data?.priceChangePercent || 0)}
  high={parseFloat(data?.highPrice || 0)}
  low={parseFloat(data?.lowPrice || 0)}
  volume={parseFloat(data?.volume || 0)}
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
        price={parseFloat(data?.lastPrice || 0)}
        change={parseFloat(data?.priceChangePercent || 0)}
        high={parseFloat(data?.highPrice || 0)}
        low={parseFloat(data?.lowPrice || 0)}
        volume={parseFloat(data?.volume || 0)}
      />
    </div>

    {/* MOBILE POSITIONS */}
      <div className="mt-3">
        <PositionsPanel
          portfolio={engineState.portfolio}
          trades={engineState.trades}
          currentPriceMap={currentPriceMap}
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
          balance={engineState.balance}
          position={
            engineState.portfolio[
              selectedCoin.symbol.toLowerCase().replace('usdt', '')
            ]
          }
          onExecute={handleTrade}
          onUpdate={setAiData}
        />
      </div>

      <div className="rounded-xl border border-white/5 bg-[#0B1220]/80 p-2">
        <TradePanel
          coinId={selectedCoin.symbol}
          price={price}
          balance={engineState.balance}
          position={
            engineState.portfolio[
              selectedCoin.symbol.toLowerCase().replace('usdt', '')
            ]
          }
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

  {mobileTab === 'insights' && (
    <div className="rounded-xl border border-white/5 bg-[#0B1220]/80 p-2">
      <AIInsightsPanel
        price={price}
        change={change}
        data={aiData}
      />
    </div>
  )}

</div>

)} 


{/* DESKTOP ONLY */}
<div className="hidden lg:block lg:w-[300px] border border-white/5 rounded-xl bg-[#0B1220]/80 backdrop-blur p-2 overflow-y-auto">
  <AIEngine
    symbol={selectedCoin.symbol}
    coinName={selectedCoin.name}
    balance={engineState.balance}
    position={
      engineState.portfolio[
        selectedCoin.symbol.toLowerCase().replace('usdt', '')
      ]
    }
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
          position={
            engineState.portfolio[
              selectedCoin.symbol.toLowerCase().replace('usdt', '')
            ]
          }
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

    {/* AI INSIGHTS */}
    <div className="col-span-12 lg:col-span-3">
      <div className="h-[340px] rounded-xl border border-white/5 bg-[#0B1220]/80 backdrop-blur p-1.5 overflow-hidden">
        <AIInsightsPanel price={price} change={change} data={aiData} />
      </div>
    </div>

    <TradeSuccessModal
  open={!!tradeModal}
  trade={tradeModal}
  onClose={() => setTradeModal(null)}
/>

 <div className="col-span-12">
  <PositionsPanel
    portfolio={engineState.portfolio}
    trades={engineState.trades}
    currentPriceMap={currentPriceMap}
  />
</div>

  </div>
</div>
</div>
)}
