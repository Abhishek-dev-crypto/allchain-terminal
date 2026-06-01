import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { message, coinId, price, change, tradeScore } =
    await req.json();

  try {
    const msg = message.toLowerCase();

    /* 🔥 DERIVED SIGNALS */
    const trend =
      tradeScore >= 70
        ? "strong bullish"
        : tradeScore >= 55
        ? "bullish"
        : tradeScore >= 45
        ? "sideways"
        : tradeScore >= 30
        ? "bearish"
        : "strong bearish";

    const volatility =
      Math.abs(change) > 5
        ? "high volatility"
        : Math.abs(change) > 2
        ? "moderate volatility"
        : "low volatility";

    let response = "";

    /* 🔥 MARKET */
    if (msg.includes("market")) {
      response = `
Market Analysis:

• Trend: ${trend}
• Volatility: ${volatility}
• Price: $${price}
• 24h Change: ${change.toFixed(2)}%
• AI Score: ${tradeScore}/100

Insight:
${
  tradeScore >= 70
    ? "Momentum is strong with continuation potential."
    : tradeScore >= 50
    ? "Market is stable but lacks strong momentum."
    : "Market is weak and prone to downside or choppiness."
}
`;
    }

    /* 🔥 BUY */
    else if (msg.includes("buy")) {
      if (tradeScore >= 80) {
        response = `
🔥 High Probability Setup

Trend: ${trend}

• Strong momentum confirmed
• Buyers in control

Strategy:
→ Consider entering with confidence
→ Use stop-loss below recent support
`;
      } else if (tradeScore >= 60) {
        response = `
✅ Moderate Opportunity

Trend: ${trend}

• Momentum present but not explosive

Strategy:
→ Small position recommended
→ Wait for breakout confirmation
`;
      } else if (tradeScore >= 40) {
        response = `
⚠️ Weak Setup

Trend: ${trend}

• No clear direction

Strategy:
→ Avoid fresh entries
→ Wait for better structure
`;
      } else {
        response = `
❌ Avoid Buying

Trend: ${trend}

• Sellers dominating

Strategy:
→ High downside risk
→ Preserve capital
`;
      }
    }

    /* 🔥 SELL */
    else if (msg.includes("sell")) {
      if (tradeScore >= 70) {
        response = `
Market still strong

• Trend intact
• Momentum positive

Strategy:
→ Hold or trail stop-loss
`;
      } else if (tradeScore >= 50) {
        response = `
Momentum weakening

Strategy:
→ Partial profit booking advised
`;
      } else {
        response = `
Bearish conditions

Strategy:
→ Exit or reduce exposure
`;
      }
    }

    /* 🔥 BEST COIN */
    else if (msg.includes("best")) {
      response = `
Currently, ${coinId.toUpperCase()} shows:

• Score: ${tradeScore}/100
• Trend: ${trend}

${
  tradeScore >= 70
    ? "This is among the stronger setups in the market right now."
    : "Not the strongest opportunity currently. Better setups may exist."
}
`;
    }

    /* 🔥 DEFAULT */
    else {
      response = `
AI Trading Insight:

${coinId.toUpperCase()} → $${price}
Trend: ${trend}
Volatility: ${volatility}
Score: ${tradeScore}/100

Guidance:
${
  tradeScore >= 70
    ? "Favorable conditions for trend-following trades."
    : tradeScore >= 50
    ? "Trade cautiously with proper risk control."
    : "Focus on capital protection."
}
`;
    }

    return NextResponse.json({ reply: response });
  } catch (err) {
    return NextResponse.json(
      { reply: "AI unavailable." },
      { status: 500 }
    );
  }
}