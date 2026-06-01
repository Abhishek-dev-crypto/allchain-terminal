"use client";

import { Lock, Crown } from "lucide-react";
import { motion } from "framer-motion";

import { auth, db } from "@/lib/firebaseConfig";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { useState } from "react";

const premiumFeatures = [
  {
    title: "AI Probability Model",
    description: "Multi-factor probability engine",
  },
  {
    title: "Predictive Market Engine",
    description: "AI-powered market predictions",
  },
  {
    title: "Regime Detection",
    description: "Advanced regime identification",
  },
  {
    title: "Whale Tracking",
    description: "Real-time whale monitoring",
  },
  {
    title: "Behavioral Analytics",
    description: "Market behavior & psychology",
  },
  {
    title: "Portfolio AI",
    description: "AI-powered portfolio insights",
  },
  {
    title: "Smart Execution",
    description: "AI trade execution assistant",
  },
  {
    title: "Trade Journal AI",
    description: "AI-powered trade analysis",
  },
];

export default function PremiumRail() {

     

      const [showSuccess, setShowSuccess] = useState(false);

     const handlePremiumUpgrade = async () => {
  try {
    const user = auth.currentUser;
   

    if (!user) {
      alert("Please sign in first");
      return;
    }

    setShowSuccess(true);

    await addDoc(collection(db, "premium_requests"), {
      uid: user.uid,
      email: user.email || "",
      name: user.displayName || "",
      source: "premium_rail",
      createdAt: serverTimestamp(),
      status: "pending",
    });

    alert(
            "Your premium access request has been registered. We’ll notify you once Premium Intelligence becomes available."
        );

  } catch (error) {
    console.error("Premium Request Error:", error);
  }
};

  return (
    <div className="h-full border-l border-white/10 p-4 bg-black/20">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-purple-300">
          AI Command Layer
        </div>

        <div className="px-2 py-1 rounded-full text-[9px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/20">
          PREMIUM
        </div>
      </div>

      {/* PREMIUM CARDS */}
      <div className="space-y-3">
        {premiumFeatures.map((feature) => (
          <motion.button
            key={feature.title}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="
              relative w-full text-left
              p-3 rounded-xl
              border border-white/10
              bg-white/[0.03]
              hover:bg-purple-500/10
              transition-all
            "
          >
            {/* LOCK */}
            <div className="absolute right-3 top-3 text-white/40">
              <Lock size={14} />
            </div>

            {/* CONTENT */}
            <div className="pr-6">
              <div className="text-sm font-medium text-white/90">
                {feature.title}
              </div>

              <div className="text-[11px] text-white/45 mt-1">
                {feature.description}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-6 rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4">
        
        <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm">
          <Crown size={16} />
          Unlock Premium Access
        </div>

        <div className="mt-3 space-y-1 text-[11px] text-white/60">
          <div>✓ Advanced AI models & predictions</div>
          <div>✓ Real-time whale tracking</div>
          <div>✓ Smart portfolio optimization</div>
          <div>✓ AI-powered trade insights</div>
        </div>

        <button
            onClick={handlePremiumUpgrade}
                className="
                    mt-4 w-full py-2 rounded-xl
                    bg-gradient-to-r from-purple-500 to-violet-600
                    text-sm font-semibold
                    hover:opacity-90
                    transition-all
                    "
                >
          Request Early Access
        </button>
      </div>
    </div>
  );
}

