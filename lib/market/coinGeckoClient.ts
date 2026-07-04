import { getCoinGeckoId } from "@/lib/coingeckoSymbolMap";

export async function getCoinGeckoPrice(symbol: string) {
  const id = getCoinGeckoId(symbol);

  if (!id) throw new Error("Unsupported symbol for CoinGecko");

  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`
  );

  if (!res.ok) throw new Error("CoinGecko failed");

  const data = await res.json();
  const coin = data?.[id];

  return {
    price: coin?.usd ?? 0,
    change24h: coin?.usd_24h_change ?? 0,
  };
}