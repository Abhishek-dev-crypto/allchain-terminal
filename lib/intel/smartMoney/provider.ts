import "server-only";

import type {
  SmartMoneyTransfer,
} from "./types";

/* =========================================================
   RE-EXPORT TYPES
========================================================= */

export type {
  SmartMoneyTransfer,
} from "./types";

/* =========================================================
   SMART MONEY PROVIDER
========================================================= */

export interface SmartMoneyProvider {
  /**
   * Fetch transfer history for a specific wallet.
   */
  getTransfers(params: {
    chain: string;
    tokenAddress?: string;
    walletAddress?: string;
    limit?: number;
  }): Promise<SmartMoneyTransfer[]>;

  /**
   * Discover transfers across a defined token universe.
   *
   * This is intentionally token-scoped rather than
   * "scan the entire blockchain".
   */
  discoverTransfers(params: {
    chain: string;
    tokenAddresses: string[];
    limitPerToken?: number;
  }): Promise<SmartMoneyTransfer[]>;
}