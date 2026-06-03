'use client';

import Link from 'next/link';

export default function LegalPage() {
return ( <div className="min-h-screen bg-[#0B1220] text-white">


  {/* GRID BACKGROUND */}
  <div className="absolute inset-0 opacity-10 pointer-events-none">
    <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:50px_50px]" />
  </div>

  <div className="relative z-10 max-w-5xl mx-auto px-6">

    {/* HEADER */}
    <section className="pt-24 text-center">
      <h1 className="text-4xl md:text-5xl font-bold">
        Legal Notice
      </h1>

      <p className="mt-6 max-w-2xl mx-auto text-gray-400">
        Important legal information regarding the use of the
        AllChain platform, services, educational content,
        AI-generated insights, and simulated trading environment.
      </p>
    </section>

    {/* CONTENT */}
    <section className="mt-16 pb-24 space-y-10 text-gray-300 leading-relaxed">

      {/* DISCLAIMER */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-3">
          1. General Disclaimer
        </h2>

        <p>
          The information provided through AllChain is intended for
          educational, informational, and research purposes only.
          Nothing on this platform should be interpreted as financial,
          investment, legal, accounting, or tax advice.
        </p>
      </div>

      {/* AI DISCLOSURE */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-3">
          2. AI-Generated Content Disclosure
        </h2>

        <p>
          AllChain may provide AI-generated market narratives,
          sentiment analysis, forecasts, signals, opportunity
          detection, and other intelligence outputs.
        </p>

        <p className="mt-3">
          These outputs are generated using automated systems and
          may contain inaccuracies, incomplete information,
          or incorrect assumptions.
        </p>

        <p className="mt-3">
          Users should independently verify information before making
          any financial or investment decisions.
        </p>
      </div>

      {/* RISK */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-3">
          3. Cryptocurrency Risk Disclosure
        </h2>

        <p>
          Cryptocurrency and digital asset markets are highly
          speculative and volatile.
        </p>

        <ul className="mt-3 list-disc list-inside space-y-2">
          <li>Prices may fluctuate rapidly.</li>
          <li>Market liquidity can change unexpectedly.</li>
          <li>Past performance does not predict future outcomes.</li>
          <li>Loss of capital is possible.</li>
        </ul>

        <p className="mt-3">
          Users assume full responsibility for any decisions made
          based on information provided through the platform.
        </p>
      </div>

      {/* SIMULATION */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-3">
          4. Simulated Trading Environment
        </h2>

        <p>
          Unless explicitly stated otherwise, trading functionality
          within AllChain operates using virtual balances and
          simulated transactions.
        </p>

        <p className="mt-3">
          No actual cryptocurrency purchases, sales, custody,
          brokerage, or exchange services are performed through
          the simulated environment.
        </p>
      </div>

      {/* LIABILITY */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-3">
          5. Limitation of Liability
        </h2>

        <p>
          AllChain is provided on an "as available" and
          "as is" basis without warranties of any kind.
        </p>

        <p className="mt-3">
          To the fullest extent permitted by applicable law,
          AllChain shall not be liable for any direct, indirect,
          incidental, consequential, or special damages arising
          from the use of the platform.
        </p>
      </div>

      {/* PRIVACY */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-3">
          6. Privacy & Data Usage
        </h2>

        <p>
          We are committed to protecting user information and
          maintaining appropriate security safeguards.
        </p>

        <p className="mt-3">
          Platform usage data may be collected to improve product
          performance, reliability, analytics, and user experience.
        </p>
      </div>

      {/* COMPLIANCE */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-3">
          7. Regulatory Compliance
        </h2>

        <p>
          Regulatory treatment of digital assets varies across
          jurisdictions and may change over time.
        </p>

        <p className="mt-3">
          Users are responsible for ensuring compliance with local
          laws, regulations, tax obligations, and reporting
          requirements applicable in their jurisdiction.
        </p>
      </div>

      {/* MODIFICATIONS */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-3">
          8. Updates & Modifications
        </h2>

        <p>
          AllChain reserves the right to modify platform features,
          services, legal notices, and policies at any time without
          prior notice.
        </p>
      </div>

    </section>

    {/* QUICK LINKS */}
    <div className="pb-12">

      <div className="border border-white/10 rounded-2xl bg-white/5 p-6">

        <h3 className="text-lg font-semibold mb-4">
          Related Policies
        </h3>

        <div className="flex flex-wrap gap-4 text-sm">

          <Link
            href="/terms"
            className="text-cyan-400 hover:text-cyan-300"
          >
            Terms of Service
          </Link>

          <Link
            href="/security"
            className="text-cyan-400 hover:text-cyan-300"
          >
            Security Center
          </Link>

          <Link
            href="/support"
            className="text-cyan-400 hover:text-cyan-300"
          >
            Support
          </Link>

          <Link
            href="/help"
            className="text-cyan-400 hover:text-cyan-300"
          >
            Help Center
          </Link>

        </div>

      </div>

      <div className="text-center text-xs text-gray-500 mt-8">
        © 2026 AllChain. All rights reserved.
      </div>

    </div>

  </div>
</div>


);
}
