export default function Loader() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 animate-pulse">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">

        <div>
          <div className="h-3 w-24 rounded bg-white/10 mb-2" />
          <div className="h-2 w-40 rounded bg-white/5" />
        </div>

        <div className="h-8 w-8 rounded-lg bg-white/5" />

      </div>

      {/* Main Content */}
      <div className="space-y-3">

        <div className="h-14 rounded-2xl bg-white/[0.04]" />

        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 rounded-2xl bg-white/[0.04]" />
          <div className="h-20 rounded-2xl bg-white/[0.04]" />
        </div>

        <div className="h-28 rounded-2xl bg-white/[0.04]" />

      </div>

      {/* Bottom */}
      <div className="mt-5 flex items-center justify-between">

        <div className="h-2 w-20 rounded bg-white/10" />

        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400/30" />
          <div className="h-2 w-10 rounded bg-white/10" />
        </div>

      </div>

    </div>
  );
}