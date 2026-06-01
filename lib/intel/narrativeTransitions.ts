export type MarketTransition = {
  fromRegime?: string;
  toRegime: string;
  fromMomentum?: string;
  toMomentum: string;
  isTransition: boolean;
};

export function detectMarketTransition({
  lastRegime,
  currentRegime,
  lastMomentum,
  currentMomentum,
}: {
  lastRegime?: string;
  currentRegime: string;
  lastMomentum?: string;
  currentMomentum: string;
}): MarketTransition {
  return {
    fromRegime: lastRegime,
    toRegime: currentRegime,
    fromMomentum: lastMomentum,
    toMomentum: currentMomentum,
    isTransition:
      lastRegime !== undefined &&
      lastRegime !== currentRegime,
  };
}