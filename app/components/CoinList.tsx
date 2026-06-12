'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { getExchangeUniverse } from '@/lib/binance/exchangeUniverse';

interface Coin {
  symbol: string;
  base: string;
  name: string;
  price: number;
  change: number;
}


const COIN_META: Record<string, { name: string }> = {
  BTC: { name: 'Bitcoin' },
  ETH: { name: 'Ethereum' },
  SOL: { name: 'Solana' },
  BNB: { name: 'BNB' },
  XRP: { name: 'Ripple' },
  ADA: { name: 'Cardano' },
  DOGE: { name: 'Dogecoin' },
  DOT: { name: 'Polkadot' },
  AVAX: { name: 'Avalanche' },
  MATIC: { name: 'Polygon' },

};

type Props = {
  selectedCoin: string;
  onSelectCoin: (coin: { symbol: string; name: string }) => void;
};

export default function CoinList({ selectedCoin, onSelectCoin }: Props) {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sort, setSort] = useState<'all' | 'gainers' | 'losers'>('all');
  const [prevPrices, setPrevPrices] = useState<Record<string, number>>({});

  /* ---------------- LOAD FAVORITES ---------------- */
  useEffect(() => {
    const saved = localStorage.getItem('favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const toggleFav = (symbol: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(symbol);
      const updated = exists
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol];

      localStorage.setItem('favorites', JSON.stringify(updated));
      return updated;
    });
  };

  /* ---------------- FETCH BINANCE DATA ---------------- */
 useEffect(() => {
  const fetchData = async () => {
    try {
      const universe = await getExchangeUniverse();

      const res = await fetch(
  '/api/market/tickers'
);

      const data = await res.json();

      const formatted: Coin[] = data
        .filter((d: any) => universe.has(d.symbol)) // 🔥 KEY FIX
        .map((d: any) => {
          const base = d.symbol.replace('USDT', '');

          return {
            symbol: d.symbol,
            base,
            name: COIN_META[base]?.name || base,
            price: parseFloat(d.lastPrice),
            change: parseFloat(d.priceChangePercent),
          };
        });

      setCoins(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  fetchData();
  const interval = setInterval(fetchData, 10000);

  return () => clearInterval(interval);
}, []);

  /* ---------------- FILTER + SORT ---------------- */
  const filtered = useMemo(() => {
    let list = coins.filter((c) =>
      c.symbol.toLowerCase().includes(search.toLowerCase())
    );

    if (sort === 'gainers') {
      list = [...list].sort((a, b) => b.change - a.change);
    }

    if (sort === 'losers') {
      list = [...list].sort((a, b) => a.change - b.change);
    }

    return list;
  }, [coins, search, sort]);

  /* ---------------- HELPERS ---------------- */
  const getLogo = (symbol: string) => {
    const base = symbol.replace('USDT', '').toLowerCase();
    return `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${base}.png`;
  };

  const handleImgError = (e: any) => {
    e.currentTarget.src =
      'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/generic.png';
  };

  return (
    <div className="h-full flex flex-col bg-[#0b0f19] text-white border-r border-white/10">

      {/* HEADER */}
      <div className="p-3 border-b border-white/10">
        <div className="text-sm font-semibold mb-2">Markets</div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search BTC, ETH..."
          className="w-full px-3 py-2 text-xs bg-black/40 rounded border border-white/10"
        />

        {/* TABS */}
        <div className="flex gap-2 mt-2 text-[11px]">
          <button onClick={() => setSort('all')} className="px-2 py-1 bg-white/10 rounded">
            All
          </button>
          <button onClick={() => setSort('gainers')} className="px-2 py-1 bg-green-500/20 text-green-400 rounded">
            Gainers
          </button>
          <button onClick={() => setSort('losers')} className="px-2 py-1 bg-red-500/20 text-red-400 rounded">
            Losers
          </button>
        </div>
      </div>

      {/* FAVORITES */}
      {favorites.length > 0 && (
        <div className="p-2 border-b border-white/10">
          <div className="text-[11px] text-gray-400 mb-2">Favorites</div>

          {coins
            .filter((c) => favorites.includes(c.symbol))
            .map((coin) => (
              <div
                key={coin.symbol}
               onClick={() =>
  onSelectCoin({
    symbol: coin.symbol,
    name: coin.name,
  })
}
                className="flex justify-between text-xs p-2 hover:bg-white/5 cursor-pointer"
              >
                <span>{coin.base}</span>
                <span className="text-green-400">
                  {coin.change.toFixed(2)}%
                </span>
              </div>
            ))}
        </div>
      )}

      {/* LIST */}
      <div className="flex-1 overflow-y-auto">

        {filtered.map((coin) => {
          const isActive = selectedCoin === coin.symbol;
          const prev = prevPrices[coin.symbol] || 0;

          return (
            <div
              key={coin.symbol}
             onClick={() =>
  onSelectCoin({
    symbol: coin.symbol,
    name: coin.name,
  })
}
              className={`group flex items-center justify-between px-3 py-2 cursor-pointer transition hover:bg-white/5 ${
                isActive ? 'bg-white/5 border-l-2 border-blue-500' : ''
              }`}
            >

              {/* LEFT */}
              <div className="flex items-center gap-2">

                {/* STAR */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFav(coin.symbol);
                  }}
                  className="text-xs opacity-60 hover:opacity-100"
                >
                  {favorites.includes(coin.symbol) ? '⭐' : '☆'}
                </button>

                {/* LOGO */}
                <img
                  src={getLogo(coin.symbol)}
                  onError={handleImgError}
                  className="w-6 h-6 rounded-full"
                />

                <div>
                  <div className="text-xs font-medium">
                    {coin.base}
                  </div>

                  <div className="text-[11px] text-gray-500 truncate max-w-[80px]">
                    {coin.name}
                  </div>

                  <div className="text-[11px] text-gray-400">
                    ${coin.price.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex flex-col items-end">

                <div
                  className={`text-[11px] font-medium ${
                    coin.change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {coin.change.toFixed(2)}%
                </div>

                {/* PULSE DOT */}
                <div
                  className={`w-1.5 h-1.5 rounded-full mt-1 ${
                    coin.price > prev ? 'bg-green-400' : 'bg-red-400'
                  } animate-pulse`}
                />
              </div>

            </div>
          );
        })}

      </div>
    </div>
  );
}