
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Brain,
  ExternalLink,
  Fish,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  Wallet,
  ChevronDown,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type SmartMoneyDirection =
  | "ACCUMULATING"
  | "DISTRIBUTING"
  | "NEUTRAL";

type SmartMoneyIntent =
  | "ACCUMULATION"
  | "DISTRIBUTION"
  | "POSITIONING"
  | "ROTATION"
  | "DE_RISKING"
  | "NEUTRAL"
  | "UNKNOWN";

type SmartMoneyActivity =
  | "LOW"
  | "MODERATE"
  | "HIGH"
  | "EXTREME";

type SmartMoneyAsset = {
  symbol: string;

  direction: SmartMoneyDirection;
  intent: SmartMoneyIntent;
  activity: SmartMoneyActivity;

  smartMoneyScore: number;
  confidence: number;

  flow: {
    inflow: number;
    outflow: number;
    netFlow: number;
  };

  largeTransactions: number;

  accumulationScore: number;
  distributionScore: number;

  drivers: string[];

  risk: string;

  updatedAt: number;
};

type SmartWallet = {
  address: string;
  chain: string;
  classification: string;

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

type SmartMoneyResponse = {
  success: boolean;

  provider?: string;
  chain?: string;

  tokens?: {
    symbol: string;
    address: string;
  }[];

  generatedAt?: number;

  transfers?: {
    count?: number;
  };

  smartMoney?: {
    overallDirection: SmartMoneyDirection;
    overallScore: number;
    overallConfidence: number;

    flow: {
      inflowUsd: number;
      outflowUsd: number;
      netFlowUsd: number;
    };

    smartWalletCount: number;

    wallets: SmartWallet[];

    assets?: SmartMoneyAsset[];

    keyDrivers?: string[];
  };

  error?: string;
};

/* =========================================================
   HELPERS
========================================================= */

function safeNumber(value: number | undefined | null) {
  return Number.isFinite(value) ? Number(value) : 0;
}

function clamp(
  value: number | undefined | null,
  min = 0,
  max = 100
) {
  return Math.min(
    max,
    Math.max(min, safeNumber(value))
  );
}

function formatUsd(value: number) {
  const safe = safeNumber(value);
  const abs = Math.abs(safe);

  if (abs >= 1_000_000_000) {
    return `$${(safe / 1_000_000_000).toFixed(2)}B`;
  }

  if (abs >= 1_000_000) {
    return `$${(safe / 1_000_000).toFixed(2)}M`;
  }

  if (abs >= 1_000) {
    return `$${(safe / 1_000).toFixed(1)}K`;
  }

  return `$${safe.toFixed(2)}`;
}

function shortenAddress(address: string) {
  if (!address) {
    return "Unknown";
  }

  if (address.length <= 12) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function directionLabel(direction: SmartMoneyDirection) {
  switch (direction) {
    case "ACCUMULATING":
      return "Accumulating";

    case "DISTRIBUTING":
      return "Distributing";

    default:
      return "Neutral / Mixed";
  }
}

function directionClass(direction: SmartMoneyDirection) {
  switch (direction) {
    case "ACCUMULATING":
      return "text-emerald-300";

    case "DISTRIBUTING":
      return "text-red-300";

    default:
      return "text-white/70";
  }
}

function directionDescription(
  direction: SmartMoneyDirection
) {
  switch (direction) {
    case "ACCUMULATING":
      return "More money is flowing into observed whale wallets";

    case "DISTRIBUTING":
      return "More money is flowing out of observed whale wallets";

    default:
      return "Whale money flows are relatively balanced";
  }
}

function confidenceLabel(confidence: number) {
  const value = clamp(confidence);

  if (value >= 75) {
    return "Strong evidence";
  }

  if (value >= 50) {
    return "Moderate evidence";
  }

  if (value >= 30) {
    return "Low evidence";
  }

  return "Very low evidence";
}

function classificationLabel(classification: string) {
  if (!classification) {
    return "Unknown";
  }

  return classification
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/* =========================================================
   EVIDENCE NOTICE
========================================================= */

function getEvidenceNotice(
  confidence: number,
  walletCount: number,
  transactionCount: number
) {
  const safeConfidence = clamp(confidence);

  if (
    safeConfidence < 30 ||
    walletCount <= 2 ||
    transactionCount <= 2
  ) {
    return {
      title: "Limited evidence",
      text:
        "Only a small number of wallets or transactions are currently observable. Large transfers can be wallet movements, custody changes, or capital rotation — not necessarily buying or selling.",
    };
  }

  if (safeConfidence < 50) {
    return {
      title: "Developing evidence",
      text:
        "Smart-money activity is observable, but more wallets and transactions are needed before the directional signal becomes convincing.",
    };
  }

  if (safeConfidence < 75) {
    return {
      title: "Moderate evidence",
      text:
        "Multiple wallet observations support the current direction, although the evidence is not yet conclusive.",
    };
  }

  return {
    title: "Strong evidence",
    text:
      "The signal is supported by broader wallet participation and meaningful transaction activity.",
  };
}

/* =========================================================
   METRIC
========================================================= */

function SmartMoneyMetric({
  label,
  value,
  icon,
  description,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  description?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] uppercase tracking-[0.2em] text-white/35">
          {label}
        </div>

        <div className="text-cyan-300/60">
          {icon}
        </div>
      </div>

      <div className="mt-2 text-xl font-semibold text-white">
        {value}
      </div>

      {description && (
        <div className="mt-1 text-[10px] leading-relaxed text-white/35">
          {description}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   FLOW BAR
========================================================= */

function FlowBar({
  inflow,
  outflow,
}: {
  inflow: number;
  outflow: number;
}) {
  const safeInflow = Math.max(0, safeNumber(inflow));
  const safeOutflow = Math.max(0, safeNumber(outflow));

  const total = safeInflow + safeOutflow;

  const inflowPct =
    total > 0
      ? (safeInflow / total) * 100
      : 50;

  const outflowPct =
    total > 0
      ? (safeOutflow / total) * 100
      : 50;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 text-[10px]">
        <span className="text-emerald-300">
          Money in {formatUsd(safeInflow)}
        </span>

        <span className="text-red-300">
          Money out {formatUsd(safeOutflow)}
        </span>
      </div>

      <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="bg-emerald-400/80 transition-all"
          style={{
            width: `${inflowPct}%`,
          }}
        />

        <div
          className="bg-red-400/80 transition-all"
          style={{
            width: `${outflowPct}%`,
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   WALLET CARD
========================================================= */

function WalletCard({
  wallet,
}: {
  wallet: SmartWallet;
}) {
  const netFlow = safeNumber(wallet.netFlowUsd);

  const isInflow = netFlow > 0;
  const isOutflow = netFlow < 0;

  const evidenceScore = clamp(
    wallet.preliminarySmartMoneyScore
  );

  const confidence = clamp(wallet.confidence);

  const activityScore = clamp(
    wallet.activityScore
  );

  const explorerUrl =
    wallet.chain === "0x1"
      ? `https://etherscan.io/address/${wallet.address}`
      : null;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4 transition hover:border-cyan-400/20 hover:bg-white/[0.04]">

      {/* HEADER */}

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/5">
            <Wallet
              size={16}
              className="text-cyan-300"
            />
          </div>

          <div className="min-w-0">
            <div className="font-mono text-xs text-white/80">
              {shortenAddress(wallet.address)}
            </div>

            <div className="mt-1 flex items-center gap-2">
              <span className="text-[9px] uppercase tracking-wider text-amber-300">
                {classificationLabel(
                  wallet.classification
                )}
              </span>

              <span className="text-white/20">
                •
              </span>

              <span className="text-[9px] text-white/35">
                {wallet.chain === "0x1"
                  ? "Ethereum"
                  : wallet.chain || "Unknown"}
              </span>
            </div>
          </div>
        </div>

        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/30 transition hover:text-cyan-300"
            title="View on explorer"
            aria-label="View wallet on explorer"
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>

      {/* LABELS */}

      {wallet.labels?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {wallet.labels.map((label, index) => (
            <span
              key={`${label}-${index}`}
              className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[9px] text-white/45"
            >
              #{label}
            </span>
          ))}
        </div>
      )}

      {/* NET FLOW */}

      <div className="mt-4 rounded-lg border border-white/5 bg-black/10 p-3">
        <div className="text-[9px] uppercase tracking-[0.18em] text-white/30">
          Net Flow
        </div>

        <div
          className={`mt-1 flex items-center gap-2 text-lg font-semibold ${
            isInflow
              ? "text-emerald-300"
              : isOutflow
              ? "text-red-300"
              : "text-white/70"
          }`}
        >
          {isInflow && (
            <ArrowUpRight size={17} />
          )}

          {isOutflow && (
            <ArrowDownRight size={17} />
          )}

          {netFlow > 0
            ? "+"
            : netFlow < 0
            ? "-"
            : ""}

          {formatUsd(Math.abs(netFlow))}
        </div>

        <div className="mt-1 text-[10px] text-white/35">
          {netFlow > 0
            ? "More capital entered than left"
            : netFlow < 0
            ? "More capital left than entered"
            : "Capital in and out was roughly balanced"}
        </div>
      </div>

      {/* STATS */}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-white/[0.025] p-2">
          <div className="text-[9px] text-white/30">
            Volume
          </div>

          <div className="mt-1 text-xs text-white/75">
            {formatUsd(wallet.totalVolumeUsd)}
          </div>
        </div>

        <div className="rounded-lg bg-white/[0.025] p-2">
          <div className="text-[9px] text-white/30">
            Transactions
          </div>

          <div className="mt-1 text-xs text-white/75">
            {safeNumber(
              wallet.transactionCount
            )}
          </div>
        </div>

        <div className="rounded-lg bg-white/[0.025] p-2">
          <div className="text-[9px] text-white/30">
            Assets
          </div>

          <div className="mt-1 text-xs text-white/75">
            {safeNumber(wallet.uniqueAssets)}
          </div>
        </div>

        <div className="rounded-lg bg-white/[0.025] p-2">
          <div className="text-[9px] text-white/30">
            Activity
          </div>

          <div className="mt-1 text-xs text-white/75">
            {Math.round(activityScore)}/100
          </div>
        </div>
      </div>

      {/* SMART MONEY EVIDENCE */}

      <div className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[9px] uppercase tracking-wider text-white/30">
            Smart Money Evidence
          </span>

          <span className="text-[10px] text-cyan-300">
            {evidenceScore.toFixed(1)}
          </span>
        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-cyan-400/70 transition-all"
            style={{
              width: `${evidenceScore}%`,
            }}
          />
        </div>

        <div className="mt-1 text-right text-[9px] text-white/30">
          Confidence {Math.round(confidence)}%
        </div>
      </div>

      {/* ASSETS */}

      {wallet.assets?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {wallet.assets.map(
            (asset, index) => (
              <span
                key={`${asset}-${index}`}
                className="rounded-md border border-cyan-400/10 bg-cyan-400/5 px-2 py-1 text-[9px] text-cyan-300/70"
              >
                {asset}
              </span>
            )
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   HOW SMART MONEY WORKS
========================================================= */

function HowSmartMoneyWorks() {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-white/[0.025]"
        aria-expanded={open}
      >
        <div>
          <div className="flex items-center gap-2">
            <Brain
              size={14}
              className="text-violet-300/80"
            />

            <span className="text-xs font-medium text-white/80">
              How Smart Money Works
            </span>
          </div>

          <div className="mt-1 text-[10px] text-white/30">
            Understand what the signal measures and what it does not.
          </div>
        </div>

        <ChevronDown
          size={15}
          className={`shrink-0 text-white/30 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="border-t border-white/5 p-4">

          <div className="grid gap-3 md:grid-cols-2">

            {/* 1 */}

            <div className="rounded-lg border border-white/5 bg-black/10 p-4">
              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-violet-300/70">
                Observable wallet activity
              </div>

              <div className="mt-2 text-xs font-medium text-white/75">
                We monitor large wallet capital flows.
              </div>

              <div className="mt-1 text-[10px] leading-relaxed text-white/35">
                The system looks at observable transactions,
                wallet activity, capital volume and assets involved.
              </div>
            </div>

            {/* 2 */}

            <div className="rounded-lg border border-white/5 bg-black/10 p-4">
              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-violet-300/70">
                Flow direction
              </div>

              <div className="mt-2 text-xs font-medium text-white/75">
                Money in vs. money out
              </div>

              <div className="mt-1 text-[10px] leading-relaxed text-white/35">
                More capital entering observed wallets produces
                an accumulating signal. More capital leaving produces
                a distributing signal.
              </div>
            </div>

            {/* 3 */}

            <div className="rounded-lg border border-white/5 bg-black/10 p-4">
              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-violet-300/70">
                Evidence scoring
              </div>

              <div className="mt-2 text-xs font-medium text-white/75">
                More activity can make the signal stronger.
              </div>

              <div className="mt-1 text-[10px] leading-relaxed text-white/35">
                Wallet participation, transaction activity and
                capital flows contribute to the evidence score.
                A high score means stronger supporting evidence,
                not a guaranteed outcome.
              </div>
            </div>

            {/* 4 */}

            <div className="rounded-lg border border-white/5 bg-black/10 p-4">
              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-violet-300/70">
                Confidence
              </div>

              <div className="mt-2 text-xs font-medium text-white/75">
                Confidence measures evidence quality.
              </div>

              <div className="mt-1 text-[10px] leading-relaxed text-white/35">
                Confidence is separate from direction. A wallet
                flow can point strongly in one direction while
                still having low confidence if there are too few
                wallets or transactions.
              </div>
            </div>

          </div>

          {/* IMPORTANT DISTINCTION */}

          <div className="mt-3 flex gap-3 rounded-lg border border-amber-400/15 bg-amber-400/[0.035] p-4">
            <ShieldAlert
              size={15}
              className="mt-0.5 shrink-0 text-amber-300/70"
            />

            <div>
              <div className="text-[10px] font-medium text-amber-200/80">
                What this signal does NOT tell you
              </div>

              <div className="mt-1 text-[10px] leading-relaxed text-white/40">
                Wallet transfers do not automatically mean a whale
                is buying or selling the underlying asset. Funds can
                move because of transfers, custody changes, exchange
                deposits or withdrawals, stablecoin movements, or
                capital rotation.
              </div>
            </div>
          </div>

          {/* SIMPLE INTERPRETATION */}

          <div className="mt-3 rounded-lg border border-cyan-400/10 bg-cyan-400/[0.025] p-4">
            <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-300/60">
              Simple interpretation
            </div>

            <div className="mt-2 grid gap-2 sm:grid-cols-3">

              <div className="rounded-md bg-white/[0.025] p-3">
                <div className="text-[10px] font-semibold text-emerald-300">
                  ACCUMULATING
                </div>

                <div className="mt-1 text-[10px] text-white/40">
                  More money is flowing into observed whale wallets.
                </div>
              </div>

              <div className="rounded-md bg-white/[0.025] p-3">
                <div className="text-[10px] font-semibold text-red-300">
                  DISTRIBUTING
                </div>

                <div className="mt-1 text-[10px] text-white/40">
                  More money is flowing out of observed whale wallets.
                </div>
              </div>

              <div className="rounded-md bg-white/[0.025] p-3">
                <div className="text-[10px] font-semibold text-white/70">
                  NEUTRAL / MIXED
                </div>

                <div className="mt-1 text-[10px] text-white/40">
                  Money flowing in and out is relatively balanced.
                </div>
              </div>

            </div>
          </div>

          <div className="mt-4 text-[9px] leading-relaxed text-white/25">
            Smart Money Intelligence provides behavioral evidence
            from observable wallet activity. It does not guarantee
            future price movement and should not be interpreted as
            proof of whale intent.
          </div>

        </div>
      )}
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function SmartMoney() {
  const [data, setData] =
    useState<SmartMoneyResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [refreshing, setRefreshing] =
    useState(false);

  /* =======================================================
     LOAD
  ======================================================= */

  async function loadSmartMoney(
    isRefresh = false
  ) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const response = await fetch(
        "/api/intel/smart-money",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      let json: SmartMoneyResponse;

      try {
        json =
          (await response.json()) as SmartMoneyResponse;
      } catch {
        throw new Error(
          "Smart-money API returned an invalid response."
        );
      }

      if (!response.ok || !json.success) {
        throw new Error(
          json.error ||
            "Unable to load smart-money intelligence."
        );
      }

      setData(json);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load smart-money intelligence."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadSmartMoney();
  }, []);

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const smartMoney =
    data?.smartMoney;

  const wallets =
    smartMoney?.wallets ?? [];

  const totalInflow =
    safeNumber(
      smartMoney?.flow?.inflowUsd
    );

  const totalOutflow =
    safeNumber(
      smartMoney?.flow?.outflowUsd
    );

  const netFlow =
    safeNumber(
      smartMoney?.flow?.netFlowUsd
    );

  const totalTransactions =
    wallets.reduce(
      (sum, wallet) =>
        sum +
        safeNumber(
          wallet.transactionCount
        ),
      0
    );

  const overallConfidence =
    clamp(
      smartMoney?.overallConfidence
    );

  const overallScore =
    safeNumber(
      smartMoney?.overallScore
    );

  const evidenceLabel =
    confidenceLabel(
      overallConfidence
    );

  const evidenceNotice =
    getEvidenceNotice(
      overallConfidence,
      safeNumber(
        smartMoney?.smartWalletCount
      ),
      totalTransactions
    );

  const strongestWallet =
    useMemo(() => {
      if (!wallets.length) {
        return null;
      }

      return [...wallets].sort(
        (a, b) =>
          clamp(
            b.preliminarySmartMoneyScore
          ) -
          clamp(
            a.preliminarySmartMoneyScore
          )
      )[0];
    }, [wallets]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.025] p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-3 w-40 rounded bg-white/10" />

            <div className="h-8 w-64 rounded bg-white/10" />

            <div className="h-3 w-full rounded bg-white/5" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(
            (item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-xl border border-white/10 bg-white/[0.025]"
              />
            )
          )}
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-6">
        <div className="flex items-center gap-2 text-red-300">
          <ShieldAlert size={17} />

          <span className="text-sm font-medium">
            Smart Money unavailable
          </span>
        </div>

        <div className="mt-2 text-xs text-white/40">
          {error}
        </div>

        <button
          type="button"
          onClick={() =>
            loadSmartMoney(true)
          }
          disabled={refreshing}
          className="mt-4 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 transition hover:bg-white/10 disabled:opacity-40"
        >
          {refreshing
            ? "Retrying..."
            : "Retry"}
        </button>
      </div>
    );
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  if (!smartMoney) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.025] p-6 text-sm text-white/40">
        No smart-money intelligence available.
      </div>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <div className="space-y-4">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles
              size={15}
              className="text-violet-300"
            />

            <div className="text-[10px] uppercase tracking-[0.3em] text-violet-300/80">
              Premium Intelligence
            </div>
          </div>

          <h2 className="mt-2 text-xl font-semibold text-white">
            Smart Money Intelligence
          </h2>

          <p className="mt-1 max-w-2xl text-xs text-white/40">
            See what high-value wallets are doing with their
            capital and how strong the evidence is behind the signal.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            loadSmartMoney(true)
          }
          disabled={refreshing}
          className="flex shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60 transition hover:bg-white/10 disabled:opacity-40"
        >
          <RefreshCcw
            size={13}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {/* ===================================================
          MARKET SMART MONEY
      =================================================== */}

      <div className="rounded-xl border border-violet-400/20 bg-gradient-to-br from-violet-500/[0.08] to-cyan-500/[0.03] p-5">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="min-w-0">

            <div className="text-[9px] uppercase tracking-[0.25em] text-white/30">
              Market Smart Money Direction
            </div>

            <div
              className={`mt-2 text-3xl font-semibold ${directionClass(
                smartMoney.overallDirection
              )}`}
            >
              {directionLabel(
                smartMoney.overallDirection
              )}
            </div>

            {/* BEGINNER TRANSLATION */}

            <div className="mt-1 text-sm font-medium text-white/75">
              {directionDescription(
                smartMoney.overallDirection
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/35">
              <span>
                Confidence
              </span>

              <span className="font-medium text-white/65">
                {overallConfidence.toFixed(1)}%
              </span>

              <span className="text-white/20">
                •
              </span>

              <span>
                {evidenceLabel}
              </span>
            </div>

          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

            <SmartMoneyMetric
              label="Score"
              value={overallScore.toFixed(1)}
              icon={
                <Brain size={14} />
              }
              description="Strength of the signal"
            />

            <SmartMoneyMetric
              label="Whales"
              value={
                safeNumber(
                  smartMoney.smartWalletCount
                )
              }
              icon={
                <Wallet size={14} />
              }
              description="Wallets detected"
            />

            <SmartMoneyMetric
              label="Money In"
              value={formatUsd(totalInflow)}
              icon={
                <ArrowUpRight size={14} />
              }
            />

            <SmartMoneyMetric
              label="Money Out"
              value={formatUsd(totalOutflow)}
              icon={
                <ArrowDownRight size={14} />
              }
            />

          </div>
        </div>
      </div>

      {/* ===================================================
          HOW TO READ
      =================================================== */}

      <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/[0.025] p-4">

        <div className="flex items-center gap-2">
          <Brain
            size={14}
            className="text-cyan-300/60"
          />

          <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300/60">
            How to read this
          </div>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">

          <div className="rounded-lg bg-white/[0.025] p-3">
            <div className="text-[10px] font-semibold text-emerald-300">
              Accumulating
            </div>

            <div className="mt-1 text-[10px] leading-relaxed text-white/40">
              More capital is flowing into the observed whale wallets.
            </div>
          </div>

          <div className="rounded-lg bg-white/[0.025] p-3">
            <div className="text-[10px] font-semibold text-red-300">
              Distributing
            </div>

            <div className="mt-1 text-[10px] leading-relaxed text-white/40">
              More capital is flowing out of the observed whale wallets.
            </div>
          </div>

          <div className="rounded-lg bg-white/[0.025] p-3">
            <div className="text-[10px] font-semibold text-white/70">
              Neutral / Mixed
            </div>

            <div className="mt-1 text-[10px] leading-relaxed text-white/40">
              Money flowing in and out is relatively balanced.
            </div>
          </div>

        </div>
      </div>

      {/* ===================================================
          CAPITAL FLOW
      =================================================== */}

      <div className="rounded-xl border border-white/10 bg-white/[0.025] p-5">

        <div className="flex items-center justify-between">

          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/30">
              Capital Flow
            </div>

            <div className="mt-1 text-sm font-medium text-white/80">
              Money flowing into vs. out of whale wallets
            </div>
          </div>

          <Activity
            size={15}
            className="text-cyan-300/50"
          />

        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-[1fr_auto] md:items-center">

          <FlowBar
            inflow={totalInflow}
            outflow={totalOutflow}
          />

          <div className="rounded-lg border border-white/10 bg-black/10 px-4 py-3 text-center">

            <div className="text-[9px] uppercase tracking-wider text-white/30">
              Net Flow
            </div>

            <div
              className={`mt-1 text-lg font-semibold ${
                netFlow > 0
                  ? "text-emerald-300"
                  : netFlow < 0
                  ? "text-red-300"
                  : "text-white/60"
              }`}
            >
              {netFlow > 0
                ? "+"
                : netFlow < 0
                ? "-"
                : ""}

              {formatUsd(
                Math.abs(netFlow)
              )}
            </div>

            <div className="mt-1 flex items-center justify-center gap-1 text-[9px] text-white/30">
              {netFlow > 0 ? (
                <>
                  <ArrowUpRight size={11} />
                  More money in
                </>
              ) : netFlow < 0 ? (
                <>
                  <ArrowDownRight size={11} />
                  More money out
                </>
              ) : (
                "Balanced"
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ===================================================
          EVIDENCE NOTICE
      =================================================== */}

      <div className="flex gap-3 rounded-xl border border-amber-400/15 bg-amber-400/[0.035] p-4">

        <ShieldAlert
          size={16}
          className="mt-0.5 shrink-0 text-amber-300/70"
        />

        <div>

          <div className="text-xs font-medium text-amber-200/80">
            {evidenceNotice.title}
          </div>

          <div className="mt-1 text-[10px] leading-relaxed text-white/35">
            {evidenceNotice.text}
          </div>

        </div>
      </div>

      {/* ===================================================
          QUALIFIED WALLETS
      =================================================== */}

      <div>

        <div className="mb-3 flex items-center justify-between">

          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-white/30">
              Qualified Wallets
            </div>

            <div className="mt-1 text-sm font-medium text-white/75">
              Observable smart-money candidates
            </div>
          </div>

          <div className="text-xs text-white/35">
            {wallets.length}{" "}
            {wallets.length === 1
              ? "wallet detected"
              : "wallets detected"}
          </div>

        </div>

        {wallets.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.025] p-6 text-center">

            <Fish
              size={20}
              className="mx-auto text-white/20"
            />

            <div className="mt-2 text-xs text-white/40">
              No qualified wallets detected.
            </div>

          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">

            {wallets.map((wallet) => (
              <WalletCard
                key={`${wallet.address}-${wallet.chain}`}
                wallet={wallet}
              />
            ))}

          </div>
        )}

      </div>

      {/* ===================================================
          STRONGEST EVIDENCE
      =================================================== */}

      {strongestWallet && (
        <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/[0.025] p-4">

          <div className="flex items-center gap-2">

            <Sparkles
              size={14}
              className="text-cyan-300"
            />

            <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-300/70">
              Strongest evidence
            </span>

          </div>

          <div className="mt-2 flex items-center gap-3">

            <div className="font-mono text-xs text-white/70">
              {shortenAddress(
                strongestWallet.address
              )}
            </div>

            {strongestWallet.chain ===
              "0x1" && (
              <a
                href={`https://etherscan.io/address/${strongestWallet.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/25 transition hover:text-cyan-300"
                title="View on Etherscan"
                aria-label="View strongest wallet on Etherscan"
              >
                <ExternalLink size={12} />
              </a>
            )}

          </div>

          <div className="mt-1 text-[10px] text-white/35">
            Smart Money Evidence Score{" "}
            <span className="text-cyan-300">
              {clamp(
                strongestWallet.preliminarySmartMoneyScore
              ).toFixed(1)}
            </span>
          </div>

          <div className="mt-2 text-[10px] leading-relaxed text-white/30">
            This wallet has the strongest evidence score among
            the currently observed wallets. It does not necessarily
            mean this wallet is buying or selling the underlying asset.
          </div>

        </div>
      )}

      {/* ===================================================
          HOW SMART MONEY WORKS
      =================================================== */}

      <HowSmartMoneyWorks />

      {/* ===================================================
          FOOTER
      =================================================== */}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/5 pt-3 text-[9px] text-white/25">

        <span>
          Provider:{" "}
          {data.provider ??
            "MoralisSmartMoneyProvider"}
        </span>

        <span>
          Chain:{" "}
          {data.chain === "0x1"
            ? "Ethereum"
            : data.chain ?? "Unknown"}
        </span>

        <span>
          Transfers analyzed:{" "}
          {safeNumber(
            data.transfers?.count
          )}
        </span>

        <span>
          Wallet transactions:{" "}
          {totalTransactions}
        </span>

        {strongestWallet && (
          <span>
            Strongest evidence:{" "}
            {shortenAddress(
              strongestWallet.address
            )}
          </span>
        )}

      </div>

    </div>
  );
}
