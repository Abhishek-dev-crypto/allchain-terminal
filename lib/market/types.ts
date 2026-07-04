export type MarketSource = "binance" | "coingecko";

export type Ticker = {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  source: MarketSource;
  timestamp: number;
};

export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type MarketSnapshot = {
  ticker: Ticker;
  candles: {
    "1m": Candle[];
    "5m": Candle[];
    "15m": Candle[];
    "30m": Candle[];
    "1h": Candle[];
    "4h": Candle[];
    "1d": Candle[];

  };
};

