import { NextResponse } from 'next/server';

const preferredCoins = [
  'bitcoin',
  'ethereum',
  'solana',
  'ripple',
  'binancecoin',
  'cardano',
  'avalanche-2',
  'dogecoin',
  'chainlink',
  'toncoin',
  'sui',
  'near',
];

export async function GET() {
  try {
    // =========================
    // FETCH COINGECKO
    // =========================
    const controller = new AbortController();

const timeout = setTimeout(() => {
  controller.abort();
}, 8000);

const res = await fetch(
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false',
  {
    next: {
      revalidate: 60,
    },
    signal: controller.signal,
  }
);

clearTimeout(timeout);

    if (!res.ok) {
      throw new Error('CoinGecko fetch failed');
    }

    const data = await res.json();

    // =========================
    // FILTER QUALITY ASSETS
    // =========================
    const filtered = data
      .filter((coin: any) =>
        preferredCoins.includes(coin.id)
      )
      .sort(
        (a: any, b: any) =>
          b.market_cap - a.market_cap
      )
      .slice(0, 12);

    // =========================
    // CLEAN RESPONSE
    // =========================
    const formatted = filtered.map((coin: any) => ({
  id: coin.id,
  symbol: coin.symbol.toUpperCase(),
  price: coin.current_price,
  change24h: coin.price_change_percentage_24h ?? 0,
  marketCap: coin.market_cap,
  volume: coin.total_volume ?? 0,
}));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: 'Failed to fetch heatmap',
      },
      {
        status: 500,
      }
    );
  }
}