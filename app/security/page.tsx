'use client';

import Link from 'next/link';

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* HEADER */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Security Center
          </h1>

          <p className="text-gray-400 max-w-2xl mx-auto">
            Protecting users and maintaining platform integrity are core
            priorities at AllChain. Review our security practices,
            account safety guidance, and risk disclosures.
          </p>
        </div>

        {/* PLATFORM SECURITY */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">
            Platform Security
          </h2>

          <div className="space-y-4 text-gray-300">
            <p>
              AllChain implements modern security practices to help
              safeguard user accounts and platform infrastructure.
            </p>

            <ul className="space-y-2 list-disc list-inside">
              <li>Secure authentication workflows</li>
              <li>Protected API communication</li>
              <li>Session monitoring and activity tracking</li>
              <li>Regular platform maintenance and updates</li>
              <li>Access controls and account protection measures</li>
            </ul>
          </div>
        </div>

        {/* ACCOUNT SAFETY */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">
            Account Safety Tips
          </h2>

          <div className="space-y-3 text-gray-300">
            <p>
              You play an important role in keeping your account secure.
            </p>

            <ul className="space-y-2 list-disc list-inside">
              <li>Never share passwords or verification codes.</li>
              <li>Use strong and unique passwords.</li>
              <li>Verify website URLs before signing in.</li>
              <li>Be cautious of phishing emails and fake support messages.</li>
              <li>Log out from shared or public devices.</li>
            </ul>
          </div>
        </div>

        {/* SCAM PREVENTION */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">
            Scam Prevention
          </h2>

          <div className="space-y-3 text-gray-300">
            <p>
              Cryptocurrency scams often impersonate legitimate platforms.
            </p>

            <ul className="space-y-2 list-disc list-inside">
              <li>
                AllChain will never request passwords through email,
                chat, or social media.
              </li>
              <li>
                Beware of guaranteed profit schemes and investment promises.
              </li>
              <li>
                Verify official communication channels before sharing information.
              </li>
              <li>
                Report suspicious activity immediately through our support team.
              </li>
            </ul>
          </div>
        </div>

        {/* RISK DISCLOSURE */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
          <h2 className="text-2xl font-semibold mb-4 text-amber-300">
            Risk Disclosure
          </h2>

          <div className="space-y-3 text-gray-300">
            <p>
              Digital asset markets are highly volatile and involve risk.
            </p>

            <ul className="space-y-2 list-disc list-inside">
              <li>Asset prices may fluctuate significantly.</li>
              <li>Past performance does not guarantee future results.</li>
              <li>
                AllChain does not provide financial, investment, or tax advice.
              </li>
              <li>
                Users are responsible for their own trading and investment decisions.
              </li>
            </ul>
          </div>
        </div>

        {/* FOOTER LINKS */}
        <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-gray-400">
          <Link href="/help" className="hover:text-white">
            Help Center
          </Link>

          <Link href="/support" className="hover:text-white">
            Support
          </Link>

          <Link href="/terms" className="hover:text-white">
            Terms
          </Link>

          <Link href="/pages/legal" className="hover:text-white">
            Legal
          </Link>
        </div>

      </div>
    </div>
  );
}