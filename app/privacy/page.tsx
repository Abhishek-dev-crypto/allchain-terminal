export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">

      {/* BACKGROUND GRID */}
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

          {/* INFO COLLECTED */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              1. Information We Collect
            </h2>
            <p>
              We collect basic account information such as your name and email
              address when you sign in using Google authentication. We may also
              collect technical data like device type, browser, and IP address
              for security and analytics purposes.
            </p>
          </div>

          {/* USAGE */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              2. How We Use Your Information
            </h2>
            <p>
              Your data is used to provide and improve the platform, personalize
              your experience, and maintain account security. We do not sell or
              share your personal data with third parties for marketing purposes.
            </p>
          </div>

          {/* SIMULATION CLARITY */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              3. Simulation & Trading Data
            </h2>
            <p>
              All trading activity on AllChain is simulated. No real financial
              transactions occur, and no sensitive financial data such as bank
              or card details are collected.
            </p>
          </div>

          {/* SECURITY */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              4. Data Security
            </h2>
            <p>
              We implement standard security practices to protect your data.
              However, no system is completely secure, and we cannot guarantee
              absolute protection against all threats.
            </p>
          </div>

          {/* USER CONTROL */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              5. Your Control
            </h2>
            <p>
              You can choose to stop using the platform at any time. Since login
              is handled via Google, you can manage your account permissions
              directly through your Google account settings.
            </p>
          </div>

          {/* CHANGES */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              6. Changes to Policy
            </h2>
            <p>
              We may update this Privacy Policy periodically. Continued use of
              the platform indicates your acceptance of the updated policy.
            </p>
          </div>

        </section>

      </div>
    </div>
  );
}