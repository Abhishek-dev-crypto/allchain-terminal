"use client";

type Props = {
  onClose: () => void;
};

export default function TerminalGuide({
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">

      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0b0b0b] p-6">

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Welcome to AllChain
          </h2>

          <button
            onClick={onClose}
            className="text-white/50 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 space-y-4">

          <div>
            <div className="text-sm font-medium text-cyan-300">
              Market Overview
            </div>

            <div className="text-sm text-white/60">
              Real-time health and structure of the crypto market.
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-cyan-300">
              Sentiment Engine
            </div>

            <div className="text-sm text-white/60">
              Measures market mood using news and social signals.
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-cyan-300">
              Momentum Analysis
            </div>

            <div className="text-sm text-white/60">
              Tracks trend acceleration and participation.
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-cyan-300">
              Capital Flow
            </div>

            <div className="text-sm text-white/60">
              Shows where money is entering or leaving the market.
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-cyan-300">
              AI Narrative Engine
            </div>

            <div className="text-sm text-white/60">
              Identifies themes currently driving crypto prices.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}