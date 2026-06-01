"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { handleStartTrading } from "@/lib/authRedirect";

export default function AboutPage() {
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
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Building the future of
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Crypto Trading
            </span>
          </h1>

          <p className="mt-6 text-gray-400 max-w-2xl mx-auto text-lg">
            AllChain is designed to make trading simple, intelligent, and accessible.
            Learn, simulate, and trade with confidence — powered by AI.
          </p>
        </section>

        {/* STATS */}
        <section className="mt-16 grid md:grid-cols-3 gap-6 text-center">
          {[
            { value: "AI Powered", label: "Market Intelligence" },
            { value: "AI Driven", label: "Trade Insights" },
            { value: "24/7", label: "Market Monitoring" },
          ].map((item, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
            >
              <div className="text-2xl font-bold text-white">
                {item.value}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {item.label}
              </div>
            </div>
          ))}
        </section>

        {/* ABOUT */}
        <section className="mt-20 text-center">
          <h2 className="text-3xl font-semibold mb-6">
            What is AllChain?
          </h2>

          <p className="text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed">
            AllChain is a next-generation crypto learning and trading platform
            built for modern users. Whether you are a beginner or an experienced
            trader, our platform gives you the tools to understand markets,
            simulate strategies, and improve decision-making without financial risk.
          </p>
        </section>

        {/* FEATURES */}
        <section className="mt-20">
          <h2 className="text-3xl font-semibold text-center mb-10">
            Why AllChain?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Risk-Free Trading",
                desc: "Practice with demo capital and learn without losing real money.",
              },
              {
                title: "AI Insights",
                desc: "Get real-time trade suggestions powered by intelligent algorithms.",
              },
              {
                title: "Real Market Data",
                desc: "Experience real crypto price movements in a simulated environment.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 hover:shadow-xl transition"
              >
                <h3 className="text-lg font-semibold mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {item.desc}
                </p>

                <div className="mt-4 h-[2px] w-0 bg-blue-500 group-hover:w-full transition-all duration-300" />
              </div>
            ))}
          </div>
        </section>

        {/* MISSION */}
        <section className="mt-20 text-center">
          <h2 className="text-3xl font-semibold mb-6 text-blue-400">
            Our Mission
          </h2>

          <p className="text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed">
            Our mission is to make crypto trading accessible, transparent, and
            educational for everyone. We believe the future of finance is
            decentralized — and we are building the tools to help people
            navigate it confidently.
          </p>
        </section>

        {/* CTA */}
        <section className="mt-24 text-center pb-20">
          <h2 className="text-2xl font-semibold mb-4">
            Start your trading journey today
          </h2>

          <p className="text-gray-400 mb-6">
            No risk. No pressure. Just learning.
          </p>

          <button
              disabled={loading}
              onClick={async () => {
              setLoading(true);
              await handleStartTrading(router);
              setLoading(false);
            }}
              className="px-8 py-3 bg-white text-black font-semibold rounded-xl hover:scale-105 transition disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Launch Terminal →"}
            </button>
        </section>

      </div>
    </div>
  );
}