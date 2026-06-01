export type Coin = {
  id: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume?: number;
};