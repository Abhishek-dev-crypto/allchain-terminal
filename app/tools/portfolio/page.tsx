'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Card from '../../components/ui/card';
import Button from '../../components/ui/button';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebaseConfig';
import { derivePortfolio, executeTrade } from '@/lib/exchangeEngine';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { onAuthStateChanged } from "firebase/auth";
import TradeSuccessModal from '@/app/components/TradeSuccessModal';

/* ---------------- SYMBOL MAP ---------------- */
const toSymbol = (coin: string) => {
  return `${coin.toUpperCase()}USDT`;
};

type PortfolioData = {
  balance: number;
  portfolio: Record<string, any>;
  trades: any[];
  activeOrders: any[];
};

/* ---------------- EQUITY CHART ---------------- */
const EquityChart = ({ data }: { data: number[] }) => {
  if (!data.length) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((v - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  const isUp = data[data.length - 1] >= data[0];

  return (
    <div className="w-full h-40">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <polyline
          fill="none"
          stroke={isUp ? '#22c55e' : '#ef4444'}
          strokeWidth="2"
          points={points}
        />
      </svg>
    </div>
  );
};

export default function PortfolioPage() {
  const router = useRouter();

  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [priceMap, setPriceMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [sellModal, setSellModal] = useState<any>(null);
  const [selling, setSelling] = useState(false);
  const [flash, setFlash] = useState<'green' | 'red' | null>(null);
  const [equityHistory, setEquityHistory] = useState<number[]>([]);

  /* ---------------- LOAD HISTORY ---------------- */
  useEffect(() => {
    const stored = localStorage.getItem('equityHistory');
    if (stored) setEquityHistory(JSON.parse(stored));
  }, []);

  /* ---------------- AUTH + FIRESTORE ---------------- */
  useEffect(() => {
    let unsubFirestore: any;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return router.push('/');

      const ref = doc(db, 'portfolios', user.uid);

      unsubFirestore = onSnapshot(ref, (snap) => {
        if (!snap.exists()) {
          const newState = {
            balance: 1000000,
            portfolio: {},
            trades: [],
            activeOrders: [],
          };

          setPortfolioData(newState);

          setDoc(ref, {
            trades: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });

          setLoading(false);
          return;
        }

        const trades = snap.data()?.trades || [];
        const state = derivePortfolio(trades);

        setPortfolioData(state);
        setLoading(false);
      });
    });

    return () => {
      unsubAuth();
      if (unsubFirestore) unsubFirestore();
    };
  }, [router]);

  /* ---------------- LIVE BINANCE SOCKET ---------------- */
  useEffect(() => {
    if (!portfolioData?.portfolio) return;

    const coins = Object.keys(portfolioData.portfolio).map((c) =>
  c.toLowerCase()
);
    if (!coins.length) return;

    const streams = coins
      .map((c) => `${toSymbol(c).toLowerCase()}@ticker`)
      .join('/');

    const ws = new WebSocket(
      `wss://stream.binance.com:9443/stream?streams=${streams}`
    );

    ws.onmessage = (event) => {
      const json = JSON.parse(event.data);
      const data = json.data;

      const symbol = data.s;
      const price = parseFloat(data.c);

      const coin = coins.find((c) => c.toUpperCase() === symbol.replace('USDT', ''));
      if (!coin) return;

      setPriceMap((prev) => ({
        ...prev,
        [coin]: price,
      }));
    };

    return () => ws.close();
  }, [portfolioData]);

  /* ---------------- POSITIONS ---------------- */

const USD_INR = 83;

const positions = useMemo(() => {
  const data = portfolioData?.portfolio || {};

  return Object.entries(data).map(([coin, pos]) => {
    const livePriceUsd = priceMap[coin] || 0;

    const livePriceInr = livePriceUsd * USD_INR;

    const currentPrice = livePriceInr;

    const value = pos.qty * currentPrice;

    const invested = pos.qty * pos.avgPrice; // MUST be INR

    const pnl = value - invested;

    return {
      coin,
      qty: pos.qty,
      avgPrice: pos.avgPrice,
      currentPrice,
      value,
      pnl,
    };
  });
}, [portfolioData, priceMap]);

  /* ---------------- EQUITY ---------------- */
  const equity = useMemo(() => {
    if (!portfolioData) return 0;
    const holdings = positions.reduce((s, p) => s + p.value, 0);
    return portfolioData.balance + holdings;
  }, [portfolioData, positions]);

  /* ---------------- UPDATE EQUITY HISTORY ---------------- */
  useEffect(() => {
    if (!equity) return;

    setEquityHistory((prev) => {
      const updated = [...prev, equity].slice(-50);
      localStorage.setItem('equityHistory', JSON.stringify(updated));
      return updated;
    });
  }, [equity]);

  /* ---------------- FLASH ---------------- */
  useEffect(() => {
    if (!positions.length) return;

    const totalPnL = positions.reduce((s, p) => s + p.pnl, 0);
    setFlash(totalPnL >= 0 ? 'green' : 'red');

    const t = setTimeout(() => setFlash(null), 400);
    return () => clearTimeout(t);
  }, [positions]);

  /* ---------------- BEST / WORST ---------------- */
  const best = [...positions].sort((a, b) => b.pnl - a.pnl)[0];
  const worst = [...positions].sort((a, b) => a.pnl - b.pnl)[0];

  /* ---------------- AI INSIGHTS ---------------- */
  const aiInsights = useMemo(() => {
    if (!positions.length) return ["No positions yet"];

    const insights: string[] = [];

    if (positions.length === 1) insights.push("⚠️ Concentrated risk");
    if (positions.length > 3) insights.push("✅ Well diversified");
    if (positions.some((p) => p.pnl < 0)) insights.push("📉 Losing positions present");
    if (positions.some((p) => p.pnl > 0)) insights.push("💰 Consider booking profits");

    return insights;
  }, [positions]);

  /* ---------------- SELL ---------------- */
 const handleSell = async (coin: string, percent: number) => {
  if (!portfolioData || selling) return;

  const position = portfolioData.portfolio[coin];
  const livePriceUsd = priceMap[coin];


  if (!position || !livePriceUsd) {
  return toast.error("Price not ready");
    }

  setSelling(true);

    try {

  const qtyToSell =
    (position.qty * percent) / 100;

   const USD_INR = 83;

  const livePriceInr =
    livePriceUsd * USD_INR;

  const sellAmountInr =
    qtyToSell * livePriceInr;

  const newState = executeTrade({
    state: portfolioData,
    type: 'sell',
    coin,
    amount: sellAmountInr,
    qty: qtyToSell,
    price: livePriceInr,
  });


    setPortfolioData(newState);

    const user = auth.currentUser;
    if (!user) return;

   await setDoc(
  doc(db, 'portfolios', user.uid),
  {
    trades: newState.trades,
    balance: newState.balance,
    portfolio: newState.portfolio,
    activeOrders: newState.activeOrders,
    updatedAt: Date.now(),
  },
  { merge: true }
);

    setSellModal({
  type: 'sell',
  coin,
  amount: sellAmountInr,
  price: position.avgPrice,
  qty: qtyToSell,
});

    toast.success(`${coin.toUpperCase()} sold`);
  } finally {
    setSelling(false);
  }
};

  if (loading) return <div className="text-white p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">

      {/* HEADER */}
      <Card className="p-4 bg-neutral-900 flex justify-between">
        <div>
          <p className="text-xs text-gray-400">Net Worth</p>
          <p className={`text-2xl font-bold ${
            flash === 'green' ? 'text-green-400' :
            flash === 'red' ? 'text-red-400' : ''
          }`}>
            ₹{equity.toFixed(0)}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-400">Cash</p>
          <p>₹{portfolioData?.balance.toFixed(0)}</p>
        </div>
      </Card>

      {/* EQUITY CHART */}
      <Card className="p-4 bg-neutral-900">
        <p className="text-sm text-gray-400 mb-2">Equity Curve</p>
        <EquityChart data={equityHistory} />
      </Card>

      {/* AI */}
      <Card className="p-4 bg-neutral-900">
        <p className="text-sm text-gray-400 mb-2">🧠 AI Insights</p>
        {aiInsights.map((i, idx) => <p key={idx}>{i}</p>)}
      </Card>

      {/* POSITIONS */}
      {positions.map((p) => (
        <Card key={p.coin} className="p-4 bg-neutral-900">
          <div className="flex justify-between">
            <div>
              <p>
                {p.coin.toUpperCase()}
                {p.coin === best?.coin && " 🔥"}
                {p.coin === worst?.coin && " ⚠️"}
              </p>
              <p className="text-xs text-gray-400">
                Qty: {p.qty.toFixed(4)}
              </p>
            </div>

            <div className="text-right">
              <p>₹{p.value.toFixed(0)}</p>
              <p className={p.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                ₹{p.pnl.toFixed(0)}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <Button disabled={selling} onClick={() => handleSell(p.coin, 25)} className="bg-red-500 text-xs">25%</Button>
            <Button disabled={selling} onClick={() => handleSell(p.coin, 50)} className="bg-red-600 text-xs">50%</Button>
            <Button disabled={selling} onClick={() => handleSell(p.coin, 100)} className="bg-yellow-600 text-xs">Exit</Button>
          </div>
        </Card>
      ))}

      {/* TRADE HISTORY */}
      <Card className="p-4 bg-neutral-900">
        <p className="text-sm text-gray-400 mb-3">Trade History</p>

        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {portfolioData?.trades.slice().reverse().map((t, i) => (
            <div key={i} className="flex justify-between text-xs border-b border-neutral-800 pb-1">
              <span className={t.type === 'buy' ? 'text-green-400' : 'text-red-400'}>
                {t.type.toUpperCase()}
              </span>
              <span>{t.coin.toUpperCase()}</span>
              <span>₹{t.amount.toFixed(0)}</span>
            </div>
          ))}
        </div>
      </Card>

      <TradeSuccessModal
        open={!!sellModal}
        trade={sellModal}
        onClose={() => setSellModal(null)}
      />

      <Button onClick={() => router.push('/trade')} className="bg-blue-600">
        Back to Trade
      </Button>

    </div>
  );
}