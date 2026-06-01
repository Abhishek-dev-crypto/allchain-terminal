"use client";

export default function TerminalSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-white/10 bg-white/[0.03] p-4">

      <div className="h-3 w-32 rounded bg-white/10" />

      <div className="mt-4 h-8 w-24 rounded bg-white/10" />

      <div className="mt-4 space-y-2">
        <div className="h-3 rounded bg-white/10" />
        <div className="h-3 w-5/6 rounded bg-white/10" />
        <div className="h-3 w-4/6 rounded bg-white/10" />
      </div>

      <div className="mt-4 space-y-2">
        <div className="h-10 rounded-lg bg-white/5" />
        <div className="h-10 rounded-lg bg-white/5" />
        <div className="h-10 rounded-lg bg-white/5" />
      </div>

    </div>
  );
}