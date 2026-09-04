import "server-only";

import type {
  SmartMoneyTransfer,
} from "./types";

/* =========================================================
   TYPES
========================================================= */

export type SmartWalletClassification =
  | "WHALE"
  | "SMART"
  | "INSTITUTIONAL_LIKE"
  | "EXCHANGE"
  | "PROTOCOL"
  | "UNKNOWN";

export type SmartWalletCandidate = {
  address: string;

  chain: string;

  classification:
    SmartWalletClassification;

  transactionCount: number;

  totalVolumeUsd: number;

  inflowUsd: number;

  outflowUsd: number;

  netFlowUsd: number;

  assets: string[];

  uniqueAssets: number;

  averageTransactionUsd: number;

  largestTransactionUsd: number;

  firstSeen: number;

  lastSeen: number;

  activityScore: number;

  preliminarySmartMoneyScore: number;

  confidence: number;

  labels: string[];

  updatedAt: number;
};

/* =========================================================
   CONFIG
========================================================= */

/*
 * Discovery is intentionally conservative.
 *
 * This engine identifies wallet candidates based on
 * observable on-chain behavior.
 *
 * It does NOT prove:
 *
 * - profitability
 * - institutional ownership
 * - insider information
 * - future performance
 */

const MIN_TRANSACTION_USD = 25_000;

const MIN_CANDIDATE_VOLUME_USD = 250_000;

const MIN_REPEATED_VOLUME_USD = 125_000;

const MIN_REPEATED_TRANSACTIONS = 5;

const WHALE_VOLUME_THRESHOLD = 1_000_000;

const INSTITUTIONAL_VOLUME_THRESHOLD =
  10_000_000;

const HIGH_ACTIVITY_TRANSACTIONS = 20;

const VERY_HIGH_ACTIVITY_TRANSACTIONS = 50;

const MULTI_ASSET_THRESHOLD = 3;

const STRONG_MULTI_ASSET_THRESHOLD = 5;

const MIN_SMART_MONEY_SCORE = 35;

const MAX_TRACKED_LABELS = 20;

/*
 * Addresses with these labels are infrastructure rather
 * than independent smart-wallet candidates.
 */
const INFRASTRUCTURE_LABEL_TERMS = [
  "exchange",
  "binance",
  "coinbase",
  "kraken",
  "okx",
  "bybit",
  "gate.io",
  "gate",
  "kucoin",
  "bitfinex",
  "bitstamp",
  "gemini",
  "bitget",
  "mexc",
  "crypto.com",
  "deribit",
  "upbit",
  "bitso",
  "huobi",

  "uniswap",
  "aave",
  "compound",
  "curve",
  "balancer",
  "maker",
  "lido",
  "rocket pool",
  "stargate",
  "layerzero",
  "chainlink",

  "router",
  "protocol",
  "contract",
  "pool",
  "dex",
  "bridge",
  "staking",
  "vault",
  "multisig",
  "treasury",
  "governance",
  "factory",
  "distributor",
  "merkl",
  "lifi",
];

/* =========================================================
   HELPERS
========================================================= */

function normalizeAddress(
  address: string | undefined | null
): string {
  return (
    address ??
    ""
  )
    .trim()
    .toLowerCase();
}

function normalizeChain(
  chain: string | undefined | null
): string {
  return (
    chain ??
    "unknown"
  )
    .trim()
    .toLowerCase();
}

function normalizeSymbol(
  symbol: string | undefined | null
): string {
  return (
    symbol ??
    "UNKNOWN"
  )
    .trim()
    .toUpperCase();
}

function safeNumber(
  value: unknown
): number {
  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

function round(
  value: number,
  decimals = 2
): number {
  if (
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Number(
    value.toFixed(decimals)
  );
}

function clamp(
  value: number,
  min = 0,
  max = 100
): number {
  if (
    !Number.isFinite(value)
  ) {
    return min;
  }

  return Math.min(
    max,
    Math.max(
      min,
      value
    )
  );
}

function normalizeTimestamp(
  timestamp: unknown
): number {
  const value =
    safeNumber(timestamp);

  if (
    value > 0
  ) {
    return value;
  }

  return Date.now();
}

/* =========================================================
   USD VALUE
========================================================= */

function getTransferUsdValue(
  transfer: SmartMoneyTransfer
): number {
  const value =
    safeNumber(
      transfer.valueUsd
    );

  if (
    value <= 0
  ) {
    return 0;
  }

  return value;
}

/* =========================================================
   LABEL HELPERS
========================================================= */

function normalizeLabel(
  label: string
): string {
  return label
    .trim()
    .toLowerCase();
}

function addLabel(
  labels: Set<string>,
  label: string | null | undefined
): void {
  if (
    !label
  ) {
    return;
  }

  const normalized =
    label.trim();

  if (
    !normalized
  ) {
    return;
  }

  if (
    labels.size >=
    MAX_TRACKED_LABELS
  ) {
    return;
  }

  labels.add(
    normalized
  );
}

function getAddressLabel(
  transfer: SmartMoneyTransfer,
  address: string
): string | null {
  const normalized =
    normalizeAddress(address);

  if (
    normalizeAddress(
      transfer.fromAddress
    ) === normalized
  ) {
    return (
      transfer.fromLabel ??
      null
    );
  }

  if (
    normalizeAddress(
      transfer.toAddress
    ) === normalized
  ) {
    return (
      transfer.toLabel ??
      null
    );
  }

  return null;
}

/* =========================================================
   INFRASTRUCTURE DETECTION
========================================================= */

function isInfrastructureLabel(
  label: string
): boolean {
  const value =
    normalizeLabel(label);

  return INFRASTRUCTURE_LABEL_TERMS.some(
    (term) =>
      value.includes(term)
  );
}

function hasInfrastructureLabel(
  labels: string[]
): boolean {
  return labels.some(
    isInfrastructureLabel
  );
}

function isExchangeLabel(
  label: string
): boolean {
  const value =
    normalizeLabel(label);

  return [
    "exchange",
    "binance",
    "coinbase",
    "kraken",
    "okx",
    "bybit",
    "gate.io",
    "gate",
    "kucoin",
    "bitfinex",
    "bitstamp",
    "gemini",
    "bitget",
    "mexc",
    "crypto.com",
    "deribit",
    "upbit",
    "bitso",
    "huobi",
  ].some(
    (term) =>
      value.includes(term)
  );
}

function isProtocolLabel(
  label: string
): boolean {
  const value =
    normalizeLabel(label);

  return [
    "uniswap",
    "aave",
    "compound",
    "curve",
    "balancer",
    "maker",
    "lido",
    "rocket pool",
    "router",
    "protocol",
    "contract",
    "pool",
    "dex",
    "bridge",
    "staking",
    "vault",
    "multisig",
    "treasury",
    "governance",
    "factory",
    "distributor",
    "merkl",
    "lifi",
  ].some(
    (term) =>
      value.includes(term)
  );
}

/* =========================================================
   CLASSIFICATION
========================================================= */

function classifyWallet(
  labels: string[],
  totalVolumeUsd: number,
  transactionCount: number
): SmartWalletClassification {
  /*
   * Infrastructure classification always wins.
   *
   * A protocol or exchange should never become a
   * "smart wallet" simply because it has enormous volume.
   */

  const hasExchange =
    labels.some(
      isExchangeLabel
    );

  if (
    hasExchange
  ) {
    return "EXCHANGE";
  }

  const hasProtocol =
    labels.some(
      isProtocolLabel
    );

  if (
    hasProtocol
  ) {
    return "PROTOCOL";
  }

  /*
   * Institutional-like is a behavioral label only.
   */
  if (
    totalVolumeUsd >=
      INSTITUTIONAL_VOLUME_THRESHOLD &&
    transactionCount >= 5
  ) {
    return "INSTITUTIONAL_LIKE";
  }

  if (
    totalVolumeUsd >=
    WHALE_VOLUME_THRESHOLD
  ) {
    return "WHALE";
  }

  if (
    transactionCount >=
      MIN_REPEATED_TRANSACTIONS &&
    totalVolumeUsd >=
      MIN_REPEATED_VOLUME_USD
  ) {
    return "SMART";
  }

  return "UNKNOWN";
}

/* =========================================================
   ACTIVITY SCORE
========================================================= */

function calculateActivityScore(
  transactionCount: number,
  totalVolumeUsd: number
): number {
  const transactionScore =
    clamp(
      (
        transactionCount /
        25
      ) *
        100
    );

  const volumeScore =
    clamp(
      (
        totalVolumeUsd /
        10_000_000
      ) *
        100
    );

  return round(
    transactionScore *
      0.5 +
      volumeScore *
      0.5
  );
}

/* =========================================================
   DIRECTIONAL FLOW QUALITY
========================================================= */

function calculateDirectionalFlowScore(
  inflowUsd: number,
  outflowUsd: number
): number {
  const totalFlow =
    inflowUsd +
    outflowUsd;

  if (
    totalFlow <= 0
  ) {
    return 0;
  }

  const netFlow =
    Math.abs(
      inflowUsd -
      outflowUsd
    );

  return clamp(
    (
      netFlow /
      totalFlow
    ) *
      100
  );
}

/* =========================================================
   CONSISTENCY
========================================================= */

function calculateConsistencyScore(
  transactionCount: number
): number {
  if (
    transactionCount <= 0
  ) {
    return 0;
  }

  return clamp(
    (
      transactionCount /
      20
    ) *
      100
  );
}

/* =========================================================
   CAPITAL QUALITY
========================================================= */

function calculateCapitalScore(
  totalVolumeUsd: number
): number {
  return clamp(
    (
      totalVolumeUsd /
      5_000_000
    ) *
      100
  );
}

/* =========================================================
   DIVERSIFICATION
========================================================= */

function calculateDiversificationScore(
  uniqueAssets: number
): number {
  return clamp(
    (
      uniqueAssets /
      5
    ) *
      100
  );
}

/* =========================================================
   SMART MONEY SCORE
========================================================= */

function calculateSmartMoneyScore(
  transactionCount: number,
  totalVolumeUsd: number,
  inflowUsd: number,
  outflowUsd: number,
  uniqueAssets: number,
  largestTransactionUsd: number
): number {
  const consistencyScore =
    calculateConsistencyScore(
      transactionCount
    );

  const capitalScore =
    calculateCapitalScore(
      totalVolumeUsd
    );

  const diversificationScore =
    calculateDiversificationScore(
      uniqueAssets
    );

  const directionalScore =
    calculateDirectionalFlowScore(
      inflowUsd,
      outflowUsd
    );

  /*
   * Concentration penalty.
   *
   * One huge transaction should not make a wallet look
   * like a consistently intelligent participant.
   */

  const concentrationRatio =
    totalVolumeUsd > 0
      ? largestTransactionUsd /
        totalVolumeUsd
      : 1;

  const concentrationQuality =
    clamp(
      (
        1 -
        concentrationRatio
      ) *
        100
    );

  /*
   * Score:
   *
   * 25% consistency
   * 25% capital quality
   * 15% diversification
   * 20% directional behavior
   * 15% concentration quality
   */

  const score =
    consistencyScore *
      0.25 +

    capitalScore *
      0.25 +

    diversificationScore *
      0.15 +

    directionalScore *
      0.20 +

    concentrationQuality *
      0.15;

  return round(
    clamp(score)
  );
}

/* =========================================================
   CONFIDENCE
========================================================= */

function calculateConfidence(
  transactionCount: number,
  totalVolumeUsd: number,
  uniqueAssets: number,
  largestTransactionUsd: number,
  firstSeen: number,
  lastSeen: number
): number {
  const transactionDepth =
    clamp(
      (
        transactionCount /
        20
      ) *
        100
    );

  const capitalDepth =
    clamp(
      (
        totalVolumeUsd /
        5_000_000
      ) *
        100
    );

  const assetDepth =
    clamp(
      (
        uniqueAssets /
        5
      ) *
        100
    );

  const concentrationRatio =
    totalVolumeUsd > 0
      ? largestTransactionUsd /
        totalVolumeUsd
      : 1;

  const concentrationQuality =
    clamp(
      (
        1 -
        concentrationRatio
      ) *
        100
    );

  const timeSpan =
    Math.max(
      0,
      lastSeen -
        firstSeen
    );

  const timeDepth =
    clamp(
      (
        timeSpan /
        (
          7 *
          24 *
          60 *
          60 *
          1000
        )
      ) *
        100
    );

  return round(
    clamp(
      transactionDepth *
        0.30 +

      capitalDepth *
        0.20 +

      assetDepth *
        0.15 +

      concentrationQuality *
        0.15 +

      timeDepth *
        0.20
    )
  );
}

/* =========================================================
   BEHAVIOR LABELS
========================================================= */

function buildLabels(
  classification: SmartWalletClassification,
  transactionCount: number,
  totalVolumeUsd: number,
  uniqueAssets: number,
  netFlowUsd: number,
  confidence: number
): string[] {
  const labels: string[] =
    [];

  if (
    classification ===
    "INSTITUTIONAL_LIKE"
  ) {
    labels.push(
      "institutional-like activity"
    );
  }

  if (
    classification ===
    "WHALE"
  ) {
    labels.push(
      "large capital activity"
    );
  }

  if (
    classification ===
    "SMART"
  ) {
    labels.push(
      "repeated high-value activity"
    );
  }

  if (
    transactionCount >=
    HIGH_ACTIVITY_TRANSACTIONS
  ) {
    labels.push(
      "high transaction activity"
    );
  }

  if (
    transactionCount >=
    VERY_HIGH_ACTIVITY_TRANSACTIONS
  ) {
    labels.push(
      "very high transaction activity"
    );
  }

  if (
    totalVolumeUsd >=
    10_000_000
  ) {
    labels.push(
      "high capital throughput"
    );
  }

  if (
    uniqueAssets >=
    MULTI_ASSET_THRESHOLD
  ) {
    labels.push(
      "multi-asset activity"
    );
  }

  if (
    uniqueAssets >=
    STRONG_MULTI_ASSET_THRESHOLD
  ) {
    labels.push(
      "broad asset participation"
    );
  }

  if (
    netFlowUsd >
    100_000
  ) {
    labels.push(
      "net inflow"
    );
  }

  if (
    netFlowUsd <
    -100_000
  ) {
    labels.push(
      "net outflow"
    );
  }

  if (
    confidence >=
    70
  ) {
    labels.push(
      "high evidence confidence"
    );
  } else if (
    confidence >=
    50
  ) {
    labels.push(
      "moderate evidence confidence"
    );
  }

  return [
    ...new Set(
      labels
    ),
  ];
}

/* =========================================================
   WALLET ACCUMULATOR
========================================================= */

type WalletAccumulator = {
  address: string;

  chain: string;

  transactionCount: number;

  totalVolumeUsd: number;

  inflowUsd: number;

  outflowUsd: number;

  largestTransactionUsd: number;

  assets: Set<string>;

  firstSeen: number;

  lastSeen: number;

  labels: Set<string>;
};

/* =========================================================
   CREATE ACCUMULATOR
========================================================= */

function createWalletAccumulator(
  address: string,
  chain: string,
  timestamp: number
): WalletAccumulator {
  return {
    address,

    chain,

    transactionCount: 0,

    totalVolumeUsd: 0,

    inflowUsd: 0,

    outflowUsd: 0,

    largestTransactionUsd: 0,

    assets:
      new Set<string>(),

    firstSeen:
      timestamp,

    lastSeen:
      timestamp,

    labels:
      new Set<string>(),
  };
}

/* =========================================================
   DISCOVERY
========================================================= */

export function discoverSmartWallets(
  transfers: SmartMoneyTransfer[]
): SmartWalletCandidate[] {
  if (
    !Array.isArray(transfers) ||
    transfers.length === 0
  ) {
    return [];
  }

  const wallets =
    new Map<
      string,
      WalletAccumulator
    >();

  const seenTransfers =
    new Set<string>();

  /* =======================================================
     PROCESS TRANSFERS
  ======================================================= */

  for (
    const transfer of transfers
  ) {
    if (
      !transfer
    ) {
      continue;
    }

    const usd =
      getTransferUsdValue(
        transfer
      );

    /*
     * We cannot perform reliable smart-money discovery
     * without a USD valuation.
     */
    if (
      usd <
      MIN_TRANSACTION_USD
    ) {
      continue;
    }

    const from =
      normalizeAddress(
        transfer.fromAddress
      );

    const to =
      normalizeAddress(
        transfer.toAddress
      );

    if (
      !from &&
      !to
    ) {
      continue;
    }

    const chain =
      normalizeChain(
        transfer.chain
      );

    const symbol =
      normalizeSymbol(
        transfer.tokenSymbol
      );

    const timestamp =
      normalizeTimestamp(
        transfer.timestamp
      );

    const transactionHash =
      (
        transfer.transactionHash ??
        ""
      )
        .trim()
        .toLowerCase();

    /*
     * Provider data can contain the same transfer multiple
     * times.
     *
     * Token transfers within the same transaction are kept
     * separate because they may represent different assets.
     */

    const transferKey =
      [
        chain,
        transactionHash,
        from,
        to,
        symbol,
        String(
          usd
        ),
        String(
          timestamp
        ),
      ].join("|");

    if (
      seenTransfers.has(
        transferKey
      )
    ) {
      continue;
    }

    seenTransfers.add(
      transferKey
    );

    /* =====================================================
       FROM WALLET
    ===================================================== */

    if (
      from
    ) {
      let wallet =
        wallets.get(
          `${chain}:${from}`
        );

      if (
        !wallet
      ) {
        wallet =
          createWalletAccumulator(
            from,
            chain,
            timestamp
          );

        wallets.set(
          `${chain}:${from}`,
          wallet
        );
      }

      wallet.transactionCount +=
        1;

      wallet.totalVolumeUsd +=
        usd;

      wallet.outflowUsd +=
        usd;

      wallet.largestTransactionUsd =
        Math.max(
          wallet.largestTransactionUsd,
          usd
        );

      wallet.assets.add(
        symbol
      );

      wallet.firstSeen =
        Math.min(
          wallet.firstSeen,
          timestamp
        );

      wallet.lastSeen =
        Math.max(
          wallet.lastSeen,
          timestamp
        );

      addLabel(
        wallet.labels,
        getAddressLabel(
          transfer,
          transfer.fromAddress
        )
      );
    }

    /* =====================================================
       TO WALLET
    ===================================================== */

    if (
      to
    ) {
      let wallet =
        wallets.get(
          `${chain}:${to}`
        );

      if (
        !wallet
      ) {
        wallet =
          createWalletAccumulator(
            to,
            chain,
            timestamp
          );

        wallets.set(
          `${chain}:${to}`,
          wallet
        );
      }

      wallet.transactionCount +=
        1;

      wallet.totalVolumeUsd +=
        usd;

      wallet.inflowUsd +=
        usd;

      wallet.largestTransactionUsd =
        Math.max(
          wallet.largestTransactionUsd,
          usd
        );

      wallet.assets.add(
        symbol
      );

      wallet.firstSeen =
        Math.min(
          wallet.firstSeen,
          timestamp
        );

      wallet.lastSeen =
        Math.max(
          wallet.lastSeen,
          timestamp
        );

      addLabel(
        wallet.labels,
        getAddressLabel(
          transfer,
          transfer.toAddress
        )
      );
    }
  }

  /* =======================================================
     BUILD CANDIDATES
  ======================================================= */

  const candidates =
    Array.from(
      wallets.values()
    )
      .map(
        (
          wallet
        ): SmartWalletCandidate => {
          const assets =
            Array.from(
              wallet.assets
            ).filter(
              Boolean
            );

          const providerLabels =
            Array.from(
              wallet.labels
            );

          const netFlowUsd =
            wallet.inflowUsd -
            wallet.outflowUsd;

          const classification =
            classifyWallet(
              providerLabels,
              wallet.totalVolumeUsd,
              wallet.transactionCount
            );

          const activityScore =
            calculateActivityScore(
              wallet.transactionCount,
              wallet.totalVolumeUsd
            );

          const preliminarySmartMoneyScore =
            calculateSmartMoneyScore(
              wallet.transactionCount,
              wallet.totalVolumeUsd,
              wallet.inflowUsd,
              wallet.outflowUsd,
              assets.length,
              wallet.largestTransactionUsd
            );

          const confidence =
            calculateConfidence(
              wallet.transactionCount,
              wallet.totalVolumeUsd,
              assets.length,
              wallet.largestTransactionUsd,
              wallet.firstSeen,
              wallet.lastSeen
            );

          const behavioralLabels =
            buildLabels(
              classification,
              wallet.transactionCount,
              wallet.totalVolumeUsd,
              assets.length,
              netFlowUsd,
              confidence
            );

          /*
           * Provider labels are retained because they provide
           * useful context in the API response.
           */
          const labels =
            [
              ...new Set([
                ...providerLabels,
                ...behavioralLabels,
              ]),
            ].slice(
              0,
              MAX_TRACKED_LABELS
            );

          /*
           * Infrastructure should never become a smart-wallet
           * candidate.
           */
          return {
            address:
              wallet.address,

            chain:
              wallet.chain,

            classification,

            transactionCount:
              wallet.transactionCount,

            totalVolumeUsd:
              round(
                wallet.totalVolumeUsd
              ),

            inflowUsd:
              round(
                wallet.inflowUsd
              ),

            outflowUsd:
              round(
                wallet.outflowUsd
              ),

            netFlowUsd:
              round(
                netFlowUsd
              ),

            assets,

            uniqueAssets:
              assets.length,

            averageTransactionUsd:
              round(
                wallet.totalVolumeUsd /
                Math.max(
                  wallet.transactionCount,
                  1
                )
              ),

            largestTransactionUsd:
              round(
                wallet.largestTransactionUsd
              ),

            firstSeen:
              wallet.firstSeen,

            lastSeen:
              wallet.lastSeen,

            activityScore,

            preliminarySmartMoneyScore,

            confidence,

            labels,

            updatedAt:
              Date.now(),
          };
        }
      )

      /* =====================================================
         REMOVE EXCHANGES / PROTOCOLS
      ===================================================== */

      .filter(
        (
          wallet
        ) =>
          wallet.classification !==
            "EXCHANGE" &&
          wallet.classification !==
            "PROTOCOL"
      )

      /* =====================================================
         REQUIRE CAPITAL
      ===================================================== */

      .filter(
        (
          wallet
        ) =>
          wallet.totalVolumeUsd >=
            MIN_CANDIDATE_VOLUME_USD ||

          (
            wallet.transactionCount >=
              MIN_REPEATED_TRANSACTIONS &&

            wallet.totalVolumeUsd >=
              MIN_REPEATED_VOLUME_USD
          )
      )

      /* =====================================================
         REQUIRE QUALITY
      ===================================================== */

      .filter(
        (
          wallet
        ) =>
          wallet.preliminarySmartMoneyScore >=
            MIN_SMART_MONEY_SCORE ||

          wallet.classification ===
            "WHALE" ||

          wallet.classification ===
            "INSTITUTIONAL_LIKE"
      )

      /* =====================================================
         SORT
      ===================================================== */

      .sort(
        (
          a,
          b
        ) => {
          if (
            b.preliminarySmartMoneyScore !==
            a.preliminarySmartMoneyScore
          ) {
            return (
              b.preliminarySmartMoneyScore -
              a.preliminarySmartMoneyScore
            );
          }

          if (
            b.confidence !==
            a.confidence
          ) {
            return (
              b.confidence -
              a.confidence
            );
          }

          if (
            b.activityScore !==
            a.activityScore
          ) {
            return (
              b.activityScore -
              a.activityScore
            );
          }

          return (
            b.totalVolumeUsd -
            a.totalVolumeUsd
          );
        }
      );

  return candidates;
}