'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import  Card  from '../../components/ui/card';
import  Button  from '../../components/ui/button';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '../../components/ui/tabs';

import { auth, db } from '@/lib/firebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

/* ---------------- TYPES ---------------- */
type Strategy = {
  id?: string;
  investment: number;
  buyPrice: number;
  sellPrice: number;
  profit: number;
  profitPercent: number;
  createdAt?: any;
};

/* ---------------- PAGE ---------------- */
export default function StrategyHistoryPage() {
  const router = useRouter();

  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- LOCAL ---------------- */
  const fetchLocal = () => {
    const local = JSON.parse(localStorage.getItem('strategies') || '[]');
    return local.map((s: any) => ({
      ...s,
      createdAt: s.createdAt || new Date().toISOString(),
    }));
  };

  /* ---------------- FIREBASE ---------------- */
  const fetchFirebase = async (uid: string) => {
    try {
      const q = query(
        collection(db, 'strategies'),
        where('userId', '==', uid)
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Strategy[];
    } catch (err) {
      console.warn('Firebase not enabled yet');
      return [];
    }
  };

  /* ---------------- LOAD ---------------- */
  const loadStrategies = async (uid?: string) => {
    setLoading(true);

    const localData = fetchLocal();
    let firebaseData: Strategy[] = [];

    if (uid) {
      firebaseData = await fetchFirebase(uid);
    }

    const merged = [...firebaseData, ...localData];

    merged.sort((a, b) => {
      const aTime =
        a.createdAt?.seconds || new Date(a.createdAt).getTime();
      const bTime =
        b.createdAt?.seconds || new Date(b.createdAt).getTime();
      return bTime - aTime;
    });

    setStrategies(merged);
    setLoading(false);
  };

  /* ---------------- AUTH ---------------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      loadStrategies(user?.uid);
    });

    return () => unsub();
  }, []);

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (s: Strategy, index: number) => {
    try {
      if (s.id) {
        await deleteDoc(doc(db, 'strategies', s.id));
      }

      const local = JSON.parse(localStorage.getItem('strategies') || '[]');
      local.splice(index, 1);
      localStorage.setItem('strategies', JSON.stringify(local));

      loadStrategies(auth.currentUser?.uid);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- REUSE ---------------- */
  const handleReuse = (s: Strategy) => {
    const params = new URLSearchParams({
      investment: s.investment.toString(),
      buy: s.buyPrice.toString(),
      sell: s.sellPrice.toString(),
    });

    router.push(`/tools/profit-calculator?${params.toString()}`);
  };

  /* ---------------- AI SCORE ---------------- */
  const getAIScore = (s: Strategy) => {
    let score = 0;

    if (s.profitPercent > 25) score += 4;
    else if (s.profitPercent > 10) score += 3;
    else if (s.profitPercent > 5) score += 2;
    else score += 1;

    const ratio = s.sellPrice / s.buyPrice;

    if (ratio < 1.2) score += 3;
    else if (ratio < 1.5) score += 2;
    else score += 1;

    if (s.profitPercent > 15) score += 3;
    else if (s.profitPercent > 5) score += 2;
    else score += 1;

    return Math.min(10, score);
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return { label: 'Excellent', color: 'text-green-400' };
    if (score >= 5) return { label: 'Good', color: 'text-yellow-400' };
    return { label: 'Risky', color: 'text-red-400' };
  };

  /* ---------------- AI COACH ---------------- */
  const getAIInsight = (s: Strategy) => {
    const reasons: string[] = [];
    const suggestions: string[] = [];

    const rr = s.sellPrice / s.buyPrice;

    if (s.profitPercent > 20) reasons.push('Strong profit potential');
    else if (s.profitPercent > 10) reasons.push('Decent return setup');
    else {
      reasons.push('Low profit margin');
      suggestions.push('Increase target or avoid low RR trades');
    }

    if (rr < 1.2) reasons.push('Tight risk-reward (safe)');
    else if (rr < 1.5) reasons.push('Moderate risk-reward');
    else {
      reasons.push('High risk setup');
      suggestions.push('Reduce gap between buy & sell');
    }

    if (s.profit < 0) {
      reasons.push('Potential loss trade');
      suggestions.push('Avoid entering weak setups');
    }

    const confidence =
      s.profitPercent > 20 ? 'High' :
      s.profitPercent > 10 ? 'Medium' :
      'Low';

    return { reasons, suggestions, confidence };
  };

  /* ---------------- STATS ---------------- */
  const total = strategies.length;

  const avgReturn =
    total === 0
      ? 0
      : strategies.reduce((a, b) => a + b.profitPercent, 0) / total;

  const winRate =
    total === 0
      ? 0
      : (strategies.filter((s) => s.profit > 0).length / total) * 100;

  const best =
    total === 0
      ? 0
      : Math.max(...strategies.map((s) => s.profitPercent));

  const worst =
    total === 0
      ? 0
      : Math.min(...strategies.map((s) => s.profitPercent));

  const sortedBest = [...strategies].sort(
    (a, b) => b.profitPercent - a.profitPercent
  );

  const sortedWorst = [...strategies].sort(
    (a, b) => a.profitPercent - b.profitPercent
  );

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading strategies...
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-neutral-950 text-white p-6 space-y-6">

      <h1 className="text-2xl font-bold">
        📊 Strategy Intelligence Dashboard
      </h1>

      {/* STATS */}
      <div className="grid md:grid-cols-5 gap-4">
        <StatCard title="Total" value={total} />
        <StatCard title="Win Rate" value={`${winRate.toFixed(1)}%`} />
        <StatCard title="Avg Return" value={`${avgReturn.toFixed(2)}%`} />
        <StatCard title="Best" value={`${best.toFixed(2)}%`} green />
        <StatCard title="Worst" value={`${worst.toFixed(2)}%`} red />
      </div>

      {/* TABS */}
      <Tabs defaultValue="recent">

        <TabsList>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="best">Best</TabsTrigger>
          <TabsTrigger value="worst">Worst</TabsTrigger>
        </TabsList>

        <TabsContent value="recent">
          <StrategyList data={strategies} {...{
            handleDelete,
            handleReuse,
            getAIScore,
            getScoreLabel,
            getAIInsight
          }} />
        </TabsContent>

        <TabsContent value="best">
          <StrategyList data={sortedBest} {...{
            handleDelete,
            handleReuse,
            getAIScore,
            getScoreLabel,
            getAIInsight
          }} />
        </TabsContent>

        <TabsContent value="worst">
          <StrategyList data={sortedWorst} {...{
            handleDelete,
            handleReuse,
            getAIScore,
            getScoreLabel,
            getAIInsight
          }} />
        </TabsContent>

      </Tabs>

    </div>
  );
}

/* ---------------- STAT CARD ---------------- */
function StatCard({ title, value, green, red }: any) {
  return (
    <Card className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
      <p className="text-gray-400 text-sm">{title}</p>
      <h2 className={`text-xl font-bold ${green ? 'text-green-400' : red ? 'text-red-400' : ''}`}>
        {value}
      </h2>
    </Card>
  );
}

/* ---------------- LIST ---------------- */
function StrategyList({
  data,
  handleDelete,
  handleReuse,
  getAIScore,
  getScoreLabel,
  getAIInsight,
}: any) {
  return (
    <div className="space-y-4 mt-4">
      {data.map((s: Strategy, i: number) => {
        const score = getAIScore(s);
        const meta = getScoreLabel(score);
        const ai = getAIInsight(s);

        const date =
          s.createdAt?.toDate?.()?.toLocaleString?.() ||
          new Date(s.createdAt).toLocaleString();

        return (
          <Card key={i} className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-neutral-600 transition">

            <div className="flex justify-between">

              <div className="text-sm space-y-2">

                <p className="font-semibold">
                  ₹{s.investment} | Buy {s.buyPrice} → Sell {s.sellPrice}
                </p>

                <p className={s.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                  ₹{s.profit.toFixed(2)} ({s.profitPercent.toFixed(2)}%)
                </p>

                <p className={`text-xs ${meta.color}`}>
                  🧠 {score}/10 ({meta.label})
                </p>

                {/* AI COACH */}
                <div className="mt-2 p-3 bg-black/40 rounded border border-neutral-800 text-xs space-y-1">
                  <p className="text-gray-400">🤖 AI Coach</p>
                  <p>Confidence: <b>{ai.confidence}</b></p>

                  {ai.reasons.map((r: string, idx: number) => (
                    <p key={idx}>✔ {r}</p>
                  ))}

                  {ai.suggestions.length > 0 && (
                    <>
                      <p className="text-yellow-400 mt-1">Suggestions:</p>
                      {ai.suggestions.map((sug: string, idx: number) => (
                        <p key={idx}>→ {sug}</p>
                      ))}
                    </>
                  )}
                </div>

                <p className="text-xs text-gray-500">{date}</p>
              </div>

              <div className="flex flex-col gap-2">
                <Button onClick={() => handleReuse(s)} className="bg-green-600">
                  Reuse
                </Button>

                <Button onClick={() => handleDelete(s, i)} className="bg-red-600">
                  Delete
                </Button>
              </div>

            </div>

          </Card>
        );
      })}
    </div>
  );
}