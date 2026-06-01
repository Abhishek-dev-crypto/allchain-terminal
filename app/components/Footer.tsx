"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

const Footer = () => {
  const [visible, setVisible] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const [stats, setStats] = useState({
    users: 8123,
    trades: 52341,
    uptime: 99.9,
  });

  /* SCROLL DETECTION */
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const pageHeight = document.body.offsetHeight;

      if (scrollPosition >= pageHeight - 200) {
        setVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* FAKE LIVE STATS ANIMATION */
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        users: prev.users + Math.floor(Math.random() * 3),
        trades: prev.trades + Math.floor(Math.random() * 10),
        uptime: 99.9,
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  /* MOUSE GLOW */
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    setMouse({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <footer
      onMouseMove={handleMouseMove}
      className="relative mt-10 md:mt-14 border-t border-white/10 overflow-hidden"
    >

      {/* 🔥 BACKGROUND GLOW */}
      <div
        className={`absolute inset-0 transition-all duration-1000 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-cyan-400/10 blur-3xl" />
      </div>

      {/* 🔥 MOUSE GLOW */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: mouse.x - 200,
          top: mouse.y - 200,
          width: 400,
          height: 400,
          background:
            "radial-gradient(circle, rgba(59,130,246,0.15), transparent 70%)",
          filter: "blur(60px)",
          opacity: visible ? 1 : 0,
        }}
      />

      

      {/* 📊 STATS */}
        <div className="grid grid-cols-3 gap-6 px-8 md:px-12 py-6">

      {[
          { label: "Demo Traders", value: stats.users },
          { label: "Simulated Trades", value: stats.trades },
          { label: "System Uptime (Demo)", value: `${stats.uptime}%` },
        ].map((item, i) => (
        <div
            key={i}
            className={`p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:border-blue-500/30 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
        >
        <p className="text-xs text-gray-400">{item.label}</p>

        <p className="text-xl font-bold text-white mt-2">
            {typeof item.value === "number"
              ? item.value.toLocaleString()
              : item.value}
        </p>
    </div>
  ))}
</div>

      {/* MAIN FOOTER GRID */}
      <div className="relative w-full px-8 md:px-12 py-12 grid grid-cols-2 md:grid-cols-4 gap-10 text-gray-400">

        {/* LOGO */}
        <div className="transition-all duration-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center font-bold text-white">
              A
            </div>

            <span className="text-lg font-semibold bg-gradient-to-r from-white via-blue-300 to-cyan-400 bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite]">
              AllChain
            </span>
          </div>

          <p className="text-sm text-gray-500">
            Learn trading with zero risk. AI-powered insights. Real market simulation.
          </p>
        </div>

        {/* COMPANY */}
<div>
  <h3 className="text-white font-semibold mb-4 text-sm">Company</h3>
  <ul className="space-y-2 text-sm">
    <li>
      <Link href="/about" className="hover:text-white transition">
        About
      </Link>
    </li>
    <li>
      <Link href="/products" className="hover:text-white transition">
        Products
      </Link>
    </li>
    <li>
      <Link href="/support" className="hover:text-white transition">
        Support
      </Link>
    </li>
  </ul>
</div>

{/* PRODUCT */}
<div>
  <h3 className="text-white font-semibold mb-4 text-sm">Product</h3>
  <ul className="space-y-2 text-sm">
    <li>
      <Link href="/" className="hover:text-white transition">
        Demo Trading
      </Link>
    </li>
    <li>
      <Link href="/" className="hover:text-white transition">
        AI Signals
      </Link>
    </li>
    <li>
      <Link href="/" className="hover:text-white transition">
        Market Insights
      </Link>
    </li>
  </ul>
</div>

{/* LEGAL */}
<div>
  <h3 className="text-white font-semibold mb-4 text-sm">Legal</h3>
  <ul className="space-y-2 text-sm">
    <li>
      <Link href="/terms" className="hover:text-white transition">
        Terms
      </Link>
    </li>
    <li>
      <Link href="/privacy" className="hover:text-white transition">
        Privacy
      </Link>
    </li>
  </ul>
</div>
</div>

      {/* BOTTOM */}
      <div className="border-t border-white/10 py-6 text-center text-xs text-gray-500">
        © 2026 AllChain. Built for risk-free trading.
      </div>

      {/* ✨ ANIMATIONS */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </footer>
  );
};

export default Footer;