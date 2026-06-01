import {
  bullishNarratives,
  bearishNarratives,
  recoveryNarratives,
  accumulationNarratives,
} from "./narrativePools";

import { detectMarketTransition } from "./narrativeTransitions";

function randomItem(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export type NarrativeMemory = {
  lastRegime?: string;
  lastMomentum?: string;
  lastNarrative?: string;
  repetitionCount?: number;
};

export function generateNarrative({
  regime,
  momentum,
  memory,
}: {
  regime: string;
  momentum: string;
  memory?: NarrativeMemory;
}) {
  let pool: string[] = bullishNarratives;

  if (regime === "RISK_ON") pool = bullishNarratives;
  else if (regime === "RISK_OFF") pool = bearishNarratives;
  else if (regime === "ROTATION") pool = recoveryNarratives;
  else pool = accumulationNarratives;


  const transition = detectMarketTransition({
  lastRegime: memory?.lastRegime,
  currentRegime: regime,
  lastMomentum: memory?.lastMomentum,
  currentMomentum: momentum,
});

let isTransitionNarrative = false;



if (regime === "RISK_ON") pool = bullishNarratives;
else if (regime === "RISK_OFF") pool = bearishNarratives;
else if (regime === "ROTATION") pool = recoveryNarratives;
else pool = accumulationNarratives;

// override
if (transition.isTransition) {
  pool = [
    `Market shifted from ${transition.fromRegime} to ${transition.toRegime}.`,
    `Regime transition detected: ${transition.fromRegime} → ${transition.toRegime}.`,
    `Structural change in market conditions underway.`,
  ];
  isTransitionNarrative = true;
}

let narrative = randomItem(pool);

// repetition logic (MUST be before returns)
let attempts = 0;

while (
  memory?.lastNarrative &&
  narrative === memory.lastNarrative &&
  attempts < 3
) {
  narrative = randomItem(pool);
  attempts++;
}

const repetitionCount =
  memory?.lastNarrative === narrative
    ? (memory?.repetitionCount ?? 0) + 1
    : 0;

    

// NOW return safely
return {
  narrative,
  type: regime,
  memory: {
    lastRegime: regime,
    lastMomentum: momentum,
    lastNarrative: narrative,
    repetitionCount,
  },
  transition,
};}