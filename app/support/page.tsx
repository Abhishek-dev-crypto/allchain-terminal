'use client';

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebaseConfig";

export default function SupportPage() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("Bug Report");

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [cooldown, setCooldown] = useState(0);

  /* ---------------- COOLDOWN TIMER ---------------- */

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (cooldown > 0) {
      alert(`Please wait ${cooldown}s before sending another request.`);
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "supportTickets"), {
        name,
        email,
        message,
        category,
        status: "open",
        createdAt: serverTimestamp(),
      });

      setSubmitted(true);

      setName("");
      setEmail("");
      setMessage("");

      setCooldown(30);

      setTimeout(() => {
        setSubmitted(false);
      }, 5000);

    } catch (err) {
      console.error(err);
      alert("Failed to submit support request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden">

      {/* BACKGROUND GRID */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:50px_50px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6">

        {/* HERO */}
        <section className="pt-28 text-center">

          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 text-yellow-300 text-xs font-semibold mb-6">
            LIVE SUPPORT SYSTEM ACTIVE
          </div>

          <h1 className="text-4xl md:text-5xl font-bold">
            Support Center
          </h1>

          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            Report bugs, request features, submit feedback,
            or contact the AllChain team directly.
          </p>
        </section>

        {/* CONTACT CARD */}
        <section className="mt-16">

          <div className="p-8 rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-md">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">

              <div>
                <h2 className="text-2xl font-semibold">
                  Contact Support
                </h2>

                <p className="text-sm text-gray-400 mt-2">
                  Average response time: 24–48 hours
                </p>
              </div>

              <div className="flex gap-3">

                <a
                  href="https://x.com"
                  target="_blank"
                  className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm"
                >
                  X / Twitter
                </a>

                <a
                  href="https://discord.com"
                  target="_blank"
                  className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm"
                >
                  Discord
                </a>

              </div>

            </div>

            {/* SUPPORT EMAIL */}
            <div className="mb-8 p-4 rounded-xl border border-white/10 bg-black/30">
              <p className="text-sm text-gray-400">
                Support Email
              </p>

              <a
                href="mailto:support@allchainlabs.com"
                className="text-lg font-medium mt-1 text-blue-400 hover:underline"
              >
                support@allchainlabs.com
              </a>
            </div>

            <div className="mb-4 p-3 rounded-lg border border-blue-500/20 bg-blue-500/10 text-sm text-blue-300">
              For fastest response, include your registered account email.
            </div>

            {/* SUCCESS */}
            {submitted && (
              <div className="mb-6 p-4 rounded-xl border border-green-500/20 bg-green-500/10 animate-pulse">

                <div className="flex items-center gap-3">

                  <div className="text-2xl">
                    ✅
                  </div>

                  <div>
                    <p className="font-semibold text-green-400">
                      Support Ticket Submitted
                    </p>

                    <p className="text-sm text-green-300/80">
                      Our team has received your request.
                    </p>
                  </div>

                </div>

              </div>
            )}

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* CATEGORY */}
              <div>
                <label className="text-sm text-gray-400">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-1 p-3 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option>Bug Report</option>
                  <option>Feature Request</option>
                  <option>Feedback</option>
                  <option>Account Support</option>
                  <option>Partnership Inquiry</option>
                </select>
              </div>

              {/* NAME */}
              <div>
                <label className="text-sm text-gray-400">
                  Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 p-3 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="text-sm text-gray-400">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 p-3 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* MESSAGE */}
              <div>
                <label className="text-sm text-gray-400">
                  Message
                </label>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="w-full mt-1 p-3 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* COOLDOWN */}
              {cooldown > 0 && (
                <div className="text-xs text-yellow-400">
                  Anti-spam cooldown active:
                  {" "}
                  {cooldown}s remaining
                </div>
              )}

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading || cooldown > 0}
                className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:scale-[1.02] transition disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading
                  ? "Submitting..."
                  : cooldown > 0
                  ? `Wait ${cooldown}s`
                  : "Submit Request →"}
              </button>

            </form>

          </div>
        </section>

        {/* FAQ */}
        <section className="mt-20 pb-20">

          <h2 className="text-2xl font-semibold text-center mb-10">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6 max-w-3xl mx-auto">

            {[
              {
                q: "Is this real trading?",
                a: "No. AllChain uses simulated trading with real market data. No real money is involved.",
              },
              {
                q: "Do I need to deposit money?",
                a: "No deposit required. You start with demo balance instantly.",
              },
              {
                q: "How accurate are AI signals?",
                a: "AI signals are for educational purposes and are not financial advice.",
              },
              {
                q: "Can I request new features?",
                a: "Yes. Feature requests are reviewed regularly by the AllChain product team.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-5 rounded-xl bg-white/5 border border-white/10"
              >
                <p className="font-semibold mb-2">
                  {item.q}
                </p>

                <p className="text-sm text-gray-400">
                  {item.a}
                </p>
              </div>
            ))}

          </div>

        </section>

      </div>
    </div>
  );
}