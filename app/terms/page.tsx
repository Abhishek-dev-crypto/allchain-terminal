'use client';

import Link from 'next/link';

export default function TermsPage() {
return ( 
<div className="min-h-screen bg-[#0B1220] text-white">

  {/* GRID BACKGROUND *)/}
  <div className="absolute inset-0 opacity-10 pointer-events-none">
    <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:50px_50px]" />
  </div>

  <div className="relative z-10 max-w-5xl mx-auto px-6">

    {/* HEADER */}
    <section className="pt-24 text-center">
      <h1 className="text-4xl md:text-5xl font-bold">
        Terms of Service
      </h1>

      <p className="mt-4 text-gray-400">
        Last Updated: June 2026
      </p>

      <p className="mt-6 max-w-2xl mx-auto text-gray-400">
        These Terms of Service govern your access to and use of
        the AllChain platform, products, services, and related features.
      </p>
    </section>

    {/* CONTENT */}
    <section className="mt-16 pb-24 space-y-10 text-gray-300 leading-relaxed">

      <div>
        <h2 className="text-xl font-semibold text-white mb-3">
          1. Acceptance of Terms
        </h2>

        <p>
          By accessing or using AllChain, you agree to comply with
          these Terms of Service. If you do not agree with any part
          of these terms, you should discontinue use of the platform.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white mb-3">
          2. Platform Overview
        </h2>

        <p>
          AllChain provides cryptocurrency market intelligence,
          educational content, analytics tools, AI-generated insights,
          and simulated trading experiences.
        </p>

        <p className="mt-3">
          Unless explicitly stated otherwise, trading functionality
          within the platform uses virtual funds and does not execute
          real cryptocurrency transactions.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white mb-3">
          3. User Responsibilities
        </h2>

        <p>
          Users are responsible for maintaining the security of their
          accounts and ensuring that all information provided is accurate.
        </p>

        <ul className="mt-3 list-disc list-inside space-y-2">
          <li>Protect login credentials and account access.</li>
          <li>Use the platform in accordance with applicable laws.</li>
          <li>Avoid fraudulent, abusive, or harmful activities.</li>
          <li>Respect platform security and operational integrity.</li>
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white mb-3">
          4. AI & Market Intelligence Disclaimer
        </h2>

        <p>
          AllChain may provide AI-generated narratives, sentiment
          analysis, market intelligence, forecasts, and trading signals.
        </p>

        <p className="mt-3">
          These outputs are informational and educational in nature
          and should not be considered financial, investment, legal,
          or tax advice.
        </p>

        <p className="mt-3">
          Users are solely responsible for any decisions made based
          on information presented within the platform.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white mb-3">
          5. Risk Disclosure
        </h2>

        <p>
          Cryptocurrency markets are highly volatile and involve
          significant financial risk.
        </p>

        <p className="mt-3">
          Market conditions can change rapidly and historical
          performance does not guarantee future results.
        </p>

        <p className="mt-3">
          Users should conduct independent research and seek
          professional advice when appropriate.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white mb-3">
          6. Intellectual Property
        </h2>

        <p>
          AllChain branding, software, content, designs,
          analytics systems, and platform materials remain the
          property of AllChain unless otherwise stated.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white mb-3">
          7. Limitation of Liability
        </h2>

        <p>
          The platform is provided on an "as available" and
          "as is" basis without warranties of any kind.
        </p>

        <p className="mt-3">
          To the maximum extent permitted by law, AllChain shall not
          be liable for direct, indirect, incidental, consequential,
          or special damages arising from the use of the platform.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white mb-3">
          8. Modifications
        </h2>

        <p>
          We may update these Terms of Service from time to time.
          Continued use of the platform after updates become effective
          constitutes acceptance of the revised terms.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white mb-3">
          9. Contact
        </h2>

        <p>
          Questions regarding these Terms may be directed through
          the Support Center available within the platform.
        </p>
      </div>

    </section>

    {/* FOOTER LINKS */}
    <div className="pb-12 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
      <Link href="/help" className="hover:text-white">
        Help Center
      </Link>

      <Link href="/support" className="hover:text-white">
        Support
      </Link>

      <Link href="/security" className="hover:text-white">
        Security
      </Link>

      <Link href="/pages/legal" className="hover:text-white">
        Legal
      </Link>
    </div>

  </div>

  
);
}
