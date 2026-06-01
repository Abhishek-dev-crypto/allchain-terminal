'use client';

export default function PredictiveMarketEngine() {
  const predictions = [
    {
      asset: 'BTC',
      direction: 'Bullish',
      probability: 78,
      timeframe: '24H',
    },
    {
      asset: 'ETH',
      direction: 'Bullish',
      probability: 64,
      timeframe: '48H',
    },
    {
      asset: 'SOL',
      direction: 'Neutral',
      probability: 52,
      timeframe: '24H',
    },
    {
      asset: 'ALT MARKET',
      direction: 'Bearish',
      probability: 61,
      timeframe: '72H',
    },
  ];

  const getColor = (direction: string) => {
    switch (direction) {
      case 'Bullish':
        return 'text-emerald-300 border-emerald-500/20 bg-emerald-500/10';
      case 'Bearish':
        return 'text-red-300 border-red-500/20 bg-red-500/10';
      default:
        return 'text-yellow-300 border-yellow-500/20 bg-yellow-500/10';
    }
  };

  const getBarColor = (direction: string) => {
    switch (direction) {
      case 'Bullish':
        return 'bg-emerald-400';
      case 'Bearish':
        return 'bg-red-400';
      default:
        return 'bg-yellow-400';
    }
  };

  return (
    <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.03] p-5">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">

        <div>
          <h3 className="text-lg font-semibold text-white">
            Predictive Market Engine
          </h3>
          <p className="text-xs text-gray-400">
            AI probability forecasting model (experimental)
          </p>
        </div>

        <span className="text-xs px-3 py-1 rounded-full bg-violet-500/10 text-violet-300">
          PREMIUM
        </span>

      </div>

      {/* Predictions */}
      <div className="space-y-4">

        {predictions.map((item) => (
          <div
            key={item.asset}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
          >

            {/* Top Row */}
            <div className="flex items-center justify-between mb-3">

              <p className="font-medium text-white">
                {item.asset}
              </p>

              <span
                className={`text-xs px-2 py-1 rounded-md border ${getColor(
                  item.direction
                )}`}
              >
                {item.direction}
              </span>

            </div>

            {/* Probability Bar */}
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">

              <div
                className={`h-full ${getBarColor(item.direction)}`}
                style={{ width: `${item.probability}%` }}
              />

            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-2 text-xs text-gray-400">

              <span>Confidence: {item.probability}%</span>

              <span>{item.timeframe}</span>

            </div>

          </div>
        ))}

      </div>

      {/* Footer Insight */}
      <div className="mt-5 text-xs text-gray-400 border-t border-white/10 pt-4">
        Model combines momentum, liquidity, sentiment, and volatility clustering.
        Not financial advice.
      </div>

    </div>
  );
}