export default function TrendingNarratives() {
  return (
    <section className="rounded-[18px] border border-white/10 bg-[#060816] p-3.5 h-full overflow-hidden">

      {/* ================= HEADER ================= */}
      <div className="mb-3 flex items-start justify-between gap-3">

        <div className="min-w-0">

          <h3 className="truncate text-[15px] font-semibold text-white">
            Trending Narratives
          </h3>

          <p className="mt-1 text-[10px] text-gray-500">
            AI-detected market themes
          </p>

        </div>

        <button className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[9px] uppercase tracking-[0.15em] text-violet-300 transition-colors hover:bg-white/[0.06]">
          View All
        </button>

      </div>

      {/* ================= CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">

        {[
          {
            title: "AI Infrastructure Rally",
            description:
              "GPU, compute and AI protocol ecosystems gaining momentum.",
            momentum: "+92%",
          },
          {
            title: "Ethereum ETF Speculation",
            description:
              "Institutional positioning rising ahead of ETF developments.",
            momentum: "+74%",
          },
          {
            title: "Solana Ecosystem Expansion",
            description:
              "Liquidity inflows and ecosystem growth accelerating.",
            momentum: "+68%",
          },
          {
            title: "Real World Assets",
            description:
              "Tokenized treasury and yield narratives gaining traction.",
            momentum: "+81%",
          },
        ].map((item) => (

          <div
            key={item.title}
            className="rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-3 transition-colors hover:bg-white/[0.04]"
          >

            {/* TOP */}
            <div className="mb-2.5 flex items-center justify-between gap-2">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-emerald-500/10 text-xs text-white">
                ✦
              </div>

              <span className="shrink-0 text-[11px] font-medium text-emerald-400">
                {item.momentum}
              </span>

            </div>

            {/* TITLE */}
            <h4 className="text-[13px] font-medium text-white leading-snug">
              {item.title}
            </h4>

            {/* DESC */}
            <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-gray-400">
              {item.description}
            </p>

          </div>

        ))}

      </div>

    </section>
  );
}