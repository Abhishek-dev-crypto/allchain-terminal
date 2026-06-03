'use client';

import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0B1220] text-white relative overflow-hidden">

      {/* GRID BACKGROUND */}
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

          <p className="mt-6 max-w-3xl mx-auto text-gray-400 leading-relaxed">
            These Terms of Service govern your access to and use of the
            AllChain platform, including market intelligence tools,
            educational resources, analytics systems, AI-generated insights,
            and related services.
          </p>
        </section>

        {/* CONTENT */}
        <section className="mt-16 pb-24 space-y-12 text-gray-300 leading-relaxed">

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              1. Acceptance of Terms
            </h2>

            <p>
              By accessing or using AllChain, you agree to be bound by
              these Terms of Service and any applicable policies referenced
              within the platform. If you do not agree with these terms,
              you should discontinue use immediately.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              2. Platform Overview
            </h2>

            <p>
              AllChain provides cryptocurrency market intelligence,
              analytics, educational content, AI-assisted insights,
              and simulated trading experiences designed to help users
              better understand digital asset markets.
            </p>

            <p className="mt-3">
              Unless explicitly stated otherwise, trading functionality
              within the platform operates using virtual funds and does
              not execute real cryptocurrency transactions.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              3. User Responsibilities
            </h2>

            <p>
              Users are responsible for maintaining the security and
              confidentiality of their accounts.
            </p>

            <ul className="mt-3 list-disc list-inside space-y-2">
              <li>Protect account credentials and login access.</li>
              <li>Provide accurate and current information.</li>
              <li>Comply with applicable laws and regulations.</li>
              <li>Avoid fraudulent, abusive, or malicious activity.</li>
              <li>Respect platform security and operational integrity.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              4. AI & Market Intelligence Disclaimer
            </h2>

            <p>
              AllChain may provide AI-generated narratives, sentiment
              analysis, forecasts, market summaries, risk indicators,
              and trading-related insights.
            </p>

            <p className="mt-3">
              These outputs are provided for informational and educational
              purposes only and do not constitute financial, investment,
              legal, accounting, or tax advice.
            </p>

            <p className="mt-3">
              Users remain solely responsible for evaluating information
              and making their own decisions.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              5. Risk Disclosure
            </h2>

            <p>
              Cryptocurrency and digital asset markets are highly volatile
              and involve substantial risk.
            </p>

            <p className="mt-3">
              Market conditions may change rapidly, resulting in significant
              gains or losses. Historical performance should not be relied
              upon as an indicator of future outcomes.
            </p>

            <p className="mt-3">
              Users should conduct independent research and seek
              professional advice where appropriate before making
              financial decisions.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              6. Intellectual Property
            </h2>

            <p>
              AllChain branding, software, platform designs, content,
              analytics systems, trademarks, and proprietary materials
              remain the property of AllChain unless otherwise stated.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              7. Limitation of Liability
            </h2>

            <p>
              The platform is provided on an "as is" and "as available"
              basis without warranties of any kind.
            </p>

            <p className="mt-3">
              To the fullest extent permitted by law, AllChain shall not
              be liable for direct, indirect, incidental, consequential,
              special, or punitive damages arising from the use of the
              platform or reliance on information presented within it.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              8. Modifications to Services & Terms
            </h2>

            <p>
              We reserve the right to modify, suspend, or discontinue
              portions of the platform at any time.
            </p>

            <p className="mt-3">
              These Terms may be updated periodically. Continued use of
              AllChain after updates become effective constitutes acceptance
              of the revised Terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              9. Contact & Support
            </h2>

            <p>
              Questions regarding these Terms of Service may be directed
              through the Support Center available within the platform.
            </p>
          </div>

        </section>

        {/* FOOTER LINKS */}
        <div className="pb-12 flex flex-wrap justify-center gap-6 text-sm text-gray-500 border-t border-white/10 pt-8">
          <Link href="/help" className="hover:text-white transition">
            Help Center
          </Link>

          <Link href="/support" className="hover:text-white transition">
            Support
          </Link>

          <Link href="/security" className="hover:text-white transition">
            Security
          </Link>

          <Link href="/privacy" className="hover:text-white transition">
            Privacy Policy
          </Link>

          <Link href="/legal" className="hover:text-white transition">
            Legal Notice
          </Link>
        </div>

      </div>
    </div>
  );
}