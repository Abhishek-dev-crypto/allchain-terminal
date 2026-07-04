export type GenieTourMeta = {
  title: string;
  description: string;
  actionLabel?: string;
  placement?: "top" | "bottom" | "left" | "right";

  spotlightOffsetY?: number;
};

export const TOUR_META: Record<string, GenieTourMeta> = {
  "hero-section": {
  title: "Welcome to AllChain",
  description:
    "Practice trading using live markets, AI guidance, and simulated capital without risking real money.",
  actionLabel: "Show AI",
  placement: "right",
},

  "ai-preview": {
  title: "AI Market Intelligence",
  description:
    "Our AI continuously analyzes market structure and generates easy-to-understand insights.",
  actionLabel: "Why It Matters",
  placement: "left",
},

 "why-traders-fail": {
  title: "Why Most Traders Lose",
  description:
    "Most traders fail because they learn using real money. AllChain lets you practice safely before risking capital.",
  actionLabel: "Show Platform",
  placement: "bottom",
  spotlightOffsetY: 12,
},

 "market-block": {
  title: "Experience The Platform",
  description:
    "See market intelligence, trends, and AI-powered analysis in one unified workspace.",
  actionLabel: "Final Step",
  placement: "top",
},

"final-cta": {
  title: "Ready To Start?",
  description:
    "Click Start Risk-Free and sign in with Google to begin your AI-guided trading journey.",
  actionLabel: "Finish",
  placement: "top",
},

};