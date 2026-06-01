'use client';

import { useState } from "react";
import Link from "next/link";

export default function SecurityPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-8 scroll-smooth" id="top">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 text-blue-700">
            Security &amp; Compliance
          </h1>
          <p className="text-xl">
            Your safety is our top priority. Please review our security measures and legal notices.
          </p>
        </header>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Two-Factor Authentication (2FA)</h2>
          <p className="mb-4 text-lg">
            Enhance the security of your AllChain account by enabling Two-Factor Authentication (2FA).
            With 2FA, you&apos;ll need an additional verification step (e.g., a code from your authenticator app)
            to access your account.
          </p>
          <div className="flex items-center">
            <span className="mr-4 font-semibold">
              2FA is currently {twoFactorEnabled ? "Enabled" : "Disabled"}.
            </span>
            <button
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
            >
              {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            (Note: This is a simulation. In production, integrate with a TOTP or SMS verification service.)
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Risk Disclosures &amp; Legal Notices</h2>
          <p className="mb-4 text-lg">
            Cryptocurrency trading involves significant risks. Please ensure you fully understand these risks before trading.
          </p>
          <ul className="list-disc list-inside space-y-2 text-lg">
            <li>
              <strong>Trading Risk:</strong> Crypto markets are highly volatile and unpredictable. Past performance is not indicative of future results.
            </li>
            <li>
              <strong>Security Risk:</strong> Although AllChain employs advanced security measures, no system is completely foolproof. Personal caution is required.
            </li>
            <li>
              <strong>Legal Disclaimer:</strong> AllChain does not provide financial or investment advice. Trading cryptocurrencies carries risks, and you are solely responsible for your trading decisions.
            </li>
            <li>
              <strong>Compliance:</strong> AllChain adheres to regulatory standards, but guidelines can change rapidly.
            </li>
          </ul>
          <p className="mt-4 text-lg">
            For more details, please review our full <a href="/legal" className="text-blue-600 underline">Legal Notice</a> page.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Security Tips &amp; Scam Prevention</h2>
          <p className="text-lg">
            Always be cautious of unsolicited messages or requests for personal information. All official communications from AllChain will come through verified channels.
            If you suspect any fraudulent activity, report it immediately to our support team.
          </p>
          <p className="mt-4 text-lg">
            Stay informed and vigilant&mdash;your security is our top priority.
          </p>
        </section>

        <div className="text-center mt-8">
          <Link href="/profile" className="text-blue-600 underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
