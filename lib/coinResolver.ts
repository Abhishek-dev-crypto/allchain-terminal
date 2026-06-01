// lib/coinResolver.ts

/**
 * Unified Coin → Binance Symbol Resolver
 * Single source of truth for entire trading system
 */

type SymbolMap = Record<string, string>;

/* ---------------- CORE MAP (SAFE + STABLE) ---------------- */
const SYMBOL_MAP: SymbolMap = {
  // majors
  bitcoin: 'BTCUSDT',
  ethereum: 'ETHUSDT',
  solana: 'SOLUSDT',
  ripple: 'XRPUSDT',
  dogecoin: 'DOGEUSDT',
  cardano: 'ADAUSDT',
  polkadot: 'DOTUSDT',
  litecoin: 'LTCUSDT',
  chainlink: 'LINKUSDT',
  avalanche: 'AVAXUSDT',
  tron: 'TRXUSDT',

  // stable fallback mapping (optional)
  tether: 'USDTUSDT',
};

/* ---------------- CLEAN NORMALIZER ---------------- */
function normalize(id: string) {
  return id
    .toLowerCase()
    .replace(/-2/g, '') // avalanche-2 fix
    .replace(/-/g, '')
    .trim();
}

/* ---------------- MAIN RESOLVER ---------------- */
export function resolveSymbol(coinId: string): string {
  const id = normalize(coinId);

  // 1. direct match
  if (SYMBOL_MAP[id]) return SYMBOL_MAP[id];

  // 2. heuristic Binance-style conversion
  const guessed = id.toUpperCase() + 'USDT';

  return guessed;
}

/* ---------------- REVERSE LOOKUP (optional UI use) ---------------- */
export function resolveCoinId(symbol: string): string | null {
  const entry = Object.entries(SYMBOL_MAP).find(
    ([, value]) => value === symbol
  );

  return entry ? entry[0] : null;
}

/* ---------------- VALIDATION ---------------- */
export function isKnownCoin(coinId: string): boolean {
  return Boolean(SYMBOL_MAP[normalize(coinId)]);
}