export default function IntelFooter() {
  return (
    <footer className="pb-10 pt-4">

      <div className="rounded-[28px] border border-white/10 bg-white/[0.02] px-6 py-5">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

          {/* LEFT */}
          <div>

            <div className="flex items-center gap-3">

              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-500/20 to-emerald-500/20 border border-white/10 flex items-center justify-center font-semibold">
                AI
              </div>

              <div>

                <h4 className="font-semibold tracking-wide">
                  AI CORE
                </h4>

                <p className="text-xs text-gray-500 mt-0.5">
                  Institutional-grade crypto intelligence
                </p>

              </div>

            </div>

          </div>

          {/* CENTER */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">

            <button className="hover:text-white transition-colors">
              Intelligence
            </button>

            <button className="hover:text-white transition-colors">
              Markets
            </button>

            <button className="hover:text-white transition-colors">
              AI Signals
            </button>

            <button className="hover:text-white transition-colors">
              Whale Tracking
            </button>

            <button className="hover:text-white transition-colors">
              Premium
            </button>

          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">

            <div className="flex items-center gap-2 text-xs text-emerald-300">

              <div className="relative flex items-center justify-center">

                <div className="h-2 w-2 rounded-full bg-emerald-400" />

                <div className="absolute h-3 w-3 rounded-full bg-emerald-400/20 animate-ping" />

              </div>

              Systems Online

            </div>

            <div className="text-xs text-gray-600">
              v1.0 Intelligence Engine
            </div>

          </div>

        </div>

      </div>

    </footer>
  );
}