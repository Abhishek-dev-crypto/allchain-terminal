"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { usePremiumEntitlement } from "@/lib/premium/usePremiumEntitlement";
import {
  LENSES,
  PREMIUM_LENSES,
} from "@/lib/terminal/lenses";
import { useTerminal } from "@/lib/terminal/TerminalContext";
import {
  Lock,
  Unlock,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

type Props = {
  onLensSelect?: () => void;
};

export default function LeftIntelligencePanel({
  onLensSelect,
}: Props) {
  const { activeLens, setActiveLens } = useTerminal();

  // Intelligence open by default
  const [intelligenceOpen, setIntelligenceOpen] =
    useState(true);

  const [premiumOpen, setPremiumOpen] =
    useState(false);

  const toggleIntelligence = () => {
    setIntelligenceOpen(true);
    setPremiumOpen(false);
  };

  const togglePremium = () => {
    setPremiumOpen(true);
    setIntelligenceOpen(false);
  };

  return (
    <div className="h-full border-r border-white/10 p-1.5">
      
      {/* ================================================== */}
      {/* INTELLIGENCE LENSES */}
      {/* ================================================== */}

      <div>
        {/* SECTION HEADER */}
        <button
          type="button"
          onClick={toggleIntelligence}
          className="
            flex w-full items-center justify-between
            px-2 py-1.5
            rounded-md
            hover:bg-white/[0.03]
            transition-colors
          "
        >
          <div className="flex items-center gap-1.5">
            {intelligenceOpen ? (
              <ChevronDown
                size={12}
                className="text-cyan-300/70"
              />
            ) : (
              <ChevronRight
                size={12}
                className="text-cyan-300/70"
              />
            )}

            <div className="text-[9px] uppercase tracking-[0.25em] font-bold text-cyan-300/90">
              Intelligence Lenses
            </div>
          </div>
        </button>

        {/* LENS LIST */}
        {intelligenceOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-0.5"
          >
            {LENSES.map((lens) => {
              const isActive =
                activeLens === lens.id;

              return (
                <motion.button
                  key={lens.id}
                  type="button"
                  onClick={() => {
                    setActiveLens(lens.id);

                    if (onLensSelect) {
                      onLensSelect();
                    }
                  }}
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.995 }}
                  className={`
                    w-full text-left
                    px-2 py-1.5
                    rounded-md
                    border
                    transition-all
                    ${
                      isActive
                        ? "bg-cyan-500/10 border-cyan-400/40 text-cyan-300"
                        : "border-white/5 text-white/60 hover:bg-white/5"
                    }
                  `}
                >
                  <div className="flex items-center gap-1.5">
                    <lens.icon size={12} />

                    <div className="font-medium text-[11px] leading-tight">
                      {lens.label}
                    </div>
                  </div>

                  <div className="mt-0.5 text-[8px] leading-tight text-white/35">
                    {lens.description}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* ================================================== */}
      {/* PREMIUM INTELLIGENCE */}
      {/* ================================================== */}

      <div className="mt-1.5 border-t border-white/10 pt-1.5">
        
        {/* SECTION HEADER */}
        <button
          type="button"
          onClick={togglePremium}
          className="
            flex w-full items-center justify-between
            px-2 py-1.5
            rounded-md
            hover:bg-white/[0.03]
            transition-colors
          "
        >
          <div className="flex items-center gap-1.5">
            {premiumOpen ? (
              <ChevronDown
                size={12}
                className="text-amber-300/70"
              />
            ) : (
              <ChevronRight
                size={12}
                className="text-amber-300/70"
              />
            )}

            <div className="text-[9px] uppercase tracking-[0.25em] font-bold text-amber-300">
              Premium Intelligence
            </div>
          </div>
        </button>

        {/* PREMIUM LIST */}
        {premiumOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-0.5"
          >
            {PREMIUM_LENSES.map((lens) => {
              const isDevelopmentAccess = false
                ;

              const isActive =
                activeLens === lens.id;

              return (
                <button
                  key={lens.id}
                  type="button"
                  onClick={() => {
                    if (!isDevelopmentAccess) {
                      return;
                    }

                    setActiveLens(lens.id);

                    if (onLensSelect) {
                      onLensSelect();
                    }
                  }}
                  className={`
                    relative w-full text-left
                    px-2 py-1.5
                    rounded-md
                    border
                    transition-all
                    ${
                      isDevelopmentAccess
                        ? isActive
                          ? "border-violet-400/50 bg-violet-500/15 text-violet-300 cursor-pointer"
                          : "border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10 cursor-pointer"
                        : "border-white/10 bg-white/5 hover:bg-white/10 cursor-not-allowed"
                    }
                  `}
                >
                  {/* STATUS ICON */}
                  <div className="absolute right-1.5 top-1.5 text-white/35">
                    {isDevelopmentAccess ? (
                      <Unlock size={10} />
                    ) : (
                      <Lock size={10} />
                    )}
                  </div>

                  {/* TITLE */}
                  <div
                    className={`
                      pr-4
                      font-medium
                      text-[11px]
                      leading-tight
                      ${
                        isActive
                          ? "text-violet-300"
                          : "text-white/70"
                      }
                    `}
                  >
                    {lens.label}
                  </div>

                  {/* DESCRIPTION */}
                  <div className="mt-0.5 pr-4 text-[8px] leading-tight text-white/35">
                    {lens.description}
                  </div>

                  {/* STATUS */}
                  <div
                    className={`
                      mt-0.5
                      text-[8px]
                      leading-tight
                      ${
                        isDevelopmentAccess
                          ? "text-cyan-400/70"
                          : "text-white/25"
                      }
                    `}
                  >
                    {isDevelopmentAccess
                      ? "Development Access"
                      : "Premium Locked"}
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* ================================================== */}
      {/* FOOTER */}
      {/* ================================================== */}

      <div className="mt-1.5 border-t border-white/10 pt-1.5">
        <div className="px-2 text-[8px] text-white/25">
          Mode: AI Terminal v1
        </div>
      </div>
    </div>
  );
}