// lib/genieEngine.ts

export type UserStage =
  | "onboarding"
  | "logged_out"
  | "intel"
  | "trading";

export type UserIntent = "trade" | "learn" | null;

export type TradeFlowStep =
  | "coinlist"
  | "chart"
  | "ai_engine"
  | "execution"
  | "completed";

export type IntelFlowStep =
  | "panel_overview"
  | "left_navigation"
  | "ai_explanation"
  | "analysis_complete";

export type GenieMode =
  | "WELCOME"
  | "LOGIN_GATE"
  | "MODE_SELECT"
  | "TRADE_GUIDE"
  | "INTEL_GUIDE"
  | "PASSIVE";

export type GenieState = {
  stage: UserStage;
  intent: UserIntent;

  tradeStep: TradeFlowStep;
  intelStep: IntelFlowStep;

  currentMode: GenieMode;
};

// DEFAULT STATE
export const defaultGenieState: GenieState = {
  stage: "onboarding",
  intent: null,

  tradeStep: "coinlist",
  intelStep: "panel_overview",

  currentMode: "WELCOME",
};

// MODE DECIDER (BRAIN)
export function getGenieMode(state: GenieState): GenieMode {
  if (state.stage === "onboarding") return "WELCOME";

  if (state.stage === "logged_out") return "LOGIN_GATE";

  if (!state.intent) return "MODE_SELECT";

  if (state.intent === "trade") return "TRADE_GUIDE";

  if (state.intent === "learn") return "INTEL_GUIDE";

  return "PASSIVE";
}

// STATE UPDATER (SAFE WAY TO MODIFY STATE)
export function updateGenieState(
  state: GenieState,
  updates: Partial<GenieState>
): GenieState {
  const newState = {
    ...state,
    ...updates,
  };

  newState.currentMode = getGenieMode(newState);

  return newState;
}

// FLOW HELPERS
export function nextTradeStep(step: TradeFlowStep): TradeFlowStep {
  switch (step) {
    case "coinlist":
      return "chart";
    case "chart":
      return "ai_engine";
    case "ai_engine":
      return "execution";
    case "execution":
      return "completed";
    default:
      return "coinlist";
  }
}

export function nextIntelStep(step: IntelFlowStep): IntelFlowStep {
  switch (step) {
    case "panel_overview":
      return "left_navigation";
    case "left_navigation":
      return "ai_explanation";
    case "ai_explanation":
      return "analysis_complete";
    default:
      return "panel_overview";
  }
}