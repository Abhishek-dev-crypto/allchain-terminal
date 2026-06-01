export type MarketSignals = {
  marketMood: 'RISK_ON' | 'RISK_OFF' | 'BALANCED';

  breadth:
    | 'BROAD'
    | 'NARROW'
    | 'WEAK';

  volatility:
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH';

  leaderSector:
    | 'L1'
    | 'INFRA'
    | 'DEFI'
    | 'MEME'
    | 'OTHER';

  aiFlow:
    | 'ACCUMULATION'
    | 'DISTRIBUTION'
    | 'NEUTRAL';

  btcLeadership:
    | 'LEADING'
    | 'LAGGING'
    | 'NEUTRAL';

  momentumQuality:
    | 'STRONG'
    | 'MODERATE'
    | 'WEAK';
};