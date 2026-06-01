export default function TermsPage() {
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
            Terms of Service
          </h1>

          <p className="mt-4 text-gray-400 text-sm">
            Last updated: {new Date().getFullYear()}
          </p>
        </section>

        {/* CONTENT */}
        <section className="mt-16 space-y-10 pb-20 text-gray-300 leading-relaxed">

          {/* INTRO */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              1. Introduction
            </h2>
            <p>
              These Terms of Service govern your use of the AllChain {"\"Platform\""}.
              By accessing or using our services, you agree to be bound by these
              terms. If you do not agree, you should not use the {"\"Platform\""}.
            </p>
          </div>

          {/* USAGE */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              2. {"\"Platform\""} Usage
            </h2>
            <p>
              AllChain provides a simulated trading environment using real market
              data. No real financial transactions occur on the {"\"Platform\""}.
            </p>
          </div>

          {/* RESPONSIBILITY */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              3. User Responsibilities
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your
              account and for all activities that occur under your account. You
              agree to use the {"\"Platform\""} in compliance with applicable laws.
            </p>
          </div>

          {/* AI DISCLAIMER */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              4. AI Disclaimer
            </h2>
            <p>
              AI-generated trade signals are provided for educational and
              simulation purposes only. They do not constitute financial advice.
            </p>
          </div>

          {/* LIABILITY */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              5. Limitation of Liability
            </h2>
            <p>
              AllChain is provided "as is" without warranties of any kind. We are
              not liable for any losses, damages, or inaccuracies arising from
              the use of the {"\"Platform\""}.
            </p>
          </div>

          {/* CHANGES */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              6. Changes to Terms
            </h2>
            <p>
              We reserve the right to update these Terms at any time. Continued
              use of the {"\"Platform\""} constitutes acceptance of the updated Terms.
            </p>
          </div>

        </section>

      </div>
    </div>
  );
}