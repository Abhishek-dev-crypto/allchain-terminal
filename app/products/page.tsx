"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { handleStartTrading } from "@/lib/authRedirect";

export default function ProductsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <div className="min-h-screen bg-[#050505] text-white">

      {/* BACKGROUND GRID */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:50px_50px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">

        {/* HERO */}
        <section className="pt-28 text-center">
          <h1 className="text-4xl md:text-6xl font-bold">
            AllChain Products
          </h1>

          <p className="mt-6 text-gray-400 max-w-2xl mx-auto text-lg">
            Everything you need to learn, simulate, and master crypto trading —
            powered by real data and AI insights.
          </p>
        </section>

        {/* PRODUCT CARDS */}
        <section className="mt-20 grid md:grid-cols-3 gap-8">

          {[
            {
              title: "Demo Trading",
              desc: "Practice trading with virtual balance in real market conditions. Zero risk, real learning.",
              icon: "💰",
            },
            {
              title: "AI Trade Signals",
              desc: "Get smart buy/sell suggestions with confidence scores based on market behavior.",
              icon: "🤖",
            },
            {
              title: "Live Market Data",
              desc: "Track real-time crypto prices, volatility, and trends just like real exchanges.",
              icon: "📊",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="group relative p-8 rounded-2xl 
              bg-gradient-to-b from-white/5 to-white/[0.02] 
              border border-white/10 
              shadow-[0_10px_30px_rgba(0,0,0,0.5)] 
              hover:shadow-[0_25px_70px_rgba(0,0,0,0.8)] 
              transition-all duration-300 backdrop-blur-sm"
            >
              {/* GLOW */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />

              <div className="relative z-10">
                <div className="text-3xl mb-4">{item.icon}</div>

                <h3 className="text-lg font-semibold mb-2">
                  {item.title}
                </h3>

                <p className="text-sm text-gray-400 leading-relaxed">
                  {item.desc}
                </p>

                <div className="mt-5 h-[2px] w-0 bg-blue-500 group-hover:w-full transition-all duration-300" />
              </div>
            </div>
          ))}

        </section>

        {/* EXTRA VALUE SECTION */}
        <section className="mt-24 text-center">
          <h2 className="text-3xl font-semibold mb-6">
            Built for Real Traders
          </h2>

          <p className="text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed">
            AllChain combines real-time data, intelligent insights, and a
            risk-free environment so you can learn faster and trade smarter.
            Whether you are exploring crypto for the first time or refining
            advanced strategies — we have got you covered.
          </p>
        </section>

        {/* CTA */}
        <section className="mt-20 text-center pb-20">
          <button
                        disabled={loading}
                        onClick={async () => {
                        setLoading(true);
                        await handleStartTrading(router);
                        setLoading(false);
                      }}
                        className="px-8 py-3 bg-white text-black font-semibold rounded-xl hover:scale-105 transition disabled:opacity-50"
                      >
                        {loading ? "Signing in..." : "Start Trading →"}
                      </button>

          <p className="mt-3 text-sm text-gray-500">
            No signup friction. Instant access.
          </p>
        </section>

      </div>
    </div>
  );
}