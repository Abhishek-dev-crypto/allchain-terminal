import { NextResponse } from "next/server";

import { marketEngine } from "@/lib/market/MarketEngine";
import { buildIntel } from "@/lib/intelligence/buildIntel";
import { AIEngine } from "@/lib/ai/AIEngine";
import { formatAIForUI } from "@/lib/ai/formatAIForUI";

export async function POST(req: Request) {
  const timestamp = Date.now();

  try {
    const { symbol } = await req.json();

    if (!symbol) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing symbol",
          timestamp,
        },
        { status: 400 }
      );
    }

    /* =========================
     * 1. MARKET DATA LAYER
     * ========================= */
    const snapshot = await marketEngine.getSnapshot(symbol);

    if (!snapshot?.candles) {
      return NextResponse.json(
        {
          success: false,
          error: "No market data found",
          symbol,
          timestamp,
        },
        { status: 404 }
      );
    }

    const { candles } = snapshot;

    /* =========================
     * 2. INTELLIGENCE LAYER
     * ========================= */
    const intel = buildIntel(
      candles["1m"],
      candles["5m"],
      candles["15m"],
      candles["30m"],
      candles["1h"]
    );

    /* =========================
     * 3. AI DECISION LAYER
     * ========================= */
    const ai = AIEngine.build(intel);

    /* =========================
     * 4. UI FORMATTING LAYER
     * ========================= */
    const ui = formatAIForUI(intel, ai);

    /* =========================
     * 5. FINAL RESPONSE CONTRACT
     * ========================= */
    return NextResponse.json({
      success: true,

      symbol,

      ai,
      ui,

      meta: {
        timestamp,
        regime: intel.regime,
        confidence: ai.confidence,
        action: ai.action,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "AI engine failed",
        timestamp,
      },
      { status: 500 }
    );
  }
}