import { NextResponse } from "next/server";

import {
  buildPredictiveAI,
} from "@/lib/intel/predictiveAI";

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const {
      coins,
      engine,
      alphaSignals,
    } = body;

    if (
      !Array.isArray(coins) ||
      !engine ||
      !alphaSignals
    ) {
      return NextResponse.json(
        {
          error:
            "Missing coins, engine, or alphaSignals",
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await buildPredictiveAI(
        coins,
        engine,
        alphaSignals
      );

    return NextResponse.json(
      result
    );
  } catch (error) {
    console.error(
      "Predictive AI API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to generate Predictive AI",
      },
      {
        status: 500,
      }
    );
  }
}