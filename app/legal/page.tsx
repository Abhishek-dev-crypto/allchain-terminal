'use client';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4">Legal Notice</h1>
        </header>

        {/* Disclaimer */}
        <section className="mb-8">
          <h2 className="text-3xl font-semibold mb-4">Disclaimer</h2>
          <p className="text-lg">
            Cryptocurrency products and NFTs are unregulated and can be highly risky. There may be no regulatory recourse for any loss incurred from such transactions. The information provided on this platform is for informational purposes only and should not be construed as financial advice.
          </p>
        </section>

        {/* Risk Disclosures */}
        <section className="mb-8">
          <h2 className="text-3xl font-semibold mb-4">Risk Disclosures</h2>
          <p className="text-lg">
            Trading cryptocurrencies involves significant risks. Market conditions can be extremely volatile, and past performance is not indicative of future results. You are solely responsible for your investment decisions. AllChain disclaims any liability for losses incurred as a result of trading on this platform.
          </p>
        </section>

        {/* Terms of Use */}
        <section className="mb-8">
          <h2 className="text-3xl font-semibold mb-4">Terms of Use</h2>
          <p className="text-lg">
            By accessing and using AllChain, you agree to our Terms of Use and acknowledge that you have read and understood the risk disclosures and disclaimers provided herein. Your continued use of the platform constitutes acceptance of these terms.
          </p>
        </section>

        {/* Privacy Policy */}
        <section className="mb-8">
          <h2 className="text-3xl font-semibold mb-4">Privacy Policy</h2>
          <p className="text-lg">
            We are committed to protecting your privacy. Any personal information you provide is stored securely and will only be used in accordance with our Privacy Policy. Please review our Privacy Policy for more details on how your data is handled.
          </p>
        </section>

        {/* Security */}
        <section className="mb-8">
          <h2 className="text-3xl font-semibold mb-4">Security</h2>
          <p className="text-lg">
            AllChain employs robust security measures to protect your data and funds. However, no system is entirely immune to breaches. We encourage you to take personal precautions and remain vigilant at all times.
          </p>
        </section>

        {/* Contact Information */}
        <section className="mb-8">
          <h2 className="text-3xl font-semibold mb-4">Contact Information</h2>
          <p className="text-lg">
            If you have any questions regarding these legal notices or any related matters, please contact us at{" "}
            <a href="mailto:legal@allchain.com" className="text-blue-600 underline">
              legal@allchain.com
            </a>.
          </p>
        </section>

        <footer className="mt-12 border-t border-gray-300 pt-4 text-center text-gray-600 text-sm">
          <p>© 2024 AllChain. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
