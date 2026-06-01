export type Alert = {
  id: string;
  severity: "critical" | "warning" | "info" | "positive";
  category: string;
  title: string;
  description: string;
  timestamp: string;
};

type Flow = {
  name: string;
  avg: number;
};

export function buildAlerts(flows: Flow[]): Alert[] {
  const alerts: Alert[] = [];

  const avgFlow =
    flows.reduce((sum, f) => sum + f.avg, 0) /
    (flows.length || 1);

  const negativeRatio =
    flows.filter((f) => f.avg < 0).length /
    (flows.length || 1);

  const infra =
    flows.find((f) => f.name === "INFRA")?.avg ?? 0;

  const meme =
    flows.find((f) => f.name === "MEME")?.avg ?? 0;

  const l1 =
    flows.find((f) => f.name === "L1")?.avg ?? 0;

  const largeCap =
    flows.find((f) => f.name === "LARGE_CAP")?.avg ?? 0;

  /**
   * ✅ HYDRATION SAFE
   * Static timestamp avoids SSR mismatch
   */
  const now = "LIVE";

  /**
   * 🔴 RISK-OFF DETECTION
   */
  if (avgFlow < -2 && negativeRatio > 0.6) {
    alerts.push({
      id: "risk-off",
      severity: "critical",
      category: "Market Regime",
      title: "Broad market risk-off behavior",
      description:
        "Capital is exiting high-risk crypto sectors aggressively.",
      timestamp: now,
    });
  }

  /**
   * 🟡 INFRA COLLAPSE
   */
  if (infra < -5) {
    alerts.push({
      id: "infra-pressure",
      severity: "warning",
      category: "Sector Pressure",
      title: "Infrastructure sector under pressure",
      description:
        "Infrastructure assets are leading downside momentum.",
      timestamp: now,
    });
  }

  /**
   * 🔥 MEME VOLATILITY
   */
  if (Math.abs(meme) > 5) {
    alerts.push({
      id: "meme-volatility",
      severity: "warning",
      category: "Volatility",
      title: "Extreme MEME volatility detected",
      description:
        "High-beta speculative assets are experiencing elevated volatility.",
      timestamp: now,
    });
  }

  /**
   * 🔵 DEFENSIVE FLOW
   */
  if (largeCap > l1 && l1 < 0) {
    alerts.push({
      id: "defensive-flow",
      severity: "info",
      category: "Capital Rotation",
      title: "Defensive rotation forming",
      description:
        "Large caps are outperforming broader Layer-1 weakness.",
      timestamp: now,
    });
  }

  /**
   * 🟢 RISK-ON RECOVERY
   */
  if (avgFlow > 1.5 && negativeRatio < 0.4) {
    alerts.push({
      id: "risk-on",
      severity: "positive",
      category: "Momentum",
      title: "Risk appetite improving",
      description:
        "Capital inflows are expanding across multiple sectors.",
      timestamp: now,
    });
  }

  /**
   * ⚪ LOW CONVICTION
   */
  if (Math.abs(avgFlow) < 1) {
    alerts.push({
      id: "low-conviction",
      severity: "info",
      category: "Market Structure",
      title: "Low conviction environment",
      description:
        "Market conditions remain directionally neutral.",
      timestamp: now,
    });
  }

  /**
   * 🧠 FALLBACK
   */
  if (alerts.length === 0) {
    alerts.push({
      id: "stable",
      severity: "info",
      category: "Market Pulse",
      title: "Monitoring market structure",
      description:
        "No abnormal market behavior currently detected.",
      timestamp: now,
    });
  }

  return alerts;
}