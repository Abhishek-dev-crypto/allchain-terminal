
import "server-only";

import Moralis from "moralis";

import type {
  SmartMoneyProvider,
  SmartMoneyTransfer,
} from "./provider";

/* =========================================================
   STATE
========================================================= */

let initialized = false;

/* =========================================================
   MORALIS INITIALIZATION
========================================================= */

async function ensureMoralis(): Promise<void> {
  if (initialized) {
    return;
  }

  const apiKey = process.env.MORALIS_API_KEY;

  if (!apiKey) {
    throw new Error(
      "MORALIS_API_KEY is not configured"
    );
  }

  await Moralis.start({
    apiKey,
  });

  initialized = true;
}

/* =========================================================
   CHAIN NORMALIZATION
========================================================= */

function normalizeChain(
  chain: string
): string {
  const value = String(
    chain ?? ""
  )
    .trim()
    .toLowerCase();

  switch (value) {
    case "ethereum":
    case "eth":
    case "0x1":
      return "0x1";

    case "polygon":
    case "matic":
    case "0x89":
      return "0x89";

    case "bsc":
    case "binance":
    case "0x38":
      return "0x38";

    case "arbitrum":
    case "0xa4b1":
      return "0xa4b1";

    case "base":
    case "0x2105":
      return "0x2105";

    case "optimism":
    case "0xa":
      return "0xa";

    default:
      return String(chain ?? "").trim();
  }
}

/* =========================================================
   SAFE NUMBER HELPERS
========================================================= */

function toNumber(
  value: unknown
): number {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

/* =========================================================
   LIMIT NORMALIZATION
========================================================= */

function normalizeLimit(
  value: unknown,
  fallback = 100
): number {
  const number = Math.floor(
    toNumber(value)
  );

  if (!Number.isFinite(number) || number <= 0) {
    return fallback;
  }

  return Math.min(
    number,
    100
  );
}

/* =========================================================
   ADDRESS NORMALIZATION
========================================================= */

function normalizeAddress(
  address: unknown
): string {
  return String(
    address ?? ""
  )
    .trim()
    .toLowerCase();
}

/* =========================================================
   SYMBOL NORMALIZATION
========================================================= */

function normalizeSymbol(
  symbol: unknown,
  fallback = "UNKNOWN"
): string {
  const value = String(
    symbol ?? ""
  )
    .trim()
    .toUpperCase();

  return value || fallback;
}

/* =========================================================
   TIMESTAMP NORMALIZATION
========================================================= */

function normalizeTimestamp(
  value: unknown
): number {
  if (!value) {
    return Date.now();
  }

  const timestamp =
    new Date(
      String(value)
    ).getTime();

  return Number.isFinite(timestamp)
    ? timestamp
    : Date.now();
}

/* =========================================================
   ERC20 VALUE NORMALIZATION
========================================================= */

/**
 * Moralis ERC20 transfer `value` is normally the raw
 * token amount.
 *
 * Example:
 *
 * XAUt decimals = 6
 * raw value     = 139412270
 * actual value  = 139.41227
 */
function normalizeTokenValue(
  rawValue: unknown,
  decimals: unknown
): number {
  const value =
    toNumber(rawValue);

  const decimalCount =
    toNumber(decimals);

  if (!Number.isFinite(value)) {
    return 0;
  }

  if (!value) {
    return 0;
  }

  if (
    !Number.isFinite(decimalCount) ||
    decimalCount < 0
  ) {
    return value;
  }

  return (
    value /
    Math.pow(
      10,
      decimalCount
    )
  );
}

/* =========================================================
   USD VALUE RESOLUTION
========================================================= */

/**
 * Resolve a transfer's USD value safely.
 *
 * Priority:
 *
 * 1. Use Moralis-provided value_usd when available.
 * 2. For USD-pegged stablecoins, use normalized token
 *    quantity as an approximate USD value.
 * 3. Return undefined for arbitrary tokens when Moralis
 *    has not supplied a USD valuation.
 *
 * IMPORTANT:
 *
 * We intentionally do NOT assume:
 *
 *     token amount === USD value
 *
 * for arbitrary assets.
 */
function resolveValueUsd(
  valueUsd: unknown,
  tokenSymbol: unknown,
  normalizedValue: number
): number | undefined {
  const explicitUsd =
    toNumber(valueUsd);

  if (
    explicitUsd > 0
  ) {
    return explicitUsd;
  }

  const symbol =
    normalizeSymbol(
      tokenSymbol
    );

  /*
   * Stablecoins that are intended to track USD.
   *
   * This is suitable for capital-flow discovery,
   * but still represents an approximation.
   */
  if (
    symbol === "USDT" ||
    symbol === "USDC" ||
    symbol === "USDC.E"
  ) {
    if (
      Number.isFinite(
        normalizedValue
      ) &&
      normalizedValue > 0
    ) {
      return normalizedValue;
    }
  }

  return undefined;
}

/* =========================================================
   ERC20 TRANSFER MAPPER
========================================================= */

function mapErc20Transfer(
  transfer: any,
  transactionHash: string,
  transactionFrom?: string,
  transactionTo?: string,
  transactionFromLabel?: string,
  transactionToLabel?: string,
  chain?: string,
  fallbackTokenAddress?: string
): SmartMoneyTransfer {
  const normalizedValue =
    normalizeTokenValue(
      transfer?.value,
      transfer?.token_decimals
    );

  const tokenSymbol =
    normalizeSymbol(
      transfer?.token_symbol
    );

  return {
    chain:
      chain ?? "",

    transactionHash:
      String(
        transactionHash ?? ""
      ),

    fromAddress:
      normalizeAddress(
        transfer?.from_address ??
          transactionFrom
      ),

    toAddress:
      normalizeAddress(
        transfer?.to_address ??
          transactionTo
      ),

    tokenSymbol,

    tokenAddress:
      transfer?.address ??
      fallbackTokenAddress,

    value:
      normalizedValue,

    valueUsd:
      resolveValueUsd(
        transfer?.value_usd,
        tokenSymbol,
        normalizedValue
      ),

    timestamp:
      normalizeTimestamp(
        transfer?.block_timestamp
      ),

    fromLabel:
      transfer?.from_address_label ??
      transactionFromLabel ??
      undefined,

    toLabel:
      transfer?.to_address_label ??
      transactionToLabel ??
      undefined,
  };
}

/* =========================================================
   NATIVE TRANSFER MAPPER
========================================================= */

function mapNativeTransfer(
  transfer: any,
  transactionHash: string,
  transactionFrom?: string,
  transactionTo?: string,
  transactionFromLabel?: string,
  transactionToLabel?: string,
  transactionTimestamp?: unknown,
  chain?: string
): SmartMoneyTransfer {
  /*
   * Native EVM assets are normally represented in wei.
   *
   * EVM native assets use 18 decimals for the chains
   * currently supported by this provider.
   */
  const normalizedValue =
    normalizeTokenValue(
      transfer?.value,
      18
    );

  const tokenSymbol =
    normalizeSymbol(
      transfer?.token_symbol,
      "ETH"
    );

  return {
    chain:
      chain ?? "",

    transactionHash:
      String(
        transactionHash ?? ""
      ),

    fromAddress:
      normalizeAddress(
        transfer?.from_address ??
          transactionFrom
      ),

    toAddress:
      normalizeAddress(
        transfer?.to_address ??
          transactionTo
      ),

    tokenSymbol,

    tokenAddress:
      undefined,

    value:
      normalizedValue,

    /*
     * For native assets we trust Moralis when it provides
     * an explicit USD valuation.
     *
     * We intentionally do not calculate:
     *
     * ETH amount === USD amount
     */
    valueUsd:
      (() => {
        const explicitUsd =
          toNumber(
            transfer?.value_usd
          );

        return explicitUsd > 0
          ? explicitUsd
          : undefined;
      })(),

    timestamp:
      normalizeTimestamp(
        transactionTimestamp ??
          transfer?.block_timestamp
      ),

    fromLabel:
      transfer?.from_address_label ??
      transactionFromLabel ??
      undefined,

    toLabel:
      transfer?.to_address_label ??
      transactionToLabel ??
      undefined,
  };
}

/* =========================================================
   MORALIS PROVIDER
========================================================= */

export class MoralisSmartMoneyProvider
  implements SmartMoneyProvider
{
  /* =======================================================
     WALLET-SCOPED TRANSFER HISTORY
  ======================================================= */

  async getTransfers({
    chain,
    tokenAddress,
    walletAddress,
    limit = 100,
  }: {
    chain: string;
    tokenAddress?: string;
    walletAddress?: string;
    limit?: number;
  }): Promise<SmartMoneyTransfer[]> {
    await ensureMoralis();

    const normalizedChain =
      normalizeChain(chain);

    const safeLimit =
      normalizeLimit(
        limit
      );

    /* =====================================================
       WALLET-SPECIFIC TRANSFER HISTORY
    ===================================================== */

    if (
      walletAddress
    ) {
      const normalizedWallet =
        normalizeAddress(
          walletAddress
        );

      if (
        !normalizedWallet
      ) {
        return [];
      }

      const response =
        await Moralis.EvmApi.wallets.getWalletHistory(
          {
            chain:
              normalizedChain,

            address:
              normalizedWallet,

            limit:
              safeLimit,
          }
        );

      const result =
        response.toJSON();

      const history =
        result.result ?? [];

      const transfers:
        SmartMoneyTransfer[] =
        [];

      for (
        const transaction of
          history as any[]
      ) {
        const transactionHash =
          String(
            transaction?.hash ??
              ""
          );

        const transactionFrom =
          transaction?.from_address;

        const transactionTo =
          transaction?.to_address;

        const transactionFromLabel =
          transaction?.from_address_label;

        const transactionToLabel =
          transaction?.to_address_label;

        const transactionTimestamp =
          transaction?.block_timestamp;

        /* =================================================
           ERC20 TRANSFERS
        ================================================= */

        for (
          const transfer of
            transaction?.erc20_transfers ??
            []
        ) {
          transfers.push(
            mapErc20Transfer(
              transfer,
              transactionHash,
              transactionFrom,
              transactionTo,
              transactionFromLabel,
              transactionToLabel,
              normalizedChain
            )
          );
        }

        /* =================================================
           NATIVE TRANSFERS
        ================================================= */

        for (
          const transfer of
            transaction?.native_transfers ??
            []
        ) {
          transfers.push(
            mapNativeTransfer(
              transfer,
              transactionHash,
              transactionFrom,
              transactionTo,
              transactionFromLabel,
              transactionToLabel,
              transactionTimestamp,
              normalizedChain
            )
          );
        }
      }

      return transfers;
    }

    /* =====================================================
       TOKEN-SPECIFIC TRANSFER HISTORY
    ===================================================== */

    if (
      tokenAddress
    ) {
      const normalizedToken =
        normalizeAddress(
          tokenAddress
        );

      if (
        !normalizedToken
      ) {
        return [];
      }

      const response =
        await Moralis.EvmApi.token.getTokenTransfers(
          {
            chain:
              normalizedChain,

            address:
              normalizedToken,

            limit:
              safeLimit,
          }
        );

      const result =
        response.toJSON();

      const transfers =
        result.result ?? [];

      return (
        transfers as any[]
      ).map(
        (
          transfer
        ) =>
          mapErc20Transfer(
            transfer,
            transfer?.transaction_hash ??
              "",
            undefined,
            undefined,
            undefined,
            undefined,
            normalizedChain,
            normalizedToken
          )
      );
    }

    return [];
  }

  /* =======================================================
     GENERAL TRANSFER DISCOVERY
  ======================================================= */

  async discoverTransfers({
    chain,
    tokenAddresses,
    limitPerToken = 100,
  }: {
    chain: string;
    tokenAddresses: string[];
    limitPerToken?: number;
  }): Promise<SmartMoneyTransfer[]> {
    await ensureMoralis();

    const normalizedChain =
      normalizeChain(chain);

    /*
     * Normalize and deduplicate token addresses.
     */
    const uniqueTokenAddresses =
      [
        ...new Set(
          (
            tokenAddresses ??
            []
          )
            .map(
              (
                address
              ) =>
                normalizeAddress(
                  address
                )
            )
            .filter(Boolean)
        ),
      ];

    if (
      !uniqueTokenAddresses.length
    ) {
      return [];
    }

    const safeLimit =
      normalizeLimit(
        limitPerToken
      );

    const transfers:
      SmartMoneyTransfer[] =
      [];

    /* =====================================================
       FETCH EACH TOKEN INDEPENDENTLY
    ===================================================== */

    for (
      const tokenAddress of
        uniqueTokenAddresses
    ) {
      try {
        const response =
          await Moralis.EvmApi.token.getTokenTransfers(
            {
              chain:
                normalizedChain,

              address:
                tokenAddress,

              limit:
                safeLimit,
            }
          );

        const result =
          response.toJSON();

        const tokenTransfers =
          result.result ?? [];

        for (
          const transfer of
            tokenTransfers as any[]
        ) {
          transfers.push(
            mapErc20Transfer(
              transfer,
              transfer?.transaction_hash ??
                "",
              undefined,
              undefined,
              undefined,
              undefined,
              normalizedChain,
              tokenAddress
            )
          );
        }
      } catch (error) {
        /*
         * Discovery is intentionally fault tolerant.
         *
         * If USDT works but USDC fails, USDT discovery
         * should still be returned.
         */
        console.error(
          "[Smart Money Discovery] Token transfer fetch failed",
          {
            chain:
              normalizedChain,

            tokenAddress,

            error,
          }
        );
      }
    }

    return transfers;
  }
}