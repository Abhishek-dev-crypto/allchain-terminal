'use client';

import Link from 'next/link';

export default function WarningPage() {
  return (
    <div className="min-h-screen bg-[#0B1220] text-white">

      {/* GRID BACKGROUND */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:50px_50px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6">

        {/* HEADER */}
        <section className="pt-24 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">
            Scam & Fraud Warning
          </h1>

          <p className="mt-4 text-gray-400">
            Stay alert and protect yourself from impersonators and fraudulent schemes.
          </p>
        </section>

        {/* CONTENT */}
        <section className="mt-16 pb-24 space-y-10 text-gray-300 leading-relaxed">

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              1. Beware of Impersonation
            </h2>

            <p>
              Fraudsters may pretend to represent AllChain through
              social media, messaging applications, email, or fake
              websites. Always verify that you are interacting with
              official AllChain channels before sharing information.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              2. What AllChain Will Never Do
            </h2>

            <ul className="list-disc list-inside space-y-2">
              <li>Ask you to transfer funds to a personal account.</li>
              <li>Request passwords, authentication codes, or recovery phrases.</li>
              <li>Guarantee profits or investment returns.</li>
              <li>Contact you privately offering exclusive investment opportunities.</li>
              <li>Request remote access to your devices.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              3. Common Scam Tactics
            </h2>

            <ul className="list-disc list-inside space-y-2">
              <li>Fake customer support accounts.</li>
              <li>Fraudulent giveaways and promotions.</li>
              <li>Phishing websites designed to steal credentials.</li>
              <li>Investment schemes promising guaranteed returns.</li>
              <li>Social media messages claiming urgent account issues.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              4. How to Stay Safe
            </h2>

            <ul className="list-disc list-inside space-y-2">
              <li>Enable Two-Factor Authentication (2FA).</li>
              <li>Verify website URLs before logging in.</li>
              <li>Use strong and unique passwords.</li>
              <li>Never share private security credentials.</li>
              <li>Be cautious of unsolicited messages and offers.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              5. If You Suspect Fraud
            </h2>

            <p>
              Immediately stop communication with the suspected
              scammer, secure your account credentials, and contact
              AllChain Support through official platform channels.
            </p>

            <p className="mt-3">
              If financial loss has occurred, you should also report
              the incident to your local law enforcement and relevant
              cybercrime authorities.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              6. Disclaimer
            </h2>

            <p>
              AllChain cannot guarantee protection from third-party
              scams operating outside of official platform channels.
              Users remain responsible for exercising caution and
              verifying communications before taking action.
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

          <Link href="/legal" className="hover:text-white">
            Legal
          </Link>
        </div>

      </div>
    </div>
  );
}