export async function getMarketData() {
  try {
    const res =
      await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1",
        {
          headers: {
            Accept:
              "application/json",
          },

          cache: "no-store",
        }
      );

    if (!res.ok) {
      throw new Error(
        "CoinGecko fetch failed"
      );
    }

    const data =
      await res.json();

    return data.map(
      (coin: any) => ({
        symbol:
          coin.symbol?.toUpperCase(),

        name:
          coin.name,

        price:
          coin.current_price,

        change24h:
          coin.price_change_percentage_24h,

        marketCap:
          coin.market_cap,

        volume:
          coin.total_volume,

        image:
          coin.image,
      })
    );
  } catch (err) {
    console.error(
      "Market fetch error:",
      err
    );

    return [];
  }
}