export type Coin = {
  id?: string;

  symbol: string;
  name?: string;

  price: number;
  change24h: number;

  high24h?: number;
  low24h?: number;

  marketCap?: number;
  volume24h?: number;

  image?: string;
  rank?: number;
};