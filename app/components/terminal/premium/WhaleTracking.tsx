'use client';

export default function WhaleTracking() {
  const whaleMoves = [
    {
      asset: 'BTC',
      action: 'Accumulation',
      size: '$42.8M',
      wallets: 3,
      confidence: 86,
    },
    {
      asset: 'ETH',
      action: 'Distribution',
      size: '$18.2M',
      wallets: 2,
      confidence: 71,
    },
    {
      asset: 'SOL',
      action: 'Accumulation',
      size: '$9.6M',
      wallets: 5,
      confidence: 64,
    },
    {
      asset: 'USDT',
      action: 'Inflow Spike',
      size: '$61.3M',
      wallets: 4,
      confidence: 78,
    },
  ];

  const getColor = (action: string) => {
    switch (action) {
      case 'Accumulation':
        return 'text-emerald-300 border-emerald-500/20 bg-emerald-500/10';
      case 'Distribution':
        return 'text-red-300 border-red-500/20 bg-red-500/10';
      default:
        return 'text-violet-300 border-violet-500/20 bg-violet-500/10';
    }
  };

  const getBarColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-emerald-400';
    if (confidence >= 60) return 'bg-emerald-500/70';
    return 'bg-yellow-400/60';
  };

  return (
    <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.03] p-5">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">

        <div>
          <h3 className="text-lg font-semibold text-white">
            Whale Tracking
          </h3>

          <p className="text-xs text-gray-400 mt-1">
            Smart money flow detection system
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs bg-violet-500/10 text-violet-300">
          PREMIUM
        </span>

      </div>

      {/* Whale List */}
      <div className="space-y-4">

        {whaleMoves.map((move) => (
          <div
            key={move.asset + move.size}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
          >

            {/* Top Row */}
            <div className="flex items-center justify-between mb-3">

              <div>
                <p className="text-white font-medium">
                  {move.asset}
                </p>

                <p className="text-xs text-gray-500">
                  {move.wallets} wallets detected
                </p>
              </div>

              <span
                className={`text-xs px-2 py-1 rounded-md border ${getColor(
                  move.action
                )}`}
              >
                {move.action}
              </span>

            </div>

            {/* Middle */}
            <div className="flex items-center justify-between mb-3 text-sm">

              <p className="text-gray-400">
                Size: <span className="text-white">{move.size}</span>
              </p>

              <p className="text-gray-400">
                Confidence: <span className="text-emerald-300">{move.confidence}%</span>
              </p>

            </div>

            {/* Confidence Bar */}
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">

              <div
                className={`h-full ${getBarColor(move.confidence)}`}
                style={{ width: `${move.confidence}%` }}
              />

            </div>

          </div>
        ))}

      </div>

      {/* Footer Insight */}
      <div className="mt-5 pt-4 border-t border-white/10 text-xs text-gray-400">

        Whale detection is based on clustered wallet movement, exchange inflows,
        and abnormal transaction sizing patterns.

      </div>

    </div>
  );
}