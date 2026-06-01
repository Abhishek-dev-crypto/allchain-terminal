'use client';

export default function AITradeReaction({
  lastTrade,
  signal,
}: {
  lastTrade: any;
  signal: any;
}) {
  if (!lastTrade) return null;

  let message = 'Analyzing...';
  let color = 'text-gray-400';

  if (signal.signal === 'BUY' && lastTrade.type === 'buy') {
    message = '📈 Smart entry — momentum aligned';
    color = 'text-green-400';
  }

  if (signal.signal === 'SELL' && lastTrade.type === 'sell') {
    message = '📉 Good exit — risk managed';
    color = 'text-blue-400';
  }

  if (signal.signal !== lastTrade.type.toUpperCase()) {
    message = '⚠️ Risky move — against trend';
    color = 'text-red-400';
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
      <p className="text-xs text-gray-400 mb-1">AI Feedback</p>
      <p className={`text-sm font-medium ${color}`}>{message}</p>
    </div>
  );
}