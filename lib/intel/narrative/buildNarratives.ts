type Narrative = {
  type:
    | 'STRUCTURE'
    | 'ROTATION'
    | 'RISK'
    | 'WATCHLIST';

  text: string;
};