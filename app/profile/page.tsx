'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import Card from '../components/ui/card';
import Button from '../components/ui/button';

import { derivePortfolio } from '@/lib/exchangeEngine';

/* ---------------- TYPES ---------------- */
type Trade = {
  id: string;
  type: 'buy' | 'sell';
  coin: string;
  price: number;
  qty: number;
  amount: number;
  fee?: number;
  timestamp: number;
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [engineState, setEngineState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- AUTH + DATA ---------------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push('/');
        return;
      }

      setUser(u);

      const ref = doc(db, 'portfolios', u.uid);
      const snap = await getDoc(ref);

      const trades: Trade[] = snap.exists() ? snap.data().trades || [] : [];

      // 🔥 ENGINE REBUILD (same as trade page)
      const normalizedTrades = trades.map((t: any) => ({
  id: t.id ?? Date.now().toString(),
  type: t.type,
  coin: t.coin,
  price: t.price ?? 0,
  qty: t.qty ?? 0,
  amount: t.amount ?? 0,
  fee: t.fee ?? 0, // 🔥 CRITICAL FIX
  timestamp: t.timestamp ?? Date.now(),
}));

const state = derivePortfolio(normalizedTrades);

      setEngineState(state);
      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  if (loading || !engineState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading dashboard...
      </div>
    );
  }

  const { balance, portfolio, trades } = engineState;

  const totalTrades = trades.length;
  const totalVolume = trades.reduce((sum: number, t: Trade) => sum + t.amount, 0);

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-black text-white">

      <div className="p-6 space-y-6 max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">👤 Account Dashboard</h1>
            <p className="text-gray-400 text-sm">{user.email}</p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => router.push('/trade')}
              className="bg-blue-600"
            >
              Trade
            </Button>

            <Button
              onClick={() => router.push('/tools/portfolio')}
              className="bg-neutral-700"
            >
              Portfolio
            </Button>
          </div>
        </div>

        {/* ACCOUNT SUMMARY */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <Card className="p-4 bg-neutral-900 border border-neutral-800">
            <p className="text-gray-400 text-xs">Available Balance</p>
            <p className="text-lg font-semibold text-white">
              ₹{balance.toFixed(2)}
            </p>
          </Card>

          <Card className="p-4 bg-neutral-900 border border-neutral-800">
            <p className="text-gray-400 text-xs">Total Trades</p>
            <p className="text-lg font-semibold text-white">
              {totalTrades}
            </p>
          </Card>

          <Card className="p-4 bg-neutral-900 border border-neutral-800">
            <p className="text-gray-400 text-xs">Trade Volume</p>
            <p className="text-lg font-semibold text-white">
              ₹{totalVolume.toFixed(0)}
            </p>
          </Card>

          <Card className="p-4 bg-neutral-900 border border-neutral-800">
            <p className="text-gray-400 text-xs">Assets Held</p>
            <p className="text-lg font-semibold text-white">
              {Object.keys(portfolio).length}
            </p>
          </Card>

        </div>

        {/* PORTFOLIO SNAPSHOT */}
        <Card className="p-5 bg-[#020617] border border-neutral-800">
          <h2 className="text-lg font-semibold mb-4">💼 Holdings Snapshot</h2>

          {Object.keys(portfolio).length === 0 ? (
            <p className="text-gray-500 text-sm">No holdings yet</p>
          ) : (
            <div className="space-y-2">

              <div className="grid grid-cols-4 text-xs text-gray-500 px-2">
                <span>Asset</span>
                <span>Qty</span>
                <span>Avg Price</span>
                <span>Value</span>
              </div>

              {Object.entries(portfolio).map(([coin, pos]: any) => {
                const value = pos.qty * pos.avgPrice;

                return (
                  <div
                    key={coin}
                    className="grid grid-cols-4 text-sm px-2 py-2 border-b border-neutral-800"
                  >
                    <span className="text-white">{coin.toUpperCase()}</span>
                    <span>{pos.qty.toFixed(6)}</span>
                    <span>${pos.avgPrice.toFixed(2)}</span>
                    <span>₹{value.toFixed(2)}</span>
                  </div>
                );
              })}

            </div>
          )}
        </Card>

        {/* RECENT TRADES */}
        <Card className="p-5 bg-[#020617] border border-neutral-800">
          <h2 className="text-lg font-semibold mb-4">🧾 Recent Trades</h2>

          {trades.length === 0 ? (
            <p className="text-gray-500 text-sm">No trades yet</p>
          ) : (
            <div className="space-y-2">

              {trades.slice(-10).reverse().map((t: Trade, index: number) => (
              <div key={`${t.id}-${index}`}
              className="flex justify-between text-xs border-b border-neutral-800 py-2"
                >
                  <span className={t.type === 'buy' ? 'text-green-400' : 'text-red-400'}>
                    {t.type.toUpperCase()} {t.coin.toUpperCase()}
                  </span>

                  <span>₹{t.amount}</span>

                  <span className="text-gray-400">
                    {new Date(t.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}

            </div>
          )}
        </Card>

      </div>
    </div>
  );
}