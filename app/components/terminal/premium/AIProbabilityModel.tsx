'use client';

export default function AIProbabilityModel() {
  const modelScore = 74;

  const factors = [
    {
      name: 'Market Momentum',
      weight: 30,
      score: 78,
    },
    {
      name: 'Liquidity Flow',
      weight: 25,
      score: 69,
    },
    {
      name: 'Sentiment Index',
      weight: 20,
      score: 72,
    },
    {
      name: 'Volatility Structure',
      weight: 15,
      score: 61,
    },
    {
      name: 'On-chain Activity',
      weight: 10,
      score: 80,
    },
  ];

  const getBarColor = (score: number) => {
    if (score >= 75) return 'bg-emerald-400';
    if (score >= 60) return 'bg-emerald-500/70';
    if (score >= 45) return 'bg-yellow-400/70';
    return 'bg-red-400/70';
  };

  const getLabel = (score: number) => {
    if (score >= 75) return 'Strong Bull Bias';
    if (score >= 60) return 'Moderate Bull Bias';
    if (score >= 45) return 'Neutral';
    return 'Bearish Pressure';
  };

  return (
    <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.03] p-5">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">

        <div>
          <h3 className="text-lg font-semibold text-white">
            AI Probability Model
          </h3>

          <p className="text-xs text-gray-400 mt-1">
            Multi-factor weighted prediction engine
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs bg-violet-500/10 text-violet-300">
          CORE AI
        </span>

      </div>

      {/* Main Score */}
      <div className="flex items-center justify-between mb-6">

        <div>
          <p className="text-4xl font-semibold text-white">
            {modelScore}%
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Overall Probability Score
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-emerald-300 font-medium">
            {getLabel(modelScore)}
          </p>

          <p className="text-xs text-gray-500">
            AI Confidence Output
          </p>
        </div>

      </div>

      {/* Breakdown */}
      <div className="space-y-4">

        {factors.map((factor) => (
          <div key={factor.name}>

            {/* Top Row */}
            <div className="flex items-center justify-between mb-2">

              <p className="text-sm text-gray-300">
                {factor.name}
              </p>

              <p className="text-xs text-gray-500">
                Weight {factor.weight}%
              </p>

            </div>

            {/* Bar */}
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">

              <div
                className={`h-full ${getBarColor(factor.score)}`}
                style={{ width: `${factor.score}%` }}
              />

            </div>

          </div>
        ))}

      </div>

      {/* Footer Insight */}
      <div className="mt-5 pt-4 border-t border-white/10 text-xs text-gray-400">

        Model aggregates weighted signals across momentum, liquidity,
        sentiment, volatility, and on-chain activity to generate probability bias.

      </div>

    </div>
  );
}