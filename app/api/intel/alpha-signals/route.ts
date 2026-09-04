import { NextResponse } from "next/server";

import { getMarketSnapshot } from "@/lib/intel/core/marketSnapshotStore";
import { buildMarketEngine } from "@/lib/intel/marketEngine";
import { buildAlphaSignals } from "@/lib/intel/alphaSignals";

export async function GET(request: Request) {
  try {
    console.log("[Alpha Signals] Starting...");

    const origin = new URL(request.url).origin;

    console.log(
      "[Alpha Signals] Origin:",
      origin
    );

    const snapshot = await getMarketSnapshot(origin);

    console.log(
      "[Alpha Signals] Snapshot:",
      snapshot.coins.length,
      "coins"
    );

    const engine = buildMarketEngine(
      snapshot.coins,
      {}
    );

    console.log(
      "[Alpha Signals] Engine built:",
      engine.regime
    );

    const result = await buildAlphaSignals(
      snapshot.coins,
      engine
    );

    console.log(
      "[Alpha Signals] Success:",
      result.signals.length,
      "signals"
    );

    return NextResponse.json(result);

  } catch (error) {
    console.error("====================================");
    console.error("ALPHA SIGNALS API ERROR");
    console.error(error);

    if (error instanceof Error) {
      console.error("MESSAGE:", error.message);
      console.error("STACK:", error.stack);
    }

    console.error("====================================");

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to build Alpha Signals",
      },
      {
        status: 500,
      }
    );
  }
}