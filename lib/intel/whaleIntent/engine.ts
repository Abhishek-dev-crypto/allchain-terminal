import "server-only";

import type {
  SmartMoneyTransfer,
} from "../smartMoney/types";

import type {
  WhaleActivityLevel,
  WhaleEvidence,
  WhaleIntentAsset,
  WhaleIntentDirection,
  WhaleIntentOutput,
  WhaleWalletBehavior,
} from "./types";

/* =========================================================
   CONFIG
========================================================= */

const CONFIG = {
  /*
   * Minimum lifetime capital activity required
   * for a wallet to qualify as a whale.
   */
  MIN_WHALE_VOLUME_USD: 1_000_000,

  /*
   * Minimum individual transfer considered meaningful.
   */
  LARGE_TRANSFER_USD: 250_000,

  /*
   * Strong individual whale transfer.
   */
  STRONG_TRANSFER_USD: 1_000_000,

  /*
   * Recent behavior window.
   */
  RECENT_HOURS: 6,

  /*
   * Historical comparison window.
   */
  BASELINE_HOURS: 42,

  /*
   * Minimum recent observations required
   * for strong behavioral inference.
   */
  MIN_BEHAVIOR_TRANSACTIONS: 3,

  /*
   * Minimum directional capital evidence.
   */
  MIN_DIRECTIONAL_SCORE: 35,

  /*
   * Confidence ceiling while this engine
   * operates without deeper historical state.
   */
  MAX_INITIAL_CONFIDENCE: 85,

  /*
   * Activity acceleration thresholds.
   */
  HIGH_ACCELERATION: 2,

  EXTREME_ACCELERATION: 4,

  /*
   * Unknown counterparties provide weak evidence.
   */
  UNKNOWN_COUNTERPARTY_WEIGHT: 0.35,

  /*
   * Wallet-to-wallet transfers are contextual
   * rather than directional.
   */
  WALLET_ROTATION_WEIGHT: 0.20,

  MAX_WALLETS: 50,

  MAX_ASSETS: 50,

  MAX_DRIVERS: 6,

  MAX_EVIDENCE: 6,
} as const;

/* =========================================================
   INTERNAL TYPES
========================================================= */

type AddressRole =
  | "EXCHANGE"
  | "PROTOCOL"
  | "WHALE"
  | "SMART"
  | "INSTITUTIONAL"
  | "UNKNOWN";

type WalletAccumulator = {
  address: string;

  chain: string;

  assets: Set<string>;

  transactions: SmartMoneyTransfer[];

  totalVolumeUsd: number;

  inflowUsd: number;

  outflowUsd: number;

  largestTransactionUsd: number;
};

type AssetAccumulator = {
  symbol: string;

  whaleAddresses: Set<string>;

  transactions: number;

  totalVolumeUsd: number;

  accumulationUsd: number;

  distributionUsd: number;

  positioningUsd: number;

  deRiskingUsd: number;

  rotationUsd: number;

  evidence: WhaleEvidence[];
};

type ClassifiedTransfer = {
  direction: WhaleIntentDirection;

  weight: number;

  fromRole: AddressRole;

  toRole: AddressRole;
};

/* =========================================================
   HELPERS
========================================================= */

function safeNumber(
  value: unknown
): number {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

function clamp(
  value: number,
  min = 0,
  max = 100
): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(
    max,
    Math.max(min, value)
  );
}

function round(
  value: number,
  decimals = 2
): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Number(
    value.toFixed(decimals)
  );
}

function normalizeAddress(
  address?: string
): string {
  return (
    address ?? ""
  )
    .trim()
    .toLowerCase();
}

function normalizeSymbol(
  symbol?: string
): string {
  return (
    symbol ??
    "UNKNOWN"
  )
    .trim()
    .toUpperCase();
}

function transferUsd(
  transfer: SmartMoneyTransfer
): number {
  return Math.max(
    0,
    safeNumber(
      transfer.valueUsd
    )
  );
}

/*
 * IMPORTANT:
 *
 * Invalid timestamps are no longer converted
 * to Date.now().
 *
 * That prevents stale / malformed upstream data
 * from being falsely interpreted as recent whale activity.
 */
function transferTimestamp(
  transfer: SmartMoneyTransfer
): number | null {
  const timestamp =
    safeNumber(
      transfer.timestamp
    );

  if (
    timestamp <= 0
  ) {
    return null;
  }

  return timestamp;
}

function isValidTimestamp(
  transfer: SmartMoneyTransfer
): boolean {
  return (
    transferTimestamp(
      transfer
    ) !== null
  );
}

/* =========================================================
   DEDUPLICATION
========================================================= */

function transferKey(
  transfer: SmartMoneyTransfer
): string {
  return [
    (
      transfer.transactionHash ??
      ""
    )
      .trim()
      .toLowerCase(),

    normalizeAddress(
      transfer.fromAddress
    ),

    normalizeAddress(
      transfer.toAddress
    ),

    normalizeSymbol(
      transfer.tokenSymbol
    ),

    String(
      transfer.valueUsd ??
      0
    ),

    String(
      transfer.timestamp ??
      0
    ),
  ].join("|");
}

function deduplicateTransfers(
  transfers: SmartMoneyTransfer[]
): SmartMoneyTransfer[] {
  const seen =
    new Set<string>();

  const result:
    SmartMoneyTransfer[] =
    [];

  for (
    const transfer of transfers
  ) {
    const key =
      transferKey(
        transfer
      );

    if (
      seen.has(key)
    ) {
      continue;
    }

    seen.add(key);

    result.push(
      transfer
    );
  }

  return result;
}

/* =========================================================
   ADDRESS ROLE
========================================================= */

function getAddressRole(
  address: string,
  transfers: SmartMoneyTransfer[],
  whaleAddresses?: Set<string>
): AddressRole {
  const normalized =
    normalizeAddress(
      address
    );

  if (
    !normalized
  ) {
    return "UNKNOWN";
  }

  /*
   * Whale classification has priority once
   * candidate whales have been discovered.
   */
  if (
    whaleAddresses?.has(
      normalized
    )
  ) {
    return "WHALE";
  }

  const labels =
    transfers
      .flatMap(
        (transfer) => {
          const values: string[] =
            [];

          if (
            normalizeAddress(
              transfer.fromAddress
            ) === normalized &&
            transfer.fromLabel
          ) {
            values.push(
              transfer.fromLabel
            );
          }

          if (
            normalizeAddress(
              transfer.toAddress
            ) === normalized &&
            transfer.toLabel
          ) {
            values.push(
              transfer.toLabel
            );
          }

          return values;
        }
      )
      .map(
        (label) =>
          label
            .trim()
            .toLowerCase()
      );

  if (
    labels.some(
      (label) =>
        label.includes(
          "exchange"
        ) ||
        label.includes(
          "binance"
        ) ||
        label.includes(
          "coinbase"
        ) ||
        label.includes(
          "kraken"
        ) ||
        label.includes(
          "okx"
        ) ||
        label.includes(
          "bybit"
        ) ||
        label.includes(
          "gate.io"
        )
    )
  ) {
    return "EXCHANGE";
  }

  if (
    labels.some(
      (label) =>
        label.includes(
          "protocol"
        ) ||
        label.includes(
          "contract"
        ) ||
        label.includes(
          "router"
        ) ||
        label.includes(
          "dex"
        ) ||
        label.includes(
          "pool"
        )
    )
  ) {
    return "PROTOCOL";
  }

  if (
    labels.some(
      (label) =>
        label.includes(
          "smart money"
        ) ||
        label.includes(
          "smart-money"
        )
    )
  ) {
    return "SMART";
  }

  if (
    labels.some(
      (label) =>
        label.includes(
          "institution"
        ) ||
        label.includes(
          "fund"
        ) ||
        label.includes(
          "treasury"
        )
    )
  ) {
    return "INSTITUTIONAL";
  }

  return "UNKNOWN";
}

/* =========================================================
   WHALE DISCOVERY
========================================================= */

function discoverWhales(
  transfers: SmartMoneyTransfer[]
): Map<
  string,
  WalletAccumulator
> {
  const wallets =
    new Map<
      string,
      WalletAccumulator
    >();

  for (
    const transfer of transfers
  ) {
    /*
     * Do not allow malformed timestamps
     * to participate in behavioral windows.
     */
    if (
      !isValidTimestamp(
        transfer
      )
    ) {
      continue;
    }

    const usd =
      transferUsd(
        transfer
      );

    if (
      usd <
      CONFIG.LARGE_TRANSFER_USD
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

    const symbol =
      normalizeSymbol(
        transfer.tokenSymbol
      );

    /*
     * FROM WALLET
     */

    if (from) {
      let wallet =
        wallets.get(
          from
        );

      if (!wallet) {
        wallet = {
          address:
            from,

          chain:
            transfer.chain ??
            "",

          assets:
            new Set<string>(),

          transactions:
            [],

          totalVolumeUsd:
            0,

          inflowUsd:
            0,

          outflowUsd:
            0,

          largestTransactionUsd:
            0,
        };

        wallets.set(
          from,
          wallet
        );
      }

      wallet.transactions.push(
        transfer
      );

      wallet.totalVolumeUsd +=
        usd;

      wallet.outflowUsd +=
        usd;

      wallet.assets.add(
        symbol
      );

      wallet.largestTransactionUsd =
        Math.max(
          wallet.largestTransactionUsd,
          usd
        );
    }

    /*
     * TO WALLET
     */

    if (to) {
      let wallet =
        wallets.get(
          to
        );

      if (!wallet) {
        wallet = {
          address:
            to,

          chain:
            transfer.chain ??
            "",

          assets:
            new Set<string>(),

          transactions:
            [],

          totalVolumeUsd:
            0,

          inflowUsd:
            0,

          outflowUsd:
            0,

          largestTransactionUsd:
            0,
        };

        wallets.set(
          to,
          wallet
        );
      }

      wallet.transactions.push(
        transfer
      );

      wallet.totalVolumeUsd +=
        usd;

      wallet.inflowUsd +=
        usd;

      wallet.assets.add(
        symbol
      );

      wallet.largestTransactionUsd =
        Math.max(
          wallet.largestTransactionUsd,
          usd
        );
    }
  }

  /*
   * Remove known infrastructure.
   */

  for (
    const [
      address,
      wallet,
    ] of wallets
  ) {
    const role =
      getAddressRole(
        address,
        transfers
      );

    if (
      role === "EXCHANGE" ||
      role === "PROTOCOL"
    ) {
      wallets.delete(
        address
      );
    }
  }

  return wallets;
}

/* =========================================================
   TIME WINDOWS
========================================================= */

function splitWindows(
  transactions: SmartMoneyTransfer[],
  now: number
): {
  recent: SmartMoneyTransfer[];
  baseline: SmartMoneyTransfer[];
} {
  const recentStart =
    now -
    CONFIG.RECENT_HOURS *
      60 *
      60 *
      1000;

  const baselineStart =
    recentStart -
    CONFIG.BASELINE_HOURS *
      60 *
      60 *
      1000;

  const recent =
    transactions.filter(
      (transfer) => {
        const timestamp =
          transferTimestamp(
            transfer
          );

        return (
          timestamp !== null &&
          timestamp >=
            recentStart
        );
      }
    );

  const baseline =
    transactions.filter(
      (transfer) => {
        const timestamp =
          transferTimestamp(
            transfer
          );

        return (
          timestamp !== null &&
          timestamp >=
            baselineStart &&
          timestamp <
            recentStart
        );
      }
    );

  return {
    recent,
    baseline,
  };
}

/* =========================================================
   ACTIVITY ACCELERATION
========================================================= */

function calculateAcceleration(
  recentCount: number,
  baselineCount: number
): number {
  /*
   * Normalize the 42-hour baseline
   * into an equivalent 6-hour rate.
   */

  const baselineRate =
    baselineCount /
    CONFIG.BASELINE_HOURS *
    CONFIG.RECENT_HOURS;

  if (
    baselineRate <= 0
  ) {
    return recentCount > 0
      ? CONFIG.EXTREME_ACCELERATION
      : 0;
  }

  return round(
    recentCount /
      baselineRate
  );
}

function activityLevel(
  acceleration: number,
  recentVolumeUsd: number
): WhaleActivityLevel {
  if (
    acceleration >=
      CONFIG.EXTREME_ACCELERATION ||
    recentVolumeUsd >=
      10_000_000
  ) {
    return "EXTREME";
  }

  if (
    acceleration >=
      CONFIG.HIGH_ACCELERATION ||
    recentVolumeUsd >=
      5_000_000
  ) {
    return "HIGH";
  }

  if (
    recentVolumeUsd >=
    1_000_000
  ) {
    return "MODERATE";
  }

  return "LOW";
}

/* =========================================================
   TRANSFER CLASSIFICATION
========================================================= */

/*
 * Classification is now WALLET-PERSPECTIVE.
 *
 * This is critical.
 *
 * Example:
 *
 * Binance -> Whale A
 *
 * For Whale A:
 *   ACCUMULATION
 *
 * For Binance:
 *   infrastructure / ignored
 *
 * Whale A -> Binance
 *
 * For Whale A:
 *   DISTRIBUTION
 *
 * Whale A -> Whale B
 *
 * For Whale A:
 *   ROTATION
 *
 * For Whale B:
 *   ROTATION
 */

function classifyTransferForWallet(
  transfer: SmartMoneyTransfer,
  walletAddress: string,
  allTransfers: SmartMoneyTransfer[],
  whaleAddresses: Set<string>
): ClassifiedTransfer {
  const wallet =
    normalizeAddress(
      walletAddress
    );

  const from =
    normalizeAddress(
      transfer.fromAddress
    );

  const to =
    normalizeAddress(
      transfer.toAddress
    );

  if (
    !wallet ||
    (
      from !== wallet &&
      to !== wallet
    )
  ) {
    return {
      direction:
        "UNKNOWN",

      weight:
        0,

      fromRole:
        "UNKNOWN",

      toRole:
        "UNKNOWN",
    };
  }

  if (
    from &&
    to &&
    from === to
  ) {
    return {
      direction:
        "NEUTRAL",

      weight:
        0,

      fromRole:
        "WHALE",

      toRole:
        "WHALE",
    };
  }

  const fromRole =
    getAddressRole(
      from,
      allTransfers,
      whaleAddresses
    );

  const toRole =
    getAddressRole(
      to,
      allTransfers,
      whaleAddresses
    );

  /*
   * EXCHANGE -> WALLET
   */

  if (
    to === wallet &&
    fromRole === "EXCHANGE"
  ) {
    return {
      direction:
        "ACCUMULATION",

      weight:
        1,

      fromRole,
      toRole,
    };
  }

  /*
   * WALLET -> EXCHANGE
   */

  if (
    from === wallet &&
    toRole === "EXCHANGE"
  ) {
    return {
      direction:
        "DISTRIBUTION",

      weight:
        1,

      fromRole,
      toRole,
    };
  }

  /*
   * Protocol interaction.
   *
   * This is intentionally neutral-directional
   * because protocol activity can represent
   * staking, LP, borrowing, leverage, etc.
   */

  if (
    fromRole === "PROTOCOL" ||
    toRole === "PROTOCOL"
  ) {
    return {
      direction:
        "POSITIONING",

      weight:
        0.75,

      fromRole,
      toRole,
    };
  }

  /*
   * WALLET -> WHALE
   * WHALE -> WALLET
   *
   * Treat as rotation rather than assuming
   * bullish/bearish intent.
   */

  if (
    (
      from === wallet &&
      toRole === "WHALE"
    ) ||
    (
      to === wallet &&
      fromRole === "WHALE"
    )
  ) {
    return {
      direction:
        "ROTATION",

      weight:
        CONFIG.WALLET_ROTATION_WEIGHT,

      fromRole,
      toRole,
    };
  }

  /*
   * SMART MONEY / INSTITUTIONAL counterparties
   * are useful contextual signals.
   */

  if (
    (
      to === wallet &&
      (
        fromRole === "SMART" ||
        fromRole === "INSTITUTIONAL"
      )
    )
  ) {
    return {
      direction:
        "ACCUMULATION",

      weight:
        0.65,

      fromRole,
      toRole,
    };
  }

  if (
    (
      from === wallet &&
      (
        toRole === "SMART" ||
        toRole === "INSTITUTIONAL"
      )
    )
  ) {
    return {
      direction:
        "DE_RISKING",

      weight:
        0.65,

      fromRole,
      toRole,
    };
  }

  /*
   * UNKNOWN -> WALLET
   *
   * Weak accumulation evidence.
   */

  if (
    to === wallet
  ) {
    return {
      direction:
        "ACCUMULATION",

      weight:
        CONFIG.UNKNOWN_COUNTERPARTY_WEIGHT,

      fromRole,
      toRole,
    };
  }

  /*
   * WALLET -> UNKNOWN
   *
   * Weak de-risking evidence.
   */

  if (
    from === wallet
  ) {
    return {
      direction:
        "DE_RISKING",

      weight:
        CONFIG.UNKNOWN_COUNTERPARTY_WEIGHT,

      fromRole,
      toRole,
    };
  }

  return {
    direction:
      "UNKNOWN",

    weight:
      0,

    fromRole,
    toRole,
  };
}

/* =========================================================
   EVIDENCE
========================================================= */

function buildEvidence(
  wallet: WalletAccumulator,
  recent: SmartMoneyTransfer[],
  baseline: SmartMoneyTransfer[],
  accumulationUsd: number,
  distributionUsd: number,
  whaleAddresses: Set<string>,
  allTransfers: SmartMoneyTransfer[]
): WhaleEvidence[] {
  const evidence:
    WhaleEvidence[] =
    [];

  const recentVolume =
    recent.reduce(
      (
        total,
        transfer
      ) =>
        total +
        transferUsd(
          transfer
        ),
      0
    );

  const acceleration =
    calculateAcceleration(
      recent.length,
      baseline.length
    );

  /*
   * Large transfer evidence.
   */

  const largeTransfers =
    recent.filter(
      (transfer) =>
        transferUsd(
          transfer
        ) >=
        CONFIG.LARGE_TRANSFER_USD
    );

  if (
    largeTransfers.length > 0
  ) {
    evidence.push({
      type:
        "LARGE_TRANSFER",

      description:
        `Recent whale activity includes ${largeTransfers.length} large transfer${
          largeTransfers.length === 1
            ? ""
            : "s"
        }.`,

      valueUsd:
        largeTransfers.reduce(
          (
            total,
            transfer
          ) =>
            total +
            transferUsd(
              transfer
            ),
          0
        ),

      weight:
        0.75,
    });
  }

  /*
   * Strong transfer evidence.
   */

  const strongTransfers =
    recent.filter(
      (transfer) =>
        transferUsd(
          transfer
        ) >=
        CONFIG.STRONG_TRANSFER_USD
    );

  if (
    strongTransfers.length > 0
  ) {
    const strongest =
      Math.max(
        ...strongTransfers.map(
          (transfer) =>
            transferUsd(
              transfer
            )
        )
      );

    evidence.push({
      type:
        "LARGE_TRANSFER",

      description:
        `At least one strong whale transfer exceeded $${formatCompactUsd(
          strongest
        )}.`,

      valueUsd:
        strongest,

      weight:
        1,
    });
  }

  /*
   * Exchange flow evidence.
   */

  let exchangeAccumulation =
    0;

  let exchangeDistribution =
    0;

  for (
    const transfer of recent
  ) {
    const classified =
      classifyTransferForWallet(
        transfer,
        wallet.address,
        allTransfers,
        whaleAddresses
      );

    if (
      classified.direction ===
      "ACCUMULATION" &&
      classified.fromRole ===
      "EXCHANGE"
    ) {
      exchangeAccumulation +=
        transferUsd(
          transfer
        );
    }

    if (
      classified.direction ===
      "DISTRIBUTION" &&
      classified.toRole ===
      "EXCHANGE"
    ) {
      exchangeDistribution +=
        transferUsd(
          transfer
        );
    }
  }

  if (
    exchangeAccumulation > 0
  ) {
    evidence.push({
      type:
        "EXCHANGE_FLOW",

      description:
        `Whale received approximately $${formatCompactUsd(
          exchangeAccumulation
        )} from exchange-linked addresses.`,

      valueUsd:
        exchangeAccumulation,

      weight:
        1,
    });
  }

  if (
    exchangeDistribution > 0
  ) {
    evidence.push({
      type:
        "EXCHANGE_FLOW",

      description:
        `Whale sent approximately $${formatCompactUsd(
          exchangeDistribution
        )} to exchange-linked addresses.`,

      valueUsd:
        exchangeDistribution,

      weight:
        1,
    });
  }

  /*
   * Activity acceleration.
   */

  if (
    acceleration >=
    CONFIG.HIGH_ACCELERATION
  ) {
    evidence.push({
      type:
        "ACTIVITY_ACCELERATION",

      description:
        `Whale activity accelerated ${acceleration.toFixed(
          1
        )}x versus the baseline window.`,

      weight:
        1,
    });
  }

  /*
   * Repeated behavior.
   */

  if (
    recent.length >=
    CONFIG.MIN_BEHAVIOR_TRANSACTIONS
  ) {
    evidence.push({
      type:
        "REPEATED_BEHAVIOR",

      description:
        "Repeated large-wallet activity was observed during the recent window.",

      weight:
        0.8,
    });
  }

  /*
   * Directional flow.
   */

  if (
    accumulationUsd >
    distributionUsd *
      1.25
  ) {
    evidence.push({
      type:
        "DIRECTIONAL_FLOW",

      description:
        "Accumulation evidence currently outweighs distribution evidence.",

      valueUsd:
        accumulationUsd,

      weight:
        1,
    });
  }

  if (
    distributionUsd >
    accumulationUsd *
      1.25
  ) {
    evidence.push({
      type:
        "DIRECTIONAL_FLOW",

      description:
        "Distribution evidence currently outweighs accumulation evidence.",

      valueUsd:
        distributionUsd,

      weight:
        1,
    });
  }

  /*
   * Multi-asset behavior.
   */

  if (
    wallet.assets.size >=
    2
  ) {
    evidence.push({
      type:
        "WALLET_CONCENTRATION",

      description:
        `Whale activity spans ${wallet.assets.size} assets.`,

      weight:
        0.35,
    });
  }

  return evidence
    .sort(
      (a, b) =>
        b.weight -
        a.weight
    )
    .slice(
      0,
      CONFIG.MAX_EVIDENCE
    );
}

/* =========================================================
   USD FORMATTING
========================================================= */

function formatCompactUsd(
  value: number
): string {
  const abs =
    Math.abs(value);

  if (
    abs >=
    1_000_000_000
  ) {
    return `${round(
      value /
        1_000_000_000,
      1
    )}B`;
  }

  if (
    abs >=
    1_000_000
  ) {
    return `${round(
      value /
        1_000_000,
      1
    )}M`;
  }

  if (
    abs >=
    1_000
  ) {
    return `${round(
      value /
        1_000,
      1
    )}K`;
  }

  return round(
    value,
    0
  ).toLocaleString();
}

/* =========================================================
   WALLET INTENT
========================================================= */

function calculateWalletIntent(
  wallet: WalletAccumulator,
  allTransfers: SmartMoneyTransfer[],
  whaleAddresses: Set<string>
): WhaleWalletBehavior {
  const now =
    Date.now();

  const {
    recent,
    baseline,
  } =
    splitWindows(
      wallet.transactions,
      now
    );

  let accumulationUsd =
    0;

  let distributionUsd =
    0;

  let positioningUsd =
    0;

  let deRiskingUsd =
    0;

  let rotationUsd =
    0;

  for (
    const transfer of recent
  ) {
    const usd =
      transferUsd(
        transfer
      );

    const classified =
      classifyTransferForWallet(
        transfer,
        wallet.address,
        allTransfers,
        whaleAddresses
      );

    const weightedUsd =
      usd *
      classified.weight;

    switch (
      classified.direction
    ) {
      case "ACCUMULATION":
        accumulationUsd +=
          weightedUsd;
        break;

      case "DISTRIBUTION":
        distributionUsd +=
          weightedUsd;
        break;

      case "POSITIONING":
        positioningUsd +=
          weightedUsd;
        break;

      case "DE_RISKING":
        deRiskingUsd +=
          weightedUsd;
        break;

      case "ROTATION":
        rotationUsd +=
          weightedUsd;
        break;
    }
  }

  const recentVolume =
    recent.reduce(
      (
        total,
        transfer
      ) =>
        total +
        transferUsd(
          transfer
        ),
      0
    );

  const baselineVolume =
    baseline.reduce(
      (
        total,
        transfer
      ) =>
        total +
        transferUsd(
          transfer
        ),
      0
    );

  const acceleration =
    calculateAcceleration(
      recent.length,
      baseline.length
    );

  const directionalTotal =
    accumulationUsd +
    distributionUsd;

  const accumulationRatio =
    directionalTotal > 0
      ? accumulationUsd /
        directionalTotal
      : 0;

  const distributionRatio =
    directionalTotal > 0
      ? distributionUsd /
        directionalTotal
      : 0;

  let intent:
    WhaleIntentDirection =
    "NEUTRAL";

  let intentScore =
    0;

  /*
   * Require both:
   *
   * 1. directional dominance
   * 2. meaningful behavioral observations
   */

  const hasBehavioralDepth =
    recent.length >=
    CONFIG.MIN_BEHAVIOR_TRANSACTIONS;

  if (
    hasBehavioralDepth &&
    accumulationRatio >=
      0.65 &&
    accumulationUsd >=
      CONFIG.MIN_DIRECTIONAL_SCORE *
        10_000
  ) {
    intent =
      "ACCUMULATION";

    intentScore =
      accumulationRatio *
      100;
  } else if (
    hasBehavioralDepth &&
    distributionRatio >=
      0.65 &&
    distributionUsd >=
      CONFIG.MIN_DIRECTIONAL_SCORE *
        10_000
  ) {
    intent =
      "DISTRIBUTION";

    intentScore =
      distributionRatio *
      100;
  } else if (
    positioningUsd >
    Math.max(
      accumulationUsd,
      distributionUsd
    )
  ) {
    intent =
      "POSITIONING";

    intentScore =
      clamp(
        positioningUsd /
          Math.max(
            recentVolume,
            1
          ) *
          100
      );
  } else if (
    rotationUsd >
    Math.max(
      accumulationUsd,
      distributionUsd
    )
  ) {
    intent =
      "ROTATION";

    intentScore =
      clamp(
        rotationUsd /
          Math.max(
            recentVolume,
            1
          ) *
          100
      );
  } else if (
    deRiskingUsd >
    accumulationUsd
  ) {
    intent =
      "DE_RISKING";

    intentScore =
      clamp(
        deRiskingUsd /
          Math.max(
            recentVolume,
            1
          ) *
          100
      );
  }

  /*
   * Confidence model.
   */

  const transactionEvidence =
    clamp(
      recent.length /
        8 *
        100
    );

  const capitalEvidence =
    clamp(
      recentVolume /
        5_000_000 *
        100
    );

  const accelerationEvidence =
    clamp(
      acceleration /
        4 *
        100
    );

  const directionalEvidence =
    clamp(
      Math.abs(
        accumulationUsd -
          distributionUsd
      ) /
        Math.max(
          recentVolume,
          1
        ) *
        100
    );

  /*
   * Behavioral depth bonus.
   */

  const behavioralDepth =
    hasBehavioralDepth
      ? 10
      : recent.length === 2
        ? 4
        : 0;

  const confidence =
    clamp(
      transactionEvidence *
        0.22 +
      capitalEvidence *
        0.23 +
      accelerationEvidence *
        0.15 +
      directionalEvidence *
        0.30 +
      behavioralDepth
    );

  const evidence =
    buildEvidence(
      wallet,
      recent,
      baseline,
      accumulationUsd,
      distributionUsd,
      whaleAddresses,
      allTransfers
    );

  const firstSeen =
    wallet.transactions.reduce(
      (
        earliest,
        transfer
      ) => {
        const timestamp =
          transferTimestamp(
            transfer
          );

        if (
          timestamp === null
        ) {
          return earliest;
        }

        return Math.min(
          earliest,
          timestamp
        );
      },
      now
    );

  const lastSeen =
    wallet.transactions.reduce(
      (
        latest,
        transfer
      ) => {
        const timestamp =
          transferTimestamp(
            transfer
          );

        if (
          timestamp === null
        ) {
          return latest;
        }

        return Math.max(
          latest,
          timestamp
        );
      },
      0
    );

  return {
    address:
      wallet.address,

    chain:
      wallet.chain,

    assets:
      Array.from(
        wallet.assets
      ),

    transactionCount:
      wallet.transactions.length,

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
        wallet.inflowUsd -
        wallet.outflowUsd
      ),

    largestTransactionUsd:
      round(
        wallet.largestTransactionUsd
      ),

    recentTransactionCount:
      recent.length,

    previousTransactionCount:
      baseline.length,

    recentVolumeUsd:
      round(
        recentVolume
      ),

    previousVolumeUsd:
      round(
        baselineVolume
      ),

    activityAcceleration:
      acceleration,

    accumulationUsd:
      round(
        accumulationUsd
      ),

    distributionUsd:
      round(
        distributionUsd
      ),

    positioningUsd:
      round(
        positioningUsd
      ),

    deRiskingUsd:
      round(
        deRiskingUsd
      ),

    rotationUsd:
      round(
        rotationUsd
      ),

    intent,

    intentScore:
      round(
        intentScore
      ),

    confidence:
      round(
        Math.min(
          confidence,
          CONFIG.MAX_INITIAL_CONFIDENCE
        )
      ),

    activity:
      activityLevel(
        acceleration,
        recentVolume
      ),

    evidence,

    firstSeen,

    lastSeen,
  };
}

/* =========================================================
   ASSET AGGREGATION
========================================================= */

/*
 * Asset aggregation intentionally operates on UNIQUE
 * transfers rather than simply summing wallet outputs.
 *
 * This prevents:
 *
 * Whale A -> Whale B
 *
 * from being counted twice as $10M of asset activity.
 */

function buildAssetOutput(
  transfers: SmartMoneyTransfer[],
  whaleAddresses: Set<string>
): WhaleIntentAsset[] {
  const assets =
    new Map<
      string,
      AssetAccumulator
    >();

  const now =
    Date.now();

  const recentStart =
    now -
    CONFIG.RECENT_HOURS *
      60 *
      60 *
      1000;

  const recentTransfers =
    transfers.filter(
      (transfer) => {
        const timestamp =
          transferTimestamp(
            transfer
          );

        return (
          timestamp !== null &&
          timestamp >=
            recentStart
        );
      }
    );

  for (
    const transfer of recentTransfers
  ) {
    const symbol =
      normalizeSymbol(
        transfer.tokenSymbol
      );

    const usd =
      transferUsd(
        transfer
      );

    if (
      usd <= 0
    ) {
      continue;
    }

    let asset =
      assets.get(
        symbol
      );

    if (!asset) {
      asset = {
        symbol,

        whaleAddresses:
          new Set<string>(),

        transactions:
          0,

        totalVolumeUsd:
          0,

        accumulationUsd:
          0,

        distributionUsd:
          0,

        positioningUsd:
          0,

        deRiskingUsd:
          0,

        rotationUsd:
          0,

        evidence:
          [],
      };

      assets.set(
        symbol,
        asset
      );
    }

    const from =
      normalizeAddress(
        transfer.fromAddress
      );

    const to =
      normalizeAddress(
        transfer.toAddress
      );

    const fromRole =
      getAddressRole(
        from,
        transfers,
        whaleAddresses
      );

    const toRole =
      getAddressRole(
        to,
        transfers,
        whaleAddresses
      );

    const involvesWhale =
      whaleAddresses.has(
        from
      ) ||
      whaleAddresses.has(
        to
      );

    if (
      !involvesWhale
    ) {
      continue;
    }

    asset.transactions +=
      1;

    asset.totalVolumeUsd +=
      usd;

    if (
      whaleAddresses.has(
        to
      ) &&
      fromRole ===
        "EXCHANGE"
    ) {
      asset.accumulationUsd +=
        usd;

      asset.whaleAddresses.add(
        to
      );
    } else if (
      whaleAddresses.has(
        from
      ) &&
      toRole ===
        "EXCHANGE"
    ) {
      asset.distributionUsd +=
        usd;

      asset.whaleAddresses.add(
        from
      );
    } else if (
      fromRole ===
        "PROTOCOL" ||
      toRole ===
        "PROTOCOL"
    ) {
      asset.positioningUsd +=
        usd;

      if (
        whaleAddresses.has(
          from
        )
      ) {
        asset.whaleAddresses.add(
          from
        );
      }

      if (
        whaleAddresses.has(
          to
        )
      ) {
        asset.whaleAddresses.add(
          to
        );
      }
    } else if (
      whaleAddresses.has(
        from
      ) &&
      whaleAddresses.has(
        to
      )
    ) {
      asset.rotationUsd +=
        usd;

      asset.whaleAddresses.add(
        from
      );

      asset.whaleAddresses.add(
        to
      );
    } else if (
      whaleAddresses.has(
        to
      )
    ) {
      asset.accumulationUsd +=
        usd *
        CONFIG.UNKNOWN_COUNTERPARTY_WEIGHT;

      asset.whaleAddresses.add(
        to
      );
    } else if (
      whaleAddresses.has(
        from
      )
    ) {
      asset.deRiskingUsd +=
        usd *
        CONFIG.UNKNOWN_COUNTERPARTY_WEIGHT;

      asset.whaleAddresses.add(
        from
      );
    }
  }

  return Array.from(
    assets.values()
  )
    .map(
      (asset) => {
        const directional =
          asset.accumulationUsd +
          asset.distributionUsd;

        let intent:
          WhaleIntentDirection =
          "NEUTRAL";

        let score =
          0;

        if (
          asset.accumulationUsd >
            asset.distributionUsd *
              1.25 &&
          asset.accumulationUsd >
            0
        ) {
          intent =
            "ACCUMULATION";

          score =
            asset.accumulationUsd /
            Math.max(
              directional,
              1
            ) *
            100;
        } else if (
          asset.distributionUsd >
            asset.accumulationUsd *
              1.25 &&
          asset.distributionUsd >
            0
        ) {
          intent =
            "DISTRIBUTION";

          score =
            asset.distributionUsd /
            Math.max(
              directional,
              1
            ) *
            100;
        } else if (
          asset.positioningUsd >
          Math.max(
            asset.accumulationUsd,
            asset.distributionUsd
          )
        ) {
          intent =
            "POSITIONING";

          score =
            asset.positioningUsd /
            Math.max(
              asset.totalVolumeUsd,
              1
            ) *
            100;
        } else if (
          asset.rotationUsd >
          Math.max(
            asset.accumulationUsd,
            asset.distributionUsd
          )
        ) {
          intent =
            "ROTATION";

          score =
            asset.rotationUsd /
            Math.max(
              asset.totalVolumeUsd,
              1
            ) *
            100;
        } else if (
          asset.deRiskingUsd >
          asset.accumulationUsd
        ) {
          intent =
            "DE_RISKING";

          score =
            asset.deRiskingUsd /
            Math.max(
              asset.totalVolumeUsd,
              1
            ) *
            100;
        }

        /*
         * Evidence.
         */

        if (
          asset.accumulationUsd >
          0
        ) {
          asset.evidence.push({
            type:
              "EXCHANGE_FLOW",

            description:
              `Whale accumulation activity reached approximately $${formatCompactUsd(
                asset.accumulationUsd
              )}.`,

            valueUsd:
              asset.accumulationUsd,

            weight:
              1,
          });
        }

        if (
          asset.distributionUsd >
          0
        ) {
          asset.evidence.push({
            type:
              "EXCHANGE_FLOW",

            description:
              `Whale distribution activity reached approximately $${formatCompactUsd(
                asset.distributionUsd
              )}.`,

            valueUsd:
              asset.distributionUsd,

            weight:
              1,
          });
        }

        if (
          asset.transactions >=
          CONFIG.MIN_BEHAVIOR_TRANSACTIONS
        ) {
          asset.evidence.push({
            type:
              "REPEATED_BEHAVIOR",

            description:
              `Repeated whale activity was detected across ${asset.transactions} recent transfers.`,

            weight:
              0.8,
          });
        }

        if (
          asset.whaleAddresses.size >=
          2
        ) {
          asset.evidence.push({
            type:
              "MULTI_WALLET",

            description:
              `The signal involves ${asset.whaleAddresses.size} whale wallets.`,

            weight:
              0.9,
          });
        }

        if (
          asset.rotationUsd >
          0
        ) {
          asset.evidence.push({
            type:
              "ROTATION",

            description:
              `Whale-to-whale rotation reached approximately $${formatCompactUsd(
                asset.rotationUsd
              )}.`,

            valueUsd:
              asset.rotationUsd,

            weight:
              0.5,
          });
        }

        const confidence =
          clamp(
            Math.min(
              asset.whaleAddresses.size *
                15,
              75
            ) +
            Math.min(
              asset.transactions *
                3,
              15
            )
          );

        const activity:
          WhaleActivityLevel =
          asset.totalVolumeUsd >=
          10_000_000
            ? "EXTREME"
            : asset.totalVolumeUsd >=
              5_000_000
            ? "HIGH"
            : asset.totalVolumeUsd >=
              1_000_000
            ? "MODERATE"
            : "LOW";

        return {
          symbol:
            asset.symbol,

          whaleCount:
            asset.whaleAddresses.size,

          transactionCount:
            asset.transactions,

          totalVolumeUsd:
            round(
              asset.totalVolumeUsd
            ),

          accumulationUsd:
            round(
              asset.accumulationUsd
            ),

          distributionUsd:
            round(
              asset.distributionUsd
            ),

          positioningUsd:
            round(
              asset.positioningUsd
            ),

          deRiskingUsd:
            round(
              asset.deRiskingUsd
            ),

          rotationUsd:
            round(
              asset.rotationUsd
            ),

          intent,

          intentScore:
            round(
              clamp(
                score
              )
            ),

          confidence:
            round(
              confidence
            ),

          activity,

          evidence:
            asset.evidence
              .sort(
                (a, b) =>
                  b.weight -
                  a.weight
              )
              .slice(
                0,
                CONFIG.MAX_EVIDENCE
              ),
        };
      }
    )
    .sort(
      (a, b) =>
        b.totalVolumeUsd -
        a.totalVolumeUsd
    )
    .slice(
      0,
      CONFIG.MAX_ASSETS
    );
}

/* =========================================================
   OVERALL INTENT
========================================================= */

function calculateOverallIntent(
  wallets: WhaleWalletBehavior[]
): {
  intent: WhaleIntentDirection;

  score: number;

  confidence: number;
} {
  if (
    !wallets.length
  ) {
    return {
      intent:
        "UNKNOWN",

      score:
        0,

      confidence:
        0,
    };
  }

  let accumulation =
    0;

  let distribution =
    0;

  let positioning =
    0;

  let deRisking =
    0;

  let rotation =
    0;

  let confidenceWeight =
    0;

  for (
    const wallet of wallets
  ) {
    /*
     * Confidence weighting is capped so one
     * highly active wallet cannot dominate
     * the entire market signal.
     */

    const weight =
      Math.max(
        Math.min(
          wallet.confidence,
          85
        ),
        1
      );

    accumulation +=
      wallet.accumulationUsd *
      weight;

    distribution +=
      wallet.distributionUsd *
      weight;

    positioning +=
      wallet.positioningUsd *
      weight;

    deRisking +=
      wallet.deRiskingUsd *
      weight;

    rotation +=
      wallet.rotationUsd *
      weight;

    confidenceWeight +=
      weight;
  }

  if (
    confidenceWeight <=
    0
  ) {
    return {
      intent:
        "UNKNOWN",

      score:
        0,

      confidence:
        0,
    };
  }

  const candidates = [
    {
      intent:
        "ACCUMULATION" as const,

      value:
        accumulation,
    },

    {
      intent:
        "DISTRIBUTION" as const,

      value:
        distribution,
    },

    {
      intent:
        "POSITIONING" as const,

      value:
        positioning,
    },

    {
      intent:
        "DE_RISKING" as const,

      value:
        deRisking,
    },

    {
      intent:
        "ROTATION" as const,

      value:
        rotation,
    },
  ];

  candidates.sort(
    (a, b) =>
      b.value -
      a.value
  );

  const strongest =
    candidates[0];

  const second =
    candidates[1];

  const total =
    candidates.reduce(
      (
        sum,
        candidate
      ) =>
        sum +
        candidate.value,
      0
    );

  if (
    total <=
    0
  ) {
    return {
      intent:
        "NEUTRAL",

      score:
        0,

      confidence:
        0,
    };
  }

  const dominant =
    second.value <= 0
      ? 1
      : strongest.value /
        second.value;

  const score =
    clamp(
      strongest.value /
        total *
        100
    );

  /*
   * More wallets = better cross-wallet confirmation.
   */

  const multiWalletEvidence =
    Math.min(
      wallets.length *
        5,
      25
    );

  /*
   * Dominance bonus.
   */

  const dominanceBonus =
    dominant >= 1.5
      ? 10
      : dominant >= 1.25
        ? 5
        : 0;

  const confidence =
    clamp(
      score *
        0.65 +
      multiWalletEvidence +
      dominanceBonus
    );

  return {
    intent:
      dominant >=
      1.15
        ? strongest.intent
        : "NEUTRAL",

    score:
      round(
        score
      ),

    confidence:
      round(
        Math.min(
          confidence,
          CONFIG.MAX_INITIAL_CONFIDENCE
        )
      ),
  };
}

/* =========================================================
   KEY DRIVERS
========================================================= */

function buildKeyDrivers(
  wallets: WhaleWalletBehavior[]
): string[] {
  const drivers:
    string[] =
    [];

  const strongest =
    [...wallets].sort(
      (a, b) =>
        b.intentScore *
          b.confidence -
        a.intentScore *
          a.confidence
    )[0];

  if (
    strongest
  ) {
    drivers.push(
      `${strongest.intent.toLowerCase()} behavior detected from ${shortAddress(
        strongest.address
      )}`
    );
  }

  const accelerated =
    wallets.filter(
      (wallet) =>
        wallet.activityAcceleration >=
        CONFIG.HIGH_ACCELERATION
    );

  if (
    accelerated.length
  ) {
    drivers.push(
      `Whale activity accelerated across ${accelerated.length} wallet${
        accelerated.length === 1
          ? ""
          : "s"
      }`
    );
  }

  const accumulation =
    wallets.filter(
      (wallet) =>
        wallet.intent ===
        "ACCUMULATION"
    );

  if (
    accumulation.length
  ) {
    drivers.push(
      `${accumulation.length} whale wallet${
        accumulation.length === 1
          ? ""
          : "s"
      } show accumulation behavior`
    );
  }

  const distribution =
    wallets.filter(
      (wallet) =>
        wallet.intent ===
        "DISTRIBUTION"
    );

  if (
    distribution.length
  ) {
    drivers.push(
      `${distribution.length} whale wallet${
        distribution.length === 1
          ? ""
          : "s"
      } show distribution behavior`
    );
  }

  const rotation =
    wallets.filter(
      (wallet) =>
        wallet.intent ===
        "ROTATION"
    );

  if (
    rotation.length
  ) {
    drivers.push(
      `Large-wallet rotation detected across ${rotation.length} wallet${
        rotation.length === 1
          ? ""
          : "s"
      }`
    );
  }

  const highCapital =
    wallets.filter(
      (wallet) =>
        wallet.recentVolumeUsd >=
        5_000_000
    );

  if (
    highCapital.length
  ) {
    drivers.push(
      `${highCapital.length} whale wallet${
        highCapital.length === 1
          ? ""
          : "s"
      } moved more than $5M recently`
    );
  }

  if (
    !drivers.length
  ) {
    drivers.push(
      "No dominant whale behavior detected"
    );
  }

  return [
    ...new Set(
      drivers
    ),
  ].slice(
    0,
    CONFIG.MAX_DRIVERS
  );
}

function shortAddress(
  address: string
): string {
  if (
    address.length <=
    12
  ) {
    return address;
  }

  return `${address.slice(
    0,
    6
  )}...${address.slice(
    -4
  )}`;
}

/* =========================================================
   EMPTY OUTPUT
========================================================= */

function emptyOutput(): WhaleIntentOutput {
  return {
    overallIntent:
      "UNKNOWN",

    overallScore:
      0,

    overallConfidence:
      0,

    whaleCount:
      0,

    activeWhaleCount:
      0,

    totalVolumeUsd:
      0,

    accumulationUsd:
      0,

    distributionUsd:
      0,

    positioningUsd:
      0,

    deRiskingUsd:
      0,

    rotationUsd:
      0,

    assets:
      [],

    wallets:
      [],

    keyDrivers: [
      "No whale transfer data available",
    ],

    generatedAt:
      Date.now(),

    observationWindow: {
      recentHours:
        CONFIG.RECENT_HOURS,

      baselineHours:
        CONFIG.BASELINE_HOURS,
    },
  };
}

/* =========================================================
   MAIN ENGINE
========================================================= */

export function analyzeWhaleIntent(
  transfers: SmartMoneyTransfer[]
): WhaleIntentOutput {
  if (
    !Array.isArray(
      transfers
    ) ||
    !transfers.length
  ) {
    return emptyOutput();
  }

  /*
   * Step 1:
   * Remove duplicate observations.
   */

  const cleanTransfers =
    deduplicateTransfers(
      transfers
    );

  /*
   * Step 2:
   * Discover candidate whale wallets.
   */

  const walletMap =
    discoverWhales(
      cleanTransfers
    );

  /*
   * Step 3:
   * Lifetime volume qualification.
   */

  const candidateWallets =
    Array.from(
      walletMap.values()
    )
      .filter(
        (wallet) =>
          wallet.totalVolumeUsd >=
          CONFIG.MIN_WHALE_VOLUME_USD
      );

  /*
   * Step 4:
   * Build whale address set BEFORE
   * behavioral classification.
   */

  const whaleAddresses =
    new Set<string>(
      candidateWallets.map(
        (wallet) =>
          wallet.address
      )
    );

  /*
   * Step 5:
   * Calculate wallet-level behavior.
   */

  const wallets =
    candidateWallets
      .map(
        (wallet) =>
          calculateWalletIntent(
            wallet,
            cleanTransfers,
            whaleAddresses
          )
      )
      .sort(
        (a, b) =>
          b.intentScore *
            b.confidence -
          a.intentScore *
            a.confidence
      )
      .slice(
        0,
        CONFIG.MAX_WALLETS
      );

  /*
   * Step 6:
   * Market-level intent.
   */

  const overall =
    calculateOverallIntent(
      wallets
    );

  /*
   * Step 7:
   * Asset-level intent.
   *
   * Uses unique transfers rather than
   * summing wallet-level records.
   */

  const assets =
    buildAssetOutput(
      cleanTransfers,
      whaleAddresses
    );

  /*
   * Step 8:
   * Aggregate wallet-level recent behavior.
   */

  const totalVolumeUsd =
    wallets.reduce(
      (
        total,
        wallet
      ) =>
        total +
        wallet.recentVolumeUsd,
      0
    );

  const accumulationUsd =
    wallets.reduce(
      (
        total,
        wallet
      ) =>
        total +
        wallet.accumulationUsd,
      0
    );

  const distributionUsd =
    wallets.reduce(
      (
        total,
        wallet
      ) =>
        total +
        wallet.distributionUsd,
      0
    );

  const positioningUsd =
    wallets.reduce(
      (
        total,
        wallet
      ) =>
        total +
        wallet.positioningUsd,
      0
    );

  const deRiskingUsd =
    wallets.reduce(
      (
        total,
        wallet
      ) =>
        total +
        wallet.deRiskingUsd,
      0
    );

  const rotationUsd =
    wallets.reduce(
      (
        total,
        wallet
      ) =>
        total +
        wallet.rotationUsd,
      0
    );

  /*
   * Step 9:
   * Return stable public contract.
   */

  return {
    overallIntent:
      overall.intent,

    overallScore:
      overall.score,

    overallConfidence:
      overall.confidence,

    whaleCount:
      wallets.length,

    activeWhaleCount:
      wallets.filter(
        (wallet) =>
          wallet.recentTransactionCount >
          0
      ).length,

    totalVolumeUsd:
      round(
        totalVolumeUsd
      ),

    accumulationUsd:
      round(
        accumulationUsd
      ),

    distributionUsd:
      round(
        distributionUsd
      ),

    positioningUsd:
      round(
        positioningUsd
      ),

    deRiskingUsd:
      round(
        deRiskingUsd
      ),

    rotationUsd:
      round(
        rotationUsd
      ),

    assets,

    wallets,

    keyDrivers:
      buildKeyDrivers(
        wallets
      ),

    generatedAt:
      Date.now(),

    observationWindow: {
      recentHours:
        CONFIG.RECENT_HOURS,

      baselineHours:
        CONFIG.BASELINE_HOURS,
    },
  };
}