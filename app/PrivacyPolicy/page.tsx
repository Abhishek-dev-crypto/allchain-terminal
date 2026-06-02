'use client';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">

      {/* GRID BACKGROUND */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:50px_50px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6">

        {/* HEADER */}
        <section className="pt-28 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">
            Privacy Policy
          </h1>

          <p className="mt-4 text-gray-400 text-sm">
            Last updated: {new Date().getFullYear()}
          </p>
        </section>

        {/* CONTENT */}
        <section className="mt-16 space-y-10 pb-20 text-gray-300 leading-relaxed">

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              1. Introduction
            </h2>

            <p>
              AllChain is committed to protecting your privacy and handling
              personal information responsibly. This Privacy Policy explains
              what information we collect, how it is used, and the choices
              available to you when using the platform.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              2. Information We Collect
            </h2>

            <p>
              We may collect account information such as your name,
              email address, profile image, authentication details,
              platform activity, and usage analytics necessary to
              provide and improve the AllChain experience.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              3. How We Use Information
            </h2>

            <p>
              Information collected may be used to:
            </p>

            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Provide and maintain platform functionality.</li>
              <li>Authenticate and secure user accounts.</li>
              <li>Improve platform performance and reliability.</li>
              <li>Monitor usage patterns and user engagement.</li>
              <li>Respond to support requests and feedback.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              4. Data Storage & Security
            </h2>

            <p>
              We implement reasonable technical and organizational
              safeguards to protect user data. While we strive to
              maintain strong security standards, no online service
              can guarantee absolute protection against all risks.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              5. Third-Party Services
            </h2>

            <p>
              AllChain may utilize third-party infrastructure and
              service providers, including authentication, analytics,
              cloud hosting, and market-data providers. These services
              may process information in accordance with their own
              privacy policies.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              6. Cookies & Analytics
            </h2>

            <p>
              We may use cookies, local storage, and analytics tools
              to improve platform performance, remember preferences,
              and better understand how users interact with the
              platform.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              7. User Rights
            </h2>

            <p>
              Users may request access, correction, or deletion of
              personal information where applicable. Requests can be
              submitted through our support channels.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              8. Platform Disclaimer
            </h2>

            <p>
              AllChain currently operates as a simulated trading and
              market-intelligence platform. No real cryptocurrency
              transactions are executed through the demo trading
              environment.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              9. Changes to this Policy
            </h2>

            <p>
              We may update this Privacy Policy periodically.
              Continued use of the platform after changes are posted
              constitutes acceptance of the revised policy.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              10. Contact Us
            </h2>

            <p>
              Questions regarding this Privacy Policy may be directed
              to our support team through the Help & Support section
              of the platform.
            </p>
          </div>

        </section>
      </div>
    </div>
  );
}
