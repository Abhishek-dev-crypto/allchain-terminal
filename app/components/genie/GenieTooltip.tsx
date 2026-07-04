"use client";

import { useEffect, useState } from "react";
import { useGenie } from "@/app/contexts/GenieRuntimeContext";
import { resolveTarget } from "./core/resolveTarget";

/**
 * ⚠️ DEPRECATED VISUAL HELPER
 * Do NOT use with TourOverlay tooltip system
 * Keep ONLY if you plan separate minimal mode UI
 */

const COPY: Record<string, { title: string; desc: string }> = {
  header: {
    title: "Welcome to AllChain",
    desc: "This is your entry point into AI-powered market intelligence.",
  },
  "ai-preview": {
    title: "AI Market Preview",
    desc: "Live AI signal engine analyzing price movement in real time.",
  },
  "market-block": {
    title: "Market Intelligence",
    desc: "Deep view into live crypto structure and momentum shifts.",
  },
  "why-traders-fail": {
    title: "Why Traders Fail",
    desc: "Understand common mistakes before learning strategy.",
  },
  "signin-button": {
    title: "Start Trading",
    desc: "Begin your simulation journey with one click.",
  },
};

export default function GenieTooltip() {
  const { state } = useGenie();
  const { activeTarget, tourActive } = state;

  const [pos, setPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  useEffect(() => {
    if (!activeTarget || !tourActive) return;

    const el = resolveTarget(activeTarget);

    if (!el) return;

    const rect = el.getBoundingClientRect();

    setPos({
      top: rect.top,
      left: rect.left + rect.width / 2,
    });
  }, [activeTarget, tourActive]);

  if (!activeTarget || !pos) return null;

  const content = COPY[activeTarget];

  if (!content) return null;

  return (
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{
        top: pos.top,
        left: pos.left,
        transform: "translate(-50%, -120%)",
      }}
    >
      <div className="bg-black/90 border border-white/10 text-white px-4 py-3 rounded-xl shadow-xl max-w-[260px]">
        <p className="text-sm font-semibold">{content.title}</p>
        <p className="text-xs text-gray-400 mt-1 leading-snug">
          {content.desc}
        </p>

        <div className="mt-2 text-[10px] text-blue-400">
          Genie Guide Active
        </div>
      </div>
    </div>
  );
}