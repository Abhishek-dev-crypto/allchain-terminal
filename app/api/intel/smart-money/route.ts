
import { NextResponse } from "next/server";

import {
  MoralisSmartMoneyProvider,
} from "@/lib/intel/smartMoney/moralisProvider";

import {
  discoverSmartWallets,
} from "@/lib/intel/smartMoney/walletDiscovery";

/* =========================================================
   CONFIG
========================================================= */

const ETHEREUM_TOKENS = [
  {
    symbol: "USDT",
    address:
      "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  },
  {
    symbol: "USDC",
    address:
      "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  },
];

/* =========================================================
   GET
========================================================= */

export async function GET(
  request: Request
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const chain =
      searchParams.get("chain") ??
      "0x1";

    const limit =
      Number(
        searchParams.get("limit") ??
        "100"
      );

    const safeLimit =
      Number.isFinite(limit) &&
      limit > 0
        ? Math.min(
            Math.floor(limit),
            100
          )
        : 100;

    /* =====================================================
       PROVIDER
    ===================================================== */

    const provider =
      new MoralisSmartMoneyProvider();

    /* =====================================================
       TRANSFER DISCOVERY
    ===================================================== */

    const transfers =
      await provider.discoverTransfers({
        chain,

        tokenAddresses:
          ETHEREUM_TOKENS.map(
            (token) =>
              token.address
          ),

        limitPerToken:
          safeLimit,
      });

    /* =====================================================
       SMART WALLET DISCOVERY
    ===================================================== */

    const wallets =
      discoverSmartWallets(
        transfers
      );

    /* =====================================================
       MARKET AGGREGATES
    ===================================================== */

    const totalVolumeUsd =
      wallets.reduce(
        (
          total,
          wallet
        ) =>
          total +
          wallet.totalVolumeUsd,
        0
      );

    const totalInflowUsd =
      wallets.reduce(
        (
          total,
          wallet
        ) =>
          total +
          wallet.inflowUsd,
        0
      );

    const totalOutflowUsd =
      wallets.reduce(
        (
          total,
          wallet
        ) =>
          total +
          wallet.outflowUsd,
        0
      );

    const netFlowUsd =
      totalInflowUsd -
      totalOutflowUsd;

    const averageSmartMoneyScore =
      wallets.length > 0
        ? wallets.reduce(
            (
              total,
              wallet
            ) =>
              total +
              wallet.preliminarySmartMoneyScore,
            0
          ) /
          wallets.length
        : 0;

    const averageConfidence =
      wallets.length > 0
        ? wallets.reduce(
            (
              total,
              wallet
            ) =>
              total +
              wallet.confidence,
            0
          ) /
          wallets.length
        : 0;

    /* =====================================================
       DIRECTION
    ===================================================== */

    let overallDirection:
      | "ACCUMULATING"
      | "DISTRIBUTING"
      | "NEUTRAL";

    if (
      netFlowUsd > 0
    ) {
      overallDirection =
        "ACCUMULATING";
    } else if (
      netFlowUsd < 0
    ) {
      overallDirection =
        "DISTRIBUTING";
    } else {
      overallDirection =
        "NEUTRAL";
    }

    /* =====================================================
       RESPONSE
    ===================================================== */

    return NextResponse.json({
      success: true,

      provider:
        "MoralisSmartMoneyProvider",

      chain,

      tokens:
        ETHEREUM_TOKENS,

      generatedAt:
        Date.now(),

      transfers: {
        count:
          transfers.length,
      },

      smartMoney: {
        overallDirection,

        overallScore:
          Number(
            averageSmartMoneyScore.toFixed(
              2
            )
          ),

        overallConfidence:
          Number(
            averageConfidence.toFixed(
              2
            )
          ),

        flow: {
          inflowUsd:
            Number(
              totalInflowUsd.toFixed(
                2
              )
            ),

          outflowUsd:
            Number(
              totalOutflowUsd.toFixed(
                2
              )
            ),

          netFlowUsd:
            Number(
              netFlowUsd.toFixed(
                2
              )
            ),
        },

        smartWalletCount:
          wallets.length,

        wallets,
      },
    });
  } catch (error) {
    console.error(
      "[Smart Money API] Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}
