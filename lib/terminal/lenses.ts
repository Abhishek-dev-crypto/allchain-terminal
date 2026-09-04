import {
  LayoutDashboard,
  Brain,
  Activity,
  TrendingUp,
  Waves,
  RefreshCcw,
  Grid3X3,
  Shield,
  Fish,
  Bell,
} from "lucide-react";

export const LENSES: {
  id: IntelligenceLens;
  label: string;
  description: string;
  icon: any;
}[] = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    description: "Executive market cognition",
  },
  {
    id: "narrative",
    label: "Narrative",
    icon: Brain,
    description: "AI-driven market intelligence",
  },
  {
    id: "sentiment",
    label: "Sentiment",
    icon: Activity,
    description: "Crowd psychology & positioning",
  },
  {
    id: "momentum",
    label: "Momentum",
    icon: TrendingUp,
    description: "Trend acceleration & strength",
  },
  {
    id: "flows",
    label: "Flows",
    icon: Waves,
    description: "Capital movement & liquidity",
  },
  {
    id: "rotation",
    label: "Rotation",
    icon: RefreshCcw,
    description: "Sector leadership & rotation",
  },
  {
    id: "heatmap",
    label: "Heatmap",
    icon: Grid3X3,
    description: "Market participation landscape",
  },
  {
    id: "regime",
    label: "Regime",
    icon: Shield,
    description: "Volatility & market conditions",
  },
  {
    id: "whales",
    label: "Whales",
    icon: Fish,
    description: "Large wallet surveillance",
  },
  {
    id: "alerts",
    label: "Alerts",
    icon: Bell,
    description: "Real-time market signals",
  },
];

export type IntelligenceLens =
  | "overview"
  | "narrative"
  | "sentiment"
  | "momentum"
  | "flows"
  | "rotation"
  | "heatmap"
  | "regime"
  | "whales"
  | "alerts"
  | "alpha_signals"
  | "predictive_ai"
  | "smart_money"
  | "liquidity_heat"
  | "whale_intent"
  | "regime_forecast"
  | "edge_opportunities"
  | "market_regime";

export const PREMIUM_LENSES: {
  id: IntelligenceLens;
  label: string;
  description: string;
}[] = [
  {
    id: "alpha_signals",
    label: "Alpha Signals",
    description: "Early opportunity detection engine",
  },
  {
    id: "predictive_ai",
    label: "Predictive AI",
    description: "Forward market scenario modeling",
  },
  {
    id: "smart_money",
    label: "Smart Money",
    description: "Institutional wallet tracking & intent mapping",
  },
  {
    id: "liquidity_heat",
    label: "Liquidity Heat",
    description: "Real-time liquidity pressure zones",
  },
  {
    id: "whale_intent",
    label: "Whale Intent",
    description: "Pre-movement large wallet behavior analysis",
  },
  {
    id: "market_regime",
    label: "market_regime",
    description: " regime shift prediction engine",
  },
  {
    id: "regime_forecast",
    label: "Regime Forecast",
    description: "Market regime shift prediction engine",
  },
  {
    id: "edge_opportunities",
    label: "Edge Opportunities",
    description: "AI-ranked asymmetric trade setups",
  },
];