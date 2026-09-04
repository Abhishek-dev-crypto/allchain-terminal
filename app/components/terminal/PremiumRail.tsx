"use client";

import { Lock, Unlock, Crown } from "lucide-react";
import { motion } from "framer-motion";

import { auth, db } from "@/lib/firebaseConfig";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
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

type PremiumRailProps = {
  isPremium: boolean;
  premiumLoading: boolean;
};

export default function PremiumRail({
  isPremium,
  premiumLoading,
}: PremiumRailProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePremiumUpgrade = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        alert("Please sign in first");
        return;
      }

      await addDoc(collection(db, "premium_requests"), {
        uid: user.uid,
        email: user.email || "",
        name: user.displayName || "",
        source: "premium_rail",
        createdAt: serverTimestamp(),
        status: "pending",
      });

      setShowSuccess(true);

      alert(
        "Your Premium access request has been registered. We’ll notify you once Premium Intelligence becomes available."
      );
    } catch (error) {
      console.error("Premium Request Error:", error);
    }
  };

  return (
    <div className="h-full border-l border-white/10 bg-black/20 p-2">

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-purple-300">
          AI Command Layer
        </div>

        <div className="shrink-0 rounded-full border border-purple-500/20 bg-purple-500/20 px-1.5 py-0.5 text-[8px] font-semibold text-purple-300">
          {premiumLoading
            ? "CHECKING"
            : isPremium
            ? "ACTIVE"
            : "PREMIUM"}
        </div>
      </div>

      {/* ================================================== */}
      {/* PREMIUM STATUS */}
      {/* ================================================== */}

      {!premiumLoading && isPremium && (
        <div className="mb-2 rounded-lg border border-purple-500/20 bg-purple-500/10 p-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-300">
            <Crown size={12} />
            <span>Premium Intelligence Active</span>
          </div>

          <div className="mt-0.5 text-[9px] leading-tight text-white/40">
            Your account has full Premium access.
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* LOADING */}
      {/* ================================================== */}

      {premiumLoading && (
        <div className="mb-2 rounded-lg border border-white/10 bg-white/[0.03] p-2">
          <div className="text-[9px] text-white/40">
            Checking Premium access...
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* PREMIUM FEATURES */}
      {/* ================================================== */}

      <div className="space-y-1">
        {premiumFeatures.map((feature) => (
          <motion.button
            key={feature.title}
            type="button"
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
            disabled={premiumLoading}
            className="
              relative w-full
              rounded-lg
              border border-white/10
              bg-white/[0.03]
              px-2 py-1.5
              text-left
              transition-all
              hover:bg-purple-500/10
              disabled:opacity-60
            "
          >
            {/* LOCK / UNLOCK */}
            <div className="absolute right-2 top-2 text-white/30">
              {isPremium ? (
                <Unlock size={11} />
              ) : (
                <Lock size={11} />
              )}
            </div>

            {/* CONTENT */}
            <div className="pr-5">
              <div className="text-[10px] font-medium leading-tight text-white/85">
                {feature.title}
              </div>

              <div className="mt-0.5 text-[8px] leading-tight text-white/35">
                {feature.description}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* ================================================== */}
      {/* FREE USER CTA */}
      {/* ================================================== */}

      {!premiumLoading && !isPremium && (
        <div className="mt-2 rounded-lg border border-purple-500/20 bg-purple-500/10 p-2">

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-300">
            <Crown size={12} />
            <span>Unlock Premium Access</span>
          </div>

          <div className="mt-1.5 space-y-0.5 text-[8px] leading-tight text-white/50">
            <div>• Advanced AI models & predictions</div>
            <div>• Real-time whale tracking</div>
            <div>• Smart portfolio optimization</div>
            <div>• AI-powered trade insights</div>
          </div>

          <button
            type="button"
            onClick={handlePremiumUpgrade}
            className="
              mt-2
              w-full
              rounded-lg
              bg-gradient-to-r
              from-purple-500
              to-violet-600
              py-1.5
              text-[10px]
              font-semibold
              hover:opacity-90
              transition-all
            "
          >
            {showSuccess
              ? "Request Submitted"
              : "Request Early Access"}
          </button>
        </div>
      )}
    </div>
  );
}