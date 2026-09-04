export type MarketSector =
  | "LARGE_CAP"
  | "L1"
  | "INFRA"
  | "DEFI"
  | "MEME"
  | "PAYMENTS"
  | "OTHER";

export const SECTOR_MAP: Record<string, MarketSector> = {
  BTC: "LARGE_CAP",

  ETH: "L1",
  SOL: "L1",
  AVAX: "L1",
  SUI: "L1",

  LINK: "INFRA",
  NEAR: "INFRA",

  UNI: "DEFI",
  AAVE: "DEFI",

  DOGE: "MEME",
  SHIB: "MEME",

  XRP: "PAYMENTS",
  XLM: "PAYMENTS",
};

export function getMarketSector(symbol?: string): MarketSector {
  if (!symbol) return "OTHER";

  return SECTOR_MAP[symbol.toUpperCase()] ?? "OTHER";
}
