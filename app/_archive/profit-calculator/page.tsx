'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import  Card  from '../../components/ui/card';
import  Button  from '../../components/ui/button';
import toast from 'react-hot-toast';

import { auth, db } from '@/lib/firebaseConfig';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default function ProfitCalculatorPage() {
  const router = useRouter();

  const [investment, setInvestment] = useState<number>(10000);
  const [buyPrice, setBuyPrice] = useState<number>(100);
  const [sellPrice, setSellPrice] = useState<number>(150);

  /* ---------------- LIVE MARKET DATA ---------------- */
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/coins/bitcoin'
        );
        const data = await res.json();

        setLivePrice(data.market_data.current_price.usd);
        setPriceChange(data.market_data.price_change_percentage_24h);
      } catch (err) {
        console.error('Market fetch error', err);
      }
    };

    fetchMarketData();
  }, []);

  /* ---------------- CALCULATIONS ---------------- */
  const quantity = buyPrice ? investment / buyPrice : 0;
  const profit = (sellPrice - buyPrice) * quantity;
  const profitPercent = buyPrice
    ? ((sellPrice - buyPrice) / buyPrice) * 100
    : 0;

  /* ---------------- AI ENGINE ---------------- */
  const getAIAnalysis = () => {
    if (!buyPrice || !sellPrice || !livePrice) return null;

    let score = 0;

    if (profitPercent > 25) score += 4;
    else if (profitPercent > 10) score += 3;
    else if (profitPercent > 5) score += 2;
    else score += 1;

    const riskRatio = sellPrice / buyPrice;
    if (riskRatio < 1.2) score += 3;
    else if (riskRatio < 1.5) score += 2;
    else score += 1;

    if (priceChange > 3) score += 3;
    else if (priceChange > 0) score += 2;
    else score += 1;

    const finalScore = Math.min(10, score);

    let action = 'WAIT';
    let color = 'text-red-400';
    let msg = 'Weak setup. Avoid entry.';
    let risk = 'High Risk';

    if (finalScore >= 8) {
      action = 'STRONG BUY';
      color = 'text-green-400';
      msg = 'High probability trade. Strong alignment.';
      risk = 'Low Risk';
    } else if (finalScore >= 5) {
      action = 'CONSIDER';
      color = 'text-yellow-400';
      msg = 'Decent setup. Wait for confirmation.';
      risk = 'Moderate Risk';
    }

    return { action, color, msg, risk, score: finalScore };
  };

  const ai = getAIAnalysis();

  /* ---------------- SAVE STRATEGY (HYBRID) ---------------- */
  const handleSaveStrategy = async () => {
    const strategy = {
      investment,
      buyPrice,
      sellPrice,
      profit,
      profitPercent,
      createdAt: new Date().toISOString(),
    };

    try {
      const user = auth.currentUser;

      /* -------- FIREBASE SAVE (if available) -------- */
      if (user) {
        try {
          await addDoc(collection(db, 'strategies'), {
            userId: user.uid,
            ...strategy,
            createdAt: serverTimestamp(),
          });
          console.log('Saved to Firebase');
        } catch (err) {
          console.warn('Firebase not enabled yet');
        }
      }

      /* -------- LOCAL SAVE (ALWAYS WORKS) -------- */
      const existing = JSON.parse(localStorage.getItem('strategies') || '[]');

      localStorage.setItem(
        'strategies',
        JSON.stringify([strategy, ...existing])
      );

      toast.success('Strategy saved 🚀');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save strategy');
    }
  };

  /* ---------------- GO TO TRADE ---------------- */
  const handleTryStrategy = () => {
    const params = new URLSearchParams({
      investment: investment.toString(),
      buy: buyPrice.toString(),
      sell: sellPrice.toString(),
    });

    router.push(`/trade?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-2xl font-bold mb-2">
        Bitcoin & Crypto Profit Calculator India
      </h1>

      <p className="text-sm text-gray-400 mb-6">
        Calculate crypto profits instantly.
      </p>

      {/* INPUTS */}
      <div className="grid md:grid-cols-3 gap-4">

        <Card className="p-4 bg-neutral-900">
          <label className="text-sm text-gray-400">Investment (₹)</label>
          <input
            type="number"
            value={investment}
            onChange={(e) => setInvestment(Number(e.target.value))}
            className="w-full mt-2 p-2 bg-black border border-gray-700 rounded"
          />
        </Card>

        <Card className="p-4 bg-neutral-900">
          <label className="text-sm text-gray-400">Buy Price</label>
          <input
            type="number"
            value={buyPrice}
            onChange={(e) => setBuyPrice(Number(e.target.value))}
            className="w-full mt-2 p-2 bg-black border border-gray-700 rounded"
          />
        </Card>

        <Card className="p-4 bg-neutral-900">
          <label className="text-sm text-gray-400">Sell Price</label>
          <input
            type="number"
            value={sellPrice}
            onChange={(e) => setSellPrice(Number(e.target.value))}
            className="w-full mt-2 p-2 bg-black border border-gray-700 rounded"
          />
        </Card>

      </div>

      {/* RESULTS */}
      <Card className="mt-6 p-6 bg-neutral-900">

        <h2 className="text-lg font-semibold mb-4">Results</h2>

        <p>Quantity: <b>{quantity.toFixed(4)}</b></p>

        <p>
          Profit:{' '}
          <b className={profit >= 0 ? 'text-green-400' : 'text-red-400'}>
            ₹{profit.toFixed(2)}
          </b>
        </p>

        <p>Return: <b>{profitPercent.toFixed(2)}%</b></p>

        {/* AI */}
        {ai && (
          <div className="mt-6 p-4 bg-[#111] rounded-lg border border-neutral-800">
            <p className={`text-lg font-bold ${ai.color}`}>
              {ai.action} ({ai.score}/10)
            </p>
            <p>{ai.msg}</p>
            <p className="text-xs text-gray-500">Risk: {ai.risk}</p>
          </div>
        )}

        {/* BUTTONS */}
        <div className="mt-6 space-y-3">

          <Button onClick={handleTryStrategy} className="bg-green-600 w-full">
            Try Strategy →
          </Button>

          <Button
            onClick={() => router.push('/tools/strategy-history')}
            className="bg-purple-600 w-full"
          >
            View Strategies
          </Button>

          <Button
            onClick={handleSaveStrategy}
            className="bg-blue-600 w-full"
          >
            Save Strategy 📌
          </Button>

        </div>

      </Card>
    </div>
  );
}