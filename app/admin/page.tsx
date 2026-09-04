'use client';

import { useEffect, useMemo, useState } from 'react';
import { db } from '@/lib/firebaseConfig';

import { auth } from '@/lib/firebaseConfig';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {collection,onSnapshot,query,orderBy,limit} from 'firebase/firestore';
import { useRouter } from 'next/navigation';

type User = {
  uid?: string;
  email?: string;
  name?: string;
  photo?: string;

  createdAt?: number;
  lastLogin?: number;
  lastActive?: number;

  isActive?: boolean;

  totalTrades?: number;
  totalVolume?: number;
  aiTrades?: number;

  device?: string;
  language?: string;
  timezone?: string;
  platform?: string;
};

type Event = {
  uid: string;

  type: 'TRADE' | 'PAGE_VIEW' | 'LOGIN' | 'AI_EXECUTED';

  action?: 'BUY' | 'SELL';

  coin?: string;

  amount?: number;

  qty?: number;

  orderType?: string;

  price?: number;

  timestamp: number;

  device?: string;
  platform?: string;
};

type PremiumRequest = {
  id?: string;
  uid?: string;
  email?: string;
  name?: string;
  source?: string;
  status?: string;
  createdAt?: any;
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
 const [tab, setTab] = useState<
  'dashboard' | 'users' | 'premium' | 'trades'
>('dashboard');

const [selectedUser, setSelectedUser] = useState<string | null>(null);
  
  const router = useRouter();

  const [premiumRequests, setPremiumRequests] =
  useState<PremiumRequest[]>([]);

  const [currentUser, setCurrentUser] =
  useState<FirebaseUser | null>(null);

    const [loadingAuth, setLoadingAuth] =
  useState(true);

  const ADMIN_EMAIL = 'abhiii31@gmail.com';

    const approvePremium = async (
    uid: string,
    requestId: string
  ) => {
    try {
      if (!currentUser) {
        alert("You are not authenticated.");
        return;
      }

      const idToken = await currentUser.getIdToken();

      const response = await fetch("/api/admin/premium", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          uid,
          requestId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to approve Premium"
        );
      }

      alert("Premium access granted successfully.");
    } catch (error) {
      console.error("Premium approval failed:", error);
      alert("Failed to approve Premium access.");
    }
  };

  useEffect(() => {
  const unsub = onAuthStateChanged(auth, (user) => {
    setCurrentUser(user);
    setLoadingAuth(false);
  });

  return () => unsub();
}, []);


 /* ---------------- USERS (LIVE) ---------------- */
useEffect(() => {
  if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
    setUsers([]);
    return;
  }

  const unsub = onSnapshot(
    collection(db, 'users'),
    (snap) => {
      setUsers(
  snap.docs.map((d) => ({
    uid: d.id,
    ...(d.data() as User),
  }))
);
    },
    (error) => {
      console.error('Users Listener:', error);
    }
  );

  return () => unsub();
}, [currentUser]);


/* ---------------- EVENTS (LIVE) ---------------- */
useEffect(() => {
  if (!currentUser) {
    setEvents([]);
    return;
  }

  const q = query(
    collection(db, 'events'),
    orderBy('timestamp', 'desc'),
    limit(50)
  );

  const unsub = onSnapshot(
    q,
    (snap) => {
      const data = snap.docs.map(
        (d) => d.data() as Event
      );

      setEvents(data);
    },
    (error) => {
      console.error('Events Listener:', error);
    }
  );

  return () => unsub();
}, [currentUser]);


  /* ---------------- TIME WINDOWS ---------------- */
  const [now, setNow] = useState(Date.now());

   useEffect(() => {
  const interval = setInterval(() => {
    setNow(Date.now());
  }, 30000);

  return () => clearInterval(interval);
}, []);

  useEffect(() => {
  if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
    setPremiumRequests([]);
    return;
  }

  const unsub = onSnapshot(
    collection(db, "premium_requests"),
    (snap) => {
      setPremiumRequests(
        snap.docs.map((d) => ({
  id: d.id,
  ...d.data(),
})) as PremiumRequest[]
      );
    }
  );

  return () => unsub();
}, [currentUser]);

  const activeUsers = useMemo(() => {
  return users.filter(
    (u) => (u.lastActive || 0) > now - 15 * 60 * 1000
  );
}, [users, now]);

  const activeTraders = useMemo(() => {
    const recent = events.filter(
  (e) => e.type === 'TRADE' && e.timestamp > now - 2 * 60 * 1000
    );

    return new Set(recent.map((e) => e.uid)).size;
  }, [events, now]);

  const totalTrades = useMemo(() => {
    return events.filter((e) => e.type === 'TRADE').length;
  }, [events]);

  const userTradeStats = useMemo(() => {
  const map: Record<string, number> = {};

  events.forEach((e) => {
    if (e.type !== 'TRADE') return;
    map[e.uid] = (map[e.uid] || 0) + 1;
  });

  return map;
}, [events]);

const returningUsers = useMemo(() => {
  return Object.values(userTradeStats).filter((count) => count > 1).length;
}, [userTradeStats]);

const aiTrades = useMemo(() => {
  return events.filter((e) => e.type === "AI_EXECUTED").length;
}, [events]);



    const avgTradesPerUser =
  users.length > 0
    ? totalTrades / users.length
    : 0;


  const totalVolume = useMemo(() => {
  return events
    .filter((e) => e.type === 'TRADE')
    .reduce((sum, e) => sum + (e.amount || 0), 0);
}, [events]);

 const coinStats = useMemo(() => {
  const map: Record<string, number> = {};

  events.forEach((e) => {
    if (!e.coin) return;
    map[e.coin] = (map[e.coin] || 0) + (e.amount || 0);
  });

  return map;
}, [events]);

const topCoin = useMemo(() => {
  return Object.entries(coinStats).sort((a, b) => b[1] - a[1])[0];
}, [coinStats]);

const topCoins = useMemo(() => {
  return Object.entries(coinStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
}, [coinStats]);


const userAnalytics = useMemo(() => {
  const map: Record<string, {
    trades: number;
    buys: number;
    sells: number;
    ai: number;
    volume: number;
    lastActive: number;
  }> = {};

  events.forEach((e) => {
    if (!e.uid) return;

    if (!map[e.uid]) {
      map[e.uid] = {
        trades: 0,
        buys: 0,
        sells: 0,
        ai: 0,
        volume: 0,
        lastActive: 0,
      };
    }

    const user = map[e.uid];

    if (e.type === "TRADE") {
      user.trades += 1;
      user.volume += e.amount || 0;

      if (e.action === "BUY") user.buys += 1;
      if (e.action === "SELL") user.sells += 1;
    }

    if (e.type === "AI_EXECUTED") {
      user.ai += 1;
    }

    if (e.timestamp > user.lastActive) {
      user.lastActive = e.timestamp;
    }
  });

  return map;
}, [events]);

  const userMap = useMemo(() => {
  const map: Record<string, string> = {};

  users.forEach((u) => {
    if (u.uid && u.email) {
      map[u.uid] = u.email;
    }
  });

  return map;
}, [users]);

  const aiExecutedTrades = useMemo(() => {
  return events.filter((e) => e.type === "AI_EXECUTED");
}, [events]);


  useEffect(() => {
  if (!loadingAuth && currentUser?.email !== ADMIN_EMAIL) {
    router.push('/');
  }
}, [currentUser, loadingAuth, router]);

if (loadingAuth) {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      Loading...
    </div>
  );
}


if (currentUser?.email !== ADMIN_EMAIL) {
  return null;
}

  /* ---------------- UI ---------------- */
 return (
  <div className="min-h-screen bg-black text-white p-6 space-y-6">

    {/* HEADER */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

      <h1 className="text-2xl font-bold">
        Admin Dashboard
      </h1>

      {/* TABS */}
      <div className="flex gap-2">

        <button
          onClick={() => setTab('dashboard')}
          className={`px-4 py-2 rounded text-sm ${
            tab === 'dashboard'
              ? 'bg-blue-600 text-white'
              : 'bg-neutral-900 text-gray-400'
          }`}
        >
          Dashboard
        </button>

        <button
          onClick={() => setTab('users')}
          className={`px-4 py-2 rounded text-sm ${
            tab === 'users'
              ? 'bg-blue-600 text-white'
              : 'bg-neutral-900 text-gray-400'
          }`}
        >
          Users
        </button>

        <button
              onClick={() => setTab('premium')}
              className={`px-4 py-2 rounded text-sm ${
              tab === 'premium'
              ? 'bg-purple-600 text-white'
              : 'bg-neutral-900 text-gray-400'
            }`}
          >
            Premium Requests
          </button>

          <button
              onClick={() => setTab('trades')}
              className={`px-4 py-2 rounded text-sm ${
              tab === 'trades'
              ? 'bg-green-600 text-white'
              : 'bg-neutral-900 text-gray-400'
            }`}
          >
            User Trades
          </button>

      </div>

    </div>

    {/* DASHBOARD TAB */}
    {tab === 'dashboard' && (
      <>

        {/* METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          <div className="bg-neutral-900 p-4 rounded">
            <p className="text-gray-400 text-xs">Total Users</p>
            <p className="text-xl font-bold">{users.length}</p>
          </div>

          <div className="bg-neutral-900 p-4 rounded">
            <p className="text-gray-400 text-xs">Active Users (15m)</p>
            <p className="text-xl font-bold text-green-400">
              {activeUsers.length}
            </p>
          </div>

          <div className="bg-neutral-900 p-4 rounded">
            <p className="text-gray-400 text-xs">Active Traders (2m)</p>
            <p className="text-xl font-bold text-blue-400">
              {activeTraders}
            </p>
          </div>

          <div className="bg-neutral-900 p-4 rounded">
            <p className="text-gray-400 text-xs">Total Trades</p>
            <p className="text-xl font-bold">{totalTrades}</p>
          </div>

        </div>

        {/* SECOND ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="bg-neutral-900 p-4 rounded">
            <p className="text-gray-400 text-xs">Total Volume</p>
            <p className="text-2xl font-bold text-green-400">
              ₹{totalVolume.toFixed(0)}
            </p>
          </div>

          <div className="bg-neutral-900 p-4 rounded">
            <p className="text-gray-400 text-xs">Live Events</p>
            <p className="text-2xl font-bold text-purple-400">
              {events.length}
            </p>
          </div>

        </div>

        {/* EXTRA STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          <div className="bg-neutral-900 p-4 rounded">
            <p className="text-gray-400 text-xs">
              Returning Users
            </p>

            <p className="text-xl font-bold text-yellow-400">
              {returningUsers}
            </p>
          </div>

          <div className="bg-neutral-900 p-4 rounded">
            <p className="text-gray-400 text-xs">
              Avg Trades/User
            </p>

            <p className="text-xl font-bold text-cyan-400">
              {avgTradesPerUser.toFixed(1)}
            </p>
          </div>


          <div className="bg-neutral-900 p-4 rounded">
            <p className="text-gray-400 text-xs">
              Most Traded Coin
            </p>

            <p className="text-xl font-bold text-orange-400">
              {topCoin?.[0]?.toUpperCase() || 'N/A'}
            </p>
          </div>

        </div>

        {/* LIVE FEED */}
        <div className="bg-neutral-900 p-4 rounded">

          <h2 className="text-sm text-gray-400 mb-3">
            🔴 Live Trading Feed
          </h2>

          <div className="space-y-2 max-h-[350px] overflow-y-auto">

           {events.map((e, i) => {
              const action =
              e.action ||
              (e.type === "AI_EXECUTED"
                ? "AI"
                : e.type === "LOGIN"
                ? "LOGIN"
                : e.type === "TRADE"
                ? "TRADE"
                : e.type);

            return (
              <div
                  key={i}
                  className="flex justify-between text-xs border-b border-white/5 py-2"
                >
                <span
                   className={
                      action === "BUY"
                        ? "text-green-400"
                        : action === "SELL"
                        ? "text-red-400"
                        : action === "TRADE"
                        ? "text-blue-400"
                        : "text-gray-400"
                      }
                      >
                      {action}
                </span>

                <span className="text-white">{e.coin || "-"}</span>

                  <span className="text-gray-300">
                     ₹{(e.amount || 0).toFixed(0)}
                  </span>

                  <span className="text-gray-500">
                    {new Date(e.timestamp).toLocaleTimeString()}
                    </span>
            </div>
            );
            })}

          </div>

          <div className="bg-neutral-900 p-4 rounded">

  <h2 className="text-sm text-gray-400 mb-3">
    🧠 Event Type Distribution
  </h2>

  {Object.entries(
    events.reduce((acc: Record<string, number>, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {})
  ).map(([type, count]) => (
    <div
      key={type}
      className="flex justify-between text-xs py-1 border-b border-white/5"
    >
      <span className="text-gray-400">{type}</span>
      <span className="text-white">{count}</span>
    </div>
  ))}

</div>
        </div>

        {/* TOP COINS */}
        <div className="bg-neutral-900 p-4 rounded">

          <h2 className="text-sm text-gray-400 mb-3">
            🔥 Top Traded Coins
          </h2>

          <div className="space-y-2">

            {topCoins.map(([coin, volume]) => (
              <div
                key={coin}
                className="flex justify-between text-sm border-b border-white/5 pb-2"
              >
                <span className="text-white">
                  {coin.toUpperCase()}
                </span>

                <span className="text-green-400">
                  ₹{Number(volume || 0).toFixed(0)}
                </span>
              </div>
            ))}

          </div>
        </div>

</>
)}

    {selectedUser && userAnalytics[selectedUser] && (
  <div className="mb-4 p-4 rounded bg-black/40 border border-white/10">

    <div className="flex justify-between items-center mb-3">
      <h3 className="text-white font-semibold">
        User Intelligence
      </h3>

      <button
        onClick={() => setSelectedUser(null)}
        className="text-xs text-gray-400 hover:text-white"
      >
        Close
      </button>
    </div>

    <div className="grid grid-cols-2 gap-3 text-xs">

      <div className="p-2 bg-white/5 rounded">
        Trades: <span className="text-white">{userAnalytics[selectedUser].trades}</span>
      </div>

      <div className="p-2 bg-white/5 rounded">
        Volume: <span className="text-green-400">
          ₹{userAnalytics[selectedUser].volume.toFixed(0)}
        </span>
      </div>

      <div className="p-2 bg-white/5 rounded">
        BUYs: <span className="text-green-400">{userAnalytics[selectedUser].buys}</span>
      </div>

      <div className="p-2 bg-white/5 rounded">
        SELLs: <span className="text-red-400">{userAnalytics[selectedUser].sells}</span>
      </div>

      <div className="p-2 bg-white/5 rounded col-span-2">
        AI Usage: <span className="text-blue-400">{userAnalytics[selectedUser].ai}</span>
      </div>

      <div className="p-2 bg-white/5 rounded col-span-2">
        Last Active:{" "}
        <span className="text-white">
          {new Date(userAnalytics[selectedUser].lastActive).toLocaleString()}
        </span>
      </div>

    </div>

  </div>
)}

    {/* USERS TAB */}
    {tab === 'users' && (
      <div className="bg-neutral-900 p-4 rounded">

        <h2 className="text-sm text-gray-400 mb-3">
          👥 Users
        </h2>

        <div className="space-y-3 max-h-[700px] overflow-y-auto">

         {users.map((u, i) => (
  <div
    key={i}
    onClick={() => setSelectedUser(u.uid || null)}
    className="border border-white/5 rounded p-3 text-xs cursor-pointer hover:bg-white/5 transition"
  >
    <div className="flex items-center gap-3">
      {u.photo && (
        <img
          src={u.photo}
          className="w-10 h-10 rounded-full"
        />
      )}

      <div>
        <p className="text-white font-medium">
          {u.name || 'Unknown'}
        </p>
        <p className="text-gray-400">
          {u.email || 'No Email'}
        </p>
      </div>
    </div>
  </div>
))}
          

        </div>
      </div>
    )}

    {/* PREMIUM REQUESTS TAB */}
{tab === 'premium' && (
  <div className="bg-neutral-900 p-4 rounded">

    <div className="flex items-center justify-between mb-4">

      <h2 className="text-sm text-gray-400">
        👑 Premium Upgrade Requests
      </h2>

      <div className="text-xs text-purple-400">
        {premiumRequests.length} Requests
      </div>

    </div>

    <div className="space-y-3 max-h-[700px] overflow-y-auto">

      {premiumRequests.map((req, i) => (
        <div
          key={i}
          className="
            border border-white/5 rounded-lg
            p-4 bg-black/20
          "
        >

          <div className="flex items-center justify-between">

            <div>
              <div className="text-white font-medium">
                {req.email}
              </div>

              <div className="text-xs text-gray-500 mt-1">
                Source: {req.source}
              </div>
            </div>

            <div className="flex items-center gap-2">
  <div className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
    {req.status || "pending"}
  </div>

  {(!req.status || req.status === "pending") &&
    req.uid &&
    req.id && (
      <button
        onClick={() =>
          approvePremium(req.uid!, req.id!)
        }
        className="text-xs px-3 py-1 rounded-md bg-green-500/20 text-green-300 hover:bg-green-500/30 transition"
      >
        Approve
      </button>
    )}
</div>

          </div>

        </div>
      ))}

    </div>

  </div>
)}

{tab === 'trades' && (
  <div className="bg-neutral-900 p-4 rounded">

    <h2 className="text-sm text-gray-400 mb-3">
      📊 Trades per User
    </h2>

    <div className="space-y-2 max-h-[700px] overflow-y-auto">

      {Object.entries(userTradeStats)
        .sort((a, b) => b[1] - a[1])
        .map(([uid, count]) => (
          <div
            key={uid}
            className="flex justify-between text-sm border-b border-white/5 py-2"
          >
            <span className="text-gray-400">
              {userMap[uid] || uid}
            </span>

            <span className="text-white font-semibold">
              {count}
            </span>
          </div>
        ))}

    </div>

  </div>
)}

  </div>
);}


