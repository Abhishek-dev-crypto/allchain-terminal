import { useEffect, useState } from "react";
import axios from "axios";

// Define a proper type for the CoinGecko API response
interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
}

const useCoinGecko = () => {
  const [prices, setPrices] = useState<CoinData[] | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const { data } = await axios.get<CoinData[]>(
          "https://api.coingecko.com/api/v3/coins/markets",
          {
            params: {
              vs_currency: "usd",
              order: "market_cap_desc",
              per_page: 10,
              page: 1,
            },
          }
        );
        setPrices(data);
      } catch (error) {
        console.error("Error fetching CoinGecko data:", error);
      }
    };

    fetchPrices();
  }, []);

  return prices;
};

export default useCoinGecko;
