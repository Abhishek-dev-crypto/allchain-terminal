"use client";

export default function MiniHeatmap() {
  return (
    <section className="rounded-[20px] border border-white/10 bg-[#060816] p-4 h-full overflow-hidden">

      {/* ================= HEADER ================= */}
      <div className="mb-4 flex items-start justify-between gap-3">

        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-white">
            Market Heatmap
          </h3>

          <p className="mt-1 text-[11px] text-gray-500">
            Real-time crypto activity
          </p>
        </div>

        <button className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[9px] uppercase tracking-[0.15em] text-violet-300 transition-colors hover:bg-white/[0.06]">
          Heatmap
        </button>

      </div>

      {/* ================= GRID ================= */}
      <div className="grid h-[250px] grid-cols-6 gap-2">

        {/* BTC */}
        <div className="col-span-3 row-span-2 flex flex-col justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/15 p-3 overflow-hidden">

          <div>
            <p className="truncate text-lg font-semibold text-white">
              BTC
            </p>

            <p className="mt-1 text-[11px] text-emerald-300">
              +2.35%
            </p>
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              $67,432
            </p>

            <p className="truncate text-[10px] text-white/60">
              Dominance Leader
            </p>
          </div>

        </div>

        {/* ETH */}
        <div className="col-span-2 rounded-2xl border border-emerald-500/10 bg-emerald-500/10 p-2.5 overflow-hidden">

          <p className="truncate text-sm font-semibold text-white">
            ETH
          </p>

          <p className="mt-1 text-[10px] text-emerald-300">
            +1.82%
          </p>

          <p className="mt-2 truncate text-[11px] text-white/70">
            $3,572
          </p>

        </div>

        {/* SOL */}
        <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/10 p-2 overflow-hidden">

          <p className="truncate text-[11px] font-semibold text-white">
            SOL
          </p>

          <p className="mt-1 text-[9px] text-emerald-300">
            +4.21%
          </p>

        </div>

        {/* XRP */}
        <div className="rounded-2xl border border-red-500/10 bg-red-500/10 p-2 overflow-hidden">

          <p className="truncate text-[11px] font-semibold text-white">
            XRP
          </p>

          <p className="mt-1 text-[9px] text-red-300">
            -0.41%
          </p>

        </div>

        {/* BNB */}
        <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/10 p-2 overflow-hidden">

          <p className="truncate text-[11px] font-semibold text-white">
            BNB
          </p>

          <p className="mt-1 text-[9px] text-emerald-300">
            +1.25%
          </p>

        </div>

        {/* ADA */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-2 overflow-hidden">

          <p className="truncate text-[11px] font-semibold text-white">
            ADA
          </p>

          <p className="mt-1 text-[9px] text-gray-400">
            +0.82%
          </p>

        </div>

        {/* AVAX */}
        <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/10 p-2 overflow-hidden">

          <p className="truncate text-[11px] font-semibold text-white">
            AVAX
          </p>

          <p className="mt-1 text-[9px] text-emerald-300">
            +3.12%
          </p>

        </div>

        {/* DOGE */}
        <div className="rounded-2xl border border-red-500/10 bg-red-500/10 p-2 overflow-hidden">

          <p className="truncate text-[11px] font-semibold text-white">
            DOGE
          </p>

          <p className="mt-1 text-[9px] text-red-300">
            -1.14%
          </p>

        </div>

        {/* LINK */}
        <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/10 p-2 overflow-hidden">

          <p className="truncate text-[11px] font-semibold text-white">
            LINK
          </p>

          <p className="mt-1 text-[9px] text-emerald-300">
            +2.62%
          </p>

        </div>

        {/* RNDR */}
        <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/10 p-2 overflow-hidden">

          <p className="truncate text-[11px] font-semibold text-white">
            RNDR
          </p>

          <p className="mt-1 text-[9px] text-emerald-300">
            +8.42%
          </p>

        </div>

      </div>

    </section>
  );
}