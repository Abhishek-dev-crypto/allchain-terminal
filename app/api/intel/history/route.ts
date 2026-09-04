import { NextResponse } from "next/server";

import {
  getHistoricalMarketSnapshots,
} from "@/lib/intel/marketSnapshotHistory";

export async function GET() {
  try {
    const snapshots =
      await getHistoricalMarketSnapshots();

    return NextResponse.json({
      count: snapshots.length,

      oldest:
        snapshots.length > 0
          ? snapshots[snapshots.length - 1].timestamp
          : null,

      newest:
        snapshots.length > 0
          ? snapshots[0].timestamp
          : null,

      snapshots: snapshots.map((snapshot) => ({
        timestamp: snapshot.timestamp,
        date: new Date(snapshot.timestamp).toISOString(),
        coins: snapshot.coins.length,
      })),
    });
  } catch (error) {
    console.error(
      "Market history API error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to read market history",
      },
      {
        status: 500,
      }
    );
  }
}