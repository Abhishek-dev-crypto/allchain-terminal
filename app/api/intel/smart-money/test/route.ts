import { NextResponse } from "next/server";

import {
  MoralisSmartMoneyProvider,
} from "@/lib/intel/smartMoney/moralisProvider";

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

export async function GET(
  request: Request
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const walletAddress =
      searchParams.get("wallet");

    const mode =
      searchParams.get("mode") ??
      "discovery";

    const provider =
      new MoralisSmartMoneyProvider();

    /* =====================================================
       WALLET-SCOPED TEST
    ===================================================== */

    if (walletAddress) {
      const result =
        await provider.getTransfers({
          chain: "0x1",
          walletAddress,
          limit: 10,
        });

      return NextResponse.json({
        success: true,

        mode: "wallet",

        provider:
          "MoralisSmartMoneyProvider",

        chain: "0x1",

        walletAddress,

        count:
          result.length,

        transfers:
          result,
      });
    }

    /* =====================================================
       GENERAL DISCOVERY TEST
    ===================================================== */

    if (mode === "discovery") {
      const result =
        await provider.discoverTransfers({
          chain: "0x1",

          tokenAddresses:
            ETHEREUM_TOKENS.map(
              (token) =>
                token.address
            ),

          limitPerToken: 10,
        });

      return NextResponse.json({
        success: true,

        mode: "discovery",

        provider:
          "MoralisSmartMoneyProvider",

        chain: "0x1",

        tokens:
          ETHEREUM_TOKENS,

        count:
          result.length,

        transfers:
          result,
      });
    }

    return NextResponse.json(
      {
        success: false,

        error:
          "Unsupported mode",

        supportedModes: [
          "discovery",
          "wallet",
        ],
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error(
      "[Smart Money Test] Error:",
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