'use client';

import Link from 'next/link';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#0B1220] text-white px-4 py-12">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="mb-8 text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-cyan-300 mb-3">
            Support & Documentation
          </div>

          <h1 className="text-4xl font-bold mb-4">
            Help Center
          </h1>

          <p className="text-gray-400 max-w-2xl mx-auto">
            Find answers to common questions about trading, market intelligence,
            portfolio tracking, and platform features.
          </p>
        </div>

        {/* FAQ SECTION */}
        <div className="space-y-4">

          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h2 className="font-semibold text-cyan-300 mb-2">
              Getting Started
            </h2>

            <p className="text-gray-300">
              Sign in using your Google account to access the AllChain
              Intelligence Terminal, trading simulator, portfolio tools,
              and educational resources.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h2 className="font-semibold text-cyan-300 mb-2">
              Trading Simulator
            </h2>

            <p className="text-gray-300">
              AllChain currently provides a simulated trading environment
              designed for learning, strategy testing, and market analysis.
              Users can execute virtual trades without risking real funds.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h2 className="font-semibold text-cyan-300 mb-2">
              Market Intelligence
            </h2>

            <p className="text-gray-300">
              The Market Terminal provides AI-powered market intelligence
              including sentiment analysis, capital flow monitoring,
              regime detection, momentum tracking, heatmaps, and market
              narratives.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h2 className="font-semibold text-cyan-300 mb-2">
              Portfolio Tracking
            </h2>

            <p className="text-gray-300">
              Portfolio value, profit and loss, open positions, and trade
              history are updated automatically based on your simulated
              trading activity.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h2 className="font-semibold text-cyan-300 mb-2">
              Account Security
            </h2>

            <p className="text-gray-300">
              Authentication is secured through Google Sign-In and cloud-based
              infrastructure. User sessions are monitored and protected using
              modern authentication practices.
            </p>
          </div>

        </div>

        {/* SUPPORT CARD */}
        <div className="mt-8 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-6">

          <h2 className="text-xl font-semibold text-cyan-300 mb-3">
            Need Additional Assistance?
          </h2>

          <p className="text-gray-300 mb-4">
            If you cannot find the information you need, our support team is
            available to assist you.
          </p>

          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-400">Support Email:</span>{' '}
              <span className="text-white">
                support@allchain.ai
              </span>
            </p>

            <p>
              <span className="text-gray-400">Response Time:</span>{' '}
              <span className="text-white">
                24–48 business hours
              </span>
            </p>
          </div>

        </div>

        {/* FOOTER ACTION */}
        <div className="mt-10 text-center">
          <Link
            href="/intel"
            className="
              inline-flex
              items-center
              justify-center
              rounded-lg
              border
              border-cyan-500/30
              bg-cyan-500/10
              px-6
              py-3
              text-cyan-300
              hover:bg-cyan-500/20
              transition
            "
          >
            ← Back to Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}