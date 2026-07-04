"use client";

import { useEffect, useRef, useState } from "react";
import { useGenie } from "../../contexts/GenieRuntimeContext";
import { resolveTarget } from "./core/resolveTarget";
import { TOUR_META } from "./tour/genieTourMeta";

export default function TourOverlay() {
 const {
  state,
  nextStep,
  previousStep,
  reset,
} = useGenie();
  const { activeTarget, tourActive } = state;

  const [rect, setRect] = useState<DOMRect | null>(null);
  const rafRef = useRef<number | null>(null);

  const meta = activeTarget ? TOUR_META[activeTarget] : null;

  /**
   * Update target position safely
   */
 const updateTarget = () => {
  if (!activeTarget) return;

  const el = document.querySelector<HTMLElement>(
    `[data-genie="${activeTarget}"]`
  );

  if (!el) return;

  setRect(el.getBoundingClientRect());
};

  const scheduleUpdate = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(updateTarget);
  };

  useEffect(() => {
  if (!activeTarget) return;

  const el = document.querySelector<HTMLElement>(
    `[data-genie="${activeTarget}"]`
  );

  if (!el) return;

  el.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "center",
  });
}, [activeTarget]);

  /**
   * Wait for DOM to be ready (safe mounting)
   */
  useEffect(() => {
    if (!activeTarget) return;

    let attempts = 0;

    const interval = setInterval(() => {
      const el = resolveTarget(activeTarget);

      if (el) {
        updateTarget();
        clearInterval(interval);
      }

      attempts++;

      if (attempts > 20) {
        clearInterval(interval);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [activeTarget]);

  /**
   * Keep position synced on resize/scroll
   */
  useEffect(() => {
    if (!tourActive || !activeTarget) {
      setRect(null);
      return;
    }

    scheduleUpdate();

    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("scroll", scheduleUpdate, true);

    return () => {
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate, true);
    };
  }, [activeTarget, tourActive]);

  /* ADD HERE */
useEffect(() => {
  console.log("Target changed:", activeTarget);
}, [activeTarget]);


  if (!tourActive || !rect || !activeTarget) return null;

  const padding = 10;

  const spotlight = {
    top: rect.top - padding,
    left: rect.left - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };

  /**
   * Tooltip placement
   */
  const placement = meta?.placement ?? "bottom";
const TOOLTIP_WIDTH = 280;
const VIEWPORT_PADDING = 16;

const tooltipStyle: React.CSSProperties = {
  position: "absolute",
  width: TOOLTIP_WIDTH,
  zIndex: 10000,
};

if (placement === "bottom") {
  tooltipStyle.top = Math.min(
    spotlight.top + spotlight.height + 12,
    window.innerHeight - 180
  );

  tooltipStyle.left = spotlight.left;
}

if (placement === "top") {
  tooltipStyle.top = Math.max(
    16,
    spotlight.top - 110
  );

  tooltipStyle.left = spotlight.left;
}

if (placement === "left") {
  tooltipStyle.top = spotlight.top;
  tooltipStyle.left = spotlight.left - TOOLTIP_WIDTH - 12;
}

if (placement === "right") {
  tooltipStyle.top = spotlight.top;
  tooltipStyle.left = spotlight.left + spotlight.width + 12;
}

/**
 * Clamp horizontally into viewport
 */
const maxLeft =
  window.innerWidth -
  TOOLTIP_WIDTH -
  VIEWPORT_PADDING;

tooltipStyle.left = Math.max(
  VIEWPORT_PADDING,
  Math.min(
    Number(tooltipStyle.left ?? 0),
    maxLeft
  )
);


  return (
    <div className="fixed inset-0 z-[9998] pointer-events-none">
      {/* DARK MASK */}
      <div
        className="absolute inset-0 bg-black/70"
        style={{
          maskImage: `
            radial-gradient(
              circle at ${spotlight.left + spotlight.width / 2}px 
              ${spotlight.top + spotlight.height / 2}px,
              transparent 0px,
              transparent ${spotlight.width / 2}px,
              rgba(0,0,0,0.9) ${spotlight.width / 2 + 40}px
            )
          `,
          WebkitMaskImage: `
            radial-gradient(
              circle at ${spotlight.left + spotlight.width / 2}px 
              ${spotlight.top + spotlight.height / 2}px,
              transparent 0px,
              transparent ${spotlight.width / 2}px,
              rgba(0,0,0,0.9) ${spotlight.width / 2 + 40}px
            )
          `,
        }}
      />

      {/* HIGHLIGHT BOX */}
      <div
        className="absolute border border-cyan-400 rounded-lg shadow-[0_0_25px_rgba(34,211,238,0.4)] transition-all duration-300"
        style={{
          top: spotlight.top,
          left: spotlight.left,
          width: spotlight.width,
          height: spotlight.height,
        }}
      />

      {/* TOOLTIP */}
      {meta && (
        <div
          className="bg-[#0b0f19] text-white rounded-xl p-4 shadow-2xl border border-white/10 pointer-events-auto"
          style={tooltipStyle}
        >
          <div className="text-[10px] uppercase tracking-wider text-cyan-400 mb-2">
              Step {state.step + 1} / 5
          </div>

          <h3 className="text-sm font-semibold mb-1">
            {meta.title}
          </h3>

          <p className="text-xs text-white/70 leading-snug">
            {meta.description}
          </p>

        <div className="flex justify-between mt-3">
  <button
    onClick={previousStep}
    disabled={state.step === 0}
    className="
      text-xs
      px-3
      py-1
      rounded-md
      bg-white/10
      hover:bg-white/20
      disabled:opacity-40
      disabled:cursor-not-allowed
    "
  >
    Back
  </button>

  <div className="flex gap-2">
    <button
      onClick={reset}
      className="text-xs px-3 py-1 rounded-md bg-white/10 hover:bg-white/20"
    >
      Exit
    </button>

    <button
      onClick={nextStep}
      className="text-xs px-3 py-1 rounded-md bg-cyan-500 text-black font-medium hover:bg-cyan-400"
    >
      {meta.actionLabel ?? "Next"}
    </button>
  </div>
</div>
        </div>
      )}
    </div>
  );
}