export const ui = {
  // =========================
  // TYPOGRAPHY SYSTEM
  // =========================
  text: {
    label: "text-[10px] uppercase tracking-[0.35em] text-white/40",
    micro: "text-[10px] text-white/30",
    body: "text-xs text-white/70",
    value: "text-xs font-medium text-white",
    title: "text-xs font-semibold text-white",
  },

  // =========================
  // SURFACES
  // =========================
  surface: {
    base: "rounded-lg border border-white/10 bg-white/5",
    hover: "hover:bg-white/10 transition-all",
    soft: "rounded-lg border border-white/5 bg-white/[0.03]",
    strong: "rounded-lg border border-white/10 bg-white/10",
  },

  // =========================
  // SPACING SYSTEM
  // =========================
  space: {
    xs: "p-2",
    sm: "p-2.5",
    md: "p-3",
    gap: "gap-2",
    gapLoose: "gap-3",
  },

  // =========================
  // STATES / COLORS
  // =========================
  state: {
    neutral: "text-white/60",
    muted: "text-white/40",
    active: "text-cyan-300 border-cyan-400/40 bg-cyan-500/10",
    success: "text-emerald-400",
    danger: "text-red-400",
    warning: "text-yellow-400",
    premium: "text-amber-300",
  },

  // =========================
  // LAYOUT HELPERS
  // =========================
  layout: {
    row: "flex items-center justify-between",
    rowStart: "flex items-start justify-between",
    col: "flex flex-col",
    grid2: "grid grid-cols-2 gap-2",
    grid3: "grid grid-cols-3 gap-2",
  },

  // =========================
  // INTERACTION
  // =========================
  interaction: {
    button:
      "transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer",
  },
};