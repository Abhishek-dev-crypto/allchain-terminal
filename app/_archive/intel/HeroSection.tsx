export default function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-violet-500/10 via-[#0b1020] to-emerald-500/5 p-10">

      {/* Glow */}
      <div className="absolute top-0 right-0 h-[320px] w-[320px] bg-violet-500/20 blur-3xl" />

      <div className="relative z-10 grid grid-cols-1 xl:grid-cols-2 gap-10 items-center">

        {/* LEFT */}
        <div>

          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1 text-xs text-violet-300 mb-6">
            AI CORE INTELLIGENCE
          </div>

          <h1 className="text-5xl xl:text-6xl font-semibold leading-tight tracking-tight">

            Understand
            <span className="block text-violet-400">
              Crypto Markets
            </span>

            Before Everyone Else

          </h1>

          <p className="mt-6 max-w-xl text-gray-400 text-lg leading-relaxed">
            Real-time AI intelligence across crypto markets —
            narratives, whale activity, sector rotation,
            sentiment analysis and predictive systems.
          </p>

          {/* CTA */}
          <div className="mt-8 flex flex-wrap items-center gap-4">

            <button className="h-12 px-6 rounded-2xl bg-violet-500 hover:bg-violet-400 transition-colors font-medium">
              Open Market Intelligence
            </button>

            <button className="h-12 px-6 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
              Explore AI Systems
            </button>

          </div>

        </div>

        {/* RIGHT */}
        <div className="relative h-[420px] hidden xl:flex items-center justify-center">

          {/* Main Orb */}
          <div className="relative h-[340px] w-[340px] rounded-full border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-emerald-500/10 backdrop-blur-xl flex items-center justify-center">

            {/* Inner Rings */}
            <div className="absolute inset-5 rounded-full border border-white/10" />
            <div className="absolute inset-12 rounded-full border border-violet-500/10" />

            {/* Center */}
            <div className="text-center">
              <p className="text-6xl font-semibold">
                $2.42T
              </p>

              <p className="mt-3 text-emerald-400">
                Global Market Cap
              </p>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}