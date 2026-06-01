"use client";

import { motion } from "framer-motion";
import { LENSES, PREMIUM_LENSES } from "@/lib/terminal/lenses";
import { useTerminal } from "@/lib/terminal/TerminalContext";
import { Lock } from "lucide-react";

type Props = {
  onLensSelect?: () => void;
};

export default function LeftIntelligencePanel({
  onLensSelect,
}: Props) {
  const { activeLens, setActiveLens } = useTerminal();

  return (
    <div className="h-full border-r border-white/10 p-3 space-y-2">
      
      {/* HEADER */}
      <div className="text-[10px] uppercase tracking-[0.35em] font-bold text-cyan-300/90 drop-shadow-[0_0_8px_rgba(34,211,238,0.25)]">
            Intelligence Lenses
        </div>

      {/* LENS LIST */}
      <div className="space-y-1">
        {LENSES.map((lens) => {
          const isActive = activeLens === lens.id;

          return (
            <motion.button
              key={lens.id}
             onClick={() => {
                            setActiveLens(lens.id);

                            if (onLensSelect) {
                                onLensSelect();
                                    }
                                }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full text-left px-3 py-2 rounded-lg transition-all
                border text-xs
                ${
                  isActive
                    ? "bg-cyan-500/10 border-cyan-400/40 text-cyan-300"
                    : "border-white/5 text-white/60 hover:bg-white/5"
                }
              `}
            >
              <div className="flex items-center gap-2">
  <lens.icon size={14} />

  <div className="font-medium">
    {lens.label}
  </div>
</div>
              <div className="text-[10px] text-white/40">
                {lens.description}
              </div>

            </motion.button>
          );
        })}
      </div>

     
{/* PREMIUM HEADER */}
<div className="pt-4 mt-4 border-t border-white/10">
  <div className="text-[10px] uppercase tracking-[0.35em] font-bold text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.25)]">
        Premium Intelligence
    </div>
</div>

{/* PREMIUM LENSES */}
<div className="space-y-1 mt-2">
  {PREMIUM_LENSES.map((lens) => (
    <div
      key={lens.id}
      className="
        relative w-full text-left px-3 py-2 rounded-lg
        border border-white/10
        bg-white/5
        hover:bg-white/10 transition-all
        cursor-not-allowed
      "
    >
      {/* LOCK ICON */}
      <div className="absolute right-2 top-2 text-white/40">
        <Lock size={12} />
      </div>

      {/* LABEL */}
      <div className="font-medium text-xs text-white/70">
        {lens.label}
      </div>

      {/* DESCRIPTION */}
      <div className="text-[10px] text-white/40">
        {lens.description}
      </div>

      {/* OPTIONAL TAG */}
      <div className="mt-1 text-[9px] text-cyan-400/60">
        Premium Locked
      </div>
    </div>
  ))}
</div>

      {/* FOOTER STATE */}
      <div className="pt-4 mt-4 border-t border-white/10">
        <div className="text-[10px] text-white/30">
          Mode: AI Terminal v1
        </div>
      </div>
    </div>
  );
}